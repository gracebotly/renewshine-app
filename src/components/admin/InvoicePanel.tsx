'use client'

import * as React from 'react'

interface LineItem {
  description: string
  amount: string
}

// Returns today's date + 48 hours as a yyyy-mm-dd string in local time
function getDefault48hrDate(): string {
  const d = new Date()
  d.setHours(d.getHours() + 48)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function InvoicePanel({ job, onClose }: { job: any; onClose?: () => void }) {
  const [lineItems, setLineItems] = React.useState<LineItem[]>([{ description: '', amount: '' }])
  const [businessName, setBusinessName] = React.useState(job.business_name ?? '')
  const [preparedForAddress, setPreparedForAddress] = React.useState(job.address ?? '')
  const [notes, setNotes] = React.useState('')
  const [dueDate, setDueDate] = React.useState(getDefault48hrDate)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState('')
  const [error, setError] = React.useState('')
  const [markingPaid, setMarkingPaid] = React.useState(false)
  const [markPaidSuccess, setMarkPaidSuccess] = React.useState('')
  const [markPaidError, setMarkPaidError] = React.useState('')

  // Deposit credit — pre-fill from DB but fully overridable
  const [applyDeposit, setApplyDeposit] = React.useState<boolean>(job.deposit_paid === true)
  const [depositCreditAmount, setDepositCreditAmount] = React.useState<string>(
    String(job.deposit_amount ?? 100)
  )

  const depositCredit = applyDeposit ? (parseFloat(depositCreditAmount) || 0) : 0
  const subtotal = lineItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
  const amountDue = Math.max(subtotal - depositCredit, 0)

  // Single close handler — always calls onClose if provided
  function handleClose() {
    if (onClose) onClose()
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0 transition-colors duration-200'

  function addItem() {
    setLineItems((prev) => [...prev, { description: '', amount: '' }])
  }

  function removeItem(i: number) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: keyof LineItem, value: string) {
    setLineItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    )
  }

  async function handleSend() {
    setError('')
    setSuccess('')

    const parsed = lineItems.map((i) => ({
      description: i.description.trim(),
      amount: parseFloat(i.amount),
    }))

    if (parsed.some((i) => !i.description || isNaN(i.amount) || i.amount <= 0)) {
      setError('Each line item needs a description and a dollar amount greater than $0.')
      return
    }

    if (!dueDate) {
      setError('Please set a due date.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/admin/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        lineItems: parsed,
        dueDate,
        businessName: businessName || undefined,
        preparedForAddress: preparedForAddress || undefined,
        notes: notes || undefined,
        depositCredit,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setSuccess(`Invoice ${data.invoiceNumber} sent to ${job.client_email} ✓`)
      setLineItems([{ description: '', amount: '' }])
      setNotes('')
      setDueDate(getDefault48hrDate())
      // Keep the success message visible — don't close automatically
    } else {
      const err = await res.json().catch(() => ({}))
      setError((err as any).error ?? 'Failed to send invoice. Please try again.')
    }
    setLoading(false)
  }

  async function handleMarkPaidExternally() {
    setMarkingPaid(true)
    setMarkPaidError('')
    setMarkPaidSuccess('')
    const res = await fetch('/api/admin/mark-invoice-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id }),
    })
    if (res.ok) {
      setMarkPaidSuccess('Marked as paid — job is now complete ✓')
    } else {
      const err = await res.json().catch(() => ({}))
      setMarkPaidError((err as any).error ?? 'Failed to mark as paid. Try again.')
    }
    setMarkingPaid(false)
  }

  // ── Render: always show the form directly — no second click needed ──────

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
        <p className="text-sm font-medium text-emerald-700">{success}</p>
        <button
          onClick={handleClose}
          className="text-xs text-emerald-600 hover:underline cursor-pointer"
        >
          ← Back to actions
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Send Invoice</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Stripe payment link + branded email to{' '}
            <span className="font-medium text-slate-700">{job.client_email}</span>
          </p>
        </div>
        <button
          onClick={handleClose}
          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-200 shrink-0 ml-3"
        >
          Cancel
        </button>
      </div>

      {/* Prepared For */}
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prepared For</p>
        <p className="text-sm font-medium text-slate-900">{job.client_name}</p>
        <input
          type="text"
          placeholder="Business name (optional)"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Address (optional)"
          value={preparedForAddress}
          onChange={(e) => setPreparedForAddress(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Line Items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Line Items</p>

        {lineItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              placeholder="e.g. Commercial Office Deep Clean — 2,400 sq ft"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              className={`flex-1 ${inputClass}`}
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
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-200 bg-white pl-6 pr-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0 transition-colors duration-200"
              />
            </div>
            {lineItems.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addItem}
          className="text-xs font-medium cursor-pointer text-(--color-brand) hover:underline transition-colors duration-200"
        >
          + Add line item
        </button>
      </div>

      {/* Deposit Credit */}
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit Credit</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-slate-500">{applyDeposit ? 'Applied' : 'Not applied'}</span>
            <div
              onClick={() => setApplyDeposit((prev) => !prev)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                applyDeposit ? 'bg-(--color-brand)' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  applyDeposit ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        </div>

        {applyDeposit && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">Amount paid:</span>
            <div className="relative flex-1 max-w-[120px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={depositCreditAmount}
                onChange={(e) => setDepositCreditAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-6 pr-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0 transition-colors duration-200"
              />
            </div>
            <span className="text-xs text-emerald-600 font-medium">will be deducted</span>
          </div>
        )}

        {!applyDeposit && (
          <p className="text-xs text-slate-400">
            Toggle on if the client paid a deposit — it will be deducted from the invoice total.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes <span className="normal-case font-normal text-slate-400">(optional — shown on invoice)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Payment confirms scheduling. Thank you for your business."
          className={`${inputClass} resize-none`}
        />
      </div>

      {subtotal > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 text-sm bg-white">
          <div className="flex justify-between px-4 py-2.5 text-slate-600 border-b border-slate-100">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          {depositCredit > 0 && (
            <div className="flex justify-between px-4 py-2.5 text-slate-500 border-b border-slate-100">
              <span>Deposit credit</span>
              <span className="font-mono tabular-nums text-emerald-600">−${depositCredit.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between bg-(--color-brand) px-4 py-3 font-semibold text-white">
            <span>Amount Due</span>
            <span className="font-mono tabular-nums">${amountDue.toFixed(2)}</span>
          </div>
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</span>
        <p className="text-xs text-slate-400">
          Pre-filled to 48 hours from now — change to today for immediate payment
        </p>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
      </label>

      {job.stripe_payment_link && job.status !== 'completed' && (
        <button
          onClick={handleMarkPaidExternally}
          disabled={markingPaid}
          className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {markingPaid ? 'Saving…' : 'Mark invoice paid externally (cash / Zelle / transfer)'}
        </button>
      )}

      {markPaidSuccess && (
        <p className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {markPaidSuccess}
        </p>
      )}
      {markPaidError && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {markPaidError}
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={loading || subtotal === 0 || !dueDate}
        className="w-full cursor-pointer rounded-lg bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--color-brand-hover) disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Sending…'
          : subtotal === 0
            ? 'Add line items to send'
            : `Send Invoice to ${job.client_name.split(' ')[0]} — $${amountDue.toFixed(2)}`}
      </button>

      <p className="text-xs text-slate-400 text-center">Stripe payment link · Branded invoice email</p>
    </div>
  )
}
