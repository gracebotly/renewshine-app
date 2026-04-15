import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  console.log('quote-approved webhook received:', body.jobId)

  // n8n receives: { jobId, clientName, clientPhone, stripePaymentLink, confirmedDate }
  // n8n then runs: 24hr wait → check deposit status → follow-up SMS if still unpaid

  return Response.json({ received: true })
}
