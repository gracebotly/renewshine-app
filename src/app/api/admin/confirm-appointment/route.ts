import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, confirmedDate, timePref } = await request.json()

  if (!jobId || !confirmedDate) {
    return Response.json({ error: 'jobId and confirmedDate are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const updatePayload: Record<string, unknown> = {
    confirmed_date:        confirmedDate,
    appointment_confirmed: true,
  }

  // Save arrival window if provided
  if (timePref) {
    updatePayload.availability_time_pref = timePref
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update(updatePayload)
    .eq('id', jobId)

  if (updateError) {
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  return Response.json({ ok: true, confirmedDate })
}
