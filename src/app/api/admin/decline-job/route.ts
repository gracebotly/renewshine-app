import { createServerClient } from '@/lib/supabase/server'
import { sendCustomerDeclined } from '@/lib/email'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, reason, referral } = await request.json()

  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })
  if (!reason || String(reason).trim().length === 0) {
    return Response.json({ error: 'reason is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update({ status: 'cancelled' })
    .eq('id', jobId)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  try {
    await sendCustomerDeclined(job, String(reason).trim(), referral ? String(referral).trim() : null)
  } catch (emailError) {
    console.error('decline email failed (non-blocking):', emailError)
  }

  return Response.json({ success: true })
}
