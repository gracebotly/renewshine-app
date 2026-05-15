import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/sms'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { conversationId, to, message } = body

  if (!conversationId || !to || !message?.trim()) {
    return NextResponse.json({ error: 'conversationId, to, and message are required' }, { status: 400 })
  }

  await sendSms(to, message.trim())

  await supabase.from('sms_messages').insert({
    conversation_id: conversationId,
    direction: 'outbound',
    body: message.trim(),
  })

  await supabase
    .from('sms_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: `You: ${message.trim().slice(0, 90)}`,
      unread_count: 0,
      status: 'waiting_on_customer',
    })
    .eq('id', conversationId)

  return NextResponse.json({ sent: true })
}
