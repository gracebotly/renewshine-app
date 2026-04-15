import { NextRequest } from 'next/server'
import { sendSms } from '@/lib/sms'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  // Payload from n8n: { jobId, clientName, clientPhone, timePreference, address }
  const { clientName, clientPhone, timePreference, address } = body

  if (!clientPhone) {
    return Response.json({ error: 'clientPhone required' }, { status: 400 })
  }

  const firstName = (clientName ?? 'there').split(' ')[0]

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
  const timeWindow = timePreference
    ? (timePrefMap[timePreference] ?? 'your scheduled window')
    : 'your scheduled window'

  const message = `Hi ${firstName}! Your RenewShine clean is today. We'll arrive between ${timeWindow}. Address: ${address ?? 'on file'}. See you soon! — RenewShine`

  sendSms(clientPhone, message).catch(err => console.error('job-day-of SMS failed:', err))

  console.log(`job-day-of: sent day-of reminder to ${clientPhone}`)
  return Response.json({ sent: true })
}
