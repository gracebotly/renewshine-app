'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Search, X, ChevronRight } from 'lucide-react'
import type { Database } from '@/types/database'

type JobRecord = Database['public']['Tables']['jobs']['Row']

type Stage = 'new' | 'contacted' | 'quote_sent' | 'scheduled' | 'done' | 'declined'

function mapStatusToStage(status: JobRecord['status'] | 'contacted'): Stage {
  if (status === 'new' || status === 'under_review') return 'new'
  if (status === 'contacted') return 'contacted'
  if (status === 'approved') return 'quote_sent'
  if (status === 'scheduled') return 'scheduled'
  if (status === 'completed') return 'done'
  if (status === 'cancelled') return 'declined'
  return 'new'
}

const STAGE_CONFIG: Record<Stage, { label: string; dot: string; text: string; bg: string }> = {
  new: { label: 'New', dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50 border-red-100' },
  contacted: { label: 'Contacted', dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
  quote_sent: { label: 'Quote Sent', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
  scheduled: { label: 'Scheduled', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  done: { label: 'Done', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
  declined: { label: 'Declined', dot: 'bg-red-300', text: 'text-red-400', bg: 'bg-red-50 border-red-100' },
}

type TabFilter = 'all' | Stage
const TABS: { id: TabFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'quote_sent', label: 'Quote Sent' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'done', label: 'Done' },
]

function formatAvailability(start: string | null, end: string | null, timePref: string | null): string {
  if (!start) return '—'
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

function formatPrice(low: number | null, high: number | null): string {
  const l = Number(low ?? 0)
  const h = Number(high ?? 0)
  return l > 0 && h > 0 ? `$${l} – $${h}` : '—'
}

function timeAgo(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffHours < 1) return 'Just now'
  if (diffDays >= 1) return `${Math.floor(diffDays)}d ago`
  return `${Math.floor(diffHours)}h ago`
}

function UrgencyBadge({ createdAt, stage }: { createdAt: string; stage: Stage }) {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (stage !== 'new') return null
  if (diffHours <= 24) {
    return <span className="inline-flex items-center rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">New</span>
  }
  if (diffDays >= 1) {
    return <span className="inline-flex items-center rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">Waiting</span>
  }
  return null
}

export function StaleAlert({ count }: { count: number }) {
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed || count === 0) return null

  return (
    <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:mb-6 sm:px-5 sm:py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-900">
          <span className="font-semibold">{count} new job{count > 1 ? 's' : ''} need{count === 1 ? 's' : ''} attention</span>{' '}— no contact yet.{` `}
          <a href="/admin?stage=new" className="underline hover:text-amber-700 transition-colors duration-200">Review →</a>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="cursor-pointer shrink-0 text-amber-500 hover:text-amber-700 transition-colors duration-200" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}

export function JobsTable({ jobs }: { jobs: JobRecord[] }) {
  const searchParams = useSearchParams()
  const stageParam = searchParams.get('stage') as TabFilter | null
  const initialTab: TabFilter = stageParam && TABS.some((t) => t.id === stageParam) ? stageParam : 'all'

  const [activeTab, setActiveTab] = React.useState<TabFilter>(initialTab)
  const [query, setQuery] = React.useState('')
  const [smsFilter, setSmsFilter] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30_000)
    return () => clearInterval(interval)
  }, [router])

  const filteredJobs = React.useMemo(() => {
    return jobs
      .filter((j) => {
        if (j.status === 'partial') return false
        if (j.status === 'cancelled' && activeTab !== 'all') return false
        if (activeTab === 'all') return true
        return mapStatusToStage(j.status) === activeTab
      })
      .filter((j) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return j.client_name?.toLowerCase().includes(q) || j.client_email?.toLowerCase().includes(q)
      })
      .filter((j) => {
        if (!smsFilter) return true
        return (j as any).sms_opt_in === true
      })
  }, [activeTab, jobs, query, smsFilter])

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) sm:max-w-sm sm:py-2" />
        </div>
      </div>



      {/* SMS Opted In filter chip */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSmsFilter((prev) => !prev)}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
            smsFilter
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${smsFilter ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          SMS Opted In
          {smsFilter && (
            <span className="ml-0.5 font-semibold text-emerald-600">
              · {filteredJobs.length}
            </span>
          )}
        </button>
        {smsFilter && (
          <span className="text-xs text-slate-400">
            Showing customers who consented to text messages
          </span>
        )}
      </div>

      <div className="mb-4 -mx-4 sm:mx-0">
        <div className="flex gap-0 overflow-x-auto border-b border-slate-200 px-4 sm:gap-6 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`cursor-pointer shrink-0 pb-3 pr-4 text-sm whitespace-nowrap sm:pr-0 ${
                isActive ? 'border-b-2 border-(--color-brand) font-semibold text-(--color-brand)' : 'text-slate-500 transition-colors duration-200 hover:text-slate-900'
              }`}>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="block sm:hidden space-y-2">
        {filteredJobs.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center"><p className="text-sm text-slate-400">No jobs found.</p></div> : filteredJobs.map((job) => {
          const stage = mapStatusToStage(job.status)
          const stageConf = STAGE_CONFIG[stage]
          const badge = <UrgencyBadge createdAt={job.created_at} stage={stage} />
          return (
            <Link key={job.id} href={`/admin/jobs/${job.id}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors duration-150 active:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap"><p className="font-semibold text-slate-900 text-sm truncate">{job.client_name}</p>{badge}</div>
                <p className="mt-0.5 text-sm text-slate-600">{formatService(job.service_type)}</p>
                <p className="mt-0.5 text-xs text-slate-400">{formatAvailability(job.availability_start, job.availability_end, job.availability_time_pref)}</p>
                <div className="mt-2 flex items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${stageConf.bg} ${stageConf.text}`}><span className={`h-1.5 w-1.5 rounded-full ${stageConf.dot}`} />{stageConf.label}</span><span className="text-xs text-slate-400">{timeAgo(job.created_at)}</span></div>
              </div>
              <ChevronRight size={16} className="mt-1 shrink-0 text-slate-300" />
            </Link>
          )
        })}
      </div>

      <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">{['Submitted', 'Client', 'Service', 'Availability', 'Stage', 'Action'].map((header) => <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{header}</th>)}</tr></thead>
          <tbody>{filteredJobs.length === 0 ? <tr><td colSpan={6}><p className="px-4 py-10 text-center text-sm text-slate-400">No jobs found.</p></td></tr> : filteredJobs.map((job) => {
            const stage = mapStatusToStage(job.status)
            const stageConf = STAGE_CONFIG[stage]
            const created = new Date(job.created_at)
            return <tr key={job.id} className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50"><td className="px-4 py-3"><div><UrgencyBadge createdAt={job.created_at} stage={stage} /><p className="mt-1 text-xs text-slate-400">{created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {timeAgo(job.created_at)}</p></div></td><td className="px-4 py-3"><p className="font-medium text-slate-900">{job.client_name}</p><p className="text-xs text-slate-500">{job.client_email}</p></td><td className="px-4 py-3 text-slate-700">{formatService(job.service_type)}</td><td className="px-4 py-3 text-slate-600">{formatAvailability(job.availability_start, job.availability_end, job.availability_time_pref)}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${stageConf.dot}`} /><span className={`text-xs font-medium ${stageConf.text}`}>{stageConf.label}</span></div></td><td className="px-4 py-3"><Link href={`/admin/jobs/${job.id}`} className="cursor-pointer text-sm font-medium text-(--color-brand) hover:underline">View →</Link></td></tr>
          })}</tbody>
        </table>
      </div>
    </div>
  )
}
