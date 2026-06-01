'use client'

import * as React from 'react'
import { X, Send } from 'lucide-react'

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep')
    return 'the kitchen, bathrooms, bedrooms, and living areas'
  if (serviceType === 'move_out')
    return 'the property, including the kitchen, bathrooms, and any areas needing extra attention'
  return 'the space'
}

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')          return 'Standard Clean'
  if (serviceType === 'deep')              return 'Deep Clean'
  if (serviceType === 'move_out')          return 'Move-In / Move-Out'
  if (serviceType === 'post_construction') return 'Post-Construction'
  return 'cleaning service'
}

function fmtPhone(p: string): string {
  const d = p.replace(/\D/g, '').slice(-10)
  return d.length === 10 ? `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}` : p
}

export function ComposeSheet({
  job,
  mediaCount,
  onClose,
  onSuccess,
}: {
  job: any
  mediaCount: number
  onClose: () => void
  onSuccess: (contactNote: string) => void
}) {
  const firstName   = job.client_name?.split(' ')[0] ?? 'there'
  const serviceType = job.service_type ?? null
  const rooms       = getRoomCallout(serviceType)
  const svcLabel    = getServiceLabel(serviceType)
  const price       = job.approved_price ?? null
  const deposit     = job.deposit_amount ?? 100
  const remaining   = price ? Math.max(price - deposit, 0) : null

  const smsTemplates = [
    {
      label:         'Request photos',
      disabledReason: '',
      disabled:      false,
      preview:       `Hi ${firstName}, thanks for reaching out to RenewShine. To provide an accurate quote, please send a few photos or a short walkthrough video…`,
      body:          `Hi ${firstName}, thanks for reaching out to RenewShine.

To provide an accurate quote, please send a few photos or a short walkthrough video of ${rooms}.

If it's easier, we can also do a quick FaceTime call.

Once I review it, I'll send over your quote.

— Grace`,
    },
    {
      label:          'Quote ready',
      disabled:       !price,
      disabledReason: 'requires confirmed price',
      preview: price
        ? `Hi ${firstName} — thanks for sending the photos. Your ${svcLabel} quote is $${price.toLocaleString()}. $${deposit} deposit to reserve your date…`
        : 'Lock in a price on this job first to use this template.',
      body: price
        ? `Hi ${firstName} — thanks for sending the photos.

Your ${svcLabel} quote is $${price.toLocaleString()}.

$${deposit} deposit to reserve your date.
$${remaining?.toLocaleString()} due after the cleaning.

Reply YES and I'll send your deposit link.

— Grace`
        : '',
    },
  ]

  const emailTemplates = [
    {
      label:    'Photo request',
      subject:  'A Quick Follow-Up About Your Cleaning Request',
      template: 'need_photos',
      disabled: false,
      preview:  `Hi ${firstName}, thank you for contacting RenewShine. Before I can provide an accurate quote, I'd like to take a quick look at the space…`,
      body:     `Hi ${firstName},

Thank you for contacting RenewShine.

Before I can provide an accurate quote, I'd like to take a quick look at the space.

You can simply reply to this email with a few photos or a short walkthrough video. If it's easier, we can also schedule a quick FaceTime call.

Once I review everything, I'll send over your quote and available appointment options.

Thank you,
Grace
RenewShine`,
    },
    {
      label:    'Quote ready',
      subject:  'Your RenewShine Cleaning Quote',
      template: 'quote_ready',
      disabled: !price,
      preview: price
        ? `Hi ${firstName}, thank you for sending the photos. Your quote is ready. Service: ${svcLabel}. Total: $${price.toLocaleString()}…`
        : 'Lock in a price on this job first to use this template.',
      body: price
        ? `Hi ${firstName},

Thank you for sending the photos.

Based on the information provided, your quote is ready.

Service: ${svcLabel}
Total: $${price.toLocaleString()}
Deposit required: $${deposit}
Remaining balance: $${remaining?.toLocaleString()}

To move forward, simply reply to this email or submit your deposit once the payment link is provided.

We look forward to taking care of your home.

Grace
RenewShine
Premium Cleaning Services`
        : '',
    },
  ]

  const [tab, setTab]                     = React.useState<'sms' | 'email'>('sms')
  const [selectedSms, setSelectedSms]     = React.useState(0)
  const [selectedEmail, setSelectedEmail] = React.useState(0)
  const [smsBody, setSmsBody]             = React.useState(smsTemplates[0].body)
  const [loading, setLoading]             = React.useState(false)
  const [error, setError]                 = React.useState('')

  const handleSelectSms = (i: number) => {
    if (smsTemplates[i].disabled) return
    setSelectedSms(i)
    setSmsBody(smsTemplates[i].body)
  }

  const handleSelectEmail = (i: number) => {
    if (emailTemplates[i].disabled) return
    setSelectedEmail(i)
  }

  const handleSend = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    const isEmail = tab === 'email'
    const payload: Record<string, unknown> = {
      jobId:  job.id,
      method: isEmail ? 'email' : 'sms',
    }
    if (isEmail) {
      if (emailTemplates[selectedEmail].disabled) {
        setError('Lock in a price before sending this template.')
        setLoading(false)
        return
      }
      payload.template = emailTemplates[selectedEmail].template
    } else {
      if (!job.client_phone) {
        setError('No phone number on file. Use the Email tab instead.')
        setLoading(false)
        return
      }
      if (!smsBody.trim()) {
        setError('Message cannot be empty.')
        setLoading(false)
        return
      }
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
    }
    setLoading(false)
  }

  const smsLen = smsBody.length
  const smsCountClass = smsLen >= 1000
    ? 'text-red-500 font-medium'
    : smsLen >= 500
    ? 'text-amber-500'
    : 'text-slate-400'
  const smsCountText = smsLen >= 1000
    ? '1000 · max'
    : smsLen >= 500
    ? `${smsLen} · long`
    : smsLen >= 300
    ? `${smsLen} · 2 segments`
    : String(smsLen)

  const activeEmailTemplate = emailTemplates[selectedEmail]

  const cardBase = 'w-full text-left rounded-xl border p-3.5 transition-colors duration-150 cursor-pointer'
  const cardOn   = 'border-[#4A7C59] bg-[#f4fbf6]'
  const cardOff  = 'border-slate-200 bg-white hover:border-slate-300'
  const cardDis  = 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">Contact {firstName}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {job.client_email}
              {mediaCount > 0
                ? ` · ${mediaCount} photo${mediaCount === 1 ? '' : 's'} on file`
                : ' · No photos submitted'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 transition-colors duration-200 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
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
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Select a template
        </p>

        {/* ── SMS tab ──────────────────────────────────────────── */}
        {tab === 'sms' && (
          <>
            {smsTemplates.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSms(i)}
                className={`${cardBase} ${t.disabled ? cardDis : selectedSms === i ? cardOn : cardOff}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${
                    t.disabled ? 'text-slate-400' : selectedSms === i ? 'text-[#3a6347]' : 'text-slate-700'
                  }`}>
                    {t.label}
                    {t.disabled && (
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
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{t.preview}</p>
              </button>
            ))}

            {job.client_phone ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3.5 py-2 border-b border-slate-100 text-xs text-slate-500">
                  To <span className="font-semibold text-slate-900">{fmtPhone(job.client_phone)}</span>
                </div>
                <textarea
                  value={smsBody}
                  onChange={e => setSmsBody(e.target.value)}
                  maxLength={1000}
                  rows={6}
                  className="w-full px-3.5 py-3 text-sm text-slate-900 leading-relaxed focus:outline-none resize-none bg-white"
                />
                <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-100 bg-slate-50">
                  <span className={`text-[10px] ${smsCountClass}`}>{smsCountText}</span>
                  <button
                    onClick={handleSend}
                    disabled={!smsBody.trim() || loading}
                    className="flex items-center gap-1.5 rounded-lg bg-[#4A7C59] px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#3d6b4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send size={11} />
                    {loading ? 'Sending…' : 'Send'}
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

        {/* ── Email tab ────────────────────────────────────────── */}
        {tab === 'email' && (
          <>
            {emailTemplates.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectEmail(i)}
                className={`${cardBase} ${t.disabled ? cardDis : selectedEmail === i ? cardOn : cardOff}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${
                    t.disabled ? 'text-slate-400' : selectedEmail === i ? 'text-[#3a6347]' : 'text-slate-700'
                  }`}>
                    {t.label}
                    {t.disabled && (
                      <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                        — requires confirmed price
                      </span>
                    )}
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                    selectedEmail === i && !t.disabled
                      ? 'bg-[#4A7C59] border-[#4A7C59]'
                      : 'bg-white border-slate-300'
                  }`} />
                </div>
                <p className="text-[11px] text-slate-400 mb-1">
                  <span className="font-medium">Subject:</span> {t.subject}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{t.preview}</p>
              </button>
            ))}

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-slate-100 text-xs text-slate-500">
                To <span className="font-semibold text-slate-900">{job.client_email}</span>
              </div>
              <div className="px-3.5 py-2 border-b border-slate-100 text-xs text-slate-500">
                Subject <span className="font-semibold text-slate-900">{activeEmailTemplate.subject}</span>
              </div>
              <div className="px-3.5 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {activeEmailTemplate.body || (
                  <span className="text-slate-400 italic">Lock in a price to preview this template.</span>
                )}
              </div>
              <div className="flex items-center justify-end px-3.5 py-2.5 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleSend}
                  disabled={activeEmailTemplate.disabled || loading}
                  className="flex items-center gap-1.5 rounded-lg bg-[#4A7C59] px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#3d6b4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send size={11} />
                  {loading ? 'Sending…' : 'Send email'}
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
    </div>
  )
}
