'use client'

import * as React from 'react'
import { ADD_ONS } from '@/lib/pricing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STATUS_VARIANTS = {
  new: 'neutral',
  under_review: 'warning',
  approved: 'default',
  scheduled: 'success',
  completed: 'neutral',
  cancelled: 'danger',
} as const

const TIME_LABELS = {
  morning: 'Morning (8am–12pm)',
  afternoon: 'Afternoon (12pm–5pm)',
  flexible: 'Flexible (Any Time)',
} as const

const FREQUENCY_LABELS = {
  one_time: 'One-time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  monthly: 'Monthly',
} as const

function formatService(serviceType: string | null) {
  if (serviceType === 'standard') return 'Standard Clean'
  if (serviceType === 'deep') return 'Deep Clean'
  if (serviceType === 'move_out') return 'Move-In / Move-Out'
  return 'Service'
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start || !end) return '—'
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startFmt = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endFmt = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startFmt} – ${endFmt}`
}

export function QuoteCard({ job }: { job: any }) {
  const [approvedPrice, setApprovedPrice] = React.useState<string>(
    String(job.approved_price ?? job.estimated_price_low ?? '')
  )
  const [confirmedDate, setConfirmedDate] = React.useState<string>('')
  const [loadingStripe, setLoadingStripe] = React.useState(false)
  const [loadingCash, setLoadingCash] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')

  const canApprove = Boolean(confirmedDate && approvedPrice && Number(approvedPrice) > 0 && !job.deposit_paid)

  const bedrooms = Number(job.bedrooms ?? 0)
  const bathrooms = Number(job.bathrooms ?? 0)

  const basePrice = React.useMemo(() => {
    if (job.service_type === 'move_out') return null
    if (job.service_type === 'standard') {
      return Math.max(bedrooms * 60 + bathrooms * 40, 200)
    }
    if (job.service_type === 'deep') {
      return Math.max(bedrooms * 90 + bathrooms * 55, 350)
    }
    return null
  }, [bathrooms, bedrooms, job.service_type])

  const selectedAddOns: string[] = Array.isArray(job.add_ons) ? job.add_ons : []
  const addOns = ADD_ONS.filter((addon) => selectedAddOns.includes(addon.id))
  const addOnsTotal = addOns.reduce((sum, addon) => sum + addon.price, 0)
  const subtotal = job.service_type === 'move_out' ? null : (basePrice ?? 0) + addOnsTotal

  const statusVariant = STATUS_VARIANTS[job.status as keyof typeof STATUS_VARIANTS] ?? 'neutral'

  const handleStripe = async () => {
    setLoadingStripe(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/send-deposit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, approvedPrice: Number(approvedPrice), confirmedDate }),
    })
    if (res.ok) {
      setSuccessMsg(`Deposit link sent to ${job.client_email} ✓`)
    } else {
      setErrorMsg('Failed to send deposit link. Please try again.')
    }
    setLoadingStripe(false)
  }

  const handleCash = async () => {
    setLoadingCash(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/mark-cash-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, approvedPrice: Number(approvedPrice), confirmedDate }),
    })
    if (res.ok) {
      setSuccessMsg('Cash deposit recorded ✓ — job is now scheduled.')
    } else {
      setErrorMsg('Failed to record cash payment. Please try again.')
    }
    setLoadingCash(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Quote Summary</h2>
        <Badge variant={statusVariant}>{String(job.status ?? 'new').replace('_', ' ')}</Badge>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-slate-900">
            {formatService(job.service_type)} · {bedrooms} bed / {bathrooms} bath
          </p>
          {job.service_type === 'move_out' ? null : (
            <p className="font-mono tabular-nums text-slate-900">${basePrice ?? 0}</p>
          )}
        </div>

        {job.service_type === 'move_out' ? (
          <p className="mt-1 text-sm text-slate-600">Pricing confirmed after photo review</p>
        ) : null}

        <div className="mt-2 space-y-1">
          {addOns.map((addon) => (
            <div key={addon.id} className="flex justify-between text-sm">
              <span className="text-slate-900">{addon.label}</span>
              <span className="font-mono tabular-nums text-slate-600">${addon.price}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-medium">
          <span className="text-slate-900">Subtotal</span>
          <span className="font-mono tabular-nums text-slate-900">
            {job.service_type === 'move_out' ? 'Quoted after photo review' : `$${subtotal ?? 0}`}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <p>{formatDateRange(job.availability_start, job.availability_end)}</p>
        <p>{TIME_LABELS[job.time_preference as keyof typeof TIME_LABELS] ?? '—'}</p>
        <Badge variant="neutral">{FREQUENCY_LABELS[job.frequency as keyof typeof FREQUENCY_LABELS] ?? 'One-time'}</Badge>
      </div>

      {!job.deposit_paid ? (
        <>
          <label className="mt-4 block space-y-1">
            <span className="text-sm font-medium text-slate-900">Confirmed Date</span>
            <p className="text-xs text-slate-500">Must be within the customer's availability window above.</p>
            <Input
              type="date"
              value={confirmedDate}
              onChange={(e) => setConfirmedDate(e.target.value)}
              min={job.availability_start ?? undefined}
              max={job.availability_end ?? undefined}
            />
          </label>

          <label className="mt-3 block space-y-1">
            <span className="text-sm font-medium text-slate-900">Approved Price ($)</span>
            <Input
              type="number"
              value={approvedPrice}
              onChange={(e) => setApprovedPrice(e.target.value)}
              min="100"
              step="1"
              className="font-mono tabular-nums"
            />
          </label>
        </>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <div className="flex justify-between bg-(--color-brand) px-4 py-3 text-white">
          <span>Deposit (due now)</span>
          <span className="font-mono text-lg font-bold tabular-nums">$100</span>
        </div>
        <div className="flex justify-between bg-slate-50 px-4 py-3 text-sm">
          <span className="text-slate-600">Remaining balance</span>
          <span className="font-mono font-medium tabular-nums text-slate-900">${Math.max(Number(approvedPrice || 0) - 100, 0)}</span>
        </div>
      </div>

      {!job.deposit_paid ? (
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleStripe}
            disabled={!canApprove || loadingStripe || loadingCash}
            className="flex-1"
          >
            {loadingStripe ? 'Sending…' : 'Approve & Send Deposit Link'}
          </Button>
          <Button
            variant="brand-outline"
            onClick={handleCash}
            disabled={!canApprove || loadingStripe || loadingCash}
            className="flex-1"
          >
            {loadingCash ? 'Recording…' : 'Mark as Cash Paid'}
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Deposit received — job is scheduled
        </div>
      )}

      {!canApprove && !job.deposit_paid ? (
        <p className="mt-3 text-xs text-slate-500">Set confirmed date and approved price to enable actions.</p>
      ) : null}

      {successMsg && <p className="mt-3 text-sm font-medium text-emerald-600">{successMsg}</p>}
      {errorMsg && <p className="mt-3 text-sm font-medium text-red-600">{errorMsg}</p>}
    </div>
  )
}
