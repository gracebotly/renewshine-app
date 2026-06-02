import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import { sendOwnerBooked } from '@/lib/email'
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string
      metadata?: Record<string, string> | null
      payment_link?: string | null
    }

    const supabase = createServerClient()

    // PRIMARY: jobId from session.metadata — populated when PaymentLink has top-level metadata
    const jobId: string | null = session.metadata?.jobId ?? null
    const paymentType: string = session.metadata?.type ?? 'deposit'

    // FALLBACK: if metadata missing (e.g. older Payment Links without metadata),
    // look up the job by the Stripe payment_link URL stored in our database
    let resolvedJobId = jobId

    if (!resolvedJobId && session.payment_link) {
      console.log('Webhook: no jobId in session.metadata — attempting fallback lookup by payment_link ID:', session.payment_link)

      // Fetch the Payment Link object from Stripe to get its URL
      const paymentLinkObj = await stripe.paymentLinks.retrieve(session.payment_link)

      if (paymentLinkObj?.url) {
        const { data: jobByLink } = await supabase
          .from('jobs')
          .select('id')
          .eq('stripe_payment_link', paymentLinkObj.url)
          .single()

        if (jobByLink?.id) {
          resolvedJobId = jobByLink.id
          console.log('Webhook: fallback lookup succeeded — jobId:', resolvedJobId)
        }
      }
    }

    if (!resolvedJobId) {
      console.error(
        'Webhook: could not resolve jobId from session.metadata or payment_link fallback.',
        'Session ID:', session.id,
        'session.metadata:', JSON.stringify(session.metadata),
        'payment_link:', session.payment_link
      )
      // Return 200 — don't let Stripe retry endlessly for a configuration issue
      return Response.json({ received: true })
    }

    // Fetch job — also serves as idempotency check
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', resolvedJobId)
      .single()

    if (!job) {
      console.error('Webhook: job not found for jobId', resolvedJobId)
      return Response.json({ received: true })
    }

    // Idempotency — Stripe retries events; skip if already processed
    if (job.deposit_paid || job.status === 'completed') {
      console.log('Webhook: payment already recorded for job', resolvedJobId, '— skipping')
      return Response.json({ received: true })
    }

    const jobUpdate =
      paymentType === 'invoice'
        ? {
            // Invoice payment — mark remaining balance as cleared, move to completed
            remaining_amount: 0,
            status: 'completed' as const,
            stripe_session_id: session.id,
          }
        : {
            // Deposit payment — standard flow
            deposit_paid: true,
            status: 'scheduled' as const,
            stripe_session_id: session.id,
          }

    const { error: updateError } = await supabase
      .from('jobs')
      .update(jobUpdate)
      .eq('id', resolvedJobId)

    if (updateError) {
      console.error('Webhook: failed to update job', resolvedJobId, updateError)
      // Return 500 so Stripe retries — idempotency check above prevents double processing
      return Response.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log('Webhook: job', resolvedJobId, 'marked scheduled — sending owner deposit alert')

    const { data: updatedJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', resolvedJobId)
      .single()

    // Template 5 — owner deposit alert fires automatically
    // Template 4 (customer confirmation) is sent manually by Grace after she confirms the final date
    try {
      if (updatedJob && paymentType !== 'invoice') {
        await sendOwnerBooked(updatedJob)
        console.log('Webhook: owner booked email sent for job', resolvedJobId)
      }
    } catch (emailError) {
      console.error('Webhook: owner booked email failed (non-blocking):', emailError)
    }

    // Slack alert
    if (updatedJob) {
      notifyDepositPaid(
        `💰 *Deposit paid — Stripe*
*${updatedJob.client_name}* paid $100 deposit
🗓️ ${
          updatedJob.confirmed_date
            ? new Date(updatedJob.confirmed_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : 'Date TBD'
        }
💵 Remaining balance: $${updatedJob.remaining_amount ?? 0}
🔗 ${process.env.NEXT_PUBLIC_SITE_URL}/admin/jobs/${updatedJob.id}`
      ).catch(() => {})
    }

    // Fire job-scheduled webhook for n8n day-before reminder — deposit only
    if (updatedJob && paymentType !== 'invoice') {
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
