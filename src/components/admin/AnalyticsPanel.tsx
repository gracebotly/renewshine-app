'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'

// Business started May 2026 — analytics covers May through December only
const MONTH_NAMES = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEAR = 2026
// May = JS month index 4. MONTH_NAMES[i] maps to JS month (4 + i).
const JS_MONTH_OFFSET = 4

interface JobRow {
  id: string
  status: string
  type: string | null
  service_type: string | null
  service_frequency: string | null
  approved_price: number | null
  deposit_amount: number | null
  deposit_paid: boolean
  remaining_amount: number | null
  created_at: string
  client_email: string
}

interface MonthStats {
  collected: number
  outstanding: number
  jobsDone: number
  recurringClients: number
  weeklyBars: { label: string; amount: number }[]
  resPct: number
  comPct: number
  oneTimePct: number
  recurringPct: number
}

function calcMonthStats(jobs: JobRow[], jsMonth: number): MonthStats {
  const monthJobs = jobs.filter((j) => {
    const d = new Date(j.created_at)
    return d.getFullYear() === YEAR && d.getMonth() === jsMonth
  })

  const collected = monthJobs.reduce((sum, j) => {
    if (j.status === 'completed' && j.approved_price) return sum + j.approved_price
    if (j.deposit_paid && j.deposit_amount) return sum + j.deposit_amount
    return sum
  }, 0)

  const outstanding = monthJobs.reduce((sum, j) => sum + (j.remaining_amount ?? 0), 0)

  const jobsDone = monthJobs.filter((j) => j.status === 'completed').length

  const recurringClients = new Set(
    monthJobs
      .filter((j) => j.service_frequency && j.service_frequency !== 'one_time')
      .map((j) => j.client_email)
  ).size

  // Weekly bars — group revenue events by week-of-month
  const weekMap: Record<string, number> = {}
  monthJobs.forEach((j) => {
    const hasRevenue =
      (j.status === 'completed' && j.approved_price) ||
      (j.deposit_paid && j.deposit_amount)
    if (!hasRevenue) return
    const d = new Date(j.created_at)
    const label = `Wk ${Math.ceil(d.getDate() / 7)}`
    const amount =
      j.status === 'completed' ? (j.approved_price ?? 0) : (j.deposit_amount ?? 0)
    weekMap[label] = (weekMap[label] ?? 0) + amount
  })
  const weeklyBars = Object.entries(weekMap).map(([label, amount]) => ({ label, amount }))

  // Splits
  const total = monthJobs.length || 1
  const res = monthJobs.filter((j) => j.type !== 'commercial').length
  const com = total - res
  const recurring = monthJobs.filter(
    (j) => j.service_frequency && j.service_frequency !== 'one_time'
  ).length

  return {
    collected,
    outstanding,
    jobsDone,
    recurringClients,
    weeklyBars,
    resPct: Math.round((res / total) * 100),
    comPct: Math.round((com / total) * 100),
    oneTimePct: Math.round(((total - recurring) / total) * 100),
    recurringPct: Math.round((recurring / total) * 100),
  }
}

export function AnalyticsPanel() {
  const [allJobs, setAllJobs] = React.useState<JobRow[]>([])
  const [loading, setLoading] = React.useState(true)

  // Default to current real month, clamped to May–Dec 2026 window
  const defaultIdx = Math.min(
    Math.max(new Date().getMonth() - JS_MONTH_OFFSET, 0),
    MONTH_NAMES.length - 1
  )
  const [selectedIdx, setSelectedIdx] = React.useState(defaultIdx)

  React.useEffect(() => {
    supabaseBrowser
      .from('jobs')
      .select(
        'id, status, type, service_type, service_frequency, approved_price, deposit_amount, deposit_paid, remaining_amount, created_at, client_email'
      )
      .gte('created_at', '2026-05-01T00:00:00')
      .not('status', 'in', '(partial,cancelled)')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setAllJobs((data ?? []) as JobRow[])
        setLoading(false)
      })
  }, [])

  const jsMonth = JS_MONTH_OFFSET + selectedIdx

  const stats = React.useMemo(
    () => calcMonthStats(allJobs, jsMonth),
    [allJobs, jsMonth]
  )

  // YTD collected amount for each of the 8 months (May–Dec)
  const ytdValues = React.useMemo(
    () => MONTH_NAMES.map((_, i) => calcMonthStats(allJobs, JS_MONTH_OFFSET + i).collected),
    [allJobs]
  )
  const ytdMax = Math.max(...ytdValues, 1)

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedIdx((i) => i - 1)}
            disabled={selectedIdx === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="min-w-[96px] text-center text-base font-semibold text-slate-900">
            {MONTH_NAMES[selectedIdx]} {YEAR}
          </p>
          <button
            type="button"
            onClick={() => setSelectedIdx((i) => i + 1)}
            disabled={selectedIdx === MONTH_NAMES.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <p className="hidden text-xs text-slate-400 sm:block">Calculated from your jobs</p>
      </div>

      {loading ? (
        // Skeleton
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[88px] animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Collected</p>
              <p className="font-mono text-2xl font-semibold text-emerald-600">
                ${stats.collected.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">this month</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Outstanding</p>
              <p className="font-mono text-2xl font-semibold text-amber-600">
                ${stats.outstanding.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">unpaid balance</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Jobs done</p>
              <p className="font-mono text-2xl font-semibold text-slate-900">{stats.jobsDone}</p>
              <p className="mt-1 text-xs text-slate-400">completed</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Recurring</p>
              <p className="font-mono text-2xl font-semibold text-slate-900">
                {stats.recurringClients}
              </p>
              <p className="mt-1 text-xs text-slate-400">active clients</p>
            </div>
          </div>

          {/* Revenue by week */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Revenue by week
            </p>
            {stats.weeklyBars.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                No revenue recorded for {MONTH_NAMES[selectedIdx]} {YEAR}
              </p>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const maxBar = Math.max(...stats.weeklyBars.map((b) => b.amount), 1)
                  return stats.weeklyBars.map((bar) => (
                    <div key={bar.label} className="flex items-center gap-3">
                      <span className="w-10 shrink-0 text-right text-xs text-slate-400">
                        {bar.label}
                      </span>
                      <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
                        <div
                          className="h-full rounded-md bg-(--color-brand) transition-all duration-500"
                          style={{ width: `${Math.round((bar.amount / maxBar) * 100)}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 font-mono text-xs text-slate-600">
                        ${bar.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>

          {/* Splits */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Residential vs commercial
              </p>
              <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-(--color-brand) transition-all duration-500"
                  style={{ width: `${stats.resPct}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">{stats.resPct}% residential</span>
                <span className="text-xs text-slate-500">{stats.comPct}% commercial</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                One-time vs recurring
              </p>
              <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                  style={{ width: `${stats.oneTimePct}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">{stats.oneTimePct}% one-time</span>
                <span className="text-xs text-slate-500">{stats.recurringPct}% recurring</span>
              </div>
            </div>
          </div>

          {/* Year-to-date — May through December 2026 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              2026 — May to December
            </p>
            <div className="flex items-end gap-1.5" style={{ height: 96 }}>
              {MONTH_NAMES.map((name, i) => {
                const val = ytdValues[i]
                const isCurrent = i === selectedIdx
                const heightPct = val > 0 ? Math.max(Math.round((val / ytdMax) * 100), 8) : 0
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIdx(i)}
                    className="group flex flex-1 cursor-pointer flex-col items-center gap-1"
                    title={`${name} ${YEAR}: $${val.toLocaleString()}`}
                  >
                    <span
                      className={`text-[10px] font-mono leading-none ${
                        isCurrent ? 'text-(--color-brand) font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {val > 0
                        ? `$${val >= 1000 ? Math.round(val / 1000) + 'k' : val}`
                        : '—'}
                    </span>
                    <div
                      className="flex w-full flex-col justify-end"
                      style={{ height: 56 }}
                    >
                      {val > 0 ? (
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isCurrent
                              ? 'bg-(--color-brand)'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      ) : (
                        <div className="w-full rounded-t-sm bg-slate-100" style={{ height: 3 }} />
                      )}
                    </div>
                    <span
                      className={`text-[10px] leading-none ${
                        isCurrent ? 'text-(--color-brand) font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-300">
              Tap any month to view its data
            </p>
          </div>
        </>
      )}
    </div>
  )
}
