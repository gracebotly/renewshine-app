import { NextRequest } from 'next/server'
import { customerAbandonedTemplate } from '@/lib/email/templates/customer-abandoned'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = 'RenewShine <noreply@renewshine.co>'

export async function POST(request: NextRequest): Promise<Response> {
  // Validate shared secret — same pattern as all other n8n webhooks
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    jobId: string
    firstName: string
    clientEmail: string
    resumeUrl: string
  }

  const { jobId, firstName, clientEmail, resumeUrl } = body

  if (!clientEmail || !resumeUrl) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const { subject, html } = customerAbandonedTemplate({ firstName, clientEmail, resumeUrl })

    await resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject,
      html,
    })

    console.log(`Abandoned form reminder sent — jobId: ${jobId}, to: ${clientEmail}`)
    return Response.json({ sent: true })
  } catch (err) {
    console.error('Abandoned reminder email failed:', err)
    return Response.json({ error: 'Email send failed' }, { status: 500 })
  }
}
