import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import { sendCustomerBooked, sendOwnerBooked } from '@/lib/email'
import { notifyDepositPaid } from '@/lib/slack'

// Required: raw body for Stripe signature verification
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle checkout.session.completed for MVP
  // This is the correct event for Payment Links — it contains metadata.jobId
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string
      metadata?: { jobId?: string }
    }

    const jobId = session.metadata?.jobId

    if (!jobId) {
      console.error('Webhook: no jobId in session metadata', session.id)
      return Response.json({ received: true }) // Return 200 — don't retry
    }

    const supabase = createServerClient()

    // Fetch job first — idempotency check
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (!job) {
      console.error('Webhook: job not found for jobId', jobId)
      return Response.json({ received: true }) // Return 200 — don't retry
    }

    // Idempotency: if already paid, skip processing — Stripe retries events
    if (job.deposit_paid) {
      return Response.json({ received: true })
    }

    // Mark deposit paid and job as scheduled
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        deposit_paid: true,
        status: 'scheduled',
        stripe_session_id: session.id,
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Webhook: failed to update job', updateError)
      // Return 500 so Stripe retries — the idempotency check above prevents double-processing
      return Response.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Fetch updated job for email templates
    const { data: updatedJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    // Send Templates 4 + 5 — never block webhook response on email
    try {
      if (updatedJob) {
        await Promise.all([sendCustomerBooked(updatedJob), sendOwnerBooked(updatedJob)])
      }
    } catch (emailError) {
      console.error('Webhook: confirmation emails failed (non-blocking):', emailError)
    }

    // Slack alert — deposit received
    if (updatedJob) {
      notifyDepositPaid(
        `💰 *Deposit paid — Stripe*
*${updatedJob.client_name}* paid $100 deposit
🗓️ ${updatedJob.confirmed_date ? new Date(updatedJob.confirmed_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Date TBD'}
💵 Remaining balance: $${updatedJob.remaining_amount ?? 0}
🔗 ${process.env.NEXT_PUBLIC_SITE_URL}/admin/jobs/${updatedJob.id}`
      ).catch(() => {})
    }

    // Fire job-scheduled webhook — n8n uses this to schedule day-before reminder
    if (updatedJob) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
      const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? ''
      fetch(`${siteUrl}/api/webhooks/job-scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret,
        },
        body: JSON.stringify({
          jobId: updatedJob.id,
          clientName: updatedJob.client_name,
          clientPhone: updatedJob.client_phone,
          confirmedDate: updatedJob.confirmed_date,
          timePreference: updatedJob.availability_time_pref,
          address: updatedJob.address,
        }),
      }).catch(err => console.error('job-scheduled webhook failed (stripe path):', err))
    }
  }

  // Always return 200 — Stripe interprets anything else as a failure and retries
  return Response.json({ received: true })
}
