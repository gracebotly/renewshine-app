import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { sendCustomerBooked } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, confirmedDate } = await request.json()

  if (!jobId || !confirmedDate) {
    return Response.json({ error: 'jobId and confirmedDate are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      confirmed_date: confirmedDate,
      appointment_confirmed: true,
    })
    .eq('id', jobId)

  if (updateError) {
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  const { data: updatedJob } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (!updatedJob) {
    return Response.json({ error: 'Job not found after update' }, { status: 404 })
  }

  try {
    await sendCustomerBooked(updatedJob)
  } catch (emailError) {
    console.error('confirm-appointment: email failed (non-blocking):', emailError)
  }

  return Response.json({ ok: true, confirmedDate })
}
