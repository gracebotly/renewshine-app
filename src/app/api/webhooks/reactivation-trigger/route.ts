import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { jobId, clientPhone } = body

  if (!jobId || !clientPhone) {
    return Response.json({ error: 'jobId and clientPhone are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('reactivation_log')
    .insert({
      job_id: jobId,
      client_phone: clientPhone,
    })

  if (error) {
    // Non-fatal — log but return success so n8n does not retry
    console.error('reactivation-trigger: failed to log event:', error)
  }

  console.log(`reactivation-trigger: logged reactivation for job ${jobId}`)
  return Response.json({ logged: true })
}
