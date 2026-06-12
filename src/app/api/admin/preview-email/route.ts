import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { customerQuoteTemplate } from '@/lib/email/templates/customer-quote'
import { customerInvoiceTemplate } from '@/lib/email/templates/customer-invoice'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    type: 'quote' | 'invoice'
    jobId: string
    approvedPrice?: number
    depositAmount?: number
    confirmedDate?: string
    lineItems?: Array<{ description: string; amount: number }>
    dueDate?: string
    businessName?: string
    preparedForAddress?: string
    notes?: string
    depositCredit?: number
    arrivalTime?: string
  }

  const { type, jobId } = body

  if (!type || !jobId) {
    return Response.json({ error: 'type and jobId are required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).single()

  if (error || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  let html = ''

  if (type === 'quote') {
    const previewJob = {
      ...job,
      approved_price: Number(body.approvedPrice) || job.approved_price || 0,
      confirmed_date: body.confirmedDate ?? job.confirmed_date,
    }

    const depositOverride = Number(body.depositAmount) > 0 ? Number(body.depositAmount) : undefined
    const { html: rendered } = customerQuoteTemplate(previewJob as any, '#preview-deposit-link', depositOverride)
    html = rendered
  }

  if (type === 'invoice') {
    const lineItems = body.lineItems ?? []
    const total = lineItems.reduce((sum, i) => sum + i.amount, 0)
    const depositPaid =
      typeof body.depositCredit === 'number'
        ? body.depositCredit
        : job.deposit_paid
          ? (job.deposit_amount ?? 100)
          : 0
    const amountDue = Math.max(total - depositPaid, 0)

    const year = new Date(job.created_at).getFullYear()
    const suffix = (parseInt(job.id.replace(/-/g, '').slice(-4), 16) % 9000) + 1000
    const invoiceNumber = `RS-${year}-${suffix}`

    const dueDateStr = body.dueDate
      ? new Date(body.dueDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'TBD'

    const serviceDateStr = job.confirmed_date
      ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null

    const { html: rendered } = customerInvoiceTemplate({
      clientName: job.client_name,
      clientEmail: job.client_email,
      businessName: body.businessName?.trim() || job.business_name || null,
      address: body.preparedForAddress?.trim() || job.address || null,
      invoiceNumber,
      lineItems,
      total,
      depositPaid,
      amountDue,
      dueDate: dueDateStr,
      paymentUrl: '#preview-payment-link',
      serviceDate: serviceDateStr,
      arrivalTime: body.arrivalTime?.trim() || null,
      notes: body.notes?.trim() || null,
    })
    html = rendered
  }

  return Response.json({ html })
}
