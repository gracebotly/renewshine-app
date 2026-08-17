import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { buildRenderContext } from '@/lib/documents/context'
import { renderEmailDocument } from '@/lib/documents/render-email'
import { renderSmsDocument, smsSegmentCount } from '@/lib/documents/render-sms'
import { sanitizeDocument } from '@/lib/documents/types'
import type { Job } from '@/types/database'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as {
    jobId?: string
    document?: unknown
    approvedPrice?: number
    depositAmount?: number
    confirmedDate?: string | null
    recurringFrequency?: string
    recurringPriceOverride?: number
  }
  if (!body.jobId)
    return Response.json({ error: 'jobId is required' }, { status: 400 })
  const clean = sanitizeDocument(body.document)
  if (!clean)
    return Response.json({ error: 'Invalid document' }, { status: 400 })
  const supabase = createServerClient()
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', body.jobId)
    .single()
  if (error || !job)
    return Response.json({ error: 'Job not found' }, { status: 404 })
  const previewJob = {
    ...job,
    approved_price: Number(body.approvedPrice) || job.approved_price || 0,
    confirmed_date: body.confirmedDate ?? job.confirmed_date,
  } as Job
  const ctx = buildRenderContext({
    job: previewJob,
    depositOverride:
      Number(body.depositAmount) > 0 ? Number(body.depositAmount) : undefined,
    recurringFrequency: body.recurringFrequency,
    recurringPriceOverride: body.recurringPriceOverride
      ? Number(body.recurringPriceOverride)
      : undefined,
    depositLink: 'https://pay.stripe.com/preview',
    paymentLink: 'https://pay.stripe.com/preview',
  })
  if (clean.channel === 'sms') {
    const text = renderSmsDocument(clean, ctx)
    return Response.json({
      text,
      chars: text.length,
      segments: smsSegmentCount(text),
    })
  }
  const { subject, html } = renderEmailDocument(clean, ctx)
  return Response.json({ subject, html })
}
