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

  const update: Record<string, unknown> = {}
  if (typeof notes === 'string') update.notes = notes
  if (Array.isArray(tags)) update.tags = tags

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('sms_conversations')
    .update(update)
    .eq('id', conversationId)

  if (error) {
    console.error('conversation-update failed:', error)
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }

  return NextResponse.json({ updated: true })
}
