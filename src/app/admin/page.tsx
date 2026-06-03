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
  ] = await Promise.all([
    // Stale alert — new/under_review jobs older than 4 hours
    supabase
      .from('jobs')
      .select('id, created_at')
      .eq('is_archived', false)
      .in('status', ['new', 'under_review'])
      .lt('created_at', fourHoursAgo.toISOString()),

    // Outstanding invoices — jobs with an unpaid remaining balance
    supabase
      .from('jobs')
      .select(
        'id, client_name, type, service_type, approved_price, remaining_amount, deposit_paid, status, created_at'
      )
      .eq('is_archived', false)
      .not('status', 'in', '(partial,cancelled,completed)')
      .gt('remaining_amount', 0)
      .order('created_at', { ascending: true }),

    // Jobs table with pagination
    supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
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
    />
  )
}
