import { requireAdmin } from '@/lib/require-admin'
import { baseTemplate } from '@/lib/email/templates/base'

// Generic preview for the 4 templates that send as baseTemplate(plain paragraphs)
// at actual send time: photos, quote_no, appt, reminder. quote_dep and invoice have
// their own fully designed layouts and use their existing dedicated preview routes
// instead of this one — see preview-quote-email and preview-email (type: 'invoice').
export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subject, body } = await request.json() as { subject?: string; body?: string }

  if (!body || !body.trim()) {
    return Response.json({ error: 'body is required' }, { status: 400 })
  }

  const content = body
    .trim()
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;">${escapeHtml(p)}</p>`)
    .join('')

  const html = baseTemplate(content, subject ?? 'RenewShine')
  return Response.json({ html })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
