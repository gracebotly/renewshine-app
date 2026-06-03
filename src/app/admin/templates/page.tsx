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
        message: `Hi [NAME] — your RenewShine quote is ready.

Service: [SERVICE]
Total: $[AMOUNT]
Deposit to confirm: $100
Remaining after service: $[REMAINING]

To reserve your appointment, submit your deposit here:
[LINK]

Your date is not held until the deposit is submitted.

— RenewShine`,
      },
      {
        label: 'Follow-Up (No Deposit Yet)',
        message: `Hi [NAME] — following up on your RenewShine quote.

Your requested date window is still available. Submit your deposit to secure your spot:

[LINK]

Questions? Reply here anytime.

— RenewShine`,
      },
      {
        label: 'Cash Deposit Confirmed',
        message: `Hi [NAME] — your deposit has been received and your appointment is confirmed.

Date: [DATE]
Arrival window: [TIME]

We'll reach out the day before to confirm details.

— RenewShine`,
      },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      {
        label: 'Booking Confirmed',
        message: `Hi [NAME] — your [SERVICE] is confirmed for [DATE].

Arrival window: [TIME]
Address: [ADDRESS]

A few notes before we arrive:
• Please have floors and countertops reasonably clear.
• Let us know any priority areas in advance.
• We don't move heavy furniture or appliances.
• Please secure pets if they're uncomfortable around equipment.

We bring all supplies. We'll also call 48 hours before your appointment to confirm details.

— RenewShine`,
      },
      {
        label: '48-Hour Reminder',
        message: `Hi [NAME] — your RenewShine appointment is coming up on [DAY], [DATE].

Arrival window: [TIME]

Address:
[ADDRESS]

A few quick reminders:
- Please clear countertops and bathroom surfaces if possible.
- If you won't be home, please reply with access instructions.
- Let us know if anything has changed.

We'll bring all supplies and equipment needed for the service.

Reply YES to confirm or let us know if anything has changed.

— RenewShine`,
      },
      {
        label: 'On My Way',
        message: `Hi [NAME] — your cleaner is on the way.

Estimated arrival: [TIME]

— RenewShine`,
      },
      {
        label: 'Job Complete — Balance Due',
        message: `Hi [NAME] — your cleaning is complete.

Remaining balance: $[REMAINING]

Submit payment here:
[LINK]

Thank you for choosing RenewShine.

— RenewShine`,
      },
      {
        label: 'Review Request',
        message: `Hi [NAME] — thank you for choosing RenewShine.

If you have a moment, a Google review helps us serve more customers in the area:
[GOOGLE_REVIEW_LINK]

We appreciate your support.

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
