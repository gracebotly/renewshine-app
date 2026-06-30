import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId, channel } = await request.json()
  if (!templateId || !channel) {
    return Response.json({ error: 'templateId and channel required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('message_templates')
    .delete()
    .eq('template_id', templateId)
    .eq('channel', channel)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
