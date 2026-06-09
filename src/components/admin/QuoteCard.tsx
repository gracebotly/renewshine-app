'use client'

import * as React from 'react'
import { ChevronDown, Pencil, Table } from 'lucide-react'
import type { Job } from '@/types/database'

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')           return 'Standard Clean'
  if (serviceType === 'deep')               return 'Deep Clean'
  if (serviceType === 'move_out')           return 'Move-In / Move-Out'
  if (serviceType === 'post_construction')  return 'Post-Construction'
  return 'cleaning service'
}

function ManualLogDropdown({ onLog }: { onLog: (m: 'text' | 'email' | 'verbal') => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="text-[11px] text-slate-400 underline cursor-pointer bg-none border-none hover:text-slate-600 transition-colors"
      >
        Log manual contact
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {[
              { key: 'text' as const, label: 'Via text (outside app)' },
              { key: 'email' as const, label: 'Via email (outside app)' },
              { key: 'verbal' as const, label: 'Verbally / by phone' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => { onLog(opt.key); setOpen(false) }}
                className="flex w-full items-center px-3 py-2.5 text-xs text-slate-700 hover:bg-[#e8f3ec] hover:text-[#4A7C59] transition-colors cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function JobActionDropdown({
  onDecline,
  onArchive,
  loading,
}: {
  onDecline: () => void
  onArchive: () => void
  loading: boolean
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        disabled={loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Updating…' : 'More actions'}
        <ChevronDown size={11} className="ml-auto" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 z-20 mb-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button
              onClick={() => { onArchive(); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[10px]">
                ↓
              </span>
              Archive — remove from dashboard
            </button>
            <button
              onClick={() => { onDecline(); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-red-400 text-[10px]">
                ✕
              </span>
              Decline job
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const ARRIVAL_MAP: Record<string, string> = {
  early_morning: '8am – 10am',
  mid_morning: '10am – 12pm',
  noon: '12pm – 2pm',
  early_afternoon: '2pm – 4pm',
  late_afternoon: '4pm – 6pm',
  morning: '8am – 12pm',
  afternoon: '12pm – 5pm',
  flexible: 'Morning to Afternoon',
}

const EMAIL_TEMPLATE_LIST = [
  { id: 'photos',     label: 'Request photos / video' },
  { id: 'quote_dep',  label: 'Quote + deposit link' },
  { id: 'quote_no',   label: 'Quote — no deposit' },
  { id: 'appt',       label: 'Appointment confirmation' },
  { id: 'reminder',   label: 'Day-before reminder' },
  { id: 'invoice',    label: 'Invoice (balance due)' },
  { id: 'custom',     label: 'Custom message' },
]

const SMS_TEMPLATE_LIST = [
  { id: 'photos',     label: 'Request photos / video' },
  { id: 'quote_dep',  label: 'Quote + deposit link' },
  { id: 'quote_no',   label: 'Quote — no deposit' },
  { id: 'appt',       label: 'Appointment confirmation' },
  { id: 'reminder',   label: 'Day-before reminder' },
  { id: 'invoice',    label: 'Invoice (balance due)' },
  { id: 'custom',     label: 'Custom message' },
]

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep')
    return ' of the kitchen, bathrooms, bedrooms, and living areas'
  if (serviceType === 'move_out')
    return ' of the property — the kitchen, bathrooms, and any areas needing extra attention'
  return ''
}

function getTemplateContent(
  id: string,
  channel: 'email' | 'sms',
  j: Job,
  price: number | null,
  date: string | null,
  arrival: string
): string {
  const first = j.client_name?.split(' ')[0] ?? 'there'
  const svc = getServiceLabel(j.service_type ?? null)
  const beds = j.bedrooms && j.bathrooms ? ` · ${j.bedrooms} bed / ${j.bathrooms} bath` : ''
  const dep = j.deposit_amount ?? 100
  const remaining = price ? Math.max(price - dep, 0) : null
  const priceFmt = price ? `$${price.toLocaleString()}` : '—'
  const remainFmt = remaining !== null ? `$${remaining.toLocaleString()}` : '—'
  const arrFmt = ARRIVAL_MAP[arrival] ?? arrival
  const dateFmt = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : null
  const noDate = '(Set a confirmed date in the Booking card first)'

  const t: Record<string, Record<'email' | 'sms', string>> = {
    photos: {
      email: `Hi ${first},

One quick step before your quote.

Before we confirm a price, our team reviews photos of every space. Please send a few photos or a short walkthrough video${getRoomCallout(j.service_type)} to hello@renewshine.co, or text them to (771) 253-9204.

A short video call works too — just text us to arrange a time.

Once we've reviewed everything, we'll send your confirmed quote and reach out to schedule.

— RenewShine`,
      sms: `Hi ${first}, one quick step before your quote.

Please send a few photos or a short video${getRoomCallout(j.service_type)} — text them here or to (771) 253-9204.

A short video call works too. We'll have your quote ready the same business day.

— RenewShine`,
    },

    quote_dep: {
      email: `Hi ${first},

We've reviewed your photos. Your quote is ready — full details and payment link are in the email.

Service: ${svc}${beds}
Total: ${priceFmt}
To reserve your date: $${dep}
Balance after service: ${remainFmt}

Questions? Just reply or text (771) 253-9204.

— RenewShine`,
      sms: `Hi ${first} — your ${svc} quote is ${priceFmt}.

Service: ${svc}${beds}
To reserve your date: $${dep}
Balance after service: ${remainFmt}

Reserve here:
[deposit link included]

Questions? Just reply.
— RenewShine`,
    },

    quote_no: {
      email: `Hi ${first},

We've reviewed your request. Your quote is ready.

Service: ${svc}${beds}
Total: ${priceFmt}

No deposit required. Text or call us at (771) 253-9204 to confirm and we'll get you scheduled.

— RenewShine`,
      sms: `Hi ${first} — your ${svc} quote is ${priceFmt}.

No deposit required. Reply YES to confirm and we'll get you scheduled.

— RenewShine`,
    },

    appt: {
      email: dateFmt
        ? `Hi ${first},

Your ${svc} is confirmed for ${dateFmt} · ${arrFmt}.

Before we arrive:
• Please have floors, countertops, and surfaces reasonably clear.
• Let us know any priority areas in advance.
• For safety, our team doesn't move heavy furniture or appliances.
• Pets should be secured if they may be uncomfortable.

We bring all supplies and equipment. You'll get a reminder text the day before your appointment.

— RenewShine`
        : noDate,
      sms: dateFmt
        ? `Hi ${first} — your ${svc} is confirmed for ${dateFmt} · ${arrFmt}.

Before we arrive:
• Floors and surfaces reasonably clear.
• Let us know priority areas in advance.
• We don't move heavy furniture or appliances.
• Pets secured if needed.

We bring all supplies. You'll get a reminder text the day before.

— RenewShine`
        : noDate,
    },

    reminder: {
      email: dateFmt
        ? `Hi ${first},

Your ${svc} is tomorrow — ${dateFmt}, ${arrFmt}.

Address on file: ${j.address ?? 'on file'}

If anything has changed, let us know today.

See you then.
— RenewShine`
        : noDate,
      sms: dateFmt
        ? `Hi ${first} — your ${svc} is tomorrow, ${dateFmt}, ${arrFmt}.

Address: ${j.address ?? 'on file'}.

Reply YES to confirm or let us know if anything has changed.

— RenewShine`
        : noDate,
    },

    invoice: {
      email: `Hi ${first},

Your ${svc}${dateFmt ? ` on ${dateFmt}` : ''} is complete. Your invoice has been sent to your email on file.

Service: ${svc}${beds}
Total: ${priceFmt}${j.deposit_paid ? `
Deposit paid: −$${dep}` : ''}
Balance due: ${remainFmt}

Payment is due within 24 hours of the service date.

— RenewShine`,
      sms: j.stripe_payment_link
        ? `Hi ${first} — your RenewShine invoice.

Service: ${svc}${beds}${dateFmt ? `
Date: ${dateFmt}` : ''}

Service total: ${priceFmt}${j.deposit_paid ? `
Deposit paid: -$${dep}` : ''}
Balance due: ${remainFmt}

Due within 24 hours:
${j.stripe_payment_link}

— RenewShine`
        : '',
    },

    custom: { email: '', sms: '' },
  }

  return t[id]?.[channel] ?? ''
}

function getEmailSubject(id: string, j: Job, price: number | null, date: string | null): string {
  void price
  const first = j.client_name?.split(' ')[0] ?? ''
  const svc = getServiceLabel(j.service_type ?? null)
  const dateFmt = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null
  const subjects: Record<string, string> = {
    photos:    `One more step before your quote — RenewShine`,
    quote_dep: `${first}, your RenewShine quote is ready`,
    quote_no:  `${first}, your RenewShine quote is ready`,
    appt:      dateFmt ? `${first}, your ${svc} is confirmed for ${dateFmt}` : `${first}, your ${svc} is confirmed`,
    reminder:  `Reminder: your ${svc} is tomorrow`,
    invoice:   `${first} — your RenewShine invoice`,
    custom:    '',
  }
  return subjects[id] ?? ''
}

// ─── QuoteCard ────────────────────────────────────────────────────────────────

export function QuoteCard({ job }: { job: Job }) {
  const [overrideStatus, setOverrideStatus] = React.useState(job.status)
  const [loadingResend, setLoadingResend] = React.useState(false)
  const [loadingComplete, setLoadingComplete] = React.useState(false)
  const [loadingOverride, setLoadingOverride] = React.useState(false)
  const [completedConfirm, setCompletedConfirm] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [savedDate, setSavedDate] = React.useState<string | null>(
    job.confirmed_date ? String(job.confirmed_date).split(/[T ]/)[0] : null
  )
  const [savedPrice, setSavedPrice] = React.useState<number | null>(job.approved_price ?? null)
  const [savedNotes] = React.useState<string>(job.notes ?? '')
  const [appointmentConfirmed, setAppointmentConfirmed] = React.useState<boolean>(
    job.appointment_confirmed ?? false
  )

  // Booking card edit state
  const [priceEditOpen, setPriceEditOpen] = React.useState(false)
  const [dateEditOpen, setDateEditOpen] = React.useState(false)
  const [depositEditOpen, setDepositEditOpen] = React.useState(false)
  const [priceInput, setPriceInput] = React.useState(
    job.approved_price ? String(job.approved_price) : ''
  )
  const [dateInput, setDateInput] = React.useState(
    job.confirmed_date ? String(job.confirmed_date).split(/[T ]/)[0] : ''
  )
  const [depositInput, setDepositInput] = React.useState(
    String(job.deposit_amount ?? 100)
  )
  const [arrivalInput, setArrivalInput] = React.useState(
    job.availability_time_pref ?? 'morning'
  )
  const [savedArrival, setSavedArrival] = React.useState<string>(
    job.availability_time_pref ?? 'morning'
  )
  const [priceSaving, setPriceSaving] = React.useState(false)
  const [dateSaving, setDateSaving] = React.useState(false)
  const [depositSaving, setDepositSaving] = React.useState(false)
  const [chartOpen, setChartOpen] = React.useState(false)

  // Contact panel state
  const [currentChannel, setCurrentChannel] = React.useState<'email' | 'sms'>(
    job.preferred_contact === 'text' ? 'sms' : 'email'
  )
  const [currentTemplate, setCurrentTemplate] = React.useState<string>('photos')
  const [contactEditBody, setContactEditBody] = React.useState('')
  const [contactSending, setContactSending] = React.useState(false)

  // Recurring pricing toggle
  const [includeRecurring, setIncludeRecurring] = React.useState<boolean>(() => {
    const f = job.service_frequency
    return !!f && ['weekly', 'biweekly', 'monthly'].includes(f)
  })
  const [recurringFreq, setRecurringFreq] = React.useState<string>(() => {
    const f = job.service_frequency
    return (f && ['weekly', 'biweekly', 'monthly'].includes(f)) ? f : 'biweekly'
  })

  const FREQ_MULT: Record<string, number> = { weekly: 0.80, biweekly: 0.85, monthly: 0.90 }
  const FREQ_LABEL: Record<string, string> = { weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' }
  const recurringPrice = savedPrice && includeRecurring
    ? Math.round(savedPrice * (FREQ_MULT[recurringFreq] ?? 0.85))
    : null

  const handleSavePrice = async () => {
    const val = parseFloat(priceInput)
    if (!priceInput || isNaN(val)) return
    setPriceSaving(true)
    const res = await fetch('/api/admin/lock-in-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, finalPrice: val }),
    })
    if (res.ok) {
      setSavedPrice(val)
      setPriceEditOpen(false)
      setSuccessMsg('Price saved.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setErrorMsg('Failed to save price.')
    }
    setPriceSaving(false)
  }

  const handleSaveDate = async () => {
    if (!dateInput) return
    setDateSaving(true)
    const res = await fetch('/api/admin/lock-in-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, confirmedDate: dateInput }),
    })
    if (res.ok) {
      setSavedDate(dateInput)
      setSavedArrival(arrivalInput)
      setDateEditOpen(false)
      setSuccessMsg('Date saved.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setErrorMsg('Failed to save date.')
    }
    setDateSaving(false)
  }

  const handleSaveDeposit = async () => {
    const val = parseFloat(depositInput)
    if (!depositInput || isNaN(val) || val < 0) return
    setDepositSaving(true)
    const res = await fetch('/api/admin/lock-in-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, depositAmount: val }),
    })
    if (res.ok) {
      setDepositEditOpen(false)
      setSuccessMsg('Deposit amount saved.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setErrorMsg('Failed to save deposit amount.')
    }
    setDepositSaving(false)
  }

  const handleSendTemplate = async () => {
    if (contactSending) return
    setContactSending(true)
    setErrorMsg('')
    const body = contactEditBody.trim()
      ? contactEditBody
      : getTemplateContent(currentTemplate, currentChannel, job, savedPrice, savedDate, savedArrival)
    try {
      if (currentTemplate === 'photos' || currentTemplate === 'custom') {
        await fetch('/api/admin/send-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            method: currentChannel === 'email' ? 'email' : 'sms',
            template: currentChannel === 'email' ? 'custom_formatted' : undefined,
            customBody: body,
            subject: currentChannel === 'email' ? previewSubject : undefined,
          }),
        })
      } else if (currentTemplate === 'quote_dep') {
        await fetch('/api/admin/send-deposit-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            approvedPrice: savedPrice ?? job.approved_price,
            depositAmount: job.deposit_amount ?? 100,
            confirmedDate: savedDate || null,
            channel: currentChannel,
            customSmsBody: currentChannel === 'sms' ? body : undefined,
            recurringFrequency: currentChannel === 'email' && includeRecurring ? recurringFreq : undefined,
          }),
        })
        setOverrideStatus('approved')
      } else if (currentTemplate === 'quote_no') {
        await fetch('/api/admin/send-quote-no-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, channel: currentChannel, body }),
        })
      } else if (currentTemplate === 'appt') {
        if (currentChannel === 'email') {
          await fetch('/api/admin/confirm-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.id, confirmedDate: savedDate, timePref: savedArrival }),
          })
          await fetch('/api/admin/send-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.id, method: 'email', template: 'appointment_confirmed' }),
          })
          setAppointmentConfirmed(true)
        } else {
          await fetch('/api/admin/send-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.id, method: 'sms', customBody: body }),
          })
        }
      } else if (currentTemplate === 'reminder') {
        if (currentChannel === 'sms') {
          await fetch('/api/admin/send-reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.id }),
          })
        } else {
          await fetch('/api/admin/send-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId: job.id,
              method: 'email',
              template: 'custom_formatted',
              customBody: body,
              subject: previewSubject,
            }),
          })
        }
      } else if (currentTemplate === 'invoice') {
        const svc = getServiceLabel(job.service_type ?? null)
        const price = savedPrice ?? job.approved_price ?? 0
        const lineItems = [{ description: `${svc}${savedDate ? ` — ${new Date(savedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : ''}`, amount: price }]
        const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const res = await fetch('/api/admin/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, lineItems, dueDate }),
        })
        if (res.ok && currentChannel === 'sms') {
          const { paymentUrl } = await res.json()
          const smsBody = body.replace('Payment link below.', `Pay now: ${paymentUrl}`)
          await fetch('/api/admin/send-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.id, method: 'sms', customBody: smsBody }),
          })
        }
      }
      setSuccessMsg('Sent ✓')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch {
      setErrorMsg('Failed to send. Try again.')
    }
    setContactSending(false)
  }

  const handleManualLog = async (method: 'text' | 'email' | 'verbal') => {
    const labels = { text: 'Contacted via text (outside app)', email: 'Contacted via email (outside app)', verbal: 'Contacted verbally / by phone' }
    await fetch('/api/admin/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, method: 'external', customBody: labels[method] }),
    })
    setSuccessMsg(`Logged: ${labels[method]}`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleMarkScheduled = async () => {
    const res = await fetch('/api/admin/update-job-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, status: 'scheduled' }),
    })
    if (res.ok) setOverrideStatus('scheduled')
  }

  const handleArchive = async () => {
    setLoadingOverride(true)
    const res = await fetch('/api/admin/archive-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, action: 'archive' }),
    })
    if (res.ok) {
      setOverrideStatus('archived' as typeof overrideStatus)
      setSuccessMsg('Job archived — removed from dashboard.')
    }
    setLoadingOverride(false)
  }

  const handleDecline = async () => {
    setLoadingOverride(true)
    const res = await fetch('/api/admin/archive-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, action: 'decline' }),
    })
    if (res.ok) {
      setOverrideStatus('cancelled')
      setSuccessMsg('Job declined.')
    }
    setLoadingOverride(false)
  }

  const handleResendLink = async () => {
    setLoadingResend(true)
    await fetch('/api/admin/send-deposit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        approvedPrice: job.approved_price,
        depositAmount: job.deposit_amount,
        confirmedDate: job.confirmed_date,
        regenerate: true,
      }),
    })
    setLoadingResend(false)
    setSuccessMsg('Deposit link resent ✓')
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

  const firstName = job.client_name?.split(' ')[0] ?? ''
  const templateList = currentChannel === 'email' ? EMAIL_TEMPLATE_LIST : SMS_TEMPLATE_LIST
  const previewBody = getTemplateContent(currentTemplate, currentChannel, job, savedPrice, savedDate, savedArrival)
  const previewSubject = currentChannel === 'email'
    ? getEmailSubject(currentTemplate, job, savedPrice, savedDate)
    : null
  const isCustomTemplate = currentTemplate === 'custom'


  const dateDisplay = (() => {
    if (savedDate) {
      const d = new Date(savedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const a = ARRIVAL_MAP[savedArrival] ?? savedArrival
      return `${d} · ${a}`
    }
    if (job.availability_start) {
      const s = new Date(job.availability_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const e = job.availability_end ? new Date(job.availability_end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
      return e ? `${s} – ${e}` : s
    }
    return null
  })()

  const statusConfig: Record<string, { dot: string; label: string }> = {
    new:          { dot: 'bg-red-400',     label: 'New' },
    under_review: { dot: 'bg-amber-400',   label: 'Under review' },
    contacted:    { dot: 'bg-amber-500',   label: 'Contacted' },
    approved:     { dot: 'bg-blue-400',    label: 'Quote sent — awaiting deposit' },
    scheduled:    { dot: 'bg-emerald-500', label: job.deposit_paid ? 'Deposit paid — scheduled' : 'Scheduled' },
    completed:    { dot: 'bg-slate-400',   label: 'Complete' },
    cancelled:    { dot: 'bg-red-300',     label: 'Declined' },
    archived:     { dot: 'bg-slate-400',   label: 'Archived' },
  }
  const { dot, label } = statusConfig[overrideStatus] ?? { dot: 'bg-slate-300', label: overrideStatus }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
        <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
        <p className="text-sm font-medium text-slate-900">{label}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* ── BOOKING CARD ── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Booking</p>
          <div className="overflow-hidden rounded-xl border border-slate-200">

            {/* Price row */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
              onClick={() => { setPriceEditOpen(p => !p); setDateEditOpen(false) }}
            >
              <span className="text-xs text-slate-400">Price</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${savedPrice ? 'text-slate-900' : 'text-slate-400'}`}>
                  {savedPrice ? `$${savedPrice.toLocaleString()}` : '$0'}
                </span>
                <Pencil size={11} className="text-slate-300" />
              </div>
            </div>

            {/* Price edit row */}
            {priceEditOpen && (
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 space-y-2">
                <input
                  type="number"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                  placeholder="e.g. 380"
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePrice}
                    disabled={priceSaving}
                    className="rounded-lg bg-[#4A7C59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer hover:bg-[#3d6b4a] transition-colors"
                  >
                    {priceSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setPriceEditOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Deposit row — editable amount + journey status */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
              onClick={() => { setDepositEditOpen(p => !p); setPriceEditOpen(false); setDateEditOpen(false) }}
            >
              <span className="text-xs text-slate-400">Deposit</span>
              <div className="flex items-center gap-2">
                {/* Journey-aware status */}
                {job.deposit_paid ? (
                  <span className="text-xs font-medium text-emerald-600">
                    ${job.deposit_amount ?? 100} paid ✓
                  </span>
                ) : job.stripe_payment_link ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-amber-600">Link sent — awaiting</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleResendLink() }}
                      disabled={loadingResend}
                      className="text-[10px] font-semibold text-blue-500 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {loadingResend ? 'Resending…' : 'Resend'}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">
                    ${job.deposit_amount ?? 100}
                  </span>
                )}
                <Pencil size={11} className="text-slate-300" />
              </div>
            </div>

            {/* Deposit edit row */}
            {depositEditOpen && (
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 space-y-2">
                <p className="text-[10px] text-slate-400">Change deposit amount</p>
                <input
                  type="number"
                  value={depositInput}
                  onChange={e => setDepositInput(e.target.value)}
                  placeholder="e.g. 150"
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDeposit}
                    disabled={depositSaving}
                    className="rounded-lg bg-[#4A7C59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer hover:bg-[#3d6b4a] transition-colors"
                  >
                    {depositSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setDepositEditOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Date row */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
              onClick={() => { setDateEditOpen(p => !p); setPriceEditOpen(false) }}
            >
              <span className="text-xs text-slate-400">Date</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${savedDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {dateDisplay ?? 'Not set'}
                </span>
                <Pencil size={11} className="text-slate-300" />
              </div>
            </div>

            {/* Date edit row */}
            {dateEditOpen && (
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Date</p>
                    <input
                      type="date"
                      value={dateInput}
                      onChange={e => setDateInput(e.target.value)}
                      autoFocus
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Arrival</p>
                    <select
                      value={arrivalInput}
                      onChange={e => setArrivalInput(e.target.value as typeof arrivalInput)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none cursor-pointer"
                    >
                      <option value="early_morning">8am – 10am</option>
                      <option value="mid_morning">10am – 12pm</option>
                      <option value="noon">12pm – 2pm</option>
                      <option value="early_afternoon">2pm – 4pm</option>
                      <option value="late_afternoon">4pm – 6pm</option>
                      <option value="morning">8am – 12pm</option>
                      <option value="afternoon">12pm – 5pm</option>
                      <option value="flexible">Morning to Afternoon</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDate}
                    disabled={dateSaving}
                    className="rounded-lg bg-[#4A7C59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer hover:bg-[#3d6b4a] transition-colors"
                  >
                    {dateSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setDateEditOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Service row — read-only from wizard */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-xs text-slate-400">Service</span>
              <span className="text-xs text-slate-600">
                {getServiceLabel(job.service_type ?? null)}
                {job.bedrooms ? ` · ${job.bedrooms}bd / ${job.bathrooms}ba` : ''}
              </span>
            </div>

          </div>
        </div>

        {/* ── CONTACT PANEL ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Contact {firstName}
            </p>
            <button
              onClick={() => setChartOpen(p => !p)}
              title="Pricing reference"
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer ${
                chartOpen
                  ? 'bg-[#4A7C59] text-white'
                  : 'bg-slate-100 text-slate-400 hover:bg-[#e8f3ec] hover:text-[#4A7C59]'
              }`}
            >
              <Table size={11} aria-hidden />
            </button>
          </div>

          {/* Pricing reference panel — shown inline below the header */}
          {chartOpen && (
            <div className="mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Pricing reference
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-1.5 pr-3 text-left font-semibold text-slate-500">Bed / Bath</th>
                      <th className="pb-1.5 pr-3 text-right font-semibold text-slate-500">Standard</th>
                      <th className="pb-1.5 text-right font-semibold text-slate-500">Deep</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {[
                      { label: '1 / 1', std: 200, deep: 400 },
                      { label: '2 / 1', std: 260, deep: 400 },
                      { label: '2 / 2', std: 300, deep: 400 },
                      { label: '3 / 2', std: 380, deep: 505 },
                      { label: '4 / 2', std: 440, deep: 580 },
                      { label: '4 / 3', std: 480, deep: 635 },
                    ].map(row => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 pr-3 text-slate-500">{row.label}</td>
                        <td className="py-1.5 pr-3 text-right">${row.std}</td>
                        <td className="py-1.5 text-right">${row.deep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">Move-In / Move-Out — always custom quoted. Add-ons extra.</p>
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-slate-200">

            {/* Email / SMS toggle */}
            <div className="flex border-b border-slate-100">
              {(['email', 'sms'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => { setCurrentChannel(ch); setContactEditBody('') }}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                    currentChannel === ch
                      ? 'bg-[#4A7C59] text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {ch === 'email' ? 'Email' : 'SMS'}
                </button>
              ))}
            </div>

            <div className="p-3 space-y-2">
              {/* Template dropdown */}
              <select
                value={currentTemplate}
                onChange={e => { setCurrentTemplate(e.target.value); setContactEditBody('') }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none cursor-pointer"
              >
                {templateList.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              {/* Recurring rate toggle — only shown for email quote+deposit */}
              {currentChannel === 'email' && currentTemplate === 'quote_dep' && (
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    type="checkbox"
                    id="include-recurring"
                    checked={includeRecurring}
                    onChange={e => setIncludeRecurring(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#4A7C59] cursor-pointer shrink-0"
                  />
                  <label htmlFor="include-recurring" className="text-xs text-slate-700 cursor-pointer select-none">
                    Include recurring rate
                  </label>
                  {includeRecurring && (
                    <>
                      <select
                        value={recurringFreq}
                        onChange={e => setRecurringFreq(e.target.value)}
                        className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
                      >
                        {Object.entries(FREQ_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {recurringPrice && (
                        <span className="text-xs font-semibold text-[#4A7C59] font-mono shrink-0">
                          ${recurringPrice}/visit
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Preview area */}
              <div className="overflow-hidden rounded-lg border border-slate-200">
                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Preview
                  </span>
                  {!isCustomTemplate && contactEditBody && (
                    <button
                      onClick={() => setContactEditBody('')}
                      className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Subject line — email only */}
                {currentChannel === 'email' && previewSubject && (
                  <div className="border-b border-slate-100 px-3 py-2">
                    <span className="text-[10px] text-slate-400">Subject: </span>
                    <span className="text-[11px] text-slate-700">{previewSubject}</span>
                  </div>
                )}

                {/* Body — always editable */}
                <textarea
                  value={contactEditBody || previewBody}
                  onChange={e => setContactEditBody(e.target.value)}
                  rows={7}
                  maxLength={1000}
                  placeholder={isCustomTemplate ? 'Type your message…' : undefined}
                  className="w-full bg-white px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                />

                {/* Send row */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2">
                  <span className={`text-[10px] ${
                    (contactEditBody || previewBody).length >= 500
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }`}>
                    {currentChannel === 'sms'
                      ? `${(contactEditBody || previewBody).length} chars`
                      : ''}
                  </span>
                  <button
                    onClick={handleSendTemplate}
                    disabled={contactSending || (!previewBody.trim() && !contactEditBody.trim())}
                    className="flex items-center gap-1.5 rounded-lg bg-[#4A7C59] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#3d6b4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {contactSending ? 'Sending…' : currentChannel === 'email' ? 'Send email' : 'Send SMS'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Manual contact log */}
          <div className="mt-2 flex justify-center">
            <ManualLogDropdown onLog={handleManualLog} />
          </div>
        </div>

        {/* ── JOB ACTIONS ── */}
        <div className="h-px bg-slate-100" />
        <div className="space-y-2">
          {/* Appointment confirmed badge */}
          {job.deposit_paid && appointmentConfirmed && (
            <div className="flex items-center gap-2 rounded-xl border border-[#4A7C59]/20 bg-[#e8f3ec] px-3 py-2.5">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4A7C59]">
                <span className="text-[8px] font-bold text-white">✓</span>
              </div>
              <p className="text-xs font-medium text-[#4A7C59]">Appointment confirmed</p>
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

          {/* Archive / Decline dropdown */}
          {overrideStatus !== 'cancelled' && overrideStatus !== 'completed' && String(overrideStatus) !== 'archived' && (
            <JobActionDropdown
              onDecline={handleDecline}
              onArchive={handleArchive}
              loading={loadingOverride}
            />
          )}
        </div>

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
        {savedNotes && (
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            Notes: {savedNotes}
          </p>
        )}
      </div>
    </div>
  )
}
