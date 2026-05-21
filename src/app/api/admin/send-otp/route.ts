import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { ALLOWED_ADMIN_EMAILS } from '@/lib/allowed-emails'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = 'RenewShine <noreply@renewshine.co>'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()

    if (!ALLOWED_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) {
      return NextResponse.json({ error: 'This email is not authorized.' }, { status: 403 })
    }

    // Generate a cryptographically random 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    const supabase = createServerClient()

    // Upsert — replaces any existing code for this email
    const { error: dbError } = await supabase
      .from('admin_otp_codes')
      .upsert(
        { email: normalized, code, expires_at: expiresAt },
        { onConflict: 'email' }
      )

    if (dbError) {
      console.error('[send-otp] DB error:', dbError)
      return NextResponse.json({ error: 'Failed to generate code.' }, { status: 500 })
    }

    // Send via Resend
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: normalized,
      subject: 'Your RenewShine sign-in code',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; background: #f8fafc; padding: 40px 20px;">
            <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
              <h2 style="margin: 0 0 8px; font-size: 20px; color: #0f172a;">Your RenewShine sign-in code</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 14px;">
                Enter this code in the app to sign in. It expires in 10 minutes.
              </p>
              <div style="
                display: inline-block;
                padding: 16px 32px;
                background: #f1f5f9;
                border-radius: 8px;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 10px;
                font-family: monospace;
                color: #0f172a;
                margin-bottom: 24px;
              ">
                ${code}
              </div>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('[send-otp] Resend error:', emailError)
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-otp] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
