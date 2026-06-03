import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow } from './base'

export function customerSubmittedTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `Your cleaning request has been received — RenewShine`
  const isCommercial = job.type === 'commercial'
  const isPostConstruction = job.service_type === 'post_construction'

  // ── Service label ─────────────────────────────────────────────────────────
  const serviceLabel =
    job.service_type === 'standard'            ? 'Standard Clean'
    : job.service_type === 'deep'              ? 'Deep Clean'
    : job.service_type === 'move_out'          ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'Commercial Cleaning'

  // ── Frequency label ───────────────────────────────────────────────────────
  const frequencyMap: Record<string, string> = {
    one_time:  'One-time',
    weekly:    'Weekly',
    bi_weekly: 'Bi-weekly',
    monthly:   'Monthly',
  }
  const frequencyLabel = job.service_frequency
    ? (frequencyMap[job.service_frequency] ?? job.service_frequency)
    : 'One-time'

  // ── Time preference label ─────────────────────────────────────────────────
  const timePrefMap: Record<string, string> = {
    morning:         'Morning (8am \u2013 12pm)',
    afternoon:       'Afternoon (12pm \u2013 5pm)',
    early_morning:   '8am \u2013 10am',
    mid_morning:     '10am \u2013 12pm',
    noon:            '12pm \u2013 2pm',
    early_afternoon: '2pm \u2013 4pm',
    late_afternoon:  '4pm \u2013 6pm',
    flexible:        'Flexible',
  }
  const timePref = job.availability_time_pref
    ? (timePrefMap[job.availability_time_pref] ?? 'Flexible')
    : 'Flexible'

  // ── Availability dates ────────────────────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const availability =
    job.availability_start && job.availability_end && job.availability_start !== job.availability_end
      ? `${fmtDate(job.availability_start)} \u2013 ${fmtDate(job.availability_end)}`
      : job.availability_start
        ? fmtDate(job.availability_start)
        : null

  // ── Property type label (commercial + post-construction) ──────────────────
  const jobAny = job as any
  const propertyTypeRaw: string | null = jobAny.property_type ?? null
  const propertyOtherDesc: string | null = jobAny.property_other_description ?? null
  const propertyTypeLabel = propertyTypeRaw
    ? propertyTypeRaw === 'other' && propertyOtherDesc
      ? `Other \u2014 ${propertyOtherDesc}`
      : propertyTypeRaw.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null

  // ── Add-ons (residential only — commercial always sends []) ───────────────
  const addOns =
    Array.isArray(job.add_ons) && job.add_ons.length > 0
      ? (job.add_ons as string[]).join(', ')
      : null

  // ── Info rows — conditional per job type ─────────────────────────────────
  let rows = ''

  // Service — always shown
  rows += infoRow('Service', serviceLabel)

  // Business name — commercial and post-construction only
  if ((isCommercial || isPostConstruction) && job.business_name) {
    rows += infoRow('Business', job.business_name)
  }

  // Home size — residential only
  if (!isCommercial && !isPostConstruction && job.bedrooms && job.bathrooms) {
    rows += infoRow('Home size', `${job.bedrooms} bed / ${job.bathrooms} bath`)
  }

  // Square footage — commercial and post-construction only
  if ((isCommercial || isPostConstruction) && job.square_footage) {
    rows += infoRow('Square footage', `${job.square_footage.toLocaleString()} sq ft`)
  }

  // Property type — commercial and post-construction only
  if ((isCommercial || isPostConstruction) && propertyTypeLabel) {
    rows += infoRow('Property type', propertyTypeLabel)
  }

  // Availability dates — all types
  if (availability) {
    rows += infoRow('Availability', availability)
  }

  // Arrival window — all types
  rows += infoRow('Arrival window', timePref)

  // Frequency — all types
  rows += infoRow('Frequency', frequencyLabel)

  // Add-ons — residential only, and only when at least one is selected
  if (addOns) {
    rows += infoRow('Add-ons', addOns)
  }

  // ── "What happens next" steps — exact copy, do not alter ─────────────────
  // Colors are inlined to avoid importing constants not exported from base.ts
  const BRAND       = '#4A7C59'
  const TEXT_DARK   = '#0f172a'
  const STEP_BG     = '#f8faf9'
  const STEP_BORDER = '#d1e7d9'
  const STEP_DIV    = '#e8f0eb'

  const nextSteps = [
    'We review your request and service details',
    'If needed, we\u2019ll contact you to clarify access, timing, photos, or scope',
    'We\u2019ll follow up with personalized next steps for booking',
  ]

  const stepsHtml = `
<p style="margin:0 0 10px;font-size:13px;font-weight:600;color:${TEXT_DARK};text-transform:uppercase;letter-spacing:0.04em;">What happens next</p>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
  style="background:${STEP_BG};border:1px solid ${STEP_BORDER};border-radius:8px;margin:0 0 22px;">
  <tbody>
    ${nextSteps.map((text, i) => {
      const notLast = i < nextSteps.length - 1
      const borderStyle = notLast ? `border-bottom:1px solid ${STEP_DIV};` : ''
      return `
    <tr>
      <td style="padding:13px 16px;vertical-align:middle;width:40px;${borderStyle}">
        <div style="width:24px;height:24px;border-radius:50%;background:${BRAND};color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">${i + 1}</div>
      </td>
      <td style="padding:13px 16px 13px 0;font-size:13px;color:${TEXT_DARK};line-height:1.5;vertical-align:middle;${borderStyle}">${text}</td>
    </tr>`
    }).join('')}
  </tbody>
</table>`

  // ── Assemble content ──────────────────────────────────────────────────────
  const content = `
    ${badge('Request received', 'green')}
    ${heading(`Your request has been confirmed, ${firstName}.`)}
    ${para(`Your request has been received. We'll review your details and follow up as soon as possible — typically within a few hours.`)}

    ${stepsHtml}

    ${divider}

    <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">What you submitted</p>
    ${infoTable(rows)}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `Your RenewShine cleaning request has been received. We\u2019ll be in touch shortly.`
    ),
  }
}
