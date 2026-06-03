import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: NextRequest) {
  try { await requireAdmin() } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await request.json()
  if (!jobId) {
    return Response.json({ error: 'jobId required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Delete job — CASCADE handles job_media, job_activity, and any other FK children
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    return Response.json({ error: 'Failed to delete job' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
