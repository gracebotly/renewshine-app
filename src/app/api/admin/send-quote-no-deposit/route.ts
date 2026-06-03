import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { sendSms } from '@/lib/sms'
import { sendContactQuoteReady } from '@/lib/email'

export async function POST(request: Request) {
  try { await requireAdmin() } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, channel = 'email', body } = await request.json()
  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  if (error || !job) return Response.json({ error: 'Job not found' }, { status: 404 })

  if (channel === 'sms') {
    if (!job.client_phone) return Response.json({ error: 'No phone on file' }, { status: 400 })
    const message = body || `Hi ${job.client_name.split(' ')[0]} — your quote is ready. Reply to confirm and I'll get you scheduled. — Grace, RenewShine`
    await sendSms(job.client_phone, message).catch(console.error)
  } else {
    await sendContactQuoteReady(job).catch(console.error)
  }

  return Response.json({ ok: true })
}
