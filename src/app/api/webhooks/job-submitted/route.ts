import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Payload is logged for n8n audit trail — actual SMS fires directly from create-job
  const body = await request.json()
  console.log('job-submitted webhook received:', body.jobId)

  return Response.json({ received: true })
}
