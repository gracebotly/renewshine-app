import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'
import { sendSms } from '@/lib/sms'
import { sendPushNotification } from '@/lib/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'

// Compliance keywords Twilio handles at carrier level — no action needed
const COMPLIANCE_KEYWORDS = new Set([
  'STOP','STOPALL','UNSUBSCRIBE','CANCEL','END','QUIT','HELP','INFO'
])

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params  = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url       = `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/sms`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params['From'] ?? ''
  const body = params['Body'] ?? ''
  const sid  = params['MessageSid'] ?? ''

  if (!from || !body) {
    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  const normalized = body.trim().toUpperCase()
  const supabase   = createServerClient()
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://renewshine.co'

  // ─── COMPLIANCE — carrier handles opt-out, we do nothing ──────────────────
  if (COMPLIANCE_KEYWORDS.has(normalized)) {
    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  // ─── RATING REPLY (1–5) — WF-04b rating gate logic ───────────────────────
  if (['1','2','3','4','5'].includes(normalized)) {
    const score = parseInt(normalized)

    // Find the most recently completed job for this phone number
    const { data: job } = await supabase
      .from('jobs')
      .select('id, client_name')
      .eq('client_phone', from)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (job) {
      // Store the satisfaction score
      await supabase
        .from('jobs')
        .update({ satisfaction_score: score })
        .eq('id', job.id)

      if (score >= 4) {
        // High score — send Google review request
        const reviewLink = process.env.RENEWSHINE_GOOGLE_REVIEW ?? ''
        await sendSms(
          from,
          `So glad to hear it! If you have 30 seconds, a Google review would mean a lot to us:\n\n${reviewLink}\n\n— RenewShine`
        )
      } else {
        // Low score — re-clean offer + owner alert
        await sendSms(
          from,
          `We're sorry to hear that. We want to make it right.\n\nReply YES and we'll schedule a complimentary re-clean at no charge.\n\n— RenewShine`
        )
        sendSms(
          process.env.OWNER_PHONE ?? null,
          `⚠️ Low rating — ${job.client_name ?? from} scored ${score}/5. Review: ${siteUrl}/admin/jobs/${job.id}`
        ).catch(err => console.error('owner low-score alert failed:', err))
      }
    }

    // Store in inbox too so you can see the rating reply in the thread
    await storeInInbox({ supabase, from, body, sid, siteUrl, skipOwnerAlert: true })

    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  // ─── YES — appointment confirmation ───────────────────────────────────────
  if (normalized === 'YES') {
    // Check if this is a re-clean acceptance (after low score) or appointment confirm
    // We treat both the same: confirm and alert owner
    await sendSms(from, `You're confirmed for tomorrow. See you then!\n\n— RenewShine`)
    sendSms(
      process.env.OWNER_PHONE ?? null,
      `✅ ${from} confirmed their appointment.`
    ).catch(err => console.error('owner YES alert failed:', err))

    await storeInInbox({ supabase, from, body, sid, siteUrl, skipOwnerAlert: true })

    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  // ─── NO — cancellation / reschedule ───────────────────────────────────────
  if (normalized === 'NO') {
    await sendSms(
      from,
      `No problem — we'll get you rescheduled. I'll reach out shortly to find a new time that works.\n\n— RenewShine`
    )
    sendSms(
      process.env.OWNER_PHONE ?? null,
      `⚠️ ${from} replied NO to their appointment confirmation. Reschedule needed.`
    ).catch(err => console.error('owner NO alert failed:', err))

    await storeInInbox({ supabase, from, body, sid, siteUrl, skipOwnerAlert: true })

    return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
  }

  // ─── HUMAN REPLY — store in inbox, pause automation, alert owner ──────────
  // Pause automation for this customer for 12 hours so n8n sequences skip
  await supabase
    .from('jobs')
    .update({ automation_paused_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() })
    .eq('client_phone', from)
    .in('status', ['approved', 'scheduled', 'completed'])

  await storeInInbox({ supabase, from, body, sid, siteUrl, skipOwnerAlert: false })

  return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
}

// ─── Shared: store message in SMS inbox ──────────────────────────────────────

async function storeInInbox({
  supabase, from, body, sid, siteUrl, skipOwnerAlert,
}: {
  supabase: ReturnType<typeof createServerClient>
  from: string
  body: string
  sid: string
  siteUrl: string
  skipOwnerAlert: boolean
}) {
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

  const leadSource  = matchingJob ? 'returning_client' : missedCall ? 'missed_call' : 'sms'
  const contactName = matchingJob?.client_name ?? null

  const { data: conv, error: convErr } = await supabase
    .from('sms_conversations')
    .upsert(
      {
        contact_phone:        from,
        contact_name:         contactName,
        lead_source:          leadSource,
        last_message_at:      new Date().toISOString(),
        last_message_preview: body.slice(0, 100),
        status:               'needs_reply',
        notes:                null,
        tags:                 [],
      },
      { onConflict: 'contact_phone', ignoreDuplicates: false }
    )
    .select('id, contact_name')
    .single()

  if (convErr || !conv) {
    console.error('storeInInbox: upsert failed:', convErr)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('increment_unread', {
    conv_id: conv.id,
    preview: body.slice(0, 100),
  })

  await supabase.from('sms_messages').insert({
    conversation_id: conv.id,
    direction:       'inbound',
    body,
    twilio_sid:      sid,
  })

  const displayName = conv.contact_name ?? from

  // Push notification — always fires
  sendPushNotification({
    title:          `💬 ${displayName}`,
    body:           body.slice(0, 80),
    url:            `/admin/inbox?phone=${encodeURIComponent(from)}`,
    conversationId: conv.id,
  }).catch(err => console.error('push failed (non-blocking):', err))

  // Owner backup SMS — only for human replies, not for structured replies (YES/NO/scores)
  if (!skipOwnerAlert) {
    const preview = body.length > 60 ? `${body.slice(0, 60)}…` : body
    sendSms(
      process.env.OWNER_PHONE ?? null,
      `New RenewShine text from ${displayName}: "${preview}" — ${siteUrl}/admin/inbox`
    ).catch(err => console.error('owner backup SMS failed (non-blocking):', err))
  }
}
