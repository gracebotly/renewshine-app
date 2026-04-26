import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { sendCustomerQuote, sendQuoteReminder, sendExpiredLinkRecovery } from '@/lib/email'
import { notifyQuoteSent } from '@/lib/slack'

export async function POST(request: Request) {
  const { jobId, approvedPrice, confirmedDate, regenerate } = await request.json()

  // Validate
  if (!jobId || !approvedPrice || !confirmedDate) {
    return Response.json({ error: 'jobId, approvedPrice, and confirmedDate are required' }, { status: 400 })
  }
  if (Number(approvedPrice) <= 100) {
    return Response.json({ error: 'approvedPrice must be greater than $100' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Fetch job to get client details for email + metadata
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  // Create Stripe Payment Link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'RenewShine Cleaning Deposit',
            description: `Deposit for ${job.client_name} — confirms your booking`,
          },
          unit_amount: 10000, // $100.00 in cents
        },
        quantity: 1,
      },
    ],
    // payment_intent_data.metadata is copied to every CheckoutSession created
    // from this Payment Link — this is how jobId reaches the webhook handler.
    // Top-level metadata on a PaymentLink is NOT propagated to the session.
    payment_intent_data: {
      metadata: {
        jobId: job.id,
        client_email: job.client_email,
        client_name: job.client_name,
      },
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${siteUrl}/pay?session_id={CHECKOUT_SESSION_ID}`,
      },
    },
  })

  // Update job in Supabase
  const remaining = Number(approvedPrice) - 100
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'approved',
      approved_price: Number(approvedPrice),
      confirmed_date: confirmedDate,
      remaining_amount: remaining,
      stripe_payment_link: paymentLink.url,
    })
    .eq('id', jobId)

  if (updateError) {
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  // Fetch updated job for email (has confirmed_date and approved_price now)
  const { data: updatedJob } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  // Send the appropriate email based on whether this is a new quote or a regenerated link
  try {
    if (updatedJob) {
      if (regenerate) {
        // Expired link recovery — different subject + copy to re-engage the customer
        await sendExpiredLinkRecovery(updatedJob, paymentLink.url)
      } else {
        // First-time quote send
        await sendCustomerQuote(updatedJob, paymentLink.url)
      }
    }
  } catch (emailError) {
    console.error('send-deposit-link email failed (non-blocking):', emailError)
  }

  // Fire quote-approved webhook — n8n uses this to start the 24hr/48hr deposit follow-up sequence
  // Only fire on first-time quote sends (not regenerated/expired links — customer already has the link)
  if (!regenerate && updatedJob) {
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? ''
    fetch(`${siteUrl}/api/webhooks/quote-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify({
        jobId: updatedJob.id,
        clientName: updatedJob.client_name,
        clientPhone: updatedJob.client_phone,
        stripePaymentLink: paymentLink.url,
        confirmedDate: updatedJob.confirmed_date,
      }),
    }).catch(err => console.error('quote-approved webhook failed:', err))
  }

  // Slack alert — quote sent to customer
  notifyQuoteSent(
    `📋 *Quote sent*
*${job.client_name}* — $${approvedPrice} approved
📧 ${job.client_email}
Deposit link sent. Waiting for $100 deposit.`
  ).catch(() => {})

  return Response.json({ url: paymentLink.url })
}
