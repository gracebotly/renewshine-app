import { createServerClient } from '@/lib/supabase/server'
import { sendCustomerSubmittedConfirmation } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.json() as { jobId?: string; newEmail?: string }
  const { jobId, newEmail } = body

  if (!jobId || !newEmail) {
    return Response.json({ error: 'Missing jobId or newEmail' }, { status: 400 })
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return Response.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Fetch the job to get client_name and confirm it's still editable
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  // Only allow correction on jobs that haven't been approved/paid yet
  if (!['new', 'under_review', 'partial'].includes(job.status)) {
    return Response.json({ error: 'Job is too far along to update email' }, { status: 409 })
  }

  // Update the email on the DB record
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ client_email: newEmail })
    .eq('id', jobId)

  if (updateError) {
    console.error('Email update error:', updateError)
    return Response.json({ error: 'Failed to update email' }, { status: 500 })
  }

  // Re-send the customer confirmation email to the corrected address
  // Pass the full job object with the corrected email so the template has all fields
  try {
    await sendCustomerSubmittedConfirmation({ ...job, client_email: newEmail })
  } catch (emailError) {
    // Non-blocking — DB was updated successfully even if email fails
    console.error('Re-send confirmation email failed (non-blocking):', emailError)
  }

  return Response.json({ updated: true })
}
