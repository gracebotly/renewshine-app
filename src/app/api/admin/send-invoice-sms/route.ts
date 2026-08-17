import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { requireAdmin } from '@/lib/require-admin'
import { sendSms } from '@/lib/sms'
import type { Job } from '@/types/database'
import { loadDocument } from '@/lib/documents/load'
import { buildRenderContext } from '@/lib/documents/context'
import { renderSmsDocument } from '@/lib/documents/render-sms'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = (await request.json()) as { jobId?: string }
  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  if (error || !job)
    return Response.json({ error: 'Job not found' }, { status: 404 })
  if (!job.client_phone)
    return Response.json(
      { error: 'No phone number on file for this client' },
      { status: 400 }
    )

  const amountDue = Math.max(
    (job.approved_price ?? 0) -
      (job.deposit_paid ? (job.deposit_amount ?? 0) : 0),
    0
  )
  if (amountDue <= 0) {
    return Response.json(
      { error: 'Nothing due — amount is $0' },
      { status: 400 }
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  // Create Stripe Payment Link — same pattern as deposit flow.
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'RenewShine Cleaning Invoice',
            description: `Invoice balance for ${job.client_name}`,
          },
          unit_amount: Math.round(amountDue * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      jobId: job.id,
      client_email: job.client_email,
      client_name: job.client_name,
      type: 'invoice',
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${siteUrl}/pay?session_id={CHECKOUT_SESSION_ID}`,
      },
    },
  })

  await supabase
    .from('jobs')
    .update({
      stripe_payment_link: paymentLink.url,
      remaining_amount: amountDue,
    })
    .eq('id', jobId)

  const doc = await loadDocument(job as Job, 'invoice', 'sms')
  if (!doc || doc.channel !== 'sms') {
    return Response.json(
      { error: 'Invoice SMS document unavailable' },
      { status: 500 }
    )
  }
  const ctx = buildRenderContext({
    job: job as Job,
    paymentLink: paymentLink.url,
  })
  const smsBody = renderSmsDocument(doc, ctx)

  await sendSms(job.client_phone, smsBody)

  return Response.json({ success: true })
}
