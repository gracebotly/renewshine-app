import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, badge, heading, ctaButton, divider } from './base'
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaults'
import { renderTemplate } from '@/lib/templates/render'
import { createServerClient } from '@/lib/supabase/server'
import type { TemplateId } from '@/lib/templates/types'

export async function customerQuoteTemplate(
  job: Job,
  stripeUrl: string,
  depositAmountOverride?: number,
  recurringFrequency?: string,
  recurringPriceOverride?: number,
  customBodyOverride?: string
): Promise<{ subject: string; html: string }> {
  const firstName = job.client_name.split(' ')[0]
  const serviceLabel =
    job.service_type === 'standard'            ? 'Standard Clean'
    : job.service_type === 'deep'              ? 'Deep Clean'
    : job.service_type === 'move_out'          ? 'Move-In/Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'Cleaning Service'
  const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const defaultSubject = `Your ${serviceLabel} quote is ready`

  const timePrefMap: Record<string, string> = {
    morning:         '8am – 12pm',
    afternoon:       '12pm – 5pm',
    early_morning:   '8am – 10am',
    mid_morning:     '10am – 12pm',
    noon:            '12pm – 2pm',
    early_afternoon: '2pm – 4pm',
    late_afternoon:  '4pm – 6pm',
    flexible:        'Flexible',
  }
  const timePref = job.availability_time_pref
    ? (timePrefMap[job.availability_time_pref] ?? 'Flexible')
    : 'Flexible'

  // ── Schedule state ────────────────────────────────────────────────────────
  // State A (default): no confirmed date — show the window the customer asked for.
  // State B: confirmed_date is set — show the real appointment.
  // Trigger is confirmed_date alone. Price and deposit are irrelevant here.
  // This mirrors buildTemplateTokens() in QuoteCard.tsx — the two MUST agree.
  const hasConfirmedDate = Boolean(job.confirmed_date)

  const requestedWindowStr = (() => {
    const startDate = parseDateOnly(job.availability_start)
    const endDate = parseDateOnly(job.availability_end)
    const start = startDate
      ? startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : null
    const end = endDate
      ? endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null
    if (start && end && start !== end) return `${start} – ${end}`
    if (start) return start
    return 'Dates to be confirmed'
  })()

  const requestedLine = timePref !== 'Flexible'
    ? `${requestedWindowStr} · ${timePref}`
    : requestedWindowStr

  const confirmedArrival = job.confirmed_arrival_pref
    ? (timePrefMap[job.confirmed_arrival_pref] ?? '')
    : ''
  const confirmedDateObj = parseDateOnly(job.confirmed_date as unknown as string)
  const confirmedDateStr = confirmedDateObj
    ? confirmedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''
  const confirmedLine = confirmedArrival && confirmedArrival !== 'Flexible'
    ? `${confirmedDateStr} · ${confirmedArrival}`
    : confirmedDateStr

  const scheduleValue = hasConfirmedDate ? confirmedLine : requestedLine

  const approvedPrice = job.approved_price ?? 0
  // Use the passed deposit amount, then fall back to job.deposit_amount, then 100
  const depositAmount = depositAmountOverride ?? job.deposit_amount ?? 100
  const remainingAmount = Math.max(approvedPrice - depositAmount, 0)

  const totalDisplay = `$${approvedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const depositDisplay = `$${depositAmount.toFixed(2)}`
  const remainingDisplay = `$${remainingAmount.toFixed(2)}`

  // ── Recurring pricing ─────────────────────────────────────────────────────
  const FREQ_CONFIG: Record<string, { label: string; mult: number }> = {
    weekly:   { label: 'Weekly',    mult: 0.80 },
    biweekly: { label: 'Bi-weekly', mult: 0.85 },
    monthly:  { label: 'Monthly',   mult: 0.90 },
  }
  const activeFreq = recurringFrequency ?? (
    job.service_frequency && ['weekly', 'biweekly', 'monthly'].includes(job.service_frequency)
      ? job.service_frequency
      : null
  )
  const freqCfg   = activeFreq ? FREQ_CONFIG[activeFreq] : null
  const recurringPriceNum = freqCfg
    ? (recurringPriceOverride && recurringPriceOverride > 0
        ? Math.round(recurringPriceOverride)
        : Math.round(approvedPrice * freqCfg.mult))
    : null

  const bedroomLine =
    job.bedrooms
      ? `${job.bedrooms} Bedroom${job.bedrooms !== 1 ? 's' : ''} · ${job.bathrooms} Bathroom${(job.bathrooms ?? 0) !== 1 ? 's' : ''}`
      : ''

  const scheduleTemplateId = hasConfirmedDate
    ? 'quote_dep_schedule_confirmed'
    : 'quote_dep_schedule_requested'

  const [quoteTemplate, bulletsTemplate, nextStepsTemplate, scheduleTemplate] = await Promise.all([
    getQuoteEmailTemplate('quote_dep'),
    getQuoteEmailTemplate('quote_dep_bullets'),
    getQuoteEmailTemplate('quote_dep_next_steps'),
    getQuoteEmailTemplate(scheduleTemplateId),
  ])

  // Three-line format: inline label / card header / badge (badge optional).
  // A missing or blank third line renders no badge — do not emit an empty pill.
  const scheduleLines = (scheduleTemplate.body ?? '').split(/\r?\n/)
  const scheduleLabel  = (scheduleLines[0] ?? '').trim() || (hasConfirmedDate ? 'Appointment' : 'Requested window')
  const scheduleHeader = (scheduleLines[1] ?? '').trim() || scheduleLabel
  const scheduleBadge  = (scheduleLines[2] ?? '').trim()

  const templateTokens = {
    firstName,
    service: serviceLabel,
    serviceDetail: [serviceLabel, bedroomLine].filter(Boolean).join(' • '),
    bedBath: bedroomLine ? ` — ${bedroomLine}` : '',
    scheduleLabel,
    schedule: scheduleValue,
    // Legacy alias — quote_no and any un-migrated saved rows still reference it.
    availabilityWindow: scheduleValue,
    timePreference: timePref,
    date: confirmedDateStr,
    arrivalWindow: confirmedArrival,
    address: job.address ?? 'on file',
    total: totalDisplay,
    deposit: depositDisplay,
    balance: remainingDisplay,
    recurringLine: freqCfg && recurringPriceNum
      ? `Recurring rate:\n${freqCfg.label}: $${recurringPriceNum.toLocaleString()}/visit`
      : '',
  }
  const subject = renderTemplate(quoteTemplate.subject ?? defaultSubject, templateTokens)
  // Per-job override replaces ONLY the prose block — the exact region the admin
  // textarea displays. Every styled section below (schedule card, service card,
  // payment summary, trust bullets, CTA, next steps) is preserved.
  const effectiveQuoteBody = customBodyOverride && customBodyOverride.trim()
    ? customBodyOverride
    : renderTemplate(quoteTemplate.body, templateTokens)

  const quoteBodyHtml = bodyToParagraphs(
    effectiveQuoteBody.replace('[deposit link included]', stripeUrl),
    escapeHtml
  )
  const trustBulletRows = splitRenderedLines(renderTemplate(bulletsTemplate.body, templateTokens))
    .map(line => `<tr><td style="padding:3px 0;font-size:13px;color:#0f172a;line-height:1.5;"><span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>${escapeHtml(line)}</td></tr>`)
    .join('')
  const nextStepRows = splitRenderedLines(renderTemplate(nextStepsTemplate.body, templateTokens))
    .map((line, index, rows) => `
        <tr>
          <td style="padding:13px 16px;vertical-align:middle;width:40px;${index < rows.length - 1 ? 'border-bottom:1px solid #e8f0eb;' : ''}">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">${index + 1}</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;${index < rows.length - 1 ? 'border-bottom:1px solid #e8f0eb;' : ''}">${escapeHtml(line)}</td>
        </tr>`)
    .join('')


  const selectedAddOns = ADD_ONS.filter((a) =>
    Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  )

  const addOnRows = selectedAddOns
    .map((a) => `
      <tr>
        <td style="padding:3px 0 3px 0;font-size:13px;color:#334155;line-height:1.5;">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#4A7C59;margin-right:8px;vertical-align:middle;margin-bottom:2px;"></span>${a.label}
        </td>
      </tr>`)
    .join('')

  type QuoteLineItem = { label: string; price: number }
  const parseLineItems = (raw: unknown): QuoteLineItem[] => {
    if (!Array.isArray(raw)) return []
    return raw.filter((i): i is QuoteLineItem =>
      !!i && typeof i === 'object' &&
      typeof (i as Record<string, unknown>).label === 'string' &&
      typeof (i as Record<string, unknown>).price === 'number'
    )
  }
  const lineItems = parseLineItems((job as unknown as { quote_line_items?: unknown }).quote_line_items)
  const hasLineItems = lineItems.length > 0

  const lineItemRows = lineItems.map(li => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 18px;font-size:13px;color:#0f172a;line-height:1.5;">${escapeHtml(li.label)}</td>
      <td style="padding:10px 18px;text-align:right;font-size:13px;font-weight:600;color:#0f172a;font-family:'Courier New',monospace;white-space:nowrap;">$${li.price.toLocaleString()}</td>
    </tr>`).join('')

  // ── Section: Appointment ─────────────────────────────────────────────────
  const appointmentSection = hasLineItems ? `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your service locations</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>${lineItemRows}</tbody>
    </table>` : `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(scheduleHeader)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:16px 18px ${scheduleBadge ? '12px' : '16px'};">
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;line-height:1.3;">${escapeHtml(scheduleValue)}</p>
            <p style="margin:0${scheduleBadge ? ' 0 12px' : ''};font-size:13px;color:#64748b;">${escapeHtml(job.address ?? '')}</p>
            ${scheduleBadge ? `<span style="display:inline-block;background:#fef9ec;color:#92600a;font-size:11px;font-weight:600;padding:4px 10px;border-radius:99px;letter-spacing:0.02em;">${escapeHtml(scheduleBadge)}</span>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`

  // ── Section: Service details ──────────────────────────────────────────────
  const serviceSection = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your service details</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">${serviceLabel}</p>
            ${!hasLineItems && bedroomLine ? `<p style="margin:0 0 ${selectedAddOns.length > 0 ? '10px' : '0'};font-size:12px;color:#64748b;">${bedroomLine}</p>` : ''}
            ${!hasLineItems && selectedAddOns.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${addOnRows}</table>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`

  // ── Section: Payment summary card ────────────────────────────────────────
  const paymentSection = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Payment summary</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 8px;">
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Total service</p>
            <p style="margin:0;font-size:26px;font-weight:700;color:#0f172a;font-family:'Courier New',monospace;letter-spacing:-0.5px;">${totalDisplay}</p>
          </td>
        </tr>
        <tr style="background:#f0f9f4;border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:13px;font-weight:600;color:#1A2E1F;">Due today <span style="font-weight:400;color:#4A7C59;">(deposit)</span></td>
                <td style="text-align:right;font-size:15px;font-weight:700;color:#1A2E1F;font-family:'Courier New',monospace;">${depositDisplay}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:13px;color:#64748b;">Remaining balance <span style="color:#94a3b8;">(after service)</span></td>
                <td style="text-align:right;font-size:13px;font-weight:600;color:#64748b;font-family:'Courier New',monospace;">${remainingDisplay}</td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0 0 24px;font-size:12px;color:#94a3b8;line-height:1.6;">No hidden fees. Fully insured cleaning professionals. If anything differs from the photos provided, we'll discuss it with you before any additional work is performed.</p>`

  // ── Section: What happens next ───────────────────────────────────────────
  const nextStepsSection = `
    ${divider}
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 20px;">
      <tbody>${nextStepRows}
      </tbody>
    </table>
    `

  // ── Full email body ───────────────────────────────────────────────────────
  const content = `
    ${badge('Quote ready', 'green')}
    ${heading(`${firstName}, your quote is ready.`)}
    ${quoteBodyHtml}

    ${appointmentSection}
    ${serviceSection}
    ${paymentSection}


    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 20px;padding:16px 20px;">
      <tr>
        <td>
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#4A7C59;text-transform:uppercase;letter-spacing:0.08em;">Why homeowners choose RenewShine</p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${trustBulletRows}
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton('Pay Deposit', stripeUrl)}

    ${nextStepsSection}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your ${serviceLabel} quote is ready. Reserve your date with the payment below.`
    ),
  }
}


function splitRenderedLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
}

function bodyToParagraphs(value: string, escapeHtml: (value: string) => string): string {
  return value
    .trim()
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;white-space:pre-line;">${escapeHtml(p)}</p>`)
    .join('')
}

// Date-only strings ('2026-07-31') parse as UTC midnight, which renders as the
// previous day in any negative-offset timezone. Anchor to noon so the calendar
// date is stable regardless of where this runs.
function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null
  const dayPart = String(value).split(/[T ]/)[0]
  const d = new Date(`${dayPart}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

async function getQuoteEmailTemplate(
  templateId: Extract<
    TemplateId,
    | 'quote_dep'
    | 'quote_dep_bullets'
    | 'quote_dep_next_steps'
    | 'quote_dep_schedule_requested'
    | 'quote_dep_schedule_confirmed'
  >
) {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('message_templates')
      .select('subject, body')
      .eq('template_id', templateId)
      .eq('channel', 'email')
      .maybeSingle()
    if (data) return data
  } catch {
    // fall through to defaults
  }
  const def = DEFAULT_TEMPLATES.find(t => t.templateId === templateId && t.channel === 'email')!
  return { subject: def.subject, body: def.body }
}
