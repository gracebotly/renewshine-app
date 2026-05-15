import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'
import { sendSms } from '@/lib/sms'
import { sendPushNotification } from '@/lib/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/sms`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params['From'] ?? ''
  const body = params['Body'] ?? ''
  const sid = params['MessageSid'] ?? ''

  if (!from || !body) {
    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  const supabase = createServerClient()

  const { data: matchingJob } = await supabase
    .from('jobs')
    .select('client_name')
    .eq('client_phone', from)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: missedCall } = await supabase
    .from('missed_calls')
    .select('id')
    .eq('caller_phone', from)
    .limit(1)
    .maybeSingle()

  const leadSource = matchingJob ? 'returning_client' : missedCall ? 'missed_call' : 'sms'
  const contactName = matchingJob?.client_name ?? null

  const { data: conv, error: convErr } = await supabase
    .from('sms_conversations')
    .upsert(
      {
        contact_phone: from,
        contact_name: contactName,
        lead_source: leadSource,
        last_message_at: new Date().toISOString(),
        last_message_preview: body.slice(0, 100),
        status: 'needs_reply',
      },
      {
        onConflict: 'contact_phone',
        ignoreDuplicates: false,
      }
    )
    .select('id, contact_name')
    .single()

  if (convErr || !conv) {
    console.error('sms inbound: upsert failed:', convErr)
    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('increment_unread', {
    conv_id: conv.id,
    preview: body.slice(0, 100),
  })

  await supabase.from('sms_messages').insert({
    conversation_id: conv.id,
    direction: 'inbound',
    body,
    twilio_sid: sid,
  })

  const displayName = conv.contact_name ?? from

  sendPushNotification({
    title: `💬 ${displayName}`,
    body: body.slice(0, 80),
    url: `/admin/inbox?phone=${encodeURIComponent(from)}`,
    conversationId: conv.id,
  }).catch(err => console.error('push failed (non-blocking):', err))

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://renewshine.co'
  const nameLabel = conv.contact_name ? conv.contact_name : from
  const preview = body.length > 60 ? `${body.slice(0, 60)}…` : body
  sendSms(
    process.env.OWNER_PHONE ?? null,
    `New RenewShine text from ${nameLabel}: "${preview}" — ${siteUrl}/admin/inbox`
  ).catch(err => console.error('owner backup SMS failed (non-blocking):', err))

  return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
}
