export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { JobsTable, StaleAlert } from '@/components/admin/JobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { RevenueSummary } from '@/components/admin/RevenueSummary'

const PAGE_SIZE = 25

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const supabase = createServerClient()
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))

  const { data: allJobsForCounts } = await supabase
    .from('jobs')
    .select('id, status, created_at')
    .order('created_at', { ascending: false })

  const allJobs = allJobsForCounts ?? []

  const fourHoursAgoDate = new Date()
  fourHoursAgoDate.setHours(fourHoursAgoDate.getHours() - 4)
  const staleCount = allJobs.filter(
    (j) => (j.status === 'new' || j.status === 'under_review') && j.created_at < fourHoursAgoDate.toISOString()
  ).length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const [{ data: monthJobs }, { data: outstandingJobs }, { data: recurringJobs }] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, status, type, service_frequency, approved_price, deposit_paid, deposit_amount, remaining_amount, created_at')
      .gte('created_at', monthStart)
      .not('status', 'in', '(partial,cancelled)')
      .order('created_at', { ascending: true }),
    supabase
      .from('jobs')
      .select('id, client_name, type, service_type, approved_price, remaining_amount, deposit_paid, status, created_at')
      .not('status', 'in', '(partial,cancelled,completed)')
      .gt('remaining_amount', 0)
      .order('created_at', { ascending: true }),
    supabase
      .from('jobs')
      .select('client_email, service_frequency')
      .in('status', ['scheduled', 'completed'])
      .in('service_frequency', ['weekly', 'bi_weekly', 'monthly']),
  ])
  const jobs_this_month = monthJobs ?? []
  const outstanding_jobs = outstandingJobs ?? []
  const collectedThisMonth = jobs_this_month.reduce((sum, j) => {
    if (j.status === 'completed' && j.approved_price) return sum + j.approved_price
    if (j.deposit_paid && j.deposit_amount) return sum + j.deposit_amount
    return sum
  }, 0)
  const outstandingTotal = outstanding_jobs.reduce((sum, j) => sum + (j.remaining_amount ?? 0), 0)
  const jobsDoneThisMonth = jobs_this_month.filter((j) => j.status === 'completed').length
  const recurringClientCount = new Set((recurringJobs ?? []).map((j) => j.client_email)).size
  function getWeekStart(dateStr: string): string {
    const d = new Date(dateStr)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const weeklyMap: Record<string, number> = {}
  jobs_this_month.forEach((j) => {
    if (j.status === 'completed' && j.approved_price) {
      const week = getWeekStart(j.created_at)
      weeklyMap[week] = (weeklyMap[week] ?? 0) + j.approved_price
    } else if (j.deposit_paid && j.deposit_amount) {
      const week = getWeekStart(j.created_at)
      weeklyMap[week] = (weeklyMap[week] ?? 0) + j.deposit_amount
    }
  })
  const weeklyBars = Object.entries(weeklyMap).map(([label, amount]) => ({ label, amount }))
  const residentialCount = jobs_this_month.filter((j) => j.type === 'residential' || !j.type).length
  const commercialCount = jobs_this_month.filter((j) => j.type === 'commercial').length
  const totalForSplit = residentialCount + commercialCount || 1
  const residentialPct = Math.round((residentialCount / totalForSplit) * 100)
  const recurringThisMonth = jobs_this_month.filter((j) => j.service_frequency && j.service_frequency !== 'one_time').length
  const totalJobs = jobs_this_month.length || 1
  const recurringPct = Math.round((recurringThisMonth / totalJobs) * 100)
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: pagedJobs, count: totalCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const jobs = pagedJobs ?? []
  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <p className="font-display text-lg font-semibold text-slate-900">Admin</p>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/inbox"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-brand/30 hover:text-brand cursor-pointer"
            >
              <MessageCircle size={14} />
              <span className="hidden xs:inline">Inbox</span>
            </Link>
            <LogoutButton />
          </div>
        </div>

        <RevenueSummary
          monthLabel={monthLabel}
          collectedThisMonth={collectedThisMonth}
          outstandingTotal={outstandingTotal}
          jobsDone={jobsDoneThisMonth}
          recurringClients={recurringClientCount}
          weeklyBars={weeklyBars}
          residentialPct={residentialPct}
          recurringPct={recurringPct}
          outstandingJobs={outstanding_jobs}
        />

        <StaleAlert count={staleCount} />
        <JobsTable jobs={jobs} />

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-4 sm:mt-6">
            <p className="text-xs text-slate-500 sm:text-sm">
              Page {page} of {totalPages} · <span className="font-medium">{totalCount ?? 0}</span> jobs
            </p>
            <div className="flex items-center gap-2">
              {hasPrev ? (
                <a
                  href={`/admin?page=${page - 1}`}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  <ChevronLeft size={14} />
                  Prev
                </a>
              ) : (
                <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed">
                  <ChevronLeft size={14} />
                  Prev
                </span>
              )}
              {hasNext ? (
                <a
                  href={`/admin?page=${page + 1}`}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  Next
                  <ChevronRight size={14} />
                </a>
              ) : (
                <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed">
                  Next
                  <ChevronRight size={14} />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
