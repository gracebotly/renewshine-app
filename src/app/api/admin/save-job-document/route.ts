import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Json } from '@/types/database'
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

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { jobId, key, channel, document } = (await request.json()) as {
    jobId?: string
    key?: MessageKey
    channel?: DocumentChannel
    document?: unknown
  }
  if (!jobId)
    return Response.json({ error: 'jobId is required' }, { status: 400 })
  if (!key || !MESSAGE_KEYS.includes(key))
    return Response.json({ error: 'Invalid message key' }, { status: 400 })
  if (channel !== 'email' && channel !== 'sms')
    return Response.json({ error: 'Invalid channel' }, { status: 400 })
  let clean: MessageDocument | null = null
  if (document !== null && document !== undefined) {
    clean = sanitizeDocument(document)
    if (!clean || clean.channel !== channel)
      return Response.json({ error: 'Invalid document' }, { status: 400 })
  }
  const supabase = createServerClient()
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('message_documents')
    .eq('id', jobId)
    .single()
  if (fetchError || !job)
    return Response.json({ error: 'Job not found' }, { status: 404 })
  const existing =
    job.message_documents && typeof job.message_documents === 'object'
      ? (job.message_documents as Record<string, unknown>)
      : {}
  const next = { ...existing }
  const dk = documentKey(key, channel)
  if (clean) next[dk] = clean
  else delete next[dk]
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ message_documents: next as unknown as Json })
    .eq('id', jobId)
  if (updateError) {
    console.error('save-job-document failed:', updateError)
    return Response.json({ error: 'Failed to save' }, { status: 500 })
  }
  return Response.json({ saved: true, customized: Boolean(clean) })
}
