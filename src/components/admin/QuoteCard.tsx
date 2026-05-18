'use client'

import * as React from 'react'
import { ADD_ONS } from '@/lib/pricing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell } from 'lucide-react'
import { InvoicePanel } from '@/components/admin/InvoicePanel'

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
  const [declineReason, setDeclineReason] = React.useState('')
  const [declineReferral, setDeclineReferral] = React.useState('')
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
    if (!declineReason.trim()) return
    setLoadingDecline(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/decline-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        reason: declineReason.trim(),
        referral: declineReferral.trim() || null,
      }),
    })
    if (res.ok) {
      setSuccessMsg('Request declined — decline email sent to customer.')
      setShowDeclineConfirm(false)
      setOverrideStatus('cancelled')
    } else {
      setErrorMsg('Failed to decline request. Please try again.')
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Decision state banner */}
      {overrideStatus === 'new' && (
        <div className="rounded-t-xl border-b border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-700">🚨 Action Required</p>
          <p className="mt-0.5 text-xs text-red-600">Review photos and send a quote</p>
        </div>
      )}
      {overrideStatus === 'under_review' && (
        <div className="rounded-t-xl border-b border-amber-100 bg-amber-50 px-5 py-4">
          <p className="text-sm font-bold text-amber-700">⏳ Under Review</p>
          <p className="mt-0.5 text-xs text-amber-600">Set price and confirmed date below</p>
        </div>
      )}
      {overrideStatus === 'approved' && !job.deposit_paid && (
        <div className="rounded-t-xl border-b border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-bold text-blue-700">💳 Awaiting Deposit</p>
          <p className="mt-0.5 text-xs text-blue-600">Quote sent — waiting for customer to pay</p>
        </div>
      )}
      {job.deposit_paid && overrideStatus === 'scheduled' && (
        <div className="rounded-t-xl border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-bold text-emerald-700">✅ Scheduled</p>
          <p className="mt-0.5 text-xs text-emerald-600">Deposit received — job is on the calendar</p>
        </div>
      )}
      {overrideStatus === 'completed' && (
        <div className="rounded-t-xl border-b border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-sm font-bold text-slate-700">✓ Completed</p>
          <p className="mt-0.5 text-xs text-slate-500">Job is done</p>
        </div>
      )}
      {overrideStatus === 'cancelled' && (
        <div className="rounded-t-xl border-b border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-700">✗ Declined</p>
          <p className="mt-0.5 text-xs text-red-500">This request was declined</p>
        </div>
      )}

      <div className="space-y-4 p-5">
        {/* Client + job summary — scannable block */}
        <div className="space-y-1">
          <p className="text-base font-bold text-slate-900">{job.client_name}</p>
          <p className="text-sm text-slate-600">
            {formatService(job.service_type)} · {bedrooms} bed / {bathrooms} bath
          </p>
          <Badge variant="neutral">
            {FREQUENCY_LABELS[job.service_frequency as keyof typeof FREQUENCY_LABELS] ?? 'One-time'}
          </Badge>
        </div>

        {/* Availability */}
        <div className="space-y-1 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <p className="text-slate-700">📅 {formatDateRange(job.availability_start, job.availability_end)}</p>
          <p className="text-slate-700">⏰ {TIME_LABELS[job.availability_time_pref as keyof typeof TIME_LABELS] ?? '—'}</p>
          {job.address && <p className="text-slate-700">📍 {job.address}</p>}
        </div>

        {/* Pricing breakdown — no per-item prices, names only */}
        <div className="overflow-hidden rounded-lg border border-slate-200 text-sm">
          {addOns.length > 0 && (
            <div className="bg-white px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Add-ons</p>
              <p className="text-slate-700">{addOns.map((a) => a.label).join(' · ')}</p>
            </div>
          )}
          <div className={`flex justify-between px-4 py-2.5 font-medium ${addOns.length > 0 ? 'border-t border-slate-200' : ''} bg-slate-50`}>
            <span className="text-slate-700">Estimated</span>
            <span className="font-mono tabular-nums text-slate-900">
              {job.service_type === 'move_out'
                ? 'After review'
                : `$${job.estimated_price_low ?? subtotal} – $${job.estimated_price_high ?? Math.round((subtotal ?? 0) * 1.15)}`}
            </span>
          </div>
        </div>

        {/* Approved price + date inputs — only show if not yet paid */}
        {!job.deposit_paid && (
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed Date</span>
              <p className="text-xs text-slate-400">Must fall within customer's window above</p>
            <Input
              type="date"
              value={confirmedDate}
              onChange={(e) => setConfirmedDate(e.target.value)}
            />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved Price ($)</span>
              <Input
                type="number"
                value={approvedPrice}
                onChange={(e) => setApprovedPrice(e.target.value)}
                min="100"
                step="1"
                className="font-mono tabular-nums"
              />
            </label>
          </div>
        )}

        {/* Deposit / remaining summary */}
        <div className="overflow-hidden rounded-lg border border-slate-200 text-sm">
          <div className="flex justify-between bg-(--color-brand) px-4 py-3 font-medium text-white">
            <span>Deposit due now</span>
            <span className="font-mono font-bold tabular-nums">$100</span>
          </div>
          <div className="flex justify-between bg-slate-50 px-4 py-2.5 text-slate-600">
            <span>Remaining balance</span>
            <span className="font-mono tabular-nums font-medium text-slate-900">
              ${Math.max(Number(approvedPrice || 0) - 100, 0)}
            </span>
          </div>
        </div>

        {/* Resend link notice */}
        {overrideStatus === 'approved' && !job.deposit_paid && job.stripe_payment_link && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
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

        {/* PRIMARY ACTION — full width, dominant */}
        {!job.deposit_paid && (
          <Button
            onClick={handleStripe}
            disabled={!canApprove || loadingStripe || loadingCash}
            className="w-full py-3 text-base font-semibold"
          >
            {loadingStripe ? 'Sending…' : 'Send Quote'}
          </Button>
        )}

        {/* SECONDARY ACTIONS */}
        {!job.deposit_paid && (
          <Button
            variant="brand-outline"
            onClick={handleCash}
            disabled={!canApprove || loadingStripe || loadingCash}
            className="w-full"
          >
            {loadingCash ? 'Recording…' : '💵 Mark as Cash Paid'}
          </Button>
        )}

        {/* Scheduled job actions */}
        {job.deposit_paid && (
          <div className="space-y-3">
            <button
              onClick={handleReminder}
              disabled={loadingReminder || reminderSent}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Bell size={14} />
              {reminderSent ? 'Reminder sent ✓' : loadingReminder ? 'Sending…' : 'Send Day-Before Reminder'}
            </button>

            {overrideStatus === 'scheduled' &&
              (!completedConfirm ? (
                <button
                  onClick={() => setCompletedConfirm(true)}
                  className="w-full cursor-pointer rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700"
                >
                  ✓ Mark as Complete
                </button>
              ) : (
                <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-800">
                    Mark complete? This sends the balance link and rating SMS automatically.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkComplete}
                      disabled={loadingComplete}
                      className="flex-1 cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {loadingComplete ? 'Completing…' : 'Yes, Complete'}
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

        {/* Decline */}
        {!job.deposit_paid && overrideStatus !== 'cancelled' && overrideStatus !== 'completed' && (
          <div>
            {!showDeclineConfirm ? (
              <button
                onClick={() => setShowDeclineConfirm(true)}
                className="w-full cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
              >
                Decline Request
              </button>
            ) : (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">Decline this request</p>
                <p className="text-xs text-red-600">A decline email will be sent to the customer automatically.</p>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Reason <span className="normal-case font-normal">(required — shown to customer)</span>
                  </span>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={3}
                    placeholder="After reviewing your photos, the level of buildup is beyond what our team is equipped to handle safely."
                    className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Referral <span className="normal-case font-normal">(optional — e.g. "ServiceMaster Clean 301-555-0100")</span>
                  </span>
                  <input
                    type="text"
                    value={declineReferral}
                    onChange={(e) => setDeclineReferral(e.target.value)}
                    placeholder="Leave blank for a generic referral line"
                    className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0"
                  />
                </label>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleDecline}
                    disabled={loadingDecline || !declineReason.trim()}
                    className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingDecline ? 'Sending…' : 'Send Decline & Email Customer'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeclineConfirm(false)
                      setDeclineReason('')
                      setDeclineReferral('')
                    }}
                    className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Helper text */}
        {!canApprove && !job.deposit_paid && overrideStatus !== 'cancelled' && (
          <p className="text-center text-xs text-slate-400">Set confirmed date and price to enable actions</p>
        )}

        {/* Feedback messages */}
        {successMsg && <p className="text-sm font-medium text-emerald-600">{successMsg}</p>}
        {errorMsg && <p className="text-sm font-medium text-red-600">{errorMsg}</p>}

        {/* Invoice */}
        <InvoicePanel job={job} />

      </div>
    </div>
  )

}
