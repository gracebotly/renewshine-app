'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Search, X } from 'lucide-react'
import type { Database } from '@/types/database'

type JobRecord = Database['public']['Tables']['jobs']['Row']

// ── Stage mapping — UI only, never touches DB ────────────────────────────────
type Stage = 'needs_quote' | 'quote_pending' | 'scheduled' | 'completed' | 'declined'

function mapStatusToStage(status: JobRecord['status']): Stage {
  if (status === 'new' || status === 'under_review') return 'needs_quote'
  if (status === 'approved') return 'quote_pending'
  if (status === 'scheduled') return 'scheduled'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'declined'
  return 'needs_quote'
}

const STAGE_CONFIG: Record<Stage, { label: string; dot: string; text: string }> = {
  needs_quote:   { label: 'Needs Quote', dot: 'bg-amber-400', text: 'text-amber-700' },
  quote_pending: { label: 'Quote Pending', dot: 'bg-orange-400', text: 'text-orange-700' },
  scheduled:     { label: 'Scheduled', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  completed:     { label: 'Completed', dot: 'bg-slate-400', text: 'text-slate-500' },
  declined:      { label: 'Declined', dot: 'bg-red-400', text: 'text-red-500' },
}

type TabFilter = 'all' | Stage
const TABS: { id: TabFilter; label: string }[] = [
  { id: 'all',           label: 'All' },
  { id: 'needs_quote',   label: 'Needs Quote' },
  { id: 'quote_pending', label: 'Quote Pending' },
  { id: 'scheduled',     label: 'Scheduled' },
  { id: 'completed',     label: 'Completed' },
  { id: 'declined',      label: 'Declined' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatAvailability(start: string | null, end: string | null, timePref: string | null): string {
  if (!start) return '—'
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeLabel = ({
    morning: 'Morning', afternoon: 'Afternoon',
    early_morning: '8–10am', mid_morning: '10am–12pm',
    noon: '12–2pm', early_afternoon: '2–4pm',
    late_afternoon: '4–6pm', flexible: 'Flexible',
  } as Record<string, string>)[timePref ?? ''] ?? ''
  const dateStr = end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
  return timeLabel ? `${dateStr} · ${timeLabel}` : dateStr
}

function formatService(serviceType: JobRecord['service_type']): string {
  if (serviceType === 'standard') return 'Standard Clean'
  if (serviceType === 'deep') return 'Deep Clean'
  if (serviceType === 'move_out') return 'Move-Out'
  if (serviceType === 'post_construction') return 'Post-Construction'
  return '—'
}

function SubmittedCell({ createdAt, status }: { createdAt: string; status: JobRecord['status'] }) {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  const timeAgo =
    diffHours < 1 ? 'Just now'
      : diffDays >= 1 ? `${Math.floor(diffDays)}d ago`
        : `${Math.floor(diffHours)}h ago`

  const stage = mapStatusToStage(status)
  const isActionable = stage === 'needs_quote'

  if (isActionable && diffHours <= 24) {
    return (
      <div>
        <span className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
          New
        </span>
        <p className="mt-1 text-xs text-slate-400">{timeAgo}</p>
      </div>
    )
  }

  if (isActionable && diffDays >= 1) {
    return (
      <div>
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
          Waiting
        </span>
        <p className="mt-1 text-xs text-slate-400">{timeAgo}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-slate-700">
        {created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
      <p className="text-xs text-slate-400">{timeAgo}</p>
    </div>
  )
}

// ── StaleAlert ───────────────────────────────────────────────────────────────
export function StaleAlert({ count }: { count: number }) {
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed || count === 0) return null

  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-900">
          <span className="font-semibold">
            {count} job{count > 1 ? 's' : ''} waiting more than 4 hours
          </span>{' '}
          without a quote sent. Review{' '}
          <a href="/admin?stage=needs_quote" className="underline hover:text-amber-700 transition-colors duration-200">
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

// ── JobsTable ────────────────────────────────────────────────────────────────
export function JobsTable({ jobs }: { jobs: JobRecord[] }) {
  const searchParams = useSearchParams()

  // Support ?stage= param from StaleAlert link
  const stageParam = searchParams.get('stage') as TabFilter | null
  const initialTab: TabFilter =
    stageParam && TABS.some((t) => t.id === stageParam) ? stageParam : 'all'

  const [activeTab, setActiveTab] = React.useState<TabFilter>(initialTab)
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  // Refresh server data every 30 seconds — new bookings appear without manual reload
  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30_000)
    return () => clearInterval(interval)
  }, [router])

  const filteredJobs = React.useMemo(() => {
    return jobs
      .filter((j) => {
        if (j.status === 'partial') return false
        // Hide cancelled from All tab — only show in Declined tab
        if (j.status === 'cancelled' && activeTab !== 'declined') return false
        if (activeTab === 'all') return true
        return mapStatusToStage(j.status) === activeTab
      })
      .filter((j) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (
          j.client_name?.toLowerCase().includes(q) ||
          j.client_email?.toLowerCase().includes(q)
        )
      })
  }, [activeTab, jobs, query])

  return (
    <div>
      {/* Search */}
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

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer pb-3 text-sm whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-(--color-brand) font-semibold text-(--color-brand)'
                  : 'text-slate-500 transition-colors duration-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Submitted', 'Client', 'Service', 'Availability', 'Est. Price', 'Stage', 'Action'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <p className="px-4 py-10 text-center text-sm text-slate-400">No jobs found.</p>
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const stage = mapStatusToStage(job.status)
                const stageConf = STAGE_CONFIG[stage]
                return (
                  <tr
                    key={job.id}
                    className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <SubmittedCell createdAt={job.created_at} status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{job.client_name}</p>
                      <p className="text-xs text-slate-500">{job.client_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatService(job.service_type)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatAvailability(
                        job.availability_start,
                        job.availability_end,
                        job.availability_time_pref
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {(() => {
                        const low = Number(job.estimated_price_low ?? 0)
                        const high = Number(job.estimated_price_high ?? 0)
                        return low > 0 && high > 0 ? `$${low} – $${high}` : '—'
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${stageConf.dot}`} />
                        <span className={`text-xs font-medium ${stageConf.text}`}>
                          {stageConf.label}
                        </span>
                      </div>
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
