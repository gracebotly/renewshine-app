'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, Copy, Check } from 'lucide-react'

const TEMPLATES = [
  {
    section: 'Quote & Deposit',
    items: [
      {
        label: 'Quote Sent',
        message: `Hi [NAME] — your RenewShine quote is ready! 🏠

Service: [SERVICE]
Date: [DATE]
Arrival: [TIME]

Total: $[AMOUNT]
Deposit due now: $100
Remaining after clean: $[REMAINING]

Pay your $100 deposit here to lock in your date:
[LINK]

Your date isn't held until the deposit is paid. Link expires in 48 hours.

— RenewShine`,
      },
      {
        label: 'Follow-Up (No Deposit Yet)',
        message: `Hi [NAME] — just checking in on your RenewShine quote.

Your date is still available but we can't hold it much longer.

Deposit link: [LINK]

Any questions? Just reply here.

— RenewShine`,
      },
      {
        label: 'Cash Deposit Confirmed',
        message: `Hi [NAME] — got your deposit, you're all set! ✅

Your clean is confirmed for [DATE] between [TIME].

We'll reach out the day before to confirm. See you then!

— RenewShine`,
      },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      {
        label: 'Booking Confirmed',
        message: `Hi [NAME] — your cleaning is booked! ✅

Date: [DATE]
Arrival window: [TIME]
Address: [ADDRESS]

We'll send a reminder the day before. If anything changes, just reply here.

— RenewShine`,
      },
      {
        label: 'Day-Before Reminder',
        message: `Hi [NAME] — reminder that your RenewShine clean is tomorrow! 🧹

Arrival window: [TIME]
Address: [ADDRESS]

Reply YES to confirm or let us know if anything has changed.

— RenewShine`,
      },
      {
        label: 'On My Way',
        message: `Hi [NAME] — your cleaner is on the way! 🚗

Estimated arrival: [TIME]

See you shortly!

— RenewShine`,
      },
      {
        label: 'Job Complete — Balance Due',
        message: `Hi [NAME] — your clean is done! Hope you love it. 🏠✨

Remaining balance: $[REMAINING]

Pay here: [LINK]

Thank you for choosing RenewShine!

— RenewShine`,
      },
      {
        label: 'Review Request',
        message: `Hi [NAME] — so glad you're happy with your clean!

If you have 30 seconds, a Google review would mean the world to us:
[GOOGLE_REVIEW_LINK]

Thank you! 🙏

— RenewShine`,
      },
    ],
  },
]

function TemplateCard({ label, message }: { label: string; message: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <button
          onClick={handleCopy}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 select-all">
        {message}
      </pre>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/admin"
          className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">SMS Templates</h1>
          <p className="mt-1 text-slate-600">Tap Copy, paste into your messages app. Fill in the blanks in brackets.</p>
        </div>

        <div className="space-y-10">
          {TEMPLATES.map((section) => (
            <div key={section.section}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {section.section}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <TemplateCard key={item.label} label={item.label} message={item.message} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
