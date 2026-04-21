'use client'

import * as React from 'react'
import { ADD_ONS } from '@/lib/pricing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell } from 'lucide-react'

const STATUS_VARIANTS = {
  new: 'neutral',
  under_review: 'warning',
  approved: 'default',
  scheduled: 'success',
  completed: 'neutral',
  cancelled: 'danger',
} as const

const TIME_LABELS = {
  early_morning: '8am – 10am',
  mid_morning: '10am – 12pm',
  noon: '12pm – 2pm',
  early_afternoon: '2pm – 4pm',
  late_afternoon: '4pm – 6pm',
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
  const [loadingReview, setLoadingReview] = React.useState(false)
  const [loadingDecline, setLoadingDecline] = React.useState(false)
  const [showDeclineConfirm, setShowDeclineConfirm] = React.useState(false)
  const [loadingResend, setLoadingResend] = React.useState(false)
  const [overrideStatus, setOverrideStatus] = React.useState(job.status)
  const [loadingOverride, setLoadingOverride] = React.useState(false)
  const [loadingReminder, setLoadingReminder] = React.useState(false)
  const [reminderSent, setReminderSent] = React.useState(false)
  const [loadingComplete, setLoadingComplete] = React.useState(false)
  const [completedConfirm, setCompletedConfirm] = React.useState(false)

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

  const handleMarkUnderReview = async () => {
    setLoadingReview(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/update-job-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: 'under_review' }),
    })
    if (res.ok) {
      setSuccessMsg('Status updated to Under Review ✓')
      setOverrideStatus('under_review')
    } else {
      setErrorMsg('Failed to update status.')
    }
    setLoadingReview(false)
  }

  const handleDecline = async () => {
    setLoadingDecline(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/update-job-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: 'cancelled' }),
    })
    if (res.ok) {
      setSuccessMsg('Request declined — status set to Cancelled.')
      setShowDeclineConfirm(false)
      setOverrideStatus('cancelled')
    } else {
      setErrorMsg('Failed to decline request.')
    }
    setLoadingDecline(false)
  }

  const handleResendLink = async () => {
    setLoadingResend(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/send-deposit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        approvedPrice: Number(job.approved_price),
        confirmedDate: job.confirmed_date,
      }),
    })
    if (res.ok) {
      setSuccessMsg(`Deposit link resent to ${job.client_email} ✓`)
    } else {
      setErrorMsg('Failed to resend link. Please try again.')
    }
    setLoadingResend(false)
  }

  const handleStatusOverride = async (newStatus: string) => {
    if (newStatus === job.status) return
    setLoadingOverride(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/update-job-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: newStatus }),
    })
    if (res.ok) {
      setOverrideStatus(newStatus)
      setSuccessMsg(`Status updated to "${newStatus.replace('_', ' ')}" ✓`)
    } else {
      setErrorMsg('Failed to update status.')
      setOverrideStatus(job.status)
    }
    setLoadingOverride(false)
  }

  async function handleMarkComplete() {
    setLoadingComplete(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/update-job-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: 'completed' }),
    })
    if (res.ok) {
      setSuccessMsg('Job marked as complete ✓ — balance link and rating SMS will fire automatically.')
      setCompletedConfirm(false)
      setOverrideStatus('completed')
    } else {
      setErrorMsg('Failed to mark job as complete. Please try again.')
    }
    setLoadingComplete(false)
  }

  async function handleReminder() {
    setLoadingReminder(true)
    try {
      const res = await fetch('/api/admin/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      if (res.ok) {
        setReminderSent(true)
      } else {
        console.error('Reminder send failed')
      }
    } catch (err) {
      console.error('Reminder send error:', err)
    } finally {
      setLoadingReminder(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Quote Summary</h2>
        <Badge variant={statusVariant}>{String(job.status ?? 'new').replace('_', ' ')}</Badge>
      </div>

      {job.status === 'new' && (
        <button
          onClick={handleMarkUnderReview}
          disabled={loadingReview}
          className="mb-4 w-full cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors duration-200 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingReview ? 'Updating…' : '👁 Mark as Under Review'}
        </button>
      )}

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
        <p>{TIME_LABELS[job.availability_time_pref as keyof typeof TIME_LABELS] ?? '—'}</p>
        <Badge variant="neutral">
          {FREQUENCY_LABELS[job.service_frequency as keyof typeof FREQUENCY_LABELS] ?? 'One-time'}
        </Badge>
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
          <span className="font-mono font-medium tabular-nums text-slate-900">
            ${Math.max(Number(approvedPrice || 0) - 100, 0)}
          </span>
        </div>
      </div>

      {job.status === 'approved' && !job.deposit_paid && job.stripe_payment_link && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">Link sent. Customer hasn't paid yet.</p>
          <button
            onClick={handleResendLink}
            disabled={loadingResend}
            className="shrink-0 cursor-pointer rounded-lg border border-(--color-brand) px-3 py-1.5 text-xs font-medium text-(--color-brand) transition-colors duration-200 hover:bg-(--color-brand-muted) disabled:opacity-50"
          >
            {loadingResend ? 'Resending…' : 'Resend Link'}
          </button>
        </div>
      )}

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
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ Deposit received — job is scheduled
          </div>
          {/* Manual day-before reminder — only show for scheduled jobs */}
          <button
            onClick={handleReminder}
            disabled={loadingReminder || reminderSent}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bell size={14} />
            {reminderSent ? 'Reminder sent ✓' : loadingReminder ? 'Sending…' : 'Send Day-Before Reminder'}
          </button>

          {/* Mark as Complete — triggers n8n job-completed webhook (balance link + rating SMS) */}
          {job.status === 'scheduled' &&
            (!completedConfirm ? (
              <button
                onClick={() => setCompletedConfirm(true)}
                className="w-full cursor-pointer rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700"
              >
                ✓ Mark as Complete
              </button>
            ) : (
              <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">
                  Mark this job as complete? This will automatically send the balance due link and the satisfaction
                  rating SMS to the client.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkComplete}
                    disabled={loadingComplete}
                    className="flex-1 cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loadingComplete ? 'Completing…' : 'Yes, Mark Complete'}
                  </button>
                  <button
                    onClick={() => setCompletedConfirm(false)}
                    className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {!job.deposit_paid && job.status !== 'cancelled' && job.status !== 'completed' && (
        <div className="mt-3">
          {!showDeclineConfirm ? (
            <button
              onClick={() => setShowDeclineConfirm(true)}
              className="w-full cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
            >
              Decline Request
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">Decline this request? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDecline}
                  disabled={loadingDecline}
                  className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
                >
                  {loadingDecline ? 'Declining…' : 'Yes, Decline'}
                </button>
                <button
                  onClick={() => setShowDeclineConfirm(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!canApprove && !job.deposit_paid ? (
        <p className="mt-3 text-xs text-slate-500">Set confirmed date and approved price to enable actions.</p>
      ) : null}

      {successMsg && <p className="mt-3 text-sm font-medium text-emerald-600">{successMsg}</p>}
      {errorMsg && <p className="mt-3 text-sm font-medium text-red-600">{errorMsg}</p>}

      <div className="mt-6 border-t border-slate-100 pt-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manual Status Override</span>
          <div className="flex gap-2">
            <select
              value={overrideStatus}
              onChange={(e) => handleStatusOverride(e.target.value)}
              disabled={loadingOverride}
              className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0 disabled:opacity-50"
            >
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {loadingOverride && <div className="flex items-center px-2 text-xs text-slate-500">Saving…</div>}
          </div>
        </label>
      </div>
    </div>
  )
}
