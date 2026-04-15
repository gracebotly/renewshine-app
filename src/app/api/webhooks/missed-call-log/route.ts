import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  // body: { callerPhone: string, calledAt: string }
  console.log('missed-call-log received:', body.callerPhone, body.calledAt)

  // Future: insert into a missed_calls table. For now, log only.
  return Response.json({ received: true })
}
