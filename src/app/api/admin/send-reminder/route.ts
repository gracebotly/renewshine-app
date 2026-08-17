import { createServerClient } from '@/lib/supabase/server'
import { sendRenderedEmail } from '@/lib/email'
import { sendSms } from '@/lib/sms'
import { requireAdmin } from '@/lib/require-admin'
import type { Job } from '@/types/database'
import { loadDocument } from '@/lib/documents/load'
import { buildRenderContext } from '@/lib/documents/context'
import { renderEmailDocument } from '@/lib/documents/render-email'
import { renderSmsDocument } from '@/lib/documents/render-sms'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, channel = 'sms' } = await request.json()
  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })
  if (channel !== 'email' && channel !== 'sms') {
    return Response.json(
      { error: 'channel must be email or sms' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()
  const { data: job, error } = await supabase
    .from('jobs')
    .select(
      'id, client_name, client_phone, client_email, confirmed_date, availability_start, availability_end, availability_time_pref, confirmed_arrival_pref, address, status, deposit_paid, message_documents, service_type, bedrooms, bathrooms, add_ons, approved_price, deposit_amount, service_frequency, stripe_payment_link, quote_line_items'
    )
    .eq('id', jobId)
    .single()

  if (error || !job)
    return Response.json({ error: 'Job not found' }, { status: 404 })

  // Only allow for scheduled jobs. This guard intentionally precedes document work.
  if (!job.deposit_paid || job.status !== 'scheduled') {
    return Response.json({ error: 'Job is not scheduled' }, { status: 400 })
  }
  if (channel === 'sms' && !job.client_phone) {
    return Response.json({ error: 'No phone number on file' }, { status: 400 })
  }

  const doc = await loadDocument(job as Job, 'reminder', channel)
  const ctx = buildRenderContext({ job: job as Job })

  if (doc && doc.channel === 'sms') {
    await sendSms(job.client_phone!, renderSmsDocument(doc, ctx))
  } else if (doc && doc.channel === 'email') {
    const { subject, html } = renderEmailDocument(doc, ctx)
    await sendRenderedEmail(job.client_email, subject, html)
  } else {
    // Legacy fallback — retained until 3B proves the document path.
    const firstName = job.client_name.split(' ')[0]
    const timePrefMap: Record<string, string> = {
      early_morning: '8am–10am',
      mid_morning: '10am–12pm',
      noon: '12pm–2pm',
      early_afternoon: '2pm–4pm',
      late_afternoon: '4pm–6pm',
      flexible: 'Morning to Afternoon',
      morning: '8am–12pm',
      afternoon: '12pm–5pm',
    }
    const timeWindow = job.availability_time_pref
      ? (timePrefMap[job.availability_time_pref] ?? 'your scheduled window')
      : 'your scheduled window'
    const message = `Hi ${firstName} 👋 Reminder: your RenewShine clean is tomorrow. Arrival window: ${timeWindow}. Address: ${job.address ?? 'on file'}. Questions? Just reply. See you then! — RenewShine`
    if (channel === 'sms') {
      await sendSms(job.client_phone!, message).catch((err) =>
        console.error('send-reminder SMS failed:', err)
      )
    } else {
      await sendRenderedEmail(
        job.client_email,
        'Reminder: your RenewShine clean is tomorrow',
        message
      )
    }
  }

  return Response.json({ sent: true })
}
