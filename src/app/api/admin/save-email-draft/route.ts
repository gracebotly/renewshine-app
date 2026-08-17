import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'

const MAX_BODY_LENGTH = 4000
// "<templateId>:<channel>" — letters, digits, underscores, one colon.
const KEY_PATTERN = /^[a-z0-9_]+:(email|sms)$/

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, key, body } = (await request.json()) as {
    jobId?: string
    key?: string
    body?: string | null
  }

  if (!jobId || !key) {
    return Response.json({ error: 'jobId and key are required' }, { status: 400 })
  }
  if (!KEY_PATTERN.test(key)) {
    return Response.json({ error: 'Invalid key' }, { status: 400 })
  }
  if (typeof body === 'string' && body.length > MAX_BODY_LENGTH) {
    return Response.json({ error: 'Draft is too long' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('email_draft_overrides')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  const existing =
    job.email_draft_overrides && typeof job.email_draft_overrides === 'object'
      ? (job.email_draft_overrides as Record<string, string>)
      : {}

  const next = { ...existing }
  // A blank or null body clears the override — that is the Reset action.
  if (typeof body === 'string' && body.trim()) {
    next[key] = body
  } else {
    delete next[key]
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update({ email_draft_overrides: next })
    .eq('id', jobId)

  if (updateError) {
    console.error('save-email-draft failed:', updateError)
    return Response.json({ error: 'Failed to save draft' }, { status: 500 })
  }

  return Response.json({ saved: true, overrides: next })
}
