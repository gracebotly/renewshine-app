import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Job } from '@/types/database'
import { loadDocument } from '@/lib/documents/load'
import { buildRenderContext } from '@/lib/documents/context'
import { renderEmailDocument } from '@/lib/documents/render-email'
import { sendCustomerBooked, sendRenderedEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, confirmedDate, timePref } = await request.json()
  if (!jobId || !confirmedDate) {
    return Response.json(
      { error: 'jobId and confirmedDate are required' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      confirmed_date: confirmedDate,
      appointment_confirmed: true,
      ...(timePref
        ? { availability_time_pref: timePref, confirmed_arrival_pref: timePref }
        : {}),
    })
    .eq('id', jobId)

  if (updateError) {
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  const { data: updatedJob, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  if (fetchError || !updatedJob) {
    return Response.json(
      { error: 'Job not found after update' },
      { status: 404 }
    )
  }

  const doc = await loadDocument(updatedJob as Job, 'appt', 'email')
  if (doc && doc.channel === 'email') {
    const ctx = buildRenderContext({ job: updatedJob as Job })
    const { subject, html } = renderEmailDocument(doc, ctx)
    await sendRenderedEmail(updatedJob.client_email, subject, html)
  } else {
    // Legacy fallback — retained until 3B proves the document path.
    await sendCustomerBooked(updatedJob as Job)
  }

  return Response.json({ ok: true, confirmedDate })
}
