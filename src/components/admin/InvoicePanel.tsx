'use client'

import * as React from 'react'

interface LineItem {
  description: string
  amount: string
}

export function InvoicePanel({ job }: { job: any }) {
  const [open, setOpen] = React.useState(false)
  const [lineItems, setLineItems] = React.useState<LineItem[]>([{ description: '', amount: '' }])
  const [businessName, setBusinessName] = React.useState(job.business_name ?? '')
  const [preparedForAddress, setPreparedForAddress] = React.useState(job.address ?? '')
  const [dueDate, setDueDate] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState('')
  const [error, setError] = React.useState('')

  const depositPaid = job.deposit_paid ? (job.deposit_amount ?? 100) : 0
  const subtotal = lineItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
  const amountDue = Math.max(subtotal - depositPaid, 0)

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

    setLoading(true)
    const res = await fetch('/api/admin/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        lineItems: parsed,
        dueDate: dueDate || undefined,
        businessName: businessName || undefined,
        preparedForAddress: preparedForAddress || undefined,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setSuccess(`Invoice ${data.invoiceNumber} sent to ${job.client_email} ✓`)
      setOpen(false)
      setLineItems([{ description: '', amount: '' }])
      setDueDate('')
    } else {
      const err = await res.json().catch(() => ({}))
      setError(err.error ?? 'Failed to send invoice. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="border-t border-slate-100 pt-4 mt-2">
      {!open ? (
        <button
          onClick={() => { setOpen(true); setSuccess(''); setError('') }}
          className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          <span>📄</span>
          <span>Send Invoice</span>
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Send Invoice</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Stripe payment link + branded email to{' '}
                <span className="font-medium text-slate-700">{job.client_email}</span>
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); setError('') }}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-200"
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">$</span>
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

          {/* Totals preview */}
          {subtotal > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200 text-sm bg-white">
              <div className="flex justify-between px-4 py-2.5 text-slate-600 border-b border-slate-100">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {depositPaid > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-slate-500 border-b border-slate-100">
                  <span>Deposit paid</span>
                  <span className="font-mono tabular-nums text-emerald-600">−${depositPaid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between bg-(--color-brand) px-4 py-3 font-semibold text-white">
                <span>Amount Due</span>
                <span className="font-mono tabular-nums">${amountDue.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Due Date */}
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Due Date{' '}
              <span className="normal-case font-normal text-slate-400">(defaults to 7 days)</span>
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </label>

          {/* Error */}
          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={loading || subtotal === 0}
            className="w-full cursor-pointer rounded-lg bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--color-brand-hover) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Sending…'
              : `Send Invoice to ${job.client_name.split(' ')[0]} — $${amountDue.toFixed(2)}`}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Stripe payment link · Branded invoice email · Invoice {job.id ? `RS-${new Date(job.created_at).getFullYear()}-XXXX` : ''}
          </p>
        </div>
      )}

      {success && (
        <p className="mt-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
    </div>
  )
}
