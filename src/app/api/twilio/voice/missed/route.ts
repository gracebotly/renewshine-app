import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/voice/missed`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Thanks for calling RenewShine Premium Cleaning.
    We respond fastest by text — just send a message to this number and we'll get back to you within the hour.
    You're also welcome to leave a message after the tone.
  </Say>
  <Record maxLength="120" transcribe="false" />
</Response>`.trim(),
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
