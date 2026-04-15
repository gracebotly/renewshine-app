import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  console.log('job-completed webhook received:', body.jobId)

  // n8n receives: { jobId, clientName, clientPhone, clientEmail }
  // n8n then runs: 2hr wait → rating request SMS → route on reply score

  return Response.json({ received: true })
}
