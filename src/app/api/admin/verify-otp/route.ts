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

    // ── 1. Look up the stored OTP ─────────────────────────────────────────
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

    // ── 2. Check expiry ───────────────────────────────────────────────────
    if (new Date(data.expires_at) < new Date()) {
      await supabase.from('admin_otp_codes').delete().eq('email', normalized)
      return NextResponse.json(
        { error: 'Code expired. Request a new one.' },
        { status: 400 }
      )
    }

    // ── 3. Check code match ───────────────────────────────────────────────
    if (data.code !== code.trim()) {
      return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 })
    }

    // ── 4. Delete used code — single use only ─────────────────────────────
    await supabase.from('admin_otp_codes').delete().eq('email', normalized)

    // ── 5. Generate a magic link to get a hashed_token ───────────────────
    // generateLink returns properties.hashed_token — NOT access_token/refresh_token.
    // We use hashed_token with verifyOtp to exchange it for a real session.
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalized,
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[verify-otp] generateLink error:', linkError)
      return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 })
    }

    // ── 6. Exchange hashed_token for a real session ───────────────────────
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    })

    if (sessionError || !sessionData?.session) {
      console.error('[verify-otp] verifyOtp error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 })
    }

    // ── 7. Return tokens to the client ────────────────────────────────────
    return NextResponse.json({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    })
  } catch (err) {
    console.error('[verify-otp] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
