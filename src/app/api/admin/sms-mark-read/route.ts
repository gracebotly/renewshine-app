import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { conversationId } = await req.json()

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
  }

  await supabase
    .from('sms_conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)

  return NextResponse.json({ ok: true })
}
