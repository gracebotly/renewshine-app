import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { sendCustomerQuote, sendQuoteReminder, sendExpiredLinkRecovery } from '@/lib/email'
import { notifyQuoteSent } from '@/lib/slack'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, approvedPrice, confirmedDate, regenerate, lineItems } = await request.json()

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
    // Top-level metadata on a PaymentLink IS copied to every CheckoutSession
    // created from this link — this is what populates session.metadata in the
    // checkout.session.completed webhook event. Do NOT use payment_intent_data.metadata
    // here — that only goes to the PaymentIntent, not to the session.
    metadata: {
      jobId: job.id,
      client_email: job.client_email,
      client_name: job.client_name,
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
  const updatePayload: Record<string, unknown> = {
    status: 'approved',
    approved_price: Number(approvedPrice),
    confirmed_date: confirmedDate,
    remaining_amount: remaining,
    stripe_payment_link: paymentLink.url,
  }
  if (Array.isArray(lineItems) && lineItems.length > 0) {
    updatePayload.quote_line_items = lineItems
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update(updatePayload)
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
