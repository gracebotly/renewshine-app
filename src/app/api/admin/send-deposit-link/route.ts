import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { sendCustomerQuote, sendQuoteReminder, sendExpiredLinkRecovery } from '@/lib/email'
import { notifyQuoteSent } from '@/lib/slack'
import { requireAdmin } from '@/lib/require-admin'
import { sendSms } from '@/lib/sms'

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return phone
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, approvedPrice, depositAmount, confirmedDate, regenerate, channel = 'email', customSmsBody, recurringFrequency, recurringPriceOverride } = await request.json()

  // Validate
  if (!jobId || !approvedPrice) {
    return Response.json({ error: 'jobId and approvedPrice are required' }, { status: 400 })
  }
  // Deposit amount — use what was passed, fall back to 100 only if not provided
  const resolvedDeposit = Number(depositAmount) > 0 ? Number(depositAmount) : 100

  if (!['email', 'sms'].includes(channel)) {
    return Response.json({ error: 'channel must be email or sms' }, { status: 400 })
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
  if (channel === 'sms' && !job.client_phone) {
    return Response.json({ error: 'No phone number on file for this job' }, { status: 400 })
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
          unit_amount: Math.round(resolvedDeposit * 100), // in cents
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
  const remaining = Math.max(Number(approvedPrice) - resolvedDeposit, 0)
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'approved',
      approved_price: Number(approvedPrice),
      deposit_amount: resolvedDeposit,
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

  // Send via the requested channel
  try {
    if (updatedJob) {
      if (channel === 'sms') {
        // SMS deposit link — premium, personal, direct
        if (job.client_phone) {
          const firstName    = job.client_name.split(' ')[0]
          const serviceLabels: Record<string, string> = {
            standard:          'Standard Clean',
            deep:              'Deep Clean',
            move_out:          'Move-In / Move-Out',
            post_construction: 'Post-Construction',
          }
          const serviceLabel = serviceLabels[job.service_type ?? ''] ?? 'cleaning service'
          const total     = Number(approvedPrice)
          const deposit   = resolvedDeposit
          const remaining = Math.max(total - deposit, 0)

          // Use custom body if Grace edited it — otherwise use the default template
          const smsBody = (customSmsBody as string | undefined)?.trim() || (
            `Hi ${firstName}, your RenewShine ${serviceLabel} quote is $${total.toLocaleString()}.

` +
            `To lock in your date, complete your $${deposit} deposit here:
${paymentLink.url}

` +
            `Remaining balance of $${remaining.toLocaleString()} is due after the clean.

` +
            `— Grace`
          )
          const finalSmsBody = smsBody.replace('[deposit link included]', paymentLink.url)
          await sendSms(job.client_phone, finalSmsBody)

          // Log to inbox thread — same pattern as send-contact/route.ts
          const normalizedPhone = toE164(job.client_phone)
          const preview = `You: ${finalSmsBody.slice(0, 90)}`
          const { data: existingConv } = await supabase
            .from('sms_conversations')
            .select('id')
            .or(`contact_phone.eq.${job.client_phone},contact_phone.eq.${normalizedPhone}`)
            .maybeSingle()

          if (existingConv) {
            await supabase.from('sms_messages').insert({
              conversation_id: existingConv.id,
              direction: 'outbound',
              body: finalSmsBody,
            })
            await supabase.from('sms_conversations').update({
              last_message_at: new Date().toISOString(),
              last_message_preview: preview,
              status: 'waiting_on_customer',
              unread_count: 0,
            }).eq('id', existingConv.id)
          } else {
            const { data: newConv } = await supabase
              .from('sms_conversations')
              .insert({
                contact_phone: normalizedPhone,
                contact_name: job.client_name,
                last_message_at: new Date().toISOString(),
                last_message_preview: preview,
                status: 'waiting_on_customer',
                lead_source: 'website',
                notes: null,
                tags: [],
              })
              .select('id')
              .single()
            if (newConv) {
              await supabase.from('sms_messages').insert({
                conversation_id: newConv.id,
                direction: 'outbound',
                body: finalSmsBody,
              })
            }
          }
        } else {
          console.warn('send-deposit-link: SMS channel requested but no client_phone on job', jobId)
        }
      } else {
        // Email channel (default)
        if (regenerate) {
          await sendExpiredLinkRecovery(updatedJob, paymentLink.url)
        } else {
          await sendCustomerQuote(
            updatedJob,
            paymentLink.url,
            resolvedDeposit,
            recurringFrequency as string | undefined,
            recurringPriceOverride ? Number(recurringPriceOverride) : undefined
          )
        }
      }
    }
  } catch (sendError) {
    console.error('send-deposit-link send failed (non-blocking):', sendError)
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
