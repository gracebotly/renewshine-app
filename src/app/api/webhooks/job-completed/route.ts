import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  console.log('job-completed webhook received:', body.jobId)

  // n8n receives:
  //   jobId, clientName, clientPhone, clientEmail  — for rating SMS
  //   remainingAmount, stripePaymentLink           — for balance collection SMS
  //
  // n8n WF-04 runs two parallel tracks:
  //   Track A (balance): immediate SMS with Stripe balance link if remainingAmount > 0
  //   Track B (rating):  2hr wait → rating request → score 4-5 sends review link,
  //                      score 1-3 sends re-clean offer + POSTs to /api/webhooks/flag-job
  //   Both tracks POST score to /api/webhooks/store-rating when reply received

  return Response.json({ received: true })
}
