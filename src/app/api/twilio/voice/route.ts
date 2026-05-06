import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OWNER_PHONE = '+13017429441'
const BUSINESS_PHONE = '+17712539204'

function xml(body: string) {
  return new NextResponse(body.trim(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

function inboundTwiML() {
  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="15" action="https://renewshine.co/api/twilio/voice/missed" method="POST">
    <Number>${OWNER_PHONE}</Number>
  </Dial>
</Response>`)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const from = String(formData.get('From') || '')

  if (from === OWNER_PHONE) {
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="dtmf" numDigits="10" timeout="10" finishOnKey="#" action="https://renewshine.co/api/twilio/voice/outbound" method="POST">
    <Say voice="Polly.Joanna">Enter the 10 digit number to call, then press pound.</Say>
  </Gather>
  <Say voice="Polly.Joanna">No number received. Goodbye.</Say>
</Response>`)
  }

  return inboundTwiML()
}
