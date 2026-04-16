import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { callerPhone, calledAt } = body

  if (!callerPhone || !calledAt) {
    return Response.json({ error: 'callerPhone and calledAt are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('missed_calls')
    .insert({
      caller_phone: callerPhone,
      called_at: calledAt,
      text_back_sent: true,
    })

  if (error) {
    // Non-fatal — return success so n8n does not retry indefinitely
    console.error('missed-call-log: failed to insert:', error)
  }

  console.log('missed-call-log: recorded missed call from', callerPhone)
  return Response.json({ received: true })
}
