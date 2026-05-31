import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUSINESS_PHONE = process.env.TWILIO_PHONE_NUMBER!

function xml(body: string) {
  return new NextResponse(body.trim(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') ?? ''

  if (!to) {
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">No customer number provided. Goodbye.</Say>
</Response>`)
  }

  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Connecting to your customer now.</Say>
  <Dial callerId="${BUSINESS_PHONE}" timeout="30">
    <Number>${to}</Number>
  </Dial>
</Response>`)
}
