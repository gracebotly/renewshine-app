import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/ratelimit'

const RATE_LIMIT = 20
const RATE_WINDOW_MS = 15 * 60 * 1000

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = getClientIp(request)
  if (!rateLimit(`resume-booking:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { token } = await params

  // Reject malformed tokens before touching the database.
  if (!token || !UUID_RE.test(token)) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createServerClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, status, client_name, client_email, client_phone, service_type')
    .eq('resume_token', token)
    .maybeSingle()

  if (error) {
    console.error('resume-booking: query failed:', error)
    return Response.json({ error: 'Lookup failed' }, { status: 500 })
  }

  if (!job) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  // Already submitted — the form must start clean rather than reopen a live job.
  if (job.status !== 'partial') {
    return Response.json({ error: 'Already submitted' }, { status: 410 })
  }

  return Response.json({
    jobId: job.id,
    clientName: job.client_name === 'Unknown' ? '' : job.client_name,
    clientEmail: job.client_email,
    clientPhone: job.client_phone ?? '',
    serviceType: job.service_type,
  })
}
