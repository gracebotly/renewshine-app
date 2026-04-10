import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  const body = await request.json()

  const required = ['client_name', 'client_email', 'type']
  for (const field of required) {
    if (!body[field]) {
      return Response.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  const { media_urls = [], ...jobData } = body

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      type: jobData.type,
      status: 'new',
      client_name: jobData.client_name,
      client_email: jobData.client_email,
      client_phone: jobData.client_phone ?? null,
      address: jobData.address ?? null,
      service_type: jobData.service_type ?? null,
      service_frequency: jobData.service_frequency ?? null,
      bedrooms: jobData.bedrooms ?? null,
      bathrooms: jobData.bathrooms ?? null,
      add_ons: jobData.add_ons ?? [],
      square_footage: jobData.square_footage ?? null,
      condition: jobData.condition ?? null,
      business_name: jobData.business_name ?? null,
      availability_start: jobData.availability_start ?? null,
      availability_end: jobData.availability_end ?? null,
      availability_time_pref: jobData.availability_time_pref ?? null,
      estimated_price_low: jobData.estimated_price_low ?? 0,
      estimated_price_high: jobData.estimated_price_high ?? 0,
      notes: jobData.notes ?? null,
    })
    .select()
    .single()

  if (jobError || !job) {
    console.error('Job insert error:', jobError)
    return Response.json({ error: 'Failed to create job' }, { status: 500 })
  }

  if (media_urls.length > 0) {
    const mediaRows = media_urls.map((url: string) => ({
      job_id: job.id,
      file_url: url,
      file_type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image',
    }))
    await supabase.from('job_media').insert(mediaRows)
  }

  try {
    // Email hooks are implemented in a later prompt.
    // Keep non-blocking behavior and never fail job creation.
  } catch (emailError) {
    console.error('Email send failed (non-blocking):', emailError)
  }

  return Response.json({ jobId: job.id }, { status: 201 })
}
