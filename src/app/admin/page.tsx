export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { JobsTable, StaleAlert } from '@/components/admin/JobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'

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

  const counts = {
    total: allJobs.length,
    needsQuote: allJobs.filter((j) => j.status === 'new' || j.status === 'under_review').length,
    quotePending: allJobs.filter((j) => j.status === 'approved').length,
    scheduled: allJobs.filter((j) => j.status === 'scheduled').length,
    completed: allJobs.filter((j) => j.status === 'completed').length,
    declined: allJobs.filter((j) => j.status === 'cancelled').length,
  }

  const fourHoursAgoDate = new Date()
  fourHoursAgoDate.setHours(fourHoursAgoDate.getHours() - 4)
  const fourHoursAgo = fourHoursAgoDate.toISOString()
  const staleCount = allJobs.filter(
    (j) => (j.status === 'new' || j.status === 'under_review') && j.created_at < fourHoursAgo
  ).length

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Admin nav bar */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-slate-900">Admin</p>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/inbox"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-brand/30 hover:text-brand cursor-pointer"
            >
              <MessageCircle size={14} />
              Inbox
            </Link>
            <LogoutButton />
          </div>
        </div>

        <StaleAlert count={staleCount} />
        <JobsTable jobs={jobs} />
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages} · <span className="font-medium">{totalCount ?? 0}</span>{' '}
              total jobs
            </p>
            <div className="flex items-center gap-2">
              <a href={hasPrev ? `/admin?page=${page - 1}` : undefined}>
                <ChevronLeft size={14} />
                Previous
              </a>
              <a href={hasNext ? `/admin?page=${page + 1}` : undefined}>
                Next
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
