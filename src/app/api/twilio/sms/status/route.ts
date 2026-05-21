import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/sms/status`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const sid = params['MessageSid']
  const status = params['MessageStatus'] // 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed'

  if (!sid || !status) {
    return new NextResponse('OK', { status: 200 })
  }

  const supabase = createServerClient()

  const updateData: Record<string, unknown> = { twilio_status: status }
  if (status === 'delivered') {
    updateData.delivered_at = new Date().toISOString()
  }

  await supabase.from('sms_messages').update(updateData).eq('twilio_sid', sid)

  return new NextResponse('OK', { status: 200 })
}
