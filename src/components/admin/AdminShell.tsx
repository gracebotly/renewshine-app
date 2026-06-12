'use client'

import * as React from 'react'
import Link from 'next/link'
import { MessageCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { JobsTable, StaleAlert } from '@/components/admin/JobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel'
import { NewVisitButton } from '@/components/admin/NewVisitModal'
import type { Database } from '@/types/database'

type JobRecord = Database['public']['Tables']['jobs']['Row']

interface OutstandingJob {
  id: string
  client_name: string
  type: string | null
  service_type: string | null
  approved_price: number | null
  remaining_amount: number | null
  deposit_paid: boolean
  status: string
  created_at: string
}

interface AdminShellProps {
  jobs: JobRecord[]
  outstandingJobs: OutstandingJob[]
  staleCount: number
  page: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  totalCount: number
  repeatJobs: JobRecord[]
}

function formatService(type: string | null): string {
  if (type === 'standard') return 'Standard Clean'
  if (type === 'deep') return 'Deep Clean'
  if (type === 'move_out') return 'Move-Out'
  if (type === 'post_construction') return 'Post-Construction'
  return 'Service'
}

function daysAgo(created: string): string {
  const diff = Math.floor((Date.now() - new Date(created).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1d ago'
  return `${diff}d ago`
}


function RepeatClientsPanel({ jobs }: { jobs: JobRecord[] }) {
  const clients = React.useMemo(() => {
    const groups: Record<string, JobRecord[]> = {}
    for (const job of jobs) {
      const key = job.client_email
      if (!groups[key]) groups[key] = []
      groups[key].push(job)
    }

    return Object.values(groups)
      .map(group => {
        const sorted = [...group].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const totalRevenue = sorted.reduce((sum, job) => sum + (job.approved_price ?? 0), 0)
        return {
          lastJob: sorted[0],
          visitCount: sorted.length,
          totalRevenue,
          lastServiceDate: sorted[0].confirmed_date ?? sorted[0].created_at,
        }
      })
      .sort((a, b) => new Date(b.lastServiceDate).getTime() - new Date(a.lastServiceDate).getTime())
  }, [jobs])

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
        <p className="text-sm text-slate-400">No completed jobs yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="hidden w-full text-sm sm:table">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Client', 'Last service', 'Visits', 'Total revenue', 'Last price', ''].map(heading => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(({ lastJob, visitCount, totalRevenue, lastServiceDate }) => {
              const dateStr = lastServiceDate
                ? new Date(lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'

              return (
                <tr key={lastJob.id} className="border-b border-slate-100 transition-colors duration-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{lastJob.client_name}</p>
                    <p className="text-xs text-slate-400">{lastJob.client_email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{dateStr}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {visitCount} {visitCount === 1 ? 'visit' : 'visits'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-medium text-slate-900">
                    ${totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-600">
                    {lastJob.approved_price ? `$${lastJob.approved_price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <NewVisitButton job={lastJob} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="divide-y divide-slate-100 sm:hidden">
          {clients.map(({ lastJob, visitCount, totalRevenue, lastServiceDate }) => {
            const dateStr = lastServiceDate
              ? new Date(lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'

            return (
              <div key={lastJob.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{lastJob.client_name}</p>
                    <p className="text-xs text-slate-400">{lastJob.client_email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-500">Last: {dateStr}</span>
                      <span className="text-xs text-slate-500">{visitCount} {visitCount === 1 ? 'visit' : 'visits'}</span>
                      <span className="font-mono text-xs font-medium text-slate-900">${totalRevenue.toLocaleString()} total</span>
                    </div>
                  </div>
                  <NewVisitButton job={lastJob} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function AdminShell({
  jobs,
  outstandingJobs,
  staleCount,
  page,
  totalPages,
  hasPrev,
  hasNext,
  totalCount,
  repeatJobs,
}: AdminShellProps) {
  const [activeTab, setActiveTab] = React.useState<'operations' | 'analytics' | 'repeat'>('operations')

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <div className="flex items-center gap-4">
            <p className="font-display text-lg font-semibold text-slate-900">Admin</p>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('operations')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  activeTab === 'operations'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Operations
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Analytics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('repeat')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  activeTab === 'repeat'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Repeat Clients
                {repeatJobs.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#4A7C59] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {new Set(repeatJobs.map(job => job.client_email)).size}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/inbox"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-brand/30 hover:text-brand cursor-pointer"
            >
              <MessageCircle size={14} />
              <span className="hidden xs:inline">Inbox</span>
            </Link>
            <Link
              href="/admin/transfer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-brand/30 hover:text-brand cursor-pointer"
            >
              <ArrowUpDown size={14} />
              <span className="hidden xs:inline">Transfer</span>
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Operations panel */}
        {activeTab === 'operations' && (
          <>
            {/* Outstanding invoices — only shown when there are unpaid balances */}
            {outstandingJobs.length > 0 && (
              <div className="mb-5 sm:mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Outstanding invoices
                </p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {outstandingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{job.client_name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {job.type === 'commercial' ? 'Commercial' : 'Residential'} · {formatService(job.service_type)} · Balance due
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono text-sm font-medium text-amber-600">
                            ${job.remaining_amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400">{daysAgo(job.created_at)}</p>
                        </div>
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="cursor-pointer text-sm font-medium text-(--color-brand) hover:underline"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <StaleAlert count={staleCount} />
            <JobsTable jobs={jobs} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4 sm:mt-6">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Page {page} of {totalPages} · <span className="font-medium">{totalCount}</span> jobs
                </p>
                <div className="flex items-center gap-2">
                  {hasPrev ? (
                    <a
                      href={`/admin?page=${page - 1}`}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                    >
                      <ChevronLeft size={14} /> Prev
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed">
                      <ChevronLeft size={14} /> Prev
                    </span>
                  )}
                  {hasNext ? (
                    <a
                      href={`/admin?page=${page + 1}`}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                    >
                      Next <ChevronRight size={14} />
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed">
                      Next <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Analytics panel */}
        {activeTab === 'analytics' && <AnalyticsPanel />}

        {/* Repeat Clients panel */}
        {activeTab === 'repeat' && <RepeatClientsPanel jobs={repeatJobs} />}
      </div>
    </div>
  )
}
