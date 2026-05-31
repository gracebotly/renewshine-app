import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/sms/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUSINESS_PHONE = process.env.TWILIO_PHONE_NUMBER!
const OWNER_PHONE    = process.env.OWNER_PHONE!
const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL!

export async function POST(req: NextRequest) {
  const { customerPhone } = await req.json()

  if (!customerPhone) {
    return NextResponse.json({ error: 'customerPhone required' }, { status: 400 })
  }

  if (!twilioClient) {
    return NextResponse.json({ error: 'Twilio not configured' }, { status: 503 })
  }

  // Step 1: Twilio calls the owner's phone.
  // Step 2: When the owner answers, the TwiML at connect-customer dials the customer.
  // Step 3: Customer's phone rings — they see the business number (771) 253-9204.
  await twilioClient.calls.create({
    to:   OWNER_PHONE,
    from: BUSINESS_PHONE,
    url:  `${SITE_URL}/api/twilio/voice/connect-customer?to=${encodeURIComponent(customerPhone)}`,
  })

  return NextResponse.json({ initiated: true })
}
