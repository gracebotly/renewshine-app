import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-admin'
import type { ServiceType } from '@/types/database'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof Response) return err
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    sourceJobId,
    serviceType,
    address,
    confirmedDate,
    price,
    notes,
    status,
    paymentType,
  } = await request.json() as {
    sourceJobId: string
    serviceType: ServiceType
    address?: string
    confirmedDate?: string | null
    price: number
    notes?: string | null
    status: 'completed' | 'scheduled'
    paymentType: 'invoice_now' | 'collect_later' | 'cash_paid'
  }

  if (!sourceJobId || !serviceType || !price || price <= 0) {
    return Response.json({ error: 'sourceJobId, serviceType, and price are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: source, error: fetchError } = await supabase
    .from('jobs')
    .select('client_name, client_email, client_phone, type, bedrooms, bathrooms, business_name, address')
    .eq('id', sourceJobId)
    .single()

  if (fetchError || !source) {
    return Response.json({ error: 'Source job not found' }, { status: 404 })
  }

  const isCashPaid = paymentType === 'cash_paid'
  const depositPaid = isCashPaid
  const depositAmount = 0
  const remainingAmount = isCashPaid ? 0 : price

  const { data: newJob, error: insertError } = await supabase
    .from('jobs')
    .insert({
      type: source.type,
      client_name: source.client_name,
      client_email: source.client_email,
      client_phone: source.client_phone ?? null,
      address: address?.trim() || source.address || null,
      bedrooms: source.bedrooms ?? null,
      bathrooms: source.bathrooms ?? null,
      business_name: source.business_name ?? null,

      service_type: serviceType,
      confirmed_date: confirmedDate || null,
      notes: notes?.trim() || null,

      approved_price: price,
      deposit_amount: depositAmount,
      deposit_paid: depositPaid,
      remaining_amount: remainingAmount,

      status,

      add_ons: [],
      sms_opt_in: false,
    })
    .select('id')
    .single()

  if (insertError || !newJob) {
    console.error('create-repeat-visit insert error:', insertError)
    return Response.json({ error: 'Failed to create job' }, { status: 500 })
  }

  return Response.json({ jobId: newJob.id })
}
