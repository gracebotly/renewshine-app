import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { conversationId, notes, tags } = body

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
  }

  const hasNotes = typeof notes === 'string'
  const hasTags  = Array.isArray(tags)

  if (!hasNotes && !hasTags) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('sms_conversations')
    .update({
      ...(hasNotes ? { notes: notes as string } : {}),
      ...(hasTags  ? { tags:  tags  as string[] } : {}),
    })
    .eq('id', conversationId)

  if (error) {
    console.error('conversation-update failed:', error)
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }

  return NextResponse.json({ updated: true })
}
