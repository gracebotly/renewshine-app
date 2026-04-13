'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type JobRecord = {
  id: string
  created_at: string
  client_name: string
  client_email: string
  type: 'residential' | 'commercial' | null
  service_type: 'standard' | 'detailed' | 'move_out' | null
  availability_start: string | null
  availability_end: string | null
  time_preference: string | null
  estimated_price_low: number
  estimated_price_high: number
  status: 'new' | 'under_review' | 'approved' | 'scheduled' | 'completed' | 'cancelled'
  deposit_paid: boolean
}

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
    timePref === 'early_morning'
      ? '8am–10am'
      : timePref === 'mid_morning'
        ? '10am–12pm'
        : timePref === 'noon'
          ? '12pm–2pm'
          : timePref === 'early_afternoon'
            ? '2pm–4pm'
            : timePref === 'late_afternoon'
              ? '4pm–6pm'
              : timePref === 'flexible'
                ? 'Flexible'
                : timePref ?? ''
  return `${fmt(start)}–${fmt(end)}${timeLabel ? ` · ${timeLabel}` : ''}`
}

function formatService(serviceType: JobRecord['service_type']) {
  if (serviceType === 'standard') return 'Standard'
  if (serviceType === 'detailed') return 'Detailed Clean'
  if (serviceType === 'move_out') return 'Move-Out'
  return '—'
}

export function JobsTable({ jobs }: { jobs: any[] }) {
  const [activeFilter, setActiveFilter] = React.useState<Filter>('all')
  const [query, setQuery] = React.useState('')

  const filteredJobs = React.useMemo(() => {
    return (jobs as JobRecord[])
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
                    <td className="px-4 py-3">{new Date(job.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{job.client_name}</div>
                      <div className="text-xs text-slate-600">{job.client_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={job.type === 'commercial' ? 'default' : 'neutral'}>
                        {job.type ?? 'residential'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatService(job.service_type)}</td>
                    <td className="px-4 py-3">
                      {formatAvailability(job.availability_start, job.availability_end, job.time_preference)}
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
