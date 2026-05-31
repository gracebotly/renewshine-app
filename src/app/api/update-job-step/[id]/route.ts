import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return Response.json({ error: 'Missing job ID' }, { status: 400 })
  }

  const body = await request.json()
  const { last_completed_step, dropped_at_label } = body

  if (typeof last_completed_step !== 'number') {
    return Response.json({ error: 'last_completed_step must be a number' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Only update partial jobs — prevents abuse of this endpoint
  const { error } = await supabase
    .from('jobs')
    .update({ last_completed_step, dropped_at_label: dropped_at_label ?? null })
    .eq('id', id)
    .eq('status', 'partial')

  if (error) {
    console.error('[update-job-step]', error)
    return Response.json({ error: 'Update failed' }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 200 })
}
