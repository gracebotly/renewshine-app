import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ALLOWED_ADMIN_EMAILS } from '@/lib/allowed-emails'

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()

    if (!ALLOWED_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
    }

    const supabase = createServerClient()

    // Look up the stored code
    const { data, error: fetchError } = await supabase
      .from('admin_otp_codes')
      .select('code, expires_at')
      .eq('email', normalized)
      .single()

    if (fetchError || !data) {
      return NextResponse.json(
        { error: 'No code found. Request a new one.' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      // Clean up expired code
      await supabase.from('admin_otp_codes').delete().eq('email', normalized)
      return NextResponse.json(
        { error: 'Code expired. Request a new one.' },
        { status: 400 }
      )
    }

    // Check code match
    if (data.code !== code.trim()) {
      return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 })
    }

    // Delete used code immediately — single use only
    await supabase.from('admin_otp_codes').delete().eq('email', normalized)

    // Generate a real Supabase session for this user server-side
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalized,
    })

    if (linkError || !linkData?.properties) {
      console.error('[verify-otp] generateLink error:', linkError)
      return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 })
    }

    return NextResponse.json({
      access_token: linkData.properties.access_token,
      refresh_token: linkData.properties.refresh_token,
    })
  } catch (err) {
    console.error('[verify-otp] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
