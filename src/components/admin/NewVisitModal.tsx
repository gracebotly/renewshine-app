'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, X } from 'lucide-react'
import type { Job } from '@/types/database'

function getCtaLabel(
  status: 'completed' | 'scheduled',
  paymentType: 'invoice_now' | 'collect_later' | 'cash_paid'
): string {
  if (status === 'scheduled') return 'Create Scheduled Visit'
  if (paymentType === 'invoice_now') return 'Create Visit + Send Invoice'
  if (paymentType === 'cash_paid') return 'Create Visit — Cash Paid'
  return 'Create Completed Visit'
}

interface NewVisitModalProps {
  sourceJob: Job
  onClose: () => void
}

export function NewVisitModal({ sourceJob, onClose }: NewVisitModalProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [serviceType, setServiceType] = React.useState(sourceJob.service_type ?? 'standard')
  const [address, setAddress] = React.useState(sourceJob.address ?? '')
  const [price, setPrice] = React.useState(sourceJob.approved_price?.toString() ?? '')
  const [confirmedDate, setConfirmedDate] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const [status, setStatus] = React.useState<'completed' | 'scheduled'>('completed')
  const [paymentType, setPaymentType] = React.useState<'invoice_now' | 'collect_later' | 'cash_paid'>('invoice_now')

  const isCommercial = sourceJob.type === 'commercial'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedPrice = parseFloat(price)
    if (!parsedPrice || parsedPrice <= 0) {
      setError('Price must be greater than $0')
      return
    }
    if (status === 'scheduled' && !confirmedDate) {
      setError('Date is required for scheduled visits')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/create-repeat-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceJobId: sourceJob.id,
          serviceType,
          address: address.trim() || sourceJob.address,
          confirmedDate: confirmedDate || null,
          price: parsedPrice,
          notes: notes.trim() || null,
          status,
          paymentType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }

      const shouldOpenInvoice = paymentType === 'invoice_now' && status === 'completed'
      router.push(`/admin/jobs/${data.jobId}${shouldOpenInvoice ? '?openPanel=invoice' : ''}`)
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:ring-offset-0'
  const lockedClass = 'w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed'
  const radioBase = 'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors duration-150 text-sm'

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">New Visit — {sourceJob.client_name}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Pre-filled from last visit
              {sourceJob.approved_price ? ` · $${sourceJob.approved_price.toLocaleString()}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close new visit modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-160px)] overflow-y-auto">
          <div className="space-y-4 px-5 py-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Customer — locked
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-xs text-slate-400">Name</p>
                  <div className={lockedClass}>{sourceJob.client_name}</div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-400">Phone</p>
                  <div className={lockedClass}>{sourceJob.client_phone ?? '—'}</div>
                </div>
              </div>
              <div className="mt-2">
                <p className="mb-1 text-xs text-slate-400">Email</p>
                <div className={lockedClass}>{sourceJob.client_email}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Visit details
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Service type</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value as typeof serviceType)}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="standard">Standard Clean</option>
                    <option value="deep">Deep Clean</option>
                    <option value="move_out">Move-In / Move-Out</option>
                    {isCommercial && <option value="post_construction">Post-Construction</option>}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-600">Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="100"
                    className={`${inputClass} font-mono`}
                    required
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs text-slate-600">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={sourceJob.address ?? 'Address'}
                  className={inputClass}
                />
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs text-slate-600">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anything to note for this visit"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Visit status
              </p>
              <div className="flex gap-2">
                <label className={`flex-1 ${radioBase} ${status === 'completed' ? 'border-[#4A7C59] bg-[#f0f9f4] text-[#1A2E1F]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <input type="radio" name="status" value="completed" checked={status === 'completed'} onChange={() => setStatus('completed')} className="sr-only" />
                  <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-2 ${status === 'completed' ? 'border-[#4A7C59]' : 'border-slate-300'}`}>
                    {status === 'completed' && <span className="h-1.5 w-1.5 rounded-full bg-[#4A7C59]" />}
                  </span>
                  Service already done
                </label>
                <label className={`flex-1 ${radioBase} ${status === 'scheduled' ? 'border-[#4A7C59] bg-[#f0f9f4] text-[#1A2E1F]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <input type="radio" name="status" value="scheduled" checked={status === 'scheduled'} onChange={() => setStatus('scheduled')} className="sr-only" />
                  <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-2 ${status === 'scheduled' ? 'border-[#4A7C59]' : 'border-slate-300'}`}>
                    {status === 'scheduled' && <span className="h-1.5 w-1.5 rounded-full bg-[#4A7C59]" />}
                  </span>
                  Schedule for later
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-600">
                Date {status === 'scheduled' ? '(required)' : '(optional)'}
              </label>
              <input
                type="date"
                value={confirmedDate}
                onChange={e => setConfirmedDate(e.target.value)}
                required={status === 'scheduled'}
                className={inputClass}
              />
            </div>

            {status === 'completed' && (
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Payment
                </p>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'invoice_now', label: 'Send invoice now', sub: 'Opens invoice panel on next screen' },
                      { value: 'collect_later', label: 'Collect later', sub: 'Create the record, send invoice when ready' },
                      { value: 'cash_paid', label: 'Cash paid', sub: 'Mark as paid in full — no invoice needed' },
                    ] as const
                  ).map(opt => (
                    <label
                      key={opt.value}
                      className={`${radioBase} ${paymentType === opt.value ? 'border-[#4A7C59] bg-[#f0f9f4]' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value={opt.value}
                        checked={paymentType === opt.value}
                        onChange={() => setPaymentType(opt.value)}
                        className="sr-only"
                      />
                      <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-2 ${paymentType === opt.value ? 'border-[#4A7C59]' : 'border-slate-300'}`}>
                        {paymentType === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-[#4A7C59]" />}
                      </span>
                      <div>
                        <p className={`text-sm font-medium ${paymentType === opt.value ? 'text-[#1A2E1F]' : 'text-slate-700'}`}>{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-sm text-slate-500 transition-colors duration-150 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-lg bg-[#4A7C59] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#3d6b4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating…' : getCtaLabel(status, paymentType)}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export function NewVisitButton({ job }: { job: Job }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#4A7C59]/30 bg-[#f0f9f4] px-3 py-1.5 text-sm font-medium text-[#4A7C59] transition-colors duration-150 hover:border-[#4A7C59]/50 hover:bg-[#e3f4ea]"
      >
        <RefreshCw size={13} />
        New Visit
      </button>
      {open && <NewVisitModal sourceJob={job} onClose={() => setOpen(false)} />}
    </>
  )
}
