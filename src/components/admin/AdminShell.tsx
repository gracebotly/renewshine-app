'use client'

import * as React from 'react'
import Link from 'next/link'
import { MessageCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { JobsTable, StaleAlert } from '@/components/admin/JobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel'
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

export function AdminShell({
  jobs,
  outstandingJobs,
  staleCount,
  page,
  totalPages,
  hasPrev,
  hasNext,
  totalCount,
}: AdminShellProps) {
  const [activeTab, setActiveTab] = React.useState<'operations' | 'analytics'>('operations')

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
      </div>
    </div>
  )
}
