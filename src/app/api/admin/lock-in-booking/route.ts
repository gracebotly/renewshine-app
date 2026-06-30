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
  const { jobId, confirmedDate, finalPrice, bookingNotes, depositAmount, arrivalTimePref } = await request.json()
  if (!jobId) return Response.json({ error: 'jobId is required' }, { status: 400 })
  const supabase = createServerClient()
  const updates: Partial<Job> = {}
  if (confirmedDate) updates.confirmed_date = confirmedDate
  if (arrivalTimePref !== undefined) updates.availability_time_pref = (String(arrivalTimePref) || null) as Job['availability_time_pref']
  if (depositAmount !== undefined && depositAmount !== null && depositAmount !== '') {
    const resolvedDeposit = Number(depositAmount)
    if (!Number.isFinite(resolvedDeposit) || resolvedDeposit < 0) {
      return Response.json({ error: 'Deposit amount must be a valid amount of $0 or more' }, { status: 400 })
    }
    updates.deposit_amount = resolvedDeposit
  }
  if (finalPrice !== undefined && finalPrice !== null && finalPrice !== '') {
    updates.approved_price = Number(finalPrice)
  }
  if (bookingNotes !== undefined) updates.notes = bookingNotes
  if (updates.approved_price !== undefined || updates.deposit_amount !== undefined) {
    const price = updates.approved_price ?? undefined
    const { data: job } = await supabase
      .from('jobs')
      .select('approved_price, deposit_paid, deposit_amount')
      .eq('id', jobId)
      .single()
    const currentPrice = price ?? job?.approved_price
    const currentDeposit = updates.deposit_amount ?? job?.deposit_amount ?? 100
    if (currentPrice !== undefined && currentPrice !== null) {
      const creditedDeposit = job?.deposit_paid ? currentDeposit : 0
      updates.remaining_amount = Math.max(Number(currentPrice) - creditedDeposit, 0)
    }
  }
  if (Object.keys(updates).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })
  const { error } = await supabase.from('jobs').update(updates).eq('id', jobId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
