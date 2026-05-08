import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'

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
  const rawBody = await req.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/voice`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params['From'] ?? ''

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
