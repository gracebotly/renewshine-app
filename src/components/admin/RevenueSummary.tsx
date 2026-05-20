'use client'

import * as React from 'react'
import Link from 'next/link'

interface WeekBar {
  label: string
  amount: number
}

interface OutstandingJob {
  id: string
  client_name: string
  type: string | null
  service_type: string | null
  remaining_amount: number | null
  created_at: string
}

interface RevenueSummaryProps {
  monthLabel: string
  collectedThisMonth: number
  outstandingTotal: number
  jobsDone: number
  recurringClients: number
  weeklyBars: WeekBar[]
  residentialPct: number
  recurringPct: number
  outstandingJobs: OutstandingJob[]
}

function formatCurrency(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US')
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function formatServiceType(s: string | null): string {
  if (s === 'standard') return 'Standard Clean'
  if (s === 'deep') return 'Deep Clean'
  if (s === 'move_out') return 'Move-Out'
  if (s === 'post_construction') return 'Post-Construction'
  return 'Service'
}

export function RevenueSummary({ monthLabel, collectedThisMonth, outstandingTotal, jobsDone, recurringClients, weeklyBars, residentialPct, recurringPct, outstandingJobs }: RevenueSummaryProps) {
  const maxBarAmount = Math.max(...weeklyBars.map((b) => b.amount), 1)
  const lastBarIndex = weeklyBars.length - 1

  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{monthLabel}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-1 text-xs text-slate-400">Collected</p><p className="text-xl font-mono font-semibold tabular-nums text-emerald-700">{formatCurrency(collectedThisMonth)}</p><p className="mt-1 text-xs text-slate-400">this month</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-1 text-xs text-slate-400">Outstanding</p><p className={`text-xl font-semibold font-mono tabular-nums ${outstandingTotal > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{outstandingTotal > 0 ? formatCurrency(outstandingTotal) : '$0'}</p><p className="mt-1 text-xs text-slate-400">{outstandingJobs.length > 0 ? `${outstandingJobs.length} unpaid invoice${outstandingJobs.length > 1 ? 's' : ''}` : 'all clear'}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-1 text-xs text-slate-400">Jobs done</p><p className="text-xl font-semibold tabular-nums text-slate-900">{jobsDone}</p><p className="mt-1 text-xs text-slate-400">this month</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-1 text-xs text-slate-400">Recurring</p><p className="text-xl font-semibold tabular-nums text-slate-900">{recurringClients}</p><p className="mt-1 text-xs text-slate-400">active clients</p></div>
      </div>

      {weeklyBars.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Revenue by week</p></div><div className="mb-2 flex h-20 items-end gap-2">{weeklyBars.map((bar, i) => { const heightPct = Math.round((bar.amount / maxBarAmount) * 100); const isCurrent = i === lastBarIndex; return <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-0"><p className={`mb-1 w-full truncate text-center text-[10px] tabular-nums ${isCurrent ? 'font-medium text-slate-700' : 'text-slate-400'}`}>{formatCurrency(bar.amount)}</p><div className={`w-full rounded-t-md transition-all duration-300 ${isCurrent ? 'bg-(--color-brand)' : 'bg-slate-100'}`} style={{ height: `${Math.max(heightPct, 8)}%` }} /></div> })}</div><div className="flex gap-2">{weeklyBars.map((bar) => <p key={bar.label} className="flex-1 truncate text-center text-[10px] text-slate-400">{bar.label}</p>)}</div></div>}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-3 text-xs text-slate-400">Residential vs commercial</p><div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-(--color-brand) transition-all duration-500" style={{ width: `${residentialPct}%` }} /></div><div className="flex justify-between"><p className="text-[11px] font-medium text-emerald-700">{residentialPct}% res</p><p className="text-[11px] text-slate-400">{100 - residentialPct}% com</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-3 text-xs text-slate-400">One-time vs recurring</p><div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-(--color-brand) transition-all duration-500" style={{ width: `${recurringPct}%` }} /></div><div className="flex justify-between"><p className="text-[11px] font-medium text-emerald-700">{recurringPct}% rec</p><p className="text-[11px] text-slate-400">{100 - recurringPct}% one</p></div></div>
      </div>

      {outstandingJobs.length > 0 && <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Outstanding invoices</p></div><div className="divide-y divide-slate-100">{outstandingJobs.map((job) => { const days = daysAgo(job.created_at); const isOld = days >= 7; return <Link key={job.id} href={`/admin/jobs/${job.id}`} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-50 active:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{job.client_name}</p><p className="mt-0.5 text-xs text-slate-400">{job.type === 'commercial' ? 'Commercial' : 'Residential'} · {formatServiceType(job.service_type)}</p></div><div className="shrink-0 text-right"><p className={`text-sm font-semibold font-mono tabular-nums ${isOld ? 'text-red-600' : 'text-amber-700'}`}>{formatCurrency(job.remaining_amount ?? 0)}</p><p className={`mt-0.5 text-xs ${isOld ? 'text-red-500' : 'text-slate-400'}`}>{days === 0 ? 'today' : `${days}d ago`}</p></div></Link> })}</div></div>}
    </div>
  )
}
