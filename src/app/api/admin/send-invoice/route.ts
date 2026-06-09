import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { sendCustomerInvoice } from '@/lib/email'
import { requireAdmin } from '@/lib/require-admin'

export interface InvoiceLineItem {
  description: string
  amount: number // dollars
}

// Generate RS-YYYY-NNNN invoice number — deterministic from job id + year
function generateInvoiceNumber(jobCreatedAt: string, jobId: string): string {
  const year = new Date(jobCreatedAt).getFullYear()
  const suffix = (parseInt(jobId.replace(/-/g, '').slice(-4), 16) % 9000) + 1000
  return `RS-${year}-${suffix}`
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, lineItems, dueDate, businessName, preparedForAddress, notes, depositCredit: depositCreditOverride } = await request.json() as {
    jobId: string
    lineItems: InvoiceLineItem[]
    dueDate: string       // ISO date string — always required, sent by client
    businessName?: string
    preparedForAddress?: string
    notes?: string
    depositCredit?: number
  }

  if (!jobId || !lineItems || lineItems.length === 0) {
    return Response.json({ error: 'jobId and at least one line item are required' }, { status: 400 })
  }

  if (!dueDate) {
    return Response.json({ error: 'Due date is required' }, { status: 400 })
  }

  for (const item of lineItems) {
    if (!item.description?.trim()) {
      return Response.json({ error: 'Each line item must have a description' }, { status: 400 })
    }
    if (!item.amount || item.amount <= 0) {
      return Response.json({ error: 'Each line item must have a positive amount' }, { status: 400 })
    }
  }

  const supabase = createServerClient()

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const depositPaid = typeof depositCreditOverride === 'number' ? depositCreditOverride : (job.deposit_paid ? (job.deposit_amount ?? 100) : 0)
  const amountDue = Math.max(total - depositPaid, 0)

  if (amountDue <= 0) {
    return Response.json({ error: 'Amount due must be greater than $0' }, { status: 400 })
  }

  const invoiceNumber = generateInvoiceNumber(job.created_at, job.id)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  // Create Stripe Payment Link — same pattern as deposit flow
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `RenewShine Invoice ${invoiceNumber}`,
            description: lineItems.map((i) => i.description).join(' · '),
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
      invoice_number: invoiceNumber,
      type: 'invoice',
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${siteUrl}/pay?session_id={CHECKOUT_SESSION_ID}`,
      },
    },
  })

  // Store invoice link on the job — do NOT touch status, keep whatever it currently is
  await supabase
    .from('jobs')
    .update({
      stripe_payment_link: paymentLink.url,
      approved_price: total,
      remaining_amount: amountDue,
    })
    .eq('id', jobId)

  // Format due date for email display
  const dueDateStr = new Date(dueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Format service date if available
  const serviceDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // Send branded invoice email via Resend
  try {
    await sendCustomerInvoice({
      clientName: job.client_name,
      clientEmail: job.client_email,
      businessName: businessName?.trim() || job.business_name || null,
      address: preparedForAddress?.trim() || job.address || null,
      invoiceNumber,
      lineItems,
      total,
      depositPaid,
      amountDue,
      dueDate: dueDateStr,
      paymentUrl: paymentLink.url,
      serviceDate: serviceDateStr,
      notes: notes?.trim() || null,
    })
  } catch (emailError) {
    console.error('Invoice email failed (non-blocking):', emailError)
  }

  return Response.json({ paymentUrl: paymentLink.url, invoiceNumber, amountDue })
}
