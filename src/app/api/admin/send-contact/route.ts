import { createServerClient } from '@/lib/supabase/server'
import { sendContactPhotos, sendContactQuoteReady } from '@/lib/email'
import { sendSms } from '@/lib/sms'
import { requireAdmin } from '@/lib/require-admin'

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return phone
}

async function logActivity(
  supabase: ReturnType<typeof createServerClient>,
  jobId: string,
  type: 'email' | 'sms' | 'external',
  label: string,
  body?: string
) {
  try {
    await supabase.from('job_activity').insert({ job_id: jobId, type, label, body })
  } catch {
    // Non-blocking — never let activity logging fail a send
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId, method, template, customBody, subject } = await request.json()
  if (!jobId || !method) return Response.json({ error: 'jobId and method are required' }, { status: 400 })
  if (!['email', 'sms', 'external'].includes(method)) return Response.json({ error: 'method must be email, sms, or external' }, { status: 400 })

  const supabase = createServerClient()
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) return Response.json({ error: 'Job not found' }, { status: 404 })

  let contactNote = ''

  if (method === 'email') {
    if (template === 'need_photos') {
      await sendContactPhotos(job)
      contactNote = 'Email sent — photos requested'
      await logActivity(supabase, jobId, 'email', 'Email sent — photos requested')
    } else if (template === 'quote_ready') {
      await sendContactQuoteReady(job)
      contactNote = 'Email sent — quote shared'
      await logActivity(supabase, jobId, 'email', 'Email sent — quote shared')
    } else if (template === 'appointment_confirmed') {
      // Fires the full sendCustomerBooked HTML template (prep notes, 48hr call, etc.)
      const { sendCustomerBooked } = await import('@/lib/email')
      await sendCustomerBooked(job)
      contactNote = 'Email sent — appointment confirmation with prep notes'
      await logActivity(supabase, jobId, 'email', 'Email sent — appointment confirmation')
    } else if (template === 'custom_formatted' && customBody?.trim()) {
      // Wraps any plain-text custom body in the branded base template HTML
      // Accepts optional subject via the request body
      const { baseTemplate, para, divider } = await import('@/lib/email/templates/base')
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY!)

      // Convert plain text paragraphs to HTML paras using existing base helper
      const paragraphs = customBody.trim().split(/\n\n+/).map((p: string) =>
        para(p.replace(/\n/g, '<br />'))
      ).join('')

      // Build a minimal content block with the body + divider + Grace sign-off
      const firstName = job.client_name?.split(' ')[0] ?? 'there'
      const content = `
        ${paragraphs}
        ${divider}
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
          — <strong style="color:#0f172a;">Grace</strong><br/>
          <span style="color:#4A7C59;font-weight:500;">RenewShine</span>
        </p>
      `
      // Allow custom subject via request body, fall back to generic
      const customSubject = subject?.trim() || `Message from RenewShine regarding your booking`

      await resend.emails.send({
        from:    'RenewShine Team <hello@renewshine.co>',
        to:      job.client_email,
        replyTo: 'hello@renewshine.co',
        subject: customSubject,
        html:    baseTemplate(content, `${firstName} — ${customSubject}`),
      })
      contactNote = `Formatted email sent: "${customBody.trim().slice(0, 80)}"`
      await logActivity(supabase, jobId, 'email', `Email sent — ${customSubject}`, customBody)
    } else if (template === 'custom' && customBody?.trim()) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY!)
      await resend.emails.send({
        from: 'RenewShine <noreply@renewshine.co>',
        to: job.client_email,
        replyTo: 'renewshinedmv@gmail.com',
        subject: 'Message from RenewShine regarding your booking',
        text: customBody.trim(),
      })
      contactNote = `Custom email sent: "${customBody.trim().slice(0, 80)}"`
      await logActivity(supabase, jobId, 'email', 'Email sent — Message from RenewShine regarding your booking', customBody)
    } else {
      return Response.json({ error: 'template or customBody required for email' }, { status: 400 })
    }
  }

  if (method === 'sms') {
    if (!job.client_phone) return Response.json({ error: 'No phone number on file for this job' }, { status: 400 })
    const body = customBody?.trim()
    if (!body) return Response.json({ error: 'customBody required for SMS' }, { status: 400 })

    const smsSid = await sendSms(job.client_phone, body)
    contactNote = `SMS sent: "${body.slice(0, 80)}"`
    await logActivity(supabase, jobId, 'sms', 'SMS sent', customBody)

    const normalizedPhone = toE164(job.client_phone ?? '')
    const { data: existingConv } = await supabase
      .from('sms_conversations')
      .select('id')
      .or(`contact_phone.eq.${job.client_phone},contact_phone.eq.${normalizedPhone}`)
      .maybeSingle()

    if (existingConv) {
      await supabase.from('sms_messages').insert({
        conversation_id: existingConv.id,
        direction: 'outbound',
        body,
        twilio_sid: smsSid ?? null,
        twilio_status: smsSid ? 'sent' : null,
      })
      await supabase
        .from('sms_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: `You: ${body.slice(0, 90)}`,
          status: 'waiting_on_customer',
          unread_count: 0,
        })
        .eq('id', existingConv.id)
    } else {
      const { data: newConv } = await supabase
        .from('sms_conversations')
        .insert({
          contact_phone: normalizedPhone,
          contact_name: job.client_name,
          last_message_at: new Date().toISOString(),
          last_message_preview: `You: ${body.slice(0, 90)}`,
          status: 'waiting_on_customer',
          lead_source: 'website',
          notes: null,
          tags: [],
        })
        .select('id')
        .single()

      if (newConv) await supabase.from('sms_messages').insert({
        conversation_id: newConv.id,
        direction: 'outbound',
        body,
        twilio_sid: smsSid ?? null,
        twilio_status: smsSid ? 'sent' : null,
      })
    }
  }

  if (method === 'external') {
    const labels = {
      text: 'Contacted via text (outside app)',
      email: 'Contacted via email (outside app)',
      verbal: 'Contacted verbally / by phone',
    }
    contactNote = labels[method as keyof typeof labels] ?? customBody?.trim() ?? 'Contacted outside the app'
    await logActivity(supabase, jobId, 'external', contactNote)
  }

  await supabase
    .from('jobs')
    .update({ status: 'contacted', contacted_at: new Date().toISOString(), contact_method: method, contact_note: contactNote })
    .eq('id', jobId)

  return Response.json({ ok: true, note: contactNote })
}
