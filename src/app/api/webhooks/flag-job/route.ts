import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { jobId, rating } = body

  if (!jobId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return Response.json({ error: 'jobId and rating (1–5) are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('jobs')
    .update({ satisfaction_score: rating })
    .eq('id', jobId)

  if (error) {
    console.error('flag-job: failed to update satisfaction_score:', error)
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  console.log(`flag-job: job ${jobId} flagged with score ${rating}`)

  // Owner alert — fires immediately when a low score (1–3) is received
  // Non-blocking — never let SMS failure affect the webhook response
  const { sendSms } = await import('@/lib/sms')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  sendSms(
    process.env.OWNER_PHONE ?? null,
    `⚠️ Low rating — job ${jobId} scored ${rating}/5. Review and consider re-clean offer: ${siteUrl}/admin/jobs/${jobId}`
  ).catch(err => console.error('flag-job owner alert SMS failed:', err))

  return Response.json({ flagged: true })
}
