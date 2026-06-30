import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaults'
import type { MessageTemplate, TemplateChannel, TemplateId } from '@/lib/templates/types'

const VALID_IDS: TemplateId[] = ['photos', 'quote_dep', 'quote_dep_bullets', 'quote_dep_next_steps', 'quote_no', 'appt', 'reminder', 'invoice']
const VALID_CHANNELS: TemplateChannel[] = ['email', 'sms']

export async function GET() {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('message_templates')
    .select('template_id, channel, subject, body')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const dbRows = (data ?? []).map(r => ({
    templateId: r.template_id as TemplateId,
    channel: r.channel as TemplateChannel,
    subject: r.subject,
    body: r.body,
  }))

  // DB row wins if present, otherwise fall back to the hardcoded default.
  // Guarantees every (templateId, channel) pair always returns something.
  const merged: MessageTemplate[] = DEFAULT_TEMPLATES.map(def => {
    const override = dbRows.find(r => r.templateId === def.templateId && r.channel === def.channel)
    return override ?? def
  })

  return Response.json({ templates: merged })
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId, channel, subject, body } = await request.json()

  if (!VALID_IDS.includes(templateId)) {
    return Response.json({ error: 'Invalid templateId' }, { status: 400 })
  }
  if (!VALID_CHANNELS.includes(channel)) {
    return Response.json({ error: 'Invalid channel' }, { status: 400 })
  }
  if (typeof body !== 'string' || !body.trim()) {
    return Response.json({ error: 'Body cannot be empty' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('message_templates')
    .upsert({
      template_id: templateId,
      channel,
      subject: channel === 'email' ? (subject ?? '') : null,
      body,
      updated_at: new Date().toISOString(),
    })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
