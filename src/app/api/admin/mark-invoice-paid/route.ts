import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await request.json()

  if (!jobId) {
    return Response.json({ error: 'jobId is required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: job } = await supabase
    .from('jobs')
    .select('id, status, client_name, client_phone, client_email, remaining_amount, stripe_payment_link')
    .eq('id', jobId)
    .single()

  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 })
  if (job.status === 'completed') return Response.json({ success: true })

  const { error: updateError } = await supabase
    .from('jobs')
    .update({ status: 'completed', remaining_amount: 0 })
    .eq('id', jobId)

  if (updateError) return Response.json({ error: 'Failed to update job' }, { status: 500 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? ''
  fetch(`${siteUrl}/api/webhooks/job-completed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': webhookSecret },
    body: JSON.stringify({
      jobId: job.id,
      clientName: job.client_name,
      clientPhone: job.client_phone,
      clientEmail: job.client_email,
      remainingAmount: 0,
      stripePaymentLink: job.stripe_payment_link,
    }),
  }).catch((err) => console.error('job-completed webhook failed (mark-invoice-paid):', err))

  return Response.json({ success: true })
}
