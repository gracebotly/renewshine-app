import { createServerClient } from '@/lib/supabase/server'
import { sendOwnerNewJobAlert, sendCustomerSubmittedConfirmation } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/ratelimit'

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 15 * 60 * 1000

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  if (!rateLimit(`update-job:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return Response.json(
      { error: 'Too many requests. Please wait a few minutes and try again.' },
      { status: 429 }
    )
  }

  const { id } = await params
  if (!id) {
    return Response.json({ error: 'Missing job ID' }, { status: 400 })
  }

  const body = await request.json()
  const supabase = createServerClient()

  // Verify the job exists and is still partial before updating
  const { data: existing, error: fetchError } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  if (existing.status !== 'partial') {
    return Response.json({ error: 'Job is no longer editable' }, { status: 409 })
  }

  const { media_urls = [], ...jobData } = body

  const { data: job, error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'new' as const,
      client_name: jobData.client_name,
      client_phone: jobData.client_phone || null,
      address: jobData.address || null,
      service_type: jobData.service_type || null,
      service_frequency: jobData.service_frequency || null,
      bedrooms: jobData.bedrooms ?? null,
      bathrooms: jobData.bathrooms ?? null,
      add_ons: jobData.add_ons ?? [],
      condition: jobData.condition || null,
      pets: jobData.pets || null,
      home_entry: jobData.home_entry || null,
      availability_start: jobData.availability_start || null,
      availability_end: jobData.availability_end || null,
      availability_time_pref: jobData.availability_time_pref || null,
      estimated_price_low: 0,
      estimated_price_high: 0,
      notes: jobData.notes || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError || !job) {
    console.error('Job update error:', updateError)
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  // Insert any media
  if (media_urls.length > 0) {
    const mediaRows = media_urls.map((url: string) => ({
      job_id: job.id,
      file_url: url,
      file_type: url?.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image',
    }))
    await supabase.from('job_media').insert(mediaRows)
  }

  // Now send emails since job is confirmed
  try {
    await Promise.all([
      sendOwnerNewJobAlert(job),
      sendCustomerSubmittedConfirmation(job),
    ])
  } catch (emailError) {
    console.error('Email send failed (non-blocking):', emailError)
  }

  return Response.json({ jobId: job.id }, { status: 200 })
}
