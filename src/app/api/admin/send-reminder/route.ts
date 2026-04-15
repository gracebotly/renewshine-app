import { createServerClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/sms'

export async function POST(request: Request) {
  const { jobId } = await request.json()

  if (!jobId) {
    return Response.json({ error: 'jobId required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, client_name, client_phone, confirmed_date, availability_time_pref, address, status, deposit_paid')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  // Only allow for scheduled jobs
  if (!job.deposit_paid || job.status !== 'scheduled') {
    return Response.json({ error: 'Job is not scheduled' }, { status: 400 })
  }

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

  sendSms(job.client_phone, message).catch(err => console.error('send-reminder SMS failed:', err))

  return Response.json({ sent: true })
}
