import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import { sendCustomerBooked, sendOwnerBooked } from '@/lib/email'
import { notifyDepositPaid } from '@/lib/slack'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string
      metadata?: Record<string, string> | null
      payment_intent?: string | { metadata?: Record<string, string> } | null
    }

    // payment_intent_data.metadata is surfaced on session.metadata for Payment Links.
    // Fallback to payment_intent.metadata for PaymentIntent-based flows.
    const sessionMeta = session.metadata ?? {}
    const paymentIntentMeta =
      session.payment_intent && typeof session.payment_intent === 'object'
        ? (session.payment_intent.metadata ?? {})
        : {}

    const jobId = sessionMeta.jobId ?? paymentIntentMeta.jobId

    if (!jobId) {
      console.error(
        'Webhook: no jobId found in session.metadata or payment_intent.metadata.',
        'Session ID:', session.id,
        'session.metadata:', JSON.stringify(sessionMeta),
        'payment_intent:', typeof session.payment_intent
      )
      // Return 200 — don't let Stripe retry endlessly for a configuration issue
      return Response.json({ received: true })
    }

    const supabase = createServerClient()

    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (!job) {
      console.error('Webhook: job not found for jobId', jobId)
      return Response.json({ received: true })
    }

    // Idempotency — Stripe retries events; skip if already processed
    if (job.deposit_paid) {
      console.log('Webhook: deposit already recorded for job', jobId, '— skipping')
      return Response.json({ received: true })
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        deposit_paid: true,
        status: 'scheduled',
        stripe_session_id: session.id,
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Webhook: failed to update job', jobId, updateError)
      return Response.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log('Webhook: job', jobId, 'marked scheduled — sending confirmation emails')

    const { data: updatedJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    // Send Templates 4 + 5 — never block webhook response on email failure
    try {
      if (updatedJob) {
        await Promise.all([sendCustomerBooked(updatedJob), sendOwnerBooked(updatedJob)])
        console.log('Webhook: confirmation emails sent for job', jobId)
      }
    } catch (emailError) {
      console.error('Webhook: confirmation emails failed (non-blocking):', emailError)
    }

    // Slack alert
    if (updatedJob) {
      notifyDepositPaid(
        `💰 *Deposit paid — Stripe*
*${updatedJob.client_name}* paid $100 deposit
🗓️ ${
          updatedJob.confirmed_date
            ? new Date(updatedJob.confirmed_date).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })
            : 'Date TBD'
        }
💵 Remaining balance: $${updatedJob.remaining_amount ?? 0}
🔗 ${
          process.env.NEXT_PUBLIC_SITE_URL
        }/admin/jobs/${updatedJob.id}`
      ).catch(() => {})
    }

    // Fire job-scheduled webhook for n8n day-before reminder
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
      }).catch((err) => console.error('job-scheduled webhook failed (stripe path):', err))
    }
  }

  // Always return 200 — Stripe interprets anything else as failure and retries
  return Response.json({ received: true })
}
