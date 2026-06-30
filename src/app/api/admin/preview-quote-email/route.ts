import { customerQuoteTemplate } from '@/lib/email/templates/customer-quote'
import { requireAdmin } from '@/lib/require-admin'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, approvedPrice, confirmedDate, lineItems, recurringFrequency, recurringPriceOverride, customEmailBody } = await request.json()

  if (!jobId) {
    return Response.json({ error: 'jobId is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  const previewJob = {
    ...job,
    approved_price: Number(approvedPrice) || job.approved_price || 0,
    confirmed_date: confirmedDate || job.confirmed_date,
    quote_line_items: Array.isArray(lineItems) && lineItems.length > 0
      ? lineItems
      : (job as any).quote_line_items ?? [],
  }

  const { html } = await customerQuoteTemplate(
    previewJob as any,
    '#preview-stripe-link',
    undefined,
    recurringFrequency as string | undefined,
    recurringPriceOverride ? Number(recurringPriceOverride) : undefined,
    customEmailBody as string | undefined
  )

  return Response.json({ html })
}
