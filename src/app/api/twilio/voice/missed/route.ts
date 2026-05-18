import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioSignature } from '@/lib/validate-twilio'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params  = Object.fromEntries(new URLSearchParams(rawBody))

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url       = `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/voice/missed`

  if (!validateTwilioSignature(signature, url, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const dialStatus = params['DialCallStatus'] ?? ''
  const from       = params['From'] ?? ''

  // Only log and play voicemail if the call was genuinely not answered
  if (dialStatus === 'no-answer' || dialStatus === 'busy' || dialStatus === 'failed') {
    // Fire-and-forget: log missed call to conversation_events
    logMissedCall(from).catch(err =>
      console.error('logMissedCall failed (non-blocking):', err)
    )

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Thanks for calling RenewShine Premium Cleaning.
    We respond fastest by text — just send a message to this number and we'll get back to you within the hour.
    You're also welcome to leave a message after the tone.
  </Say>
  <Record maxLength="120" transcribe="false" />
</Response>`.trim(),
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Call was answered (completed) — no voicemail, no logging needed
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  )
}

async function logMissedCall(from: string) {
  if (!from) return
  const supabase = createServerClient()

  // Upsert conversation — creates one if this is the caller's first contact
  const { data: matchingJob } = await supabase
    .from('jobs')
    .select('client_name')
    .eq('client_phone', from)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: conv } = await supabase
    .from('sms_conversations')
    .upsert(
      {
        contact_phone:        from,
        contact_name:         matchingJob?.client_name ?? null,
        lead_source:          'missed_call',
        last_message_at:      new Date().toISOString(),
        last_message_preview: '📞 Missed call',
        status:               'needs_reply',
        notes:                null,
        tags:                 [],
      },
      { onConflict: 'contact_phone', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (!conv) return

  // Log the event to conversation_events
  await supabase.from('conversation_events').insert({
    conversation_id: conv.id,
    event_type:      'missed_call',
    duration_sec:    null,
    recording_url:   null,
  })

  // Also log to existing missed_calls table (n8n still reads this)
  await supabase.from('missed_calls').insert({
    caller_phone:   from,
    called_at:      new Date().toISOString(),
    text_back_sent: false,
  })
}
