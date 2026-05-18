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

  const fourHoursAgoDate = new Date()
  fourHoursAgoDate.setHours(fourHoursAgoDate.getHours() - 4)
  const staleCount = allJobs.filter(
    (j) => (j.status === 'new' || j.status === 'under_review') && j.created_at < fourHoursAgoDate.toISOString()
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
