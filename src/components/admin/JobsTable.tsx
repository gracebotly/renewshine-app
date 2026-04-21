'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database'

type JobRecord = Database['public']['Tables']['jobs']['Row']

const STATUS_VARIANTS = {
  new: 'neutral',
  under_review: 'warning',
  approved: 'default',
  scheduled: 'success',
  completed: 'neutral',
  cancelled: 'danger',
} as const

const FILTERS = ['all', 'new', 'under_review', 'approved', 'scheduled', 'completed'] as const

type Filter = (typeof FILTERS)[number]

function formatAvailability(start: string | null, end: string | null, timePref: string | null): string {
  if (!start || !end) return '—'
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeLabel =
    ({ morning: 'Morning', afternoon: 'Afternoon', early_morning: '8–10am', mid_morning: '10am–12pm', noon: '12–2pm', early_afternoon: '2–4pm', late_afternoon: '4–6pm', flexible: 'Flexible' } as Record<string, string>)[timePref ?? ''] ?? timePref ?? ''
  return `${fmt(start)}–${fmt(end)}${timeLabel ? ` · ${timeLabel}` : ''}`
}

function formatService(serviceType: JobRecord['service_type']) {
  if (serviceType === 'standard') return 'Standard'
  if (serviceType === 'deep') return 'Deep Clean'
  if (serviceType === 'move_out') return 'Move-Out'
  return '—'
}

function SubmittedCell({ createdAt, status }: { createdAt: string; status: JobRecord['status'] }) {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  const dateLabel = created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (status === 'new') {
    if (diffHours < 4) {
      return (
        <div>
          <span className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
            🔥 New
          </span>
          <p className="mt-1 text-xs text-slate-400">
            {diffHours < 1 ? 'Just now' : `${Math.floor(diffHours)}h ago`}
          </p>
        </div>
      )
    }
    if (diffDays >= 1) {
      return (
        <div>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
            ⚠️ Waiting
          </span>
          <p className="mt-1 text-xs text-slate-400">{Math.floor(diffDays)}d ago</p>
        </div>
      )
    }
  }

  return (
    <div>
      <p className="text-sm text-slate-700">{dateLabel}</p>
      <p className="text-xs text-slate-400">
        {diffHours < 1 ? 'Just now' : diffDays >= 1 ? `${Math.floor(diffDays)}d ago` : `${Math.floor(diffHours)}h ago`}
      </p>
    </div>
  )
}

export function StaleAlert({ count }: { count: number }) {
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed || count === 0) return null

  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-900">
          <span className="font-semibold">
            {count} job{count > 1 ? 's' : ''} submitted more than 4 hours ago
          </span>{' '}
          without a quote sent. Review{' '}
          <a href="/admin?filter=new" className="underline hover:text-amber-700 transition-colors duration-200">
            now →
          </a>
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="cursor-pointer shrink-0 text-amber-500 hover:text-amber-700 transition-colors duration-200"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function JobsTable({ jobs }: { jobs: JobRecord[] }) {
  const searchParams = useSearchParams()
  const initialFilter = (searchParams.get('filter') as Filter) ?? 'all'
  const validInitialFilter = FILTERS.includes(initialFilter) ? initialFilter : 'all'
  const [activeFilter, setActiveFilter] = React.useState<Filter>(validInitialFilter)
  const [query, setQuery] = React.useState('')

  const filteredJobs = React.useMemo(() => {
    return jobs
      .filter((j) => activeFilter === 'all' || j.status === activeFilter)
      .filter((j) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return j.client_name?.toLowerCase().includes(q) || j.client_email?.toLowerCase().includes(q)
      })
  }, [activeFilter, jobs, query])

  return (
    <div>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-6 border-b border-slate-200">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter
          const label = filter === 'under_review' ? 'Under Review' : filter === 'all' ? 'All' : filter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer pb-3 text-sm capitalize ${
                isActive
                  ? 'border-b-2 border-(--color-brand) font-medium text-(--color-brand)'
                  : 'text-slate-600 transition-colors duration-200 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Submitted', 'Client', 'Type', 'Service', 'Availability', 'Estimate', 'Status', 'Deposit', 'Action'].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <p className="px-4 py-8 text-center text-sm text-slate-500">No jobs found.</p>
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const low = Number(job.estimated_price_low ?? 0)
                const high = Number(job.estimated_price_high ?? 0)
                return (
                  <tr key={job.id} className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <SubmittedCell createdAt={job.created_at} status={job.status} />
                  </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900">{job.client_name}</span>
                        {job.satisfaction_score !== null && job.satisfaction_score < 4 && (
                          <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                            Needs Attention
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">{job.client_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={job.type === 'commercial' ? 'default' : 'neutral'}>
                        {job.type ?? 'residential'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatService(job.service_type)}</td>
                    <td className="px-4 py-3">
                      {formatAvailability(job.availability_start, job.availability_end, job.availability_time_pref)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm tabular-nums">
                      {low === 0 && high === 0 ? 'Manual quote' : `$${low} – $${high}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[job.status] ?? 'neutral'}>{job.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {job.deposit_paid ? (
                        <span className="font-bold text-emerald-600">✓</span>
                      ) : (
                        <span className="text-slate-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="cursor-pointer text-sm font-medium text-(--color-brand) hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
