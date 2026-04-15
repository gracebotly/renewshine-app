import { createServerClient } from '@/lib/supabase/server'
import { sendCustomerBooked, sendOwnerBooked } from '@/lib/email'

export async function POST(request: Request) {
  const { jobId, approvedPrice, confirmedDate } = await request.json()

  if (!jobId || !approvedPrice || !confirmedDate) {
    return Response.json({ error: 'jobId, approvedPrice, and confirmedDate are required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const remaining = Number(approvedPrice) - 100

  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'scheduled',
      deposit_paid: true,
      approved_price: Number(approvedPrice),
      confirmed_date: confirmedDate,
      remaining_amount: remaining,
    })
    .eq('id', jobId)

  if (updateError) {
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }

  // Fetch updated job for email templates
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  // Send Templates 4 + 5 — same as Stripe webhook path
  try {
    if (job) {
      await Promise.all([sendCustomerBooked(job), sendOwnerBooked(job)])
    }
  } catch (emailError) {
    console.error('Booking confirmation emails failed (non-blocking):', emailError)
  }

  // Fire job-scheduled webhook — n8n uses this to schedule day-before reminder
  if (job) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? ''
    fetch(`${siteUrl}/api/webhooks/job-scheduled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify({
        jobId: job.id,
        clientName: job.client_name,
        clientPhone: job.client_phone,
        confirmedDate: job.confirmed_date,
        timePreference: job.availability_time_pref,
        address: job.address,
      }),
    }).catch(err => console.error('job-scheduled webhook failed (cash path):', err))
  }

  return Response.json({ success: true })
}
