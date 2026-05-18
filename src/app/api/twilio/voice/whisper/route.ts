import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">RenewShine business call.</Say>
</Response>`.trim(),
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
