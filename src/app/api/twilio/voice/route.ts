import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OWNER_PHONE   = process.env.OWNER_PHONE!          // +13017429441
const BUSINESS_PHONE = '+17712539204'
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL!

function xml(body: string) {
  return new NextResponse(body.trim(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params  = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url       = `${SITE_URL}/api/twilio/voice`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params['From'] ?? ''

  // Outbound: owner calls business number to reach a customer
  if (from === OWNER_PHONE) {
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="dtmf" numDigits="10" timeout="10" finishOnKey="#"
    action="${SITE_URL}/api/twilio/voice/outbound" method="POST">
    <Say voice="Polly.Joanna">Enter the 10 digit number to call, then press pound.</Say>
  </Gather>
  <Say voice="Polly.Joanna">No number received. Goodbye.</Say>
</Response>`)
  }

  // Inbound: customer calling — forward to owner with whisper
  // The `url` attribute on <Number> plays a whisper ONLY to the answering party (owner).
  // Customer hears ringing the whole time and never hears the whisper.
  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="15" action="${SITE_URL}/api/twilio/voice/missed" method="POST">
    <Number url="${SITE_URL}/api/twilio/voice/whisper">${OWNER_PHONE}</Number>
  </Dial>
</Response>`)
}
