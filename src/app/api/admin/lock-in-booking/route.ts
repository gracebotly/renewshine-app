import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { Job } from '@/types/database'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { jobId, confirmedDate, finalPrice, bookingNotes } = await request.json()
  if (!jobId) return Response.json({ error: 'jobId is required' }, { status: 400 })
  const supabase = createServerClient()
  const updates: Partial<Job> = {}
  if (confirmedDate) updates.confirmed_date = confirmedDate
  if (finalPrice !== undefined && finalPrice !== null && finalPrice !== '') {
    updates.approved_price = Number(finalPrice)
    const { data: job } = await supabase.from('jobs').select('deposit_paid, deposit_amount').eq('id', jobId).single()
    if (job) {
      const depositPaid = job.deposit_paid ? (job.deposit_amount ?? 100) : 0
      updates.remaining_amount = Math.max(Number(finalPrice) - depositPaid, 0)
    }
  }
  if (bookingNotes !== undefined) updates.notes = bookingNotes
  if (Object.keys(updates).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })
  const { error } = await supabase.from('jobs').update(updates).eq('id', jobId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
