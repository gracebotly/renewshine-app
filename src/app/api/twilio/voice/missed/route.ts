import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Hi, you've reached RenewShine. The fastest way to reach us is by text, but you can leave a message after the tone and we'll get back to you as soon as possible.
  </Say>
  <Record maxLength="120" transcribe="false" />
</Response>`.trim(),
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
