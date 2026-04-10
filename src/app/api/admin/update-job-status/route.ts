import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_STATUSES = ['new', 'under_review', 'approved', 'scheduled', 'completed', 'cancelled']

export async function PATCH(request: Request) {
  const { jobId, status, notes } = await request.json()

  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })
  if (status && !VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (notes !== undefined) updates.notes = notes

  const { error } = await supabase.from('jobs').update(updates).eq('id', jobId)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
