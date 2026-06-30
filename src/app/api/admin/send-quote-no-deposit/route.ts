import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { sendSms } from '@/lib/sms'
import { baseTemplate } from '@/lib/email/templates/base'

export async function POST(request: Request) {
  try { await requireAdmin() } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, channel = 'email', body, subject } = await request.json()
  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  if (error || !job) return Response.json({ error: 'Job not found' }, { status: 404 })

  if (channel === 'sms') {
    if (!job.client_phone) return Response.json({ error: 'No phone on file' }, { status: 400 })
    const message = body || `Hi ${job.client_name.split(' ')[0]} — your quote is ready. Reply to confirm and I'll get you scheduled. — Grace, RenewShine`
    await sendSms(job.client_phone, message).catch(console.error)
  } else {
    if (!job.client_email) return Response.json({ error: 'No email on file' }, { status: 400 })
    const emailBody = typeof body === 'string' && body.trim()
      ? body
      : `Hi ${job.client_name?.split(' ')[0] ?? 'there'} — your quote is ready. Reply to confirm and I'll get you scheduled. — Grace, RenewShine`
    const content = emailBody
      .trim()
      .split(/\n{2,}/)
      .map((p: string) => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;">${p}</p>`)
      .join('')
    const emailSubject = typeof subject === 'string' && subject.trim()
      ? subject.trim()
      : `${job.client_name?.split(' ')[0] ?? ''}, your RenewShine quote is ready`

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'RenewShine Team <hello@renewshine.co>',
      to: job.client_email,
      replyTo: 'hello@renewshine.co',
      subject: emailSubject,
      html: baseTemplate(content, emailSubject),
    })
  }

  return Response.json({ ok: true })
}
