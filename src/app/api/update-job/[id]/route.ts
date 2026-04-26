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
    const mediaRows = media_urls.map((encoded: string) => {
      // Encoded as "storagePath|contentType" — strip the contentType suffix before storing
      const [storagePath, contentType] = encoded.includes('|')
        ? encoded.split('|')
        : [encoded, 'image/jpeg']
      const isVideo = contentType.startsWith('video/')
      return {
        job_id: job.id,
        file_url: storagePath,
        file_type: isVideo ? 'video' : 'image',
      }
    })
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

  // SMS — non-blocking
  const { sendSms } = await import('@/lib/sms')
  const firstName = job.client_name.split(' ')[0]
  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'cleaning request'

  sendSms(
    job.client_phone,
    `Hi ${firstName} 👋 We got your ${serviceLabel} request and we're already reviewing your photos. You'll have your confirmed quote within 1–4 hours. — RenewShine`
  ).catch(err => console.error('Customer submission SMS failed:', err))

  sendSms(
    process.env.OWNER_PHONE ?? null,
    `⚡ New job — ${firstName} (${serviceLabel}, ${job.bedrooms ?? '?'}bd/${job.bathrooms ?? '?'}ba). Review: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/jobs/${job.id}`
  ).catch(err => console.error('Owner alert SMS failed:', err))

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? ''
  fetch(`${siteUrl}/api/webhooks/job-submitted`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': webhookSecret,
    },
    body: JSON.stringify({
      jobId: job.id,
      clientName: job.client_name,
      clientPhone: job.client_phone,
      clientEmail: job.client_email,
      serviceType: job.service_type,
      address: job.address,
      bedrooms: job.bedrooms,
      bathrooms: job.bathrooms,
      estimatedLow: job.estimated_price_low,
      estimatedHigh: job.estimated_price_high,
    }),
  }).catch(err => console.error('job-submitted webhook failed:', err))

  return Response.json({ jobId: job.id }, { status: 200 })
}
