'use client'

import * as React from 'react'
import { X, Send, ChevronLeft, Eye } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep')
    return 'the kitchen, bathrooms, bedrooms, and living areas'
  if (serviceType === 'move_out')
    return 'the property, including the kitchen, bathrooms, and any areas needing extra attention'
  return 'the space'
}

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')           return 'Standard Clean'
  if (serviceType === 'deep')               return 'Deep Clean'
  if (serviceType === 'move_out')           return 'Move-In / Move-Out'
  if (serviceType === 'post_construction')  return 'Post-Construction'
  return 'cleaning service'
}

function fmtPhone(p: string): string {
  const d = p.replace(/\D/g, '').slice(-10)
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p
}

function getTimePref(pref: string | null): string {
  const map: Record<string, string> = {
    morning: '8am – 12pm', afternoon: '12pm – 5pm',
    early_morning: '8am – 10am', mid_morning: '10am – 12pm',
    noon: '12pm – 2pm', early_afternoon: '2pm – 4pm',
    late_afternoon: '4pm – 6pm', flexible: 'Morning to Afternoon',
  }
  return pref ? (map[pref] ?? 'Morning to Afternoon') : 'Morning to Afternoon'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SmsTemplate {
  id:            string
  label:         string
  disabled:      boolean
  disabledReason?: string
  body:          string
}

interface EmailTemplate {
  id:            string
  label:         string
  disabled:      boolean
  disabledReason?: string
  subject:       string
  body:          string          // plain text preview / editable body
  templateKey:   string          // sent to API — 'need_photos' | 'quote_ready' | 'appointment_confirmed' | 'custom_formatted'
  fixedTemplate: boolean         // true = not editable (fires pre-built HTML); false = editable, sends custom_formatted
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ComposeSheet({
  job,
  mediaCount,
  onClose,
  onSuccess,
  initialTemplate,
  initialDate,
  initialTimePref,
}: {
  job:              any
  mediaCount:       number
  onClose:          () => void
  onSuccess:        (note: string) => void
  initialTemplate?: 'reminder' | 'request_photos' | 'quote_ready' | 'appointment_confirmed'
  initialDate?:     string   // YYYY-MM-DD — overrides job.confirmed_date
  initialTimePref?: string   // overrides job.availability_time_pref
}) {
  const firstName   = job.client_name?.split(' ')[0] ?? 'there'
  const serviceType = job.service_type ?? null
  const rooms       = getRoomCallout(serviceType)
  const svcLabel    = getServiceLabel(serviceType)
  const price       = job.approved_price ?? null
  const deposit     = job.deposit_amount ?? 100
  const remaining   = price ? Math.max(price - deposit, 0) : null

  // Editable date/time fields — for templates that use confirmed date + arrival window
  const [templateDate,     setTemplateDate]     = React.useState<string>(
    initialDate
      ?? (job.confirmed_date ? new Date(job.confirmed_date).toISOString().split('T')[0] : '')
  )
  const [templateTimePref, setTemplateTimePref] = React.useState<string>(
    initialTimePref ?? job.availability_time_pref ?? 'morning'
  )

  // These are derived from editable state — they update when the fields change
  const confirmedDate = templateDate
    ? new Date(templateDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : null
  const dayName = templateDate
    ? new Date(templateDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    : null
  const timePref = getTimePref(templateTimePref)

  // ── Template definitions ──────────────────────────────────────────────────

  const smsTemplates: SmsTemplate[] = React.useMemo(() => [
    {
      id:       'request_photos',
      label:    'Request photos',
      disabled: false,
      body: `Hi ${firstName}, thanks for reaching out to RenewShine.

To provide an accurate quote, please send a few photos or a short walkthrough video of ${rooms}.

If it's easier, we can also schedule a quick FaceTime call.

Once we've reviewed the space, we'll send over your confirmed quote.

— RenewShine`,
    },
    {
      id:            'quote_ready',
      label:         'Quote ready',
      disabled:      !price,
      disabledReason: 'requires confirmed price',
      body: price
        ? `Hi ${firstName} — your ${svcLabel} quote is ready.

Total: $${price.toLocaleString()}
Deposit due today: $${deposit}
Remaining after service: $${remaining?.toLocaleString()}

Reply YES and we'll send your deposit link.

— RenewShine`
        : '',
    },
    {
      id:            'appointment_confirmed',
      label:         'Appointment confirmed',
      disabled:      !confirmedDate,
      disabledReason: 'requires confirmed date',
      body: confirmedDate
        ? `Hi ${firstName} — your ${svcLabel} is confirmed for ${confirmedDate}.

Arrival window: ${timePref}
Address: ${job.address ?? 'on file'}

A few notes before we arrive:
• Please have floors and countertops reasonably clear.
• Let us know any priority areas in advance.
• We don't move heavy furniture or appliances.
• Please secure pets if they're uncomfortable around equipment.

We bring all supplies. We'll also call 48 hours before your appointment to confirm details.

Questions before ${dayName}? Reply here anytime.

— RenewShine`
        : '',
    },
    {
      id:            'reminder',
      label:         'Day-before reminder',
      disabled:      !confirmedDate,
      disabledReason: 'requires confirmed date',
      body: confirmedDate
        ? `Hi ${firstName} — your ${svcLabel} is tomorrow, ${confirmedDate}.

Arrival window: ${timePref}
Address: ${job.address ?? 'on file'}

Reply YES to confirm or let us know if anything has changed.

— RenewShine`
        : '',
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [templateDate, templateTimePref])

  const emailTemplates: EmailTemplate[] = React.useMemo(() => [
    {
      id:            'need_photos',
      label:         'Photo request',
      disabled:      false,
      subject:       'A Quick Follow-Up About Your Cleaning Request',
      templateKey:   'custom_formatted',
      fixedTemplate: false,
      body: `Hi ${firstName},

Thank you for contacting RenewShine.

Before we can provide an accurate quote, our team reviews photos of every space. Please send a few photos or a short walkthrough video of ${rooms}.

If it's easier, we can also schedule a quick FaceTime call — just reply and we'll arrange a time.

Once we've reviewed everything, we'll send over your confirmed quote and available appointment options.

Thank you`,
    },
    {
      id:            'quote_ready',
      label:         'Quote ready',
      disabled:      !price,
      disabledReason: 'requires confirmed price',
      subject:       'Your RenewShine Cleaning Quote',
      templateKey:   'custom_formatted',
      fixedTemplate: false,
      body: price
        ? `Hi ${firstName},

Thank you for sending the photos.

Based on our review, your quote is ready.

Service: ${svcLabel}
Total: $${price.toLocaleString()}
Deposit due today: $${deposit}
Remaining after service: $${remaining?.toLocaleString()}

To move forward, simply reply to this email and we'll send over your deposit link.

We look forward to taking care of your home.`
        : '',
    },
    {
      id:            'appointment_confirmed',
      label:         'Appointment confirmed',
      disabled:      !confirmedDate,
      disabledReason: 'requires confirmed date',
      subject:       confirmedDate ? `${firstName}, your ${svcLabel} is confirmed — ${confirmedDate}` : '',
      templateKey:   'custom_formatted',
      fixedTemplate: false,
      body: confirmedDate
        ? `Hi ${firstName},

Your ${svcLabel} is confirmed.

Date: ${confirmedDate}
Arrival window: ${timePref}

We'll take care of everything from there. Here's what to have ready:

· Floors and countertops reasonably clear
· Any priority areas flagged in advance
· Pets secured if they're sensitive to equipment

We bring all supplies and equipment. Before we leave, we do a final walkthrough to make sure everything is right.

If we need anything before your appointment, we'll reach out directly.

If anything comes up before then, just reply here.`
        : '',
    },
    {
      id:            'reminder',
      label:         'Day-before reminder',
      disabled:      !confirmedDate,
      disabledReason: 'requires confirmed date',
      subject:       confirmedDate ? `Reminder — your ${svcLabel} is tomorrow, ${confirmedDate}` : '',
      templateKey:   'custom_formatted',
      fixedTemplate: false,
      body: confirmedDate
        ? `Hi ${firstName},

Just a quick reminder that your ${svcLabel} is tomorrow, ${confirmedDate}.

Arrival window: ${timePref}
Address: ${job.address ?? 'on file'}

We'll bring everything needed. If you have any last-minute questions, just reply to this email.

See you tomorrow.`
        : '',
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [templateDate, templateTimePref])

  // ── State ─────────────────────────────────────────────────────────────────

  // Resolve initial indices from prop
  const initSmsIdx   = initialTemplate
    ? Math.max(smsTemplates.findIndex(t => t.id === initialTemplate), 0)
    : 0
  const initEmailIdx = initialTemplate
    ? Math.max(emailTemplates.findIndex(t => t.id === initialTemplate), 0)
    : 0

  const [tab,            setTab]            = React.useState<'sms' | 'email'>('sms')
  const [selectedSms,    setSelectedSms]    = React.useState(initSmsIdx)
  const [selectedEmail,  setSelectedEmail]  = React.useState(initEmailIdx)
  const [smsBody,        setSmsBody]        = React.useState(smsTemplates[initSmsIdx].body)
  const [emailBody,      setEmailBody]      = React.useState(emailTemplates[initEmailIdx].body)
  const [emailSubject,   setEmailSubject]   = React.useState(emailTemplates[initEmailIdx].subject)
  const [step,           setStep]           = React.useState<'compose' | 'preview'>('compose')
  const [loading,        setLoading]        = React.useState(false)
  const [error,          setError]          = React.useState('')

  // Keep body/subject in sync when template fields change date or time
  React.useEffect(() => {
    const t = smsTemplates[selectedSms]
    if (t && !t.disabled) setSmsBody(t.body)
  }, [smsTemplates, selectedSms])

  React.useEffect(() => {
    const t = emailTemplates[selectedEmail]
    if (t && !t.disabled) {
      setEmailBody(t.body)
      setEmailSubject(t.subject)
    }
  }, [emailTemplates, selectedEmail])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectSms = (i: number) => {
    if (smsTemplates[i].disabled) return
    setSelectedSms(i)
    setSmsBody(smsTemplates[i].body)
    setError('')
  }

  const handleSelectEmail = (i: number) => {
    if (emailTemplates[i].disabled) return
    setSelectedEmail(i)
    setEmailBody(emailTemplates[i].body)
    setEmailSubject(emailTemplates[i].subject)
    setError('')
  }

  const handlePreview = () => {
    setError('')
    if (tab === 'sms' && !job.client_phone) {
      setError('No phone number on file. Switch to the Email tab.')
      return
    }
    if (tab === 'sms' && !smsBody.trim()) {
      setError('Message cannot be empty.')
      return
    }
    if (tab === 'email' && !emailBody.trim()) {
      setError('Email body cannot be empty.')
      return
    }
    setStep('preview')
  }

  const handleSend = async () => {
    if (loading) return
    setLoading(true)
    setError('')

    const isEmail    = tab === 'email'
    const tmpl       = isEmail ? emailTemplates[selectedEmail] : null
    const payload: Record<string, unknown> = {
      jobId:  job.id,
      method: isEmail ? 'email' : 'sms',
    }

    if (isEmail && tmpl) {
      if (tmpl.fixedTemplate) {
        payload.template = tmpl.templateKey
      } else {
        payload.template   = 'custom_formatted'
        payload.customBody = emailBody.trim()
        payload.subject    = emailSubject.trim()
      }
    } else {
      payload.customBody = smsBody.trim()
    }

    const res = await fetch('/api/admin/send-contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      onSuccess(data.contactNote ?? 'Message sent ✓')
    } else {
      const data = await res.json().catch(() => ({}))
      setError((data as any).error ?? 'Failed to send. Please try again.')
      setStep('compose')
    }
    setLoading(false)
  }

  // ── Char counter ──────────────────────────────────────────────────────────

  const smsLen   = smsBody.length
  const smsColor = smsLen >= 1000 ? 'text-red-500 font-medium' : smsLen >= 500 ? 'text-amber-500' : 'text-slate-400'
  const smsCount = smsLen >= 1000 ? '1000 · max' : smsLen >= 500 ? `${smsLen} · long` : smsLen >= 300 ? `${smsLen} · 2 segments` : String(smsLen)

  // ── Card styles ───────────────────────────────────────────────────────────

  const cardBase = 'w-full text-left rounded-xl border p-3.5 transition-colors duration-150 cursor-pointer'
  const cardOn   = 'border-[#4A7C59] bg-[#f4fbf6]'
  const cardOff  = 'border-slate-200 bg-white hover:border-slate-300'
  const cardDis  = 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'

  const activeEmail = emailTemplates[selectedEmail]
  const DATE_TEMPLATES = ['reminder', 'appointment_confirmed']
  const smsNeedsDateFields   = DATE_TEMPLATES.includes(smsTemplates[selectedSms]?.id)
  const emailNeedsDateFields = DATE_TEMPLATES.includes(emailTemplates[selectedEmail]?.id)

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          {step === 'preview' ? (
            <button
              onClick={() => setStep('compose')}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              Edit
            </button>
          ) : (
            <div>
              <p className="text-base font-semibold text-slate-900">Contact {firstName}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {job.client_email}
                {job.client_phone ? ` · ${fmtPhone(job.client_phone)}` : ''}
                {mediaCount > 0
                  ? ` · ${mediaCount} photo${mediaCount === 1 ? '' : 's'} on file`
                  : ' · No photos on file'}
              </p>
            </div>
          )}

          {step === 'preview' && (
            <p className="text-sm font-semibold text-slate-900">
              {tab === 'sms' ? 'Preview SMS' : 'Preview Email'}
            </p>
          )}

          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 transition-colors duration-200 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher — only shown on compose step */}
        {step === 'compose' && (
          <div className="mt-4 flex -mx-5 px-5 border-b border-slate-100">
            {(['sms', 'email'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError('') }}
                className={`mr-6 pb-3 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
                  tab === t
                    ? 'border-[#4A7C59] text-[#4A7C59]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'sms' ? 'SMS' : 'Email'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ════════════════════════════════════════════════════════════════
            STEP 1 — COMPOSE
        ════════════════════════════════════════════════════════════════ */}
        {step === 'compose' && (
          <div className="px-5 py-5 space-y-3">

            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Select a template
            </p>

            {/* ── SMS compose ────────────────────────────────────────── */}
            {tab === 'sms' && (
              <>
                {smsTemplates.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectSms(i)}
                    className={`${cardBase} ${t.disabled ? cardDis : selectedSms === i ? cardOn : cardOff}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-semibold ${
                        t.disabled ? 'text-slate-400' : selectedSms === i ? 'text-[#3a6347]' : 'text-slate-700'
                      }`}>
                        {t.label}
                        {t.disabled && t.disabledReason && (
                          <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                            — {t.disabledReason}
                          </span>
                        )}
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                        selectedSms === i && !t.disabled
                          ? 'bg-[#4A7C59] border-[#4A7C59]'
                          : 'bg-white border-slate-300'
                      }`} />
                    </div>
                    {!t.disabled && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 whitespace-pre-line">
                        {t.body.split('\n')[0]}…
                      </p>
                    )}
                  </button>
                ))}

                {job.client_phone ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                      To <span className="font-semibold text-slate-900">{fmtPhone(job.client_phone)}</span>
                      <span className="ml-2 text-slate-400">· Edit before sending</span>
                    </div>

                    {/* Date + arrival fields — shown for date-based templates */}
                    {smsNeedsDateFields && (
                      <div className="border-b border-slate-100 bg-[#f8faf9] px-3.5 py-3 space-y-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A7C59]">
                          Confirm details — updates message automatically
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Date picker */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                              Confirmed date
                            </label>
                            <input
                              type="date"
                              value={templateDate}
                              onChange={e => setTemplateDate(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200 cursor-pointer"
                            />
                          </div>

                          {/* Arrival window */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                              Arrival window
                            </label>
                            <select
                              value={templateTimePref}
                              onChange={e => setTemplateTimePref(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200 cursor-pointer"
                            >
                              <option value="early_morning">8am – 10am</option>
                              <option value="mid_morning">10am – 12pm</option>
                              <option value="noon">12pm – 2pm</option>
                              <option value="early_afternoon">2pm – 4pm</option>
                              <option value="late_afternoon">4pm – 6pm</option>
                              <option value="flexible">Morning to Afternoon</option>
                              <option value="morning">8am – 12pm</option>
                              <option value="afternoon">12pm – 5pm</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer's requested window helper note */}
                        {(job.availability_start || job.availability_end) && (
                          <p className="text-[10px] text-slate-400">
                            Customer requested:{' '}
                            {job.availability_start
                              ? new Date(job.availability_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : '—'}
                            {' – '}
                            {job.availability_end
                              ? new Date(job.availability_end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : '—'}
                          </p>
                        )}
                      </div>
                    )}
                    <textarea
                      value={smsBody}
                      onChange={e => setSmsBody(e.target.value)}
                      maxLength={1000}
                      rows={8}
                      className="w-full px-3.5 py-3 text-sm text-slate-900 leading-relaxed focus:outline-none resize-none bg-white"
                    />
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 bg-slate-50">
                      <span className={`text-[10px] ${smsColor}`}>{smsCount}</span>
                      <button
                        onClick={handlePreview}
                        disabled={!smsBody.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Eye size={11} />
                        Preview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-medium text-amber-800">No phone number on file</p>
                    <p className="mt-0.5 text-xs text-amber-700">Switch to the Email tab.</p>
                  </div>
                )}
              </>
            )}

            {/* ── Email compose ──────────────────────────────────────── */}
            {tab === 'email' && (
              <>
                {emailTemplates.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectEmail(i)}
                    className={`${cardBase} ${t.disabled ? cardDis : selectedEmail === i ? cardOn : cardOff}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-semibold ${
                        t.disabled ? 'text-slate-400' : selectedEmail === i ? 'text-[#3a6347]' : 'text-slate-700'
                      }`}>
                        {t.label}
                        {t.disabled && t.disabledReason && (
                          <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                            — {t.disabledReason}
                          </span>
                        )}
                        {t.fixedTemplate && !t.disabled && (
                          <span className="ml-1.5 text-[10px] font-normal text-[#4A7C59]">
                            — styled HTML email
                          </span>
                        )}
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                        selectedEmail === i && !t.disabled
                          ? 'bg-[#4A7C59] border-[#4A7C59]'
                          : 'bg-white border-slate-300'
                      }`} />
                    </div>
                    {!t.disabled && (
                      <p className="text-[11px] text-slate-400">
                        <span className="font-medium">Subject:</span> {t.subject}
                      </p>
                    )}
                  </button>
                ))}

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                    To <span className="font-semibold text-slate-900">{job.client_email}</span>
                  </div>

                  {/* Subject — editable (disabled for fixed templates) */}
                  <div className="border-b border-slate-100">
                    <div className="flex items-center gap-2 px-3.5 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">
                        Subject
                      </span>
                      {activeEmail.fixedTemplate ? (
                        <p className="text-xs text-slate-700 truncate">{emailSubject}</p>
                      ) : (
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                          placeholder="Email subject…"
                        />
                      )}
                    </div>
                  </div>

                  {/* Date + arrival fields — shown for date-based templates */}
                  {emailNeedsDateFields && (
                    <div className="border-b border-slate-100 bg-[#f8faf9] px-3.5 py-3 space-y-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A7C59]">
                        Confirm details — updates message automatically
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            Confirmed date
                          </label>
                          <input
                            type="date"
                            value={templateDate}
                            onChange={e => setTemplateDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            Arrival window
                          </label>
                          <select
                            value={templateTimePref}
                            onChange={e => setTemplateTimePref(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200 cursor-pointer"
                          >
                            <option value="early_morning">8am – 10am</option>
                            <option value="mid_morning">10am – 12pm</option>
                            <option value="noon">12pm – 2pm</option>
                            <option value="early_afternoon">2pm – 4pm</option>
                            <option value="late_afternoon">4pm – 6pm</option>
                            <option value="flexible">Morning to Afternoon</option>
                            <option value="morning">8am – 12pm</option>
                            <option value="afternoon">12pm – 5pm</option>
                          </select>
                        </div>
                      </div>

                      {(job.availability_start || job.availability_end) && (
                        <p className="text-[10px] text-slate-400">
                          Customer requested:{' '}
                          {job.availability_start
                            ? new Date(job.availability_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                          {' – '}
                          {job.availability_end
                            ? new Date(job.availability_end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Body — editable unless fixedTemplate */}
                  {activeEmail.fixedTemplate ? (
                    <div className="px-3.5 py-3">
                      <div className="rounded-lg bg-[#f4fbf6] border border-[#4A7C59]/20 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A7C59] mb-2">
                          Styled HTML Email
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {activeEmail.body}
                        </p>
                        <p className="mt-2 text-[10px] text-[#4A7C59]">
                          This template includes formatted prep notes and branded footer.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      rows={9}
                      className="w-full px-3.5 py-3 text-sm text-slate-900 leading-relaxed focus:outline-none resize-none bg-white"
                      placeholder="Type your message…"
                    />
                  )}

                  <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 bg-slate-50">
                    <span className="text-[10px] text-slate-400">
                      {activeEmail.fixedTemplate ? 'Sends as branded HTML' : 'Sends with RenewShine header & footer'}
                    </span>
                    <button
                      onClick={handlePreview}
                      disabled={activeEmail.disabled || (!activeEmail.fixedTemplate && !emailBody.trim())}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Eye size={11} />
                      Preview
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STEP 2 — PREVIEW
        ════════════════════════════════════════════════════════════════ */}
        {step === 'preview' && (
          <div className="px-5 py-5 space-y-4">

            {tab === 'sms' && (
              <>
                {/* Phone mock */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Sending to {job.client_phone ? fmtPhone(job.client_phone) : '—'}
                  </p>

                  {/* iMessage-style bubble */}
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-white"
                      style={{ background: '#4A7C59' }}
                    >
                      {smsBody}
                    </div>
                    <p className="text-[10px] text-slate-400 mr-1">
                      From RenewShine · (771) 253-9204
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  This is exactly what {firstName} will receive. Multi-line messages send as MMS.
                </p>
              </>
            )}

            {tab === 'email' && (
              <>
                {/* Email preview card */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Email header mock */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-12 shrink-0">From</span>
                      <span className="text-xs text-slate-600">RenewShine Team &lt;hello@renewshine.co&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-12 shrink-0">To</span>
                      <span className="text-xs text-slate-600">{job.client_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-12 shrink-0">Re</span>
                      <span className="text-xs font-medium text-slate-900">{emailSubject}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-4">
                    {activeEmail.fixedTemplate ? (
                      <div className="space-y-2">
                        <div className="rounded-lg bg-[#f4fbf6] border border-[#4A7C59]/20 px-3 py-2.5">
                          <p className="text-[10px] font-semibold text-[#4A7C59] mb-1">Styled HTML — includes formatted prep notes</p>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{activeEmail.body}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {emailBody}
                      </p>
                    )}
                  </div>

                  {/* Footer mock */}
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] text-slate-400">— RenewShine · (771) 253-9204 · renewshine.co</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Full branded footer included in actual email</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  The actual email includes your full branded header, logo, and footer.
                </p>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer — Send button (preview step only) ─────────────────────── */}
      {step === 'preview' && (
        <div className="shrink-0 border-t border-slate-200 px-5 py-4">
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A7C59] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#3d6b4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={14} />
            {loading
              ? 'Sending…'
              : tab === 'sms'
              ? `Confirm & send SMS to ${firstName}`
              : `Confirm & send email to ${firstName}`}
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            This will be sent immediately and logged to the job record.
          </p>
        </div>
      )}
    </div>
  )
}
