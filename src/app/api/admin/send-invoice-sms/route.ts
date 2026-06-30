import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { requireAdmin } from '@/lib/require-admin'
import { sendSms } from '@/lib/sms'
import { renderTemplate } from '@/lib/templates/render'
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaults'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, customSmsBody } = await request.json() as {
    jobId?: string
    customSmsBody?: string
  }
  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  if (error || !job) return Response.json({ error: 'Job not found' }, { status: 404 })
  if (!job.client_phone) return Response.json({ error: 'No phone number on file for this client' }, { status: 400 })

  const amountDue = Math.max(
    (job.approved_price ?? 0) - (job.deposit_paid ? (job.deposit_amount ?? 0) : 0),
    0
  )
  if (amountDue <= 0) {
    return Response.json({ error: 'Nothing due — amount is $0' }, { status: 400 })
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

  const supabaseTemplates = await supabase
    .from('message_templates')
    .select('subject, body')
    .eq('template_id', 'invoice')
    .eq('channel', 'sms')
    .maybeSingle()

  const row = supabaseTemplates.data
    ?? DEFAULT_TEMPLATES.find(t => t.templateId === 'invoice' && t.channel === 'sms')!

  const tokens = {
    firstName: job.client_name?.split(' ')[0] ?? 'there',
    service: getServiceLabel(job.service_type),
    total: `$${amountDue.toFixed(2)}`,
    balance: `$${amountDue.toFixed(2)}`,
  }

  const renderedBody = renderTemplate(row.body, tokens)
  const smsBody = (customSmsBody?.trim() || renderedBody)
    .replace('[deposit link included]', paymentLink.url)

  await sendSms(job.client_phone, smsBody)

  return Response.json({ success: true })
}

function getServiceLabel(serviceType: string | null | undefined): string {
  if (serviceType === 'standard') return 'Standard Clean'
  if (serviceType === 'deep') return 'Deep Clean'
  if (serviceType === 'move_out') return 'Move-In / Move-Out Clean'
  if (serviceType === 'post_construction') return 'Post-Construction Clean'
  return 'Cleaning Service'
}
