'use client'

import * as React from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

interface PartialLead {
  id: string
  client_name: string
  client_email: string
  client_phone: string | null
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = diffMs / (1000 * 60)
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffMins < 60) return `${Math.floor(diffMins)}m ago`
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`
  return `${Math.floor(diffDays)}d ago`
}

function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function PartialLeads({ leads }: { leads: PartialLead[] }) {
  const [dismissed, setDismissed] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  if (dismissed || leads.length === 0) return null

  // Show first 3 collapsed, all when expanded
  const visible = expanded ? leads : leads.slice(0, 3)
  const hasMore = leads.length > 3

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden sm:mb-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 shrink-0" />
          <p className="text-sm font-semibold text-slate-900">
            {leads.length} incomplete booking{leads.length > 1 ? 's' : ''}
          </p>
          <p className="text-sm text-slate-400 hidden sm:block">
            — started the form but didn't finish
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="cursor-pointer shrink-0 text-slate-400 hover:text-slate-600 transition-colors duration-200"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      {/* Lead rows */}
      <div className="divide-y divide-slate-100">
        {visible.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            {/* Identity */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">
                {lead.client_name === 'Unknown' ? (
                  <span className="text-slate-400 italic">Name not provided</span>
                ) : (
                  lead.client_name
                )}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{lead.client_email}</p>
            </div>

            {/* Phone */}
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-sm text-slate-700 font-mono tabular-nums">
                {formatPhone(lead.client_phone)}
              </p>
            </div>

            {/* Time + quick actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">{timeAgo(lead.created_at)}</span>
              {/* SMS shortcut — tel link opens native dialer/messenger */}
              {lead.client_phone && (
                <a
                  href={`sms:${lead.client_phone.replace(/\D/g, '')}`}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                  aria-label={`Text ${lead.client_name}`}
                >
                  Text
                </a>
              )}
              <a
                href={`mailto:${lead.client_email}?subject=Your%20RenewShine%20quote&body=Hi%20${encodeURIComponent(lead.client_name.split(' ')[0])}%2C%0A%0AI%20saw%20you%20started%20a%20booking%20request%20with%20us.%20I%27d%20love%20to%20help%20you%20get%20a%20clean%20scheduled.%0A%0A%E2%80%94%20Grace%2C%20RenewShine`}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                aria-label={`Email ${lead.client_name}`}
              >
                Email
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-700"
        >
          {expanded ? (
            <>Show less <ChevronUp size={13} /></>
          ) : (
            <>Show {leads.length - 3} more <ChevronDown size={13} /></>
          )}
        </button>
      )}

    </div>
  )
}
