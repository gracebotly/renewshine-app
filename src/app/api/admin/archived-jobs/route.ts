import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'

export async function GET() {
  try { await requireAdmin() } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_archived', true)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: 'Failed to fetch archived jobs' }, { status: 500 })
  }

  return Response.json({ jobs: jobs ?? [] })
}
