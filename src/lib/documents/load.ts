import { createServerClient } from '@/lib/supabase/server'
import type { Job } from '@/types/database'
import { DEFAULT_DOCUMENTS } from './defaults'
import { documentKey, isValidDocument } from './types'
import type { DocumentChannel, MessageDocument, MessageKey } from './types'

export async function loadDocument(
  job: Job | null, key: MessageKey, channel: DocumentChannel
): Promise<MessageDocument | null> {
  const dk = documentKey(key, channel)
  const jobDocs = (job as unknown as { message_documents?: unknown })?.message_documents
  if (jobDocs && typeof jobDocs === 'object') {
    const candidate = (jobDocs as Record<string, unknown>)[dk]
    if (isValidDocument(candidate)) return candidate
  }
  try {
    const supabase = createServerClient()
    const { data } = await supabase.from('message_documents').select('subject, blocks')
      .eq('message_key', key).eq('channel', channel).maybeSingle()
    if (data?.blocks) {
      const candidate = { channel, subject: data.subject ?? '', blocks: data.blocks }
      if (isValidDocument(candidate)) return candidate as MessageDocument
    }
  } catch {
    // Fall through to hardcoded defaults.
  }
  const fallback = DEFAULT_DOCUMENTS[dk]
  return isValidDocument(fallback) ? fallback : null
}
