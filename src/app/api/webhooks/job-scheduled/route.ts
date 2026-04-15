import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  console.log('job-scheduled webhook received:', body.jobId)

  // n8n receives: { jobId, clientName, clientPhone, confirmedDate, timePreference, address }
  // n8n then runs: wait until day before at 9am → send reminder SMS

  return Response.json({ received: true })
}
