'use client'

import * as React from 'react'
import { InvoicePanel } from '@/components/admin/InvoicePanel'
import { ComposeSheet } from '@/components/admin/ComposeSheet'

// ─── QuoteComposer ────────────────────────────────────────────────────────────

function QuoteComposer({
  items,
  setItems,
  depositAmount,
  setDepositAmount,
  dueDate,
  setDueDate,
  notes,
  setNotes,
  quoteTotal,
  depositAmt,
  onSend,
  onSendExternal,
  onCancel,
  loading,
  clientEmail,
  savedDate,
}: {
  items: Array<{ description: string; amount: string }>
  setItems: React.Dispatch<React.SetStateAction<Array<{ description: string; amount: string }>>>
  depositAmount: string
  setDepositAmount: (v: string) => void
  dueDate: string
  setDueDate: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  quoteTotal: number
  depositAmt: number
  onSend: () => void
  onSendExternal: () => void
  onCancel: () => void
  loading: boolean
  clientEmail: string
  savedDate: string | null
}) {
  const remaining = Math.max(quoteTotal - depositAmt, 0)
  const hasDate = Boolean(dueDate || savedDate)

  function addItem() {
    setItems((prev) => [...prev, { description: '', amount: '' }])
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateItem(i: number, field: 'description' | 'amount', value: string) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    )
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200'

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Quote + deposit link</p>
        <button
          onClick={onCancel}
          className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Line items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Line items</p>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="e.g. Deep Clean — 3BR/2BA"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="relative shrink-0 w-24">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                $
              </span>
              <input
                type="number"
                placeholder="0"
                value={item.amount}
                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                min="0"
                step="1"
                className="w-full rounded-lg border border-slate-200 bg-white pl-6 pr-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {items.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          className="cursor-pointer text-xs font-medium text-blue-600 hover:underline"
        >
          + Add line item
        </button>
      </div>

      {/* Totals */}
      {quoteTotal > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
          <div className="flex justify-between border-b border-slate-100 px-4 py-2.5 text-slate-600">
            <span>Total</span>
            <span className="font-mono tabular-nums">${quoteTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 px-4 py-2.5 text-slate-600">
            <span>Deposit due now</span>
            <span className="font-mono tabular-nums font-medium text-slate-900">
              ${depositAmt.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between bg-[#1A3F6F] px-4 py-3 font-semibold text-white">
            <span>Remaining after deposit</span>
            <span className="font-mono tabular-nums">${remaining.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Deposit amount + due date */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Deposit ($)
          </span>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            min="0"
            step="1"
            className={inputClass + ' font-mono'}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Due date{!savedDate && <span className="text-red-400 ml-0.5">*</span>}
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
          {savedDate && !dueDate && (
            <p className="text-[10px] text-slate-400">Using locked-in date</p>
          )}
        </label>
      </div>

      {/* Notes */}
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes{' '}
          <span className="normal-case font-normal text-slate-400">(shown on quote)</span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Optional note shown to the customer…"
          className={inputClass + ' resize-none'}
        />
      </label>

      {/* Send buttons */}
      <button
        onClick={onSend}
        disabled={quoteTotal <= 0 || loading || !hasDate}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1A3F6F] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Sending…'
          : !hasDate
          ? 'Set a due date to send'
          : quoteTotal > 0
          ? depositAmt > 0
            ? `Send quote + $${depositAmt.toFixed(0)} deposit link — $${quoteTotal.toFixed(2)} total`
            : `Send quote — $${quoteTotal.toFixed(2)} total (no deposit)`
          : 'Add line items to send'}
      </button>
      <button
        onClick={onSendExternal}
        disabled={quoteTotal <= 0 || loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Mark as sent externally (text / call)
      </button>

      <p className="text-center text-xs text-slate-400">
        Stripe payment link · quote email to {clientEmail}
      </p>
    </div>
  )
}

// ─── QuoteCard ────────────────────────────────────────────────────────────────

export function QuoteCard({ job }: { job: any }) {
  const [overrideStatus, setOverrideStatus] = React.useState(job.status)
  const [loadingStripe, setLoadingStripe] = React.useState(false)
  const [loadingResend, setLoadingResend] = React.useState(false)
  const [loadingReminder, setLoadingReminder] = React.useState(false)
  const [loadingComplete, setLoadingComplete] = React.useState(false)
  const [loadingOverride, setLoadingOverride] = React.useState(false)
  const [completedConfirm, setCompletedConfirm] = React.useState(false)
  const [reminderSent, setReminderSent] = React.useState(false)
  const [showCompose, setShowCompose] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')

  // Lock-in form
  const [lockInOpen, setLockInOpen] = React.useState(false)
  const [lockInDate, setLockInDate] = React.useState(
    job.confirmed_date ? new Date(job.confirmed_date).toISOString().split('T')[0] : ''
  )
  const [lockInPrice, setLockInPrice] = React.useState(
    job.approved_price ? String(job.approved_price) : ''
  )
  const [lockInNotes, setLockInNotes] = React.useState(job.notes ?? '')
  const [lockInLoading, setLockInLoading] = React.useState(false)

  // Saved booking state — updated optimistically after lock-in saves
  const [savedDate, setSavedDate] = React.useState<string | null>(job.confirmed_date ?? null)
  const [savedPrice, setSavedPrice] = React.useState<number | null>(job.approved_price ?? null)
  const [savedNotes, setSavedNotes] = React.useState<string>(job.notes ?? '')

  // Active composer
  const [activeComposer, setActiveComposer] = React.useState<'quote' | 'invoice' | null>(null)

  // Quote composer fields
  const [quoteItems, setQuoteItems] = React.useState<Array<{ description: string; amount: string }>>(
    [{ description: '', amount: '' }]
  )
  const [quoteDepositAmount, setQuoteDepositAmount] = React.useState('100')
  const [quoteDueDate, setQuoteDueDate] = React.useState('')
  const [quoteNotes, setQuoteNotes] = React.useState('')

  const quoteTotal = quoteItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const depositAmount = Number.isFinite(parseFloat(quoteDepositAmount)) ? parseFloat(quoteDepositAmount) : 0

  // Derived
  const hasBooking = Boolean(savedDate || savedPrice)
  const paymentStatus: 'unpaid' | 'deposit_paid' | 'fully_paid' =
    overrideStatus === 'completed' || job.remaining_amount === 0
      ? 'fully_paid'
      : job.deposit_paid
      ? 'deposit_paid'
      : 'unpaid'

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLockIn = async () => {
    if (!lockInDate && !lockInPrice) {
      setErrorMsg('Enter a date or price to lock in the booking.')
      return
    }
    setLockInLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/lock-in-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        confirmedDate: lockInDate || null,
        finalPrice: lockInPrice || null,
        bookingNotes: lockInNotes,
      }),
    })
    if (res.ok) {
      setSavedDate(lockInDate || null)
      setSavedPrice(lockInPrice ? Number(lockInPrice) : null)
      setSavedNotes(lockInNotes)
      setLockInOpen(false)
      setSuccessMsg('Booking locked in ✓')
    } else {
      setErrorMsg('Failed to save. Please try again.')
    }
    setLockInLoading(false)
  }

  const handleStripe = async () => {
    const dateToSend = savedDate ?? quoteDueDate
    if (!dateToSend) {
      setErrorMsg('Set a deposit due date before sending.')
      return
    }
    if (quoteTotal <= 0) {
      setErrorMsg('Add at least one line item with an amount.')
      return
    }
    setLoadingStripe(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/send-deposit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        approvedPrice: quoteTotal,
        confirmedDate: dateToSend,
      }),
    })
    if (res.ok) {
      setSuccessMsg(`Quote + deposit link sent to ${job.client_email} ✓`)
      setActiveComposer(null)
      setOverrideStatus('approved')
    } else {
      const err = await res.json().catch(() => ({}))
      setErrorMsg((err as any).error ?? 'Failed to send. Please try again.')
    }
    setLoadingStripe(false)
  }

  const handleMarkSentExternally = async () => {
    setOverrideStatus('approved')
    setActiveComposer(null)
    setSuccessMsg('Marked as approved — quote sent externally ✓')
  }

  const handleMarkScheduled = async () => {
    const res = await fetch('/api/admin/update-job-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: 'scheduled' }),
    })
    if (res.ok) setOverrideStatus('scheduled')
  }

  const handleComposeSuccess = (_note: string) => {
    setShowCompose(false)
    setOverrideStatus('contacted')
    setSuccessMsg('Message sent ✓ — job marked as contacted.')
  }

  const handleResendLink = async () => {
    setLoadingResend(true)
    await fetch('/api/admin/send-deposit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        approvedPrice: job.approved_price,
        confirmedDate: job.confirmed_date,
        regenerate: true,
      }),
    })
    setLoadingResend(false)
    setSuccessMsg('Deposit link resent ✓')
  }

  const handleStatusOverride = async (newStatus: string) => {
    setLoadingOverride(true)
    const res = await fetch('/api/admin/update-job-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: newStatus }),
    })
    if (res.ok) setOverrideStatus(newStatus)
    setLoadingOverride(false)
  }

  const handleMarkComplete = async () => {
    setLoadingComplete(true)
    const res = await fetch('/api/admin/update-job-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: 'completed' }),
    })
    if (res.ok) {
      setOverrideStatus('completed')
      setCompletedConfirm(false)
      setSuccessMsg('Job marked as complete ✓')
    }
    setLoadingComplete(false)
  }

  const handleReminder = async () => {
    setLoadingReminder(true)
    await fetch('/api/admin/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id }),
    })
    setReminderSent(true)
    setLoadingReminder(false)
    setSuccessMsg('Day-before reminder sent ✓')
  }

  // ── Status bar config ─────────────────────────────────────────────────────

  const statusConfig: Record<string, { dot: string; label: string }> = {
    new:          { dot: 'bg-red-400',     label: 'New' },
    under_review: { dot: 'bg-amber-400',   label: 'Under review' },
    contacted:    { dot: 'bg-amber-500',   label: 'Contacted' },
    approved:     { dot: 'bg-blue-400',    label: 'Quote sent — awaiting deposit' },
    scheduled:    { dot: 'bg-emerald-500', label: job.deposit_paid ? 'Deposit paid — scheduled' : 'Scheduled' },
    completed:    { dot: 'bg-slate-400',   label: 'Complete' },
    cancelled:    { dot: 'bg-red-300',     label: 'Declined' },
  }
  const { dot, label } = statusConfig[overrideStatus] ?? { dot: 'bg-slate-300', label: overrideStatus }

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Status bar */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
        <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
        <p className="text-sm font-medium text-slate-900">{label}</p>
      </div>

      <div className="p-5 space-y-5">

        {/* ── ZONE 1: BOOKING CARD ── */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Booking
          </p>

          {/* Empty state */}
          {!hasBooking && !lockInOpen && (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
              <p className="mb-3 text-sm text-slate-400">No confirmed date or price yet</p>
              <button
                onClick={() => setLockInOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1A3F6F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90"
              >
                Lock in schedule + price
              </button>
            </div>
          )}

          {/* Confirmed booking card */}
          {hasBooking && !lockInOpen && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <p className="text-xs font-semibold text-slate-600">Confirmed booking</p>
                <button
                  onClick={() => setLockInOpen(true)}
                  className="cursor-pointer text-xs text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="divide-y divide-slate-100 px-4">
                {savedDate && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-slate-400">Date</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(savedDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {savedPrice !== null && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-slate-400">Final price</span>
                    <span className="text-sm font-semibold font-mono tabular-nums text-slate-900">
                      ${savedPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                {savedPrice !== null && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-slate-400">Deposit</span>
                    <span className={`text-sm font-medium ${
                      paymentStatus !== 'unpaid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {paymentStatus === 'fully_paid'
                        ? 'Fully paid ✓'
                        : paymentStatus === 'deposit_paid'
                        ? '$100 paid ✓'
                        : 'Pending'}
                    </span>
                  </div>
                )}
                {savedNotes ? (
                  <div className="py-2.5">
                    <p className="mb-1 text-xs text-slate-400">Notes</p>
                    <p className="text-sm text-slate-600">{savedNotes}</p>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-xs text-slate-400">Payment</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  paymentStatus === 'fully_paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : paymentStatus === 'deposit_paid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {paymentStatus === 'fully_paid'
                    ? 'Fully paid'
                    : paymentStatus === 'deposit_paid'
                    ? 'Deposit paid · balance due'
                    : 'Awaiting payment'}
                </span>
              </div>
            </div>
          )}

          {/* Lock-in / edit form */}
          {lockInOpen && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  {hasBooking ? 'Edit booking' : 'Lock in schedule + price'}
                </p>
                <button
                  onClick={() => setLockInOpen(false)}
                  className="cursor-pointer text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </span>
                  <input
                    type="date"
                    value={lockInDate}
                    onChange={(e) => setLockInDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Final price ($)
                  </span>
                  <input
                    type="number"
                    value={lockInPrice}
                    onChange={(e) => setLockInPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Internal notes
                </span>
                <textarea
                  value={lockInNotes}
                  onChange={(e) => setLockInNotes(e.target.value)}
                  rows={2}
                  placeholder="Parking spot, access code, scope details…"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <button
                onClick={handleLockIn}
                disabled={lockInLoading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1A3F6F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lockInLoading ? 'Saving…' : hasBooking ? 'Save changes' : 'Lock in booking'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* ── ZONE 2: ACTIONS ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Actions</p>

          {/* Contact customer — visible when no composer is open */}
          {activeComposer === null && (
            <button
              onClick={() => setShowCompose(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              Contact customer
            </button>
          )}

          {/* Send quote + deposit link */}
          {activeComposer !== 'invoice' && (
            activeComposer === 'quote' ? (
              <QuoteComposer
                items={quoteItems}
                setItems={setQuoteItems}
                depositAmount={quoteDepositAmount}
                setDepositAmount={setQuoteDepositAmount}
                dueDate={quoteDueDate}
                setDueDate={setQuoteDueDate}
                notes={quoteNotes}
                setNotes={setQuoteNotes}
                quoteTotal={quoteTotal}
                depositAmt={depositAmount}
                onSend={handleStripe}
                onSendExternal={handleMarkSentExternally}
                onCancel={() => setActiveComposer(null)}
                loading={loadingStripe}
                clientEmail={job.client_email}
                savedDate={savedDate}
              />
            ) : (
              <button
                onClick={() => setActiveComposer('quote')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1A3F6F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90"
              >
                Send quote + deposit link
              </button>
            )
          )}

          {/* Send invoice */}
          {activeComposer !== 'quote' && (
            activeComposer === 'invoice' ? (
              <InvoicePanel job={job} onClose={() => setActiveComposer(null)} />
            ) : (
              <button
                onClick={() => setActiveComposer('invoice')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
              >
                Send invoice
              </button>
            )
          )}
        </div>

        {/* ── JOB ACTIONS ── */}
        {activeComposer === null && (
          <>
            <div className="h-px bg-slate-100" />
            <div className="space-y-2">

              {/* Resend deposit link */}
              {overrideStatus === 'approved' && !job.deposit_paid && job.stripe_payment_link && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Quote sent — waiting on deposit</p>
                  <button
                    onClick={handleResendLink}
                    disabled={loadingResend}
                    className="shrink-0 cursor-pointer text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {loadingResend ? 'Resending…' : 'Resend link'}
                  </button>
                </div>
              )}

              {/* Mark scheduled manually */}
              {overrideStatus === 'approved' && !job.deposit_paid && (
                <button
                  onClick={handleMarkScheduled}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50"
                >
                  Mark scheduled (collected manually)
                </button>
              )}

              {/* Day-before reminder */}
              {(overrideStatus === 'scheduled' || job.deposit_paid) && (
                <button
                  onClick={handleReminder}
                  disabled={loadingReminder || reminderSent}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50"
                >
                  {reminderSent ? 'Reminder sent ✓' : loadingReminder ? 'Sending…' : 'Send day-before reminder'}
                </button>
              )}

              {/* Mark complete */}
              {overrideStatus !== 'completed' && overrideStatus !== 'cancelled' && (
                !completedConfirm ? (
                  <button
                    onClick={() => setCompletedConfirm(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors duration-200 hover:bg-emerald-100"
                  >
                    Mark job as complete
                  </button>
                ) : (
                  <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-medium text-emerald-800">
                      Confirm complete? This triggers balance link + rating SMS.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleMarkComplete}
                        disabled={loadingComplete}
                        className="flex-1 cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {loadingComplete ? 'Saving…' : 'Yes, complete'}
                      </button>
                      <button
                        onClick={() => setCompletedConfirm(false)}
                        className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Decline */}
              {overrideStatus !== 'cancelled' && overrideStatus !== 'completed' && (
                <button
                  onClick={() => handleStatusOverride('cancelled')}
                  disabled={loadingOverride}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2 text-xs font-medium text-red-500 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50"
                >
                  {loadingOverride ? 'Updating…' : 'Decline job'}
                </button>
              )}
            </div>
          </>
        )}

        {/* Feedback */}
        {successMsg && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
            {successMsg}
          </p>
        )}
        {errorMsg && (
          <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            {errorMsg}
          </p>
        )}

      </div>

      {/* ComposeSheet portal */}
      {showCompose && (
        <ComposeSheet
          job={job}
          mediaCount={job.job_media?.length ?? 0}
          onClose={() => setShowCompose(false)}
          onSuccess={handleComposeSuccess}
        />
      )}

    </div>
  )
}
