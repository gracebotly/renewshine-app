'use client'

import * as React from 'react'
import { X, Send, Mail, MessageSquare, ChevronRight } from 'lucide-react'

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep') {
    return 'the kitchen, bathrooms, bedrooms, and living areas'
  }
  if (serviceType === 'move_out') {
    return 'the property — the kitchen, bathrooms, and any areas needing extra attention'
  }
  return 'the space'
}

const SMS_NEED_PHOTOS = (firstName: string, serviceType: string | null): string => {
  const rooms = getRoomCallout(serviceType)
  return `Hi ${firstName}, thanks for reaching out to RenewShine. To put together an accurate quote, please send a few photos or a short walkthrough video of ${rooms}. FaceTime works too if that's easier. Once I review it, I'll have your quote ready. — Grace`
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
  const firstName = job.client_name?.split(' ')[0] ?? 'there'
  const [tab, setTab] = React.useState<'email' | 'sms'>('email')
  const [emailTemplate, setEmailTemplate] = React.useState<'need_photos' | 'custom'>('need_photos')
  const [smsBody, setSmsBody] = React.useState(SMS_NEED_PHOTOS(firstName, job.service_type ?? null))
  const [customEmailBody, setCustomEmailBody] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  async function handleSend() {
    setLoading(true)
    setError('')
    const body: Record<string, unknown> = { jobId: job.id, method: tab }
    if (tab === 'email') {
      body.template = emailTemplate
      if (emailTemplate === 'custom') body.customBody = customEmailBody.trim()
    }
    if (tab === 'sms') body.customBody = smsBody.trim()

    const res = await fetch('/api/admin/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      onSuccess(data.contactNote ?? 'Contact sent')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to send. Please try again.')
    }
    setLoading(false)
  }

  const sendDisabled =
    loading ||
    (tab === 'email' && emailTemplate === 'custom' && !customEmailBody.trim()) ||
    (tab === 'sms' && !smsBody.trim())

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-base font-semibold text-slate-900">
            Contact {firstName}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {job.client_email}
            {mediaCount === 0 ? ' · No photos submitted' : ` · ${mediaCount} photo${mediaCount === 1 ? '' : 's'} on file`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg p-2 transition-colors duration-200 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Tab switcher ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex gap-2 border-b border-slate-100 px-5 pt-4 pb-0">
        <button
          type="button"
          onClick={() => setTab('email')}
          className={`flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors duration-150 ${
            tab === 'email'
              ? 'border-(--color-brand) text-(--color-brand)'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Mail size={14} />
          Email
        </button>
        <button
          type="button"
          onClick={() => setTab('sms')}
          className={`flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors duration-150 ${
            tab === 'sms'
              ? 'border-(--color-brand) text-(--color-brand)'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare size={14} />
          SMS
          {!job.client_phone && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              No phone
            </span>
          )}
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

        {tab === 'email' && (
          <>
            {/* Option 1 — Request photos */}
            <button
              type="button"
              onClick={() => setEmailTemplate('need_photos')}
              className={`w-full cursor-pointer rounded-xl border text-left transition-colors duration-150 ${
                emailTemplate === 'need_photos'
                  ? 'border-(--color-brand) bg-[#f3f8f5]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">Request photos</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Sent to {job.client_email}
                  </p>
                </div>
                <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors duration-150 ${
                  emailTemplate === 'need_photos'
                    ? 'border-(--color-brand) bg-(--color-brand)'
                    : 'border-slate-300 bg-white'
                }`} />
              </div>

              {/* Email preview — always visible so you know what's going out */}
              <div className="border-t border-slate-100 px-4 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Preview
                </p>
                <p className="text-xs leading-relaxed text-slate-600">
                  <span className="font-medium">Subject:</span>{' '}
                  {firstName}, your RenewShine quote is one step away
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Hi {firstName}, thanks for reaching out to RenewShine. To put together an accurate quote, I need to take a look at the space first. Could you send a few photos or a short walkthrough video of {getRoomCallout(job.service_type ?? null)}? FaceTime works great too if that's easier.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Once I've reviewed it, I'll send over your confirmed quote — you won't pay anything until you've seen and approved the price.
                </p>
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  Reply to this email or text us at (771) 253-9204.
                </p>
              </div>
            </button>

            {/* Option 2 — Custom message */}
            <button
              type="button"
              onClick={() => setEmailTemplate('custom')}
              className={`w-full cursor-pointer rounded-xl border text-left transition-colors duration-150 ${
                emailTemplate === 'custom'
                  ? 'border-(--color-brand) bg-[#f3f8f5]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Custom message</p>
                  <p className="mt-0.5 text-xs text-slate-500">Write your own email</p>
                </div>
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors duration-150 ${
                  emailTemplate === 'custom'
                    ? 'border-(--color-brand) bg-(--color-brand)'
                    : 'border-slate-300 bg-white'
                }`} />
              </div>
            </button>

            {/* Custom textarea — only shown when Custom is selected */}
            {emailTemplate === 'custom' && (
              <div>
                <textarea
                  value={customEmailBody}
                  onChange={(e) => setCustomEmailBody(e.target.value)}
                  placeholder={`Hi ${firstName},\n\n`}
                  rows={7}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:border-(--color-brand) focus:outline-none resize-none"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {customEmailBody.length} characters
                </p>
              </div>
            )}
          </>
        )}

        {tab === 'sms' && (
          <>
            {!job.client_phone ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium text-amber-800">No phone number on file</p>
                <p className="mt-1 text-xs text-amber-700">
                  This customer didn't provide a phone number. Use Email instead.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Message to {job.client_phone}
                  </p>
                  <p className="text-xs text-slate-400">{smsBody.length} / 160</p>
                </div>
                <textarea
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand) focus:outline-none resize-none"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  This message will also appear in your Inbox thread.
                </p>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* ── Send button ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-200 px-5 py-4 pb-safe">
        <button
          onClick={handleSend}
          disabled={sendDisabled}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--color-brand) px-4 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          {loading ? 'Sending…' : tab === 'email' ? 'Send email' : 'Send SMS'}
        </button>
      </div>

    </div>
  )
}
