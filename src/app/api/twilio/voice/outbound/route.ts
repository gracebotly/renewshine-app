import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUSINESS_PHONE = '+17712539204'

function xml(body: string) {
  return new NextResponse(body.trim(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

function normalizePhone(input: string | null): string {
  if (!input) return ''
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return ''
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const digits = String(formData.get('Digits') || '')
  const destination = normalizePhone(digits)

  if (!destination) {
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">That number was not valid. Please try again.</Say>
  <Redirect method="POST">https://renewshine.co/api/twilio/voice</Redirect>
</Response>`)
  }

  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Connecting your RenewShine call now.</Say>
  <Dial callerId="${BUSINESS_PHONE}" timeout="30">
    <Number>${destination}</Number>
  </Dial>
</Response>`)
}
