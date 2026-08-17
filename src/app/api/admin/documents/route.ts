import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { DEFAULT_DOCUMENTS } from '@/lib/documents/defaults'
import {
  MESSAGE_KEYS,
  documentKey,
  sanitizeDocument,
} from '@/lib/documents/types'
import type {
  DocumentChannel,
  MessageDocument,
  MessageKey,
} from '@/lib/documents/types'

const CHANNELS: DocumentChannel[] = ['email', 'sms']

export async function GET() {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServerClient()
  const { data } = await supabase
    .from('message_documents')
    .select('message_key, channel, subject, blocks')
  const documents: Record<string, MessageDocument> = {}
  for (const key of MESSAGE_KEYS) {
    for (const channel of CHANNELS) {
      const dk = documentKey(key, channel)
      const row = (data ?? []).find(
        (r) => r.message_key === key && r.channel === channel
      )
      const candidate = row
        ? {
            channel,
            subject: channel === 'email' ? (row.subject ?? '') : null,
            blocks: row.blocks,
          }
        : DEFAULT_DOCUMENTS[dk]
      const clean = sanitizeDocument(candidate)
      if (clean) documents[dk] = clean
      else if (DEFAULT_DOCUMENTS[dk]) documents[dk] = DEFAULT_DOCUMENTS[dk]
    }
  }
  const { data: sampleJob } = await supabase
    .from('jobs')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return Response.json({ documents, sampleJobId: sampleJob?.id ?? null })
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { key, channel, document } = (await request.json()) as {
    key?: MessageKey
    channel?: DocumentChannel
    document?: unknown
  }
  if (!key || !MESSAGE_KEYS.includes(key))
    return Response.json({ error: 'Invalid message key' }, { status: 400 })
  if (channel !== 'email' && channel !== 'sms')
    return Response.json({ error: 'Invalid channel' }, { status: 400 })
  const clean = sanitizeDocument(document)
  if (!clean || clean.channel !== channel)
    return Response.json({ error: 'Invalid document' }, { status: 400 })
  const supabase = createServerClient()
  const { error } = await supabase.from('message_documents').upsert(
    {
      message_key: key,
      channel,
      subject: clean.channel === 'email' ? clean.subject : null,
      blocks: clean.blocks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'message_key,channel' }
  )
  if (error) {
    console.error('save default document failed:', error)
    return Response.json({ error: 'Failed to save default' }, { status: 500 })
  }
  return Response.json({ saved: true })
}
