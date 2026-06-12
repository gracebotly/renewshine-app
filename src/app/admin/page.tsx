export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

const PAGE_SIZE = 25

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const supabase = createServerClient()
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))

  const fourHoursAgo = new Date()
  fourHoursAgo.setHours(fourHoursAgo.getHours() - 4)

  const [
    { data: staleJobs },
    { data: outstandingJobs },
    { data: pagedJobs, count: totalCount },
    { data: completedJobs },
  ] = await Promise.all([
    // Stale alert — new/under_review jobs older than 4 hours
    supabase
      .from('jobs')
      .select('id, created_at')
      .in('status', ['new', 'under_review'])
      .eq('is_archived', false)
      .lt('created_at', fourHoursAgo.toISOString()),

    // Outstanding invoices — jobs with an unpaid remaining balance
    supabase
      .from('jobs')
      .select(
        'id, client_name, type, service_type, approved_price, remaining_amount, deposit_paid, status, created_at'
      )
      .not('status', 'in', '(partial,cancelled,completed)')
      .eq('is_archived', false)
      .gt('remaining_amount', 0)
      .order('created_at', { ascending: true }),

    // Jobs table with pagination
    supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),

    // Repeat clients — all completed, non-archived jobs for the Repeat Clients tab
    supabase
      .from('jobs')
      .select('id, client_name, client_email, client_phone, service_type, approved_price, confirmed_date, created_at, type, bedrooms, bathrooms, address, business_name, notes, deposit_paid, deposit_amount, remaining_amount, status, add_ons, service_frequency, availability_time_pref, availability_start, availability_end, satisfaction_score, automation_paused_until, contacted_at, contact_method, contact_note, home_type, preferred_contact, last_completed_step, dropped_at_label, quote_line_items, is_archived, stripe_payment_link, stripe_session_id, appointment_confirmed, estimated_price_low, estimated_price_high, sms_opt_in, condition, pets, home_entry, property_type, property_other_description, square_footage')
      .eq('status', 'completed')
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
  ])

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)

  return (
    <AdminShell
      jobs={pagedJobs ?? []}
      outstandingJobs={outstandingJobs ?? []}
      staleCount={staleJobs?.length ?? 0}
      page={page}
      totalPages={totalPages}
      hasPrev={page > 1}
      hasNext={page < totalPages}
      totalCount={totalCount ?? 0}
      repeatJobs={completedJobs ?? []}
    />
  )
}
