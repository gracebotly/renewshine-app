import { createServerClient } from '@/lib/supabase/server'
import type { Job } from '@/types/database'

const VALID_STATUSES = ['new', 'under_review', 'contacted', 'approved', 'scheduled', 'completed', 'cancelled']
import { requireAdmin } from '@/lib/require-admin'

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    jobId,
    status,
    notes,
    address,
    confirmedDate,
    approvedPrice,
    contactedAt,
    contactMethod,
    contactNote,
  } = await request.json()

  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })
  if (status && !VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createServerClient()
  const updates: Partial<Job> = {}
  if (status) updates.status = status
  if (notes !== undefined) updates.notes = notes
  if (address !== undefined) updates.address = address

  if (status === 'contacted') {
    if (contactedAt) updates.contacted_at = contactedAt
    if (contactMethod) updates.contact_method = contactMethod
    if (contactNote !== undefined) updates.contact_note = contactNote
  }

  if (status === 'approved') {
    if (confirmedDate) updates.confirmed_date = confirmedDate
    if (approvedPrice && Number(approvedPrice) > 0) {
      updates.approved_price = Number(approvedPrice)
      updates.remaining_amount = Math.max(Number(approvedPrice) - 100, 0)
    }
  }

  const { error } = await supabase.from('jobs').update(updates).eq('id', jobId)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Fire job-completed webhook when admin marks a job done
  // n8n uses this to trigger the 2hr wait → rating request SMS → review gate
  if (status === 'completed') {
    const { data: completedJob } = await supabase
      .from('jobs')
      .select('id, client_name, client_phone, client_email, remaining_amount, stripe_payment_link')
      .eq('id', jobId)
      .single()

    if (completedJob) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
      const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? ''
      fetch(`${siteUrl}/api/webhooks/job-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret,
        },
        body: JSON.stringify({
          jobId: completedJob.id,
          clientName: completedJob.client_name,
          clientPhone: completedJob.client_phone,
          clientEmail: completedJob.client_email,
          remainingAmount: completedJob.remaining_amount,
          stripePaymentLink: completedJob.stripe_payment_link,
        }),
      }).catch(err => console.error('job-completed webhook failed:', err))
    }
  }

  return Response.json({ success: true })
}
