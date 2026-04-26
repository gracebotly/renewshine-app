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
      payment_link?: string | null
      metadata?: Record<string, string>
    }

    const supabase = createServerClient()
    let job: any = null

    // PRIMARY: jobId in session metadata (future-proof once fixed)
    const jobId = session.metadata?.jobId
    if (jobId) {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      job = data
    }

    // FALLBACK: session.metadata is empty (current behavior with Payment Links)
    // Use session.payment_link ID -> retrieve PaymentLink from Stripe -> get URL -> find job by URL
    if (!job && session.payment_link) {
      try {
        const paymentLink = await stripe.paymentLinks.retrieve(session.payment_link)
        const linkUrl = paymentLink.url
        if (linkUrl) {
          const { data } = await supabase
            .from('jobs')
            .select('*')
            .eq('stripe_payment_link', linkUrl)
            .single()
          job = data
        }
      } catch (lookupErr) {
        console.error('Webhook: payment link lookup failed:', lookupErr)
      }
    }

    if (!job) {
      console.error('Webhook: could not resolve job for session', session.id)
      return Response.json({ received: true })
    }

    // Idempotency: already processed
    if (job.deposit_paid) {
      return Response.json({ received: true })
    }

    // Mark deposit paid and schedule job
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        deposit_paid: true,
        status: 'scheduled',
        stripe_session_id: session.id,
      })
      .eq('id', job.id)

    if (updateError) {
      console.error('Webhook: failed to update job', updateError)
      return Response.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Fetch updated job for email templates
    const { data: updatedJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job.id)
      .single()

    // Send Templates 4 + 5
    try {
      if (updatedJob) {
        await Promise.all([sendCustomerBooked(updatedJob), sendOwnerBooked(updatedJob)])
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
      ).catch(() => { })
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
      }).catch(err => console.error('job-scheduled webhook failed (stripe path):', err))
    }
  }

  return Response.json({ received: true })
}
