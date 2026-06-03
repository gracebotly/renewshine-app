import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Job } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, action: rawAction } = await request.json()
  // action: 'archive' | 'decline'
  if (!jobId || !rawAction) {
    return Response.json({ error: 'jobId and action required' }, { status: 400 })
  }
  if (!['archive', 'decline'].includes(rawAction)) {
    return Response.json({ error: 'action must be archive or decline' }, { status: 400 })
  }

  const action = rawAction as 'archive' | 'decline'
  const supabase = createServerClient()

  const update: Partial<Job> =
    action === 'decline'
      ? { is_archived: true, status: 'cancelled' }
      : { is_archived: true }

  const { error } = await supabase
    .from('jobs')
    .update(update)
    .eq('id', jobId)

  if (error) {
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  // Log to activity timeline
  await supabase.from('job_activity').insert({
    job_id: jobId,
    type: 'status_change',
    label: action === 'decline' ? 'Job declined' : 'Job archived',
  })

  return Response.json({ ok: true, action })
}
