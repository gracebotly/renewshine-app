import { customerQuoteTemplate } from '@/lib/email/templates/customer-quote'
import { requireAdmin } from '@/lib/require-admin'
import { createServerClient } from '@/lib/supabase/server'
import type { Job } from '@/types/database'
import { loadDocument } from '@/lib/documents/load'
import { buildRenderContext } from '@/lib/documents/context'
import { renderEmailDocument } from '@/lib/documents/render-email'

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

  const doc = await loadDocument(previewJob as Job, 'quote_dep', 'email')

  if (doc && doc.channel === 'email') {
    const ctx = buildRenderContext({
      job: previewJob as Job,
      recurringFrequency: recurringFrequency as string | undefined,
      recurringPriceOverride: recurringPriceOverride ? Number(recurringPriceOverride) : undefined,
      depositLink: '#preview-stripe-link',
    })
    const { html } = renderEmailDocument(doc, ctx)
    return Response.json({ html, source: 'document' })
  }

  // Legacy fallback — removed in Prompt 3 once the document path is proven.
  const { html } = await customerQuoteTemplate(
    previewJob as any,
    '#preview-stripe-link',
    undefined,
    recurringFrequency as string | undefined,
    recurringPriceOverride ? Number(recurringPriceOverride) : undefined,
    customEmailBody as string | undefined
  )

  return Response.json({ html, source: 'legacy' })
}
