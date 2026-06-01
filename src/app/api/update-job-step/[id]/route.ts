import { createServerClient } from '@/lib/supabase/server'

// ── Allowlist of fields that can be written via this partial-update route ────
// Only fields that exist on the jobs table AND make sense for partial records.
// Anything not in this list is silently ignored — prevents clients from
// accidentally overwriting status, stripe fields, or pricing data.
const ALLOWED_FIELDS = new Set([
  'last_completed_step',
  'dropped_at_label',
  // Contact
  'client_name',
  'client_email',
  'client_phone',
  'business_name',
  // Home details (residential step 2)
  'home_type',
  'bedrooms',
  'bathrooms',
  'pets',
  'condition',
  // Service (residential step 3)
  'service_type',
  'add_ons',
  'service_frequency',
  // Availability + address (residential step 4, commercial step 2/3)
  'address',
  'availability_start',
  'availability_end',
  'availability_time_pref',
  // Commercial step 2
  'property_type',
  'square_footage',
  // Notes
  'notes',
])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return Response.json({ error: 'Missing job ID' }, { status: 400 })
  }

  const body = await request.json()

  if (typeof body.last_completed_step !== 'number') {
    return Response.json({ error: 'last_completed_step must be a number' }, { status: 400 })
  }

  // Strip any fields not in the allowlist
  const update: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key) && value !== undefined) {
      update[key] = value
    }
  }

  const supabase = createServerClient()

  // Only update partial jobs — prevents abuse of this endpoint
  const { error } = await supabase
    .from('jobs')
    .update(update)
    .eq('id', id)
    .eq('status', 'partial')

  if (error) {
    console.error('[update-job-step]', error)
    return Response.json({ error: 'Update failed' }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 200 })
}
