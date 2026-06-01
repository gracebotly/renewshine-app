import { createServerClient } from '@/lib/supabase/server'
import { sendContactPhotos, sendContactQuoteReady } from '@/lib/email'
import { sendSms } from '@/lib/sms'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: Request) { /* trimmed for brevity in command */
  try { await requireAdmin() } catch (err) { if (err instanceof Response) return err; return Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { jobId, method, template, customBody } = await request.json()
  if (!jobId || !method) return Response.json({ error: 'jobId and method are required' }, { status: 400 })
  if (!['email', 'sms', 'external'].includes(method)) return Response.json({ error: 'method must be email, sms, or external' }, { status: 400 })
  const supabase = createServerClient(); const { data: job, error: fetchError } = await supabase.from('jobs').select('*').eq('id', jobId).single(); if (fetchError || !job) return Response.json({ error: 'Job not found' }, { status: 404 })
  let contactNote = ''
  if (method === 'email') {
    if (template === 'need_photos') {
      await sendContactPhotos(job)
      contactNote = 'Email sent — photos requested'
    } else if (template === 'quote_ready') {
      await sendContactQuoteReady(job)
      contactNote = 'Email sent — quote shared'
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
    } else {
      return Response.json({ error: 'template or customBody required for email' }, { status: 400 })
    }
  }
  if (method === 'sms') { if (!job.client_phone) return Response.json({ error: 'No phone number on file for this job' }, { status: 400 }); const body = customBody?.trim(); if (!body) return Response.json({ error: 'customBody required for SMS' }, { status: 400 }); await sendSms(job.client_phone, body); contactNote = `SMS sent: "${body.slice(0, 80)}"`; const { data: existingConv } = await supabase.from('sms_conversations').select('id').eq('contact_phone', job.client_phone).maybeSingle(); if (existingConv) { await supabase.from('sms_messages').insert({ conversation_id: existingConv.id, direction: 'outbound', body }); await supabase.from('sms_conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: `You: ${body.slice(0, 90)}`, status: 'waiting_on_customer', unread_count: 0 }).eq('id', existingConv.id) } else { const { data: newConv } = await supabase.from('sms_conversations').insert({ contact_phone: job.client_phone, contact_name: job.client_name, last_message_at: new Date().toISOString(), last_message_preview: `You: ${body.slice(0, 90)}`, status: 'waiting_on_customer', lead_source: 'website', notes: null, tags: [] }).select('id').single(); if (newConv) await supabase.from('sms_messages').insert({ conversation_id: newConv.id, direction: 'outbound', body }) } }
  if (method === 'external') { contactNote = customBody?.trim() ? customBody.trim() : 'Contacted outside the app' }
  await supabase.from('jobs').update({ status: 'contacted', contacted_at: new Date().toISOString(), contact_method: method, contact_note: contactNote }).eq('id', jobId)
  return Response.json({ success: true, contactNote })
}
