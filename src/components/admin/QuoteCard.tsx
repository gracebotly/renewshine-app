'use client'

import * as React from 'react'
import { Mail, MessageSquare, Send } from 'lucide-react'
import { InvoicePanel } from '@/components/admin/InvoicePanel'
import { ComposeSheet } from '@/components/admin/ComposeSheet'
import { ADD_ONS } from '@/lib/pricing'

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')           return 'Standard Clean'
  if (serviceType === 'deep')               return 'Deep Clean'
  if (serviceType === 'move_out')           return 'Move-In / Move-Out'
  if (serviceType === 'post_construction')  return 'Post-Construction'
  return 'cleaning service'
}

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
  onSendSms,
  onSendExternal,
  onCancel,
  loading,
  loadingSms,
  clientEmail,
  clientPhone,
  onPreview,
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
  onSendSms: () => void
  onSendExternal: () => void
  onCancel: () => void
  loading: boolean
  loadingSms: boolean
  clientEmail: string
  clientPhone: string | null
  onPreview: () => void
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

      {/* Primary: Send email */}
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
            ? `Send via email — $${depositAmt.toFixed(0)} deposit · $${quoteTotal.toFixed(2)} total`
            : `Send via email — $${quoteTotal.toFixed(2)} total`
          : 'Add line items to send'}
      </button>

      {/* Secondary: Send via text */}
      <button
        onClick={onSendSms}
        disabled={quoteTotal <= 0 || loadingSms || !clientPhone}
        title={!clientPhone ? 'No phone number on file' : undefined}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingSms
          ? 'Sending…'
          : !clientPhone
          ? 'No phone number on file'
          : quoteTotal > 0
          ? `Send via text — deposit link to ${clientPhone}`
          : 'Add line items to send'}
      </button>

      {/* Preview */}
      <button
        onClick={onPreview}
        disabled={quoteTotal <= 0}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Preview email before sending
      </button>

      {/* Mark sent manually — no Stripe link, no message sent */}
      <button
        onClick={onSendExternal}
        disabled={quoteTotal <= 0 || loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs text-slate-400 transition-colors duration-200 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sent manually — mark as approved
      </button>

      <p className="text-center text-xs text-slate-400">
        {clientPhone ? `Email: ${clientEmail} · Text: ${clientPhone}` : `Email: ${clientEmail}`}
      </p>
    </div>
  )
}

// ─── QuoteCard ────────────────────────────────────────────────────────────────

export function QuoteCard({ job }: { job: any }) {
  const [overrideStatus, setOverrideStatus] = React.useState(job.status)
  const [loadingStripe, setLoadingStripe] = React.useState(false)
  const [loadingSmsSend, setLoadingSmsSend] = React.useState(false)
  const [loadingResend, setLoadingResend] = React.useState(false)
  const [loadingReminder, setLoadingReminder] = React.useState(false)
  const [loadingComplete, setLoadingComplete] = React.useState(false)
  const [loadingOverride, setLoadingOverride] = React.useState(false)
  const [completedConfirm, setCompletedConfirm] = React.useState(false)
  const [reminderSent, setReminderSent] = React.useState(false)
  const [showCompose, setShowCompose] = React.useState(false)
  const [showManualPicker, setShowManualPicker] = React.useState(false)
  const [manualLogging, setManualLogging] = React.useState(false)
  const [showInlineSms, setShowInlineSms] = React.useState(false)
  const [inlineSmsBody, setInlineSmsBody] = React.useState('')
  const [smsSending, setSmsSending] = React.useState(false)
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
  const [showQuotePreview, setShowQuotePreview] = React.useState(false)
  const [quotePreviewHtml, setQuotePreviewHtml] = React.useState('')
  const [quotePreviewLoading, setQuotePreviewLoading] = React.useState(false)

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
        lineItems: quoteItems.filter((item) => item.description.trim() && parseFloat(item.amount) > 0),
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

  const handleStripeSms = async () => {
    const dateToSend = savedDate ?? quoteDueDate ?? null
    if (quoteTotal <= 0) {
      setErrorMsg('Add at least one line item with an amount.')
      return
    }
    if (!job.client_phone) {
      setErrorMsg('No phone number on file for this customer.')
      return
    }
    setLoadingSmsSend(true)
    setErrorMsg('')
    setSuccessMsg('')
    const res = await fetch('/api/admin/send-deposit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId:         job.id,
        approvedPrice: quoteTotal,
        confirmedDate: dateToSend,
        channel:       'sms',
        lineItems:     quoteItems.filter(
          (item) => item.description.trim() && parseFloat(item.amount) > 0
        ),
      }),
    })
    if (res.ok) {
      setSuccessMsg(`Deposit link texted to ${job.client_phone} ✓`)
      setActiveComposer(null)
      setOverrideStatus('approved')
    } else {
      const err = await res.json().catch(() => ({}))
      setErrorMsg((err as any).error ?? 'Failed to send. Please try again.')
    }
    setLoadingSmsSend(false)
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

  const openQuoteComposer = () => {
    // Only pre-populate if the composer hasn't been edited yet
    const isBlank =
      quoteItems.length === 1 &&
      !quoteItems[0].description &&
      !quoteItems[0].amount

    if (isBlank) {
      const serviceLabel =
        job.service_type === 'standard'            ? 'Standard Clean'
        : job.service_type === 'deep'              ? 'Deep Clean'
        : job.service_type === 'move_out'          ? 'Move-In / Move-Out'
        : job.service_type === 'post_construction' ? 'Post-Construction'
        : 'Cleaning Service'

      const bedroomLine =
        job.bedrooms
          ? `${job.bedrooms}BR / ${job.bathrooms ?? 0}BA`
          : ''

      const mainDesc = [serviceLabel, bedroomLine].filter(Boolean).join(' — ')
      const mainPrice = savedPrice ?? job.approved_price ?? ''

      const items: Array<{ description: string; amount: string }> = [
        { description: mainDesc, amount: String(mainPrice || '') },
      ]

      // Add-ons as separate line items — price left blank for Grace to confirm
      if (Array.isArray(job.add_ons) && job.add_ons.length > 0) {
        ADD_ONS
          .filter((a) => (job.add_ons as string[]).includes(a.id))
          .forEach((a) => {
            items.push({ description: a.label, amount: '' })
          })
      }

      setQuoteItems(items)
    }

    setActiveComposer('quote')
  }

  function fmtPhone(p: string) {
    const d = p.replace(/\D/g, '').slice(-10)
    return d.length === 10 ? `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}` : p
  }

  const handleManualContact = async (method: string) => {
    if (manualLogging) return
    setManualLogging(true)
    setShowManualPicker(false)
    setErrorMsg('')
    const labels: Record<string, string> = {
      text: 'Contacted via text (outside app)',
      email: 'Contacted via email (outside app)',
      verbal: 'Contacted verbally / by phone',
    }
    const res = await fetch('/api/admin/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        method: 'external',
        customBody: labels[method] ?? 'Contacted outside the app',
      }),
    })
    if (res.ok) {
      handleComposeSuccess(labels[method] ?? 'Logged ✓')
    } else {
      setErrorMsg('Failed to log. Please try again.')
    }
    setManualLogging(false)
  }

  const handleSendInlineSms = async () => {
    const body = inlineSmsBody.trim()
    if (!body || smsSending) return
    setSmsSending(true)
    setErrorMsg('')
    const res = await fetch('/api/admin/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, method: 'sms', customBody: body }),
    })
    if (res.ok) {
      const data = await res.json()
      setShowInlineSms(false)
      setInlineSmsBody('')
      handleComposeSuccess(data.contactNote ?? 'SMS sent')
    } else {
      setErrorMsg('Failed to send. Please try again.')
    }
    setSmsSending(false)
  }


  const handleQuotePreview = async () => {
    const dateToSend = savedDate ?? quoteDueDate
    if (quoteTotal <= 0) return
    setQuotePreviewLoading(true)
    setShowQuotePreview(true)
    setQuotePreviewHtml('')
    try {
      const res = await fetch('/api/admin/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          jobId: job.id,
          approvedPrice: quoteTotal,
          confirmedDate: dateToSend ?? new Date().toISOString().split('T')[0],
          lineItems: quoteItems.filter(
            (item) => item.description.trim() && parseFloat(item.amount) > 0
          ),
        }),
      })
      const data = await res.json()
      setQuotePreviewHtml(data.html ?? '')
    } catch {
      setQuotePreviewHtml('<p style="padding:32px;font-family:sans-serif;color:#ef4444;">Failed to generate preview. Check your connection and try again.</p>')
    }
    setQuotePreviewLoading(false)
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

          {/* Contact customer — Manual / Text / Email */}
          {activeComposer === null && (
            <div className="space-y-2">
              {/* Three-button row */}
              <div className="grid grid-cols-3 gap-2">
                {/* Manual — replaces Call */}
                <div className="relative">
                  <button
                    onClick={() => setShowManualPicker(p => !p)}
                    disabled={manualLogging}
                    className={`flex w-full items-center justify-center rounded-lg border py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      showManualPicker
                        ? 'border-slate-300 bg-slate-100 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {manualLogging ? '…' : 'Manual'}
                  </button>

                  {showManualPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowManualPicker(false)}
                      />
                      <div className="absolute left-0 top-full z-20 mt-1.5 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          How?
                        </p>
                        {[
                          { key: 'text', label: 'Text' },
                          { key: 'email', label: 'Email' },
                          { key: 'verbal', label: 'Verbal' },
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => handleManualContact(opt.key)}
                            className="flex w-full items-center px-3 py-2.5 text-sm text-slate-700 transition-colors duration-150 hover:bg-[#e8f3ec] hover:text-[#4A7C59] cursor-pointer last:pb-3"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Text */}
                <button
                  onClick={() => {
                    setShowManualPicker(false)
                    setShowInlineSms(p => !p)
                    setShowCompose(false)
                    if (!showInlineSms && job.client_phone) {
                      // Pre-fill based on job status
                      const firstName = job.client_name?.split(' ')[0] ?? 'there'
                      const presets: Record<string, string> = {
                        new: `Hi ${firstName} — this is Grace from RenewShine. I received your booking request. Do you have a moment to discuss?`,
                        under_review: `Hi ${firstName} — Grace from RenewShine. I'm reviewing your request and have a quick question. Reply when you get a chance!`,
                        approved: (() => {
                          // Template 2: quote-ready SMS with real price breakdown
                          const price = savedPrice ?? job.approved_price
                          if (price) {
                            const deposit = job.deposit_amount ?? 100
                            const remaining = Math.max(price - deposit, 0)
                            const svcLabel = getServiceLabel(job.service_type ?? null)
                            return `Hi ${firstName} — thanks for sending the photos.

Your ${svcLabel} quote is $${price.toLocaleString()}.

$${deposit} deposit to reserve your date.
$${remaining.toLocaleString()} due after the cleaning.

Reply YES and I'll send your deposit link.

— Grace`
                          }
                          // Fallback: no price set yet
                          return `Hi ${firstName}, thanks for reaching out to RenewShine. Your quote is being prepared — I'll follow up shortly with details. — Grace`
                        })(),
                        scheduled: `Hi ${firstName} — your clean with RenewShine is confirmed. I'll be in touch the day before with arrival details. — Grace`,
                      }
                      setInlineSmsBody(presets[job.status] ?? `Hi ${firstName} — Grace from RenewShine. `)
                    }
                  }}
                  disabled={!job.client_phone}
                  title={!job.client_phone ? 'No phone number on file' : `Text ${fmtPhone(job.client_phone ?? '')}`}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    showInlineSms
                      ? 'border-[#4A7C59]/30 bg-[#e8f3ec] text-[#4A7C59]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare size={13} />
                  Text
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    setShowManualPicker(false)
                    setShowCompose(true)
                    setShowInlineSms(false)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 cursor-pointer"
                >
                  <Mail size={13} />
                  Email
                </button>
              </div>

              {/* Inline SMS compose — expands below when Text is active */}
              {showInlineSms && job.client_phone && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    To: {fmtPhone(job.client_phone)}
                  </p>
                  <textarea
                    value={inlineSmsBody}
                    onChange={e => setInlineSmsBody(e.target.value)}
                    rows={3}
                    placeholder="Type your message…"
                    autoFocus
                    maxLength={1000}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59]/40 focus:outline-none focus:ring-0 resize-none transition-colors duration-200"
                  />
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] ${
                      inlineSmsBody.length >= 1000
                        ? 'text-red-500 font-medium'
                        : inlineSmsBody.length >= 500
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }`}>
                      {inlineSmsBody.length >= 1000
                        ? '1000 · max reached'
                        : inlineSmsBody.length >= 500
                        ? `${inlineSmsBody.length} · long message`
                        : inlineSmsBody.length >= 300
                        ? `${inlineSmsBody.length} · may send as 2 texts`
                        : String(inlineSmsBody.length)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowInlineSms(false); setInlineSmsBody('') }}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendInlineSms}
                        disabled={!inlineSmsBody.trim() || smsSending}
                        className="flex items-center gap-1.5 rounded-lg bg-[#4A7C59] px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#3d6b4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send size={11} />
                        {smsSending ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                onSendSms={handleStripeSms}
                onSendExternal={handleMarkSentExternally}
                onPreview={handleQuotePreview}
                onCancel={() => setActiveComposer(null)}
                loading={loadingStripe}
                loadingSms={loadingSmsSend}
                clientEmail={job.client_email}
                clientPhone={job.client_phone ?? null}
                savedDate={savedDate}
              />
            ) : (
              <button
                onClick={openQuoteComposer}
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

      {/* Quote email preview modal */}
      {showQuotePreview && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setShowQuotePreview(false)}
        >
          <div
            className="relative flex flex-col bg-white w-full sm:max-w-2xl sm:rounded-xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Quote email preview</p>
                  <p className="mt-0.5 text-xs text-slate-400">Exactly what {job.client_name.split(' ')[0]} will see in their inbox</p>
                </div>
                <button
                  onClick={() => setShowQuotePreview(false)}
                  className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {quotePreviewLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-slate-400">Generating preview…</p>
                </div>
              ) : (
                <iframe
                  srcDoc={quotePreviewHtml}
                  className="w-full border-0"
                  style={{ height: '560px' }}
                  title="Quote email preview"
                  sandbox="allow-same-origin"
                />
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Looks wrong? Close and edit your line items or date.</p>
                <button
                  onClick={() => {
                    setShowQuotePreview(false)
                    handleStripe()
                  }}
                  disabled={loadingStripe}
                  className="cursor-pointer rounded-lg bg-[#1A3F6F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 disabled:opacity-50"
                >
                  {loadingStripe ? 'Sending…' : 'Looks good — send it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
