import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/sms'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const contentType = req.headers.get('content-type') ?? ''

  let conversationId: string
  let to: string
  let message: string
  let mediaUrls: string[] = []

  if (contentType.includes('multipart/form-data')) {
    // ── Media message path (FormData with files) ──────────────────────────
    const formData = await req.formData()
    conversationId = (formData.get('conversationId') as string) ?? ''
    to = (formData.get('to') as string) ?? ''
    message = (formData.get('message') as string) ?? ''

    const files = formData.getAll('media') as File[]

    // Upload each file to Vercel Blob and collect public URLs
    // Twilio requires a publicly accessible URL for mediaUrl
    for (const file of files) {
      if (!file || file.size === 0) continue
      const ext = file.name.split('.').pop() ?? 'bin'
      const filename = `inbox-media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
      })
      mediaUrls.push(blob.url)
    }
  } else {
    // ── Text-only path (JSON) ─────────────────────────────────────────────
    const body = await req.json()
    conversationId = body.conversationId ?? ''
    to = body.to ?? ''
    message = body.message ?? ''
    mediaUrls = body.mediaUrls ?? []
  }

  if (!conversationId || !to) {
    return NextResponse.json({ error: 'conversationId and to are required' }, { status: 400 })
  }

  // Must have either a message body or media (or both)
  if (!message.trim() && mediaUrls.length === 0) {
    return NextResponse.json({ error: 'message or media required' }, { status: 400 })
  }

  // Send via Twilio (MMS if mediaUrls present, SMS otherwise)
  const smsSid = await sendSms(to, message.trim(), mediaUrls.length > 0 ? mediaUrls : undefined)

  // Store in Supabase
  const preview = message.trim()
    ? `You: ${message.trim().slice(0, 90)}`
    : `You: 📷 Sent ${mediaUrls.length} photo${mediaUrls.length > 1 ? 's' : ''}`

  await supabase.from('sms_messages').insert({
    conversation_id: conversationId,
    direction: 'outbound',
    body: message.trim(),
    twilio_sid: smsSid ?? null,
    twilio_status: smsSid ? 'sent' : null,
    media_url: mediaUrls[0] ?? null,       // backward compat
    media_urls: mediaUrls,                  // new multi-media column
  })

  await supabase
    .from('sms_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
      unread_count: 0,
      status: 'waiting_on_customer',
    })
    .eq('id', conversationId)

  return NextResponse.json({ sent: true, mediaCount: mediaUrls.length })
}
