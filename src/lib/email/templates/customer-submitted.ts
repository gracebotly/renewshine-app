import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow, step } from './base'

export function customerSubmittedTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `Got it, ${firstName}. We're reviewing your request now.`
  const isCommercial = job.type === 'commercial' || job.service_type === 'post_construction'

  // ── Service label ────────────────────────────────────────────────────────
  const serviceLabel =
    job.service_type === 'standard'          ? 'Standard Clean'
    : job.service_type === 'deep'            ? 'Deep Clean'
    : job.service_type === 'move_out'        ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'Commercial Cleaning'

  // ── Frequency label ──────────────────────────────────────────────────────
  const frequencyMap: Record<string, string> = {
    one_time:  'One-time',
    weekly:    'Weekly',
    bi_weekly: 'Bi-weekly',
    monthly:   'Monthly',
  }
  const frequencyLabel = job.service_frequency
    ? (frequencyMap[job.service_frequency] ?? job.service_frequency)
    : 'One-time'

  // ── Time preference label ────────────────────────────────────────────────
  const timePrefMap: Record<string, string> = {
    morning:         'Morning (8am – 12pm)',
    afternoon:       'Afternoon (12pm – 5pm)',
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

  // ── Availability dates ───────────────────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const availability =
    job.availability_start && job.availability_end && job.availability_start !== job.availability_end
      ? `${fmtDate(job.availability_start)} – ${fmtDate(job.availability_end)}`
      : job.availability_start
        ? fmtDate(job.availability_start)
        : null

  // ── Add-ons ──────────────────────────────────────────────────────────────
  const addOns = Array.isArray(job.add_ons) && job.add_ons.length > 0
    ? (job.add_ons as string[]).join(', ')
    : null

  // ── Build info rows ──────────────────────────────────────────────────────
  let rows = ''

  rows += infoRow('Service', serviceLabel)

  if (isCommercial && job.business_name) {
    rows += infoRow('Business', job.business_name)
  }

  if (!isCommercial && job.bedrooms && job.bathrooms) {
    rows += infoRow('Home size', `${job.bedrooms} bed / ${job.bathrooms} bath`)
  }

  if (addOns) {
    rows += infoRow('Add-ons', addOns)
  }

  if (availability) {
    rows += infoRow('Availability', availability)
  }

  rows += infoRow('Arrival window', timePref)
  rows += infoRow('Frequency', frequencyLabel)

  if (job.address) {
    rows += infoRow('Address', job.address)
  }

  // ── Step 3 wording — no deposit amount shown to customer ─────────────────
  const step3Title = 'You review and approve your quote'
  const step3Desc = 'Nothing is charged until you see the confirmed price and agree.'

  const content = `
    ${badge('Request Received', 'green')}
    ${heading(`Thanks, ${firstName}.`)}
    ${para(`Your request is in. We&apos;re reviewing your photos now and will be in touch as soon as possible. No payment is needed until you approve the quote.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
      <tbody>
        ${step(1, 'Request received', 'Your photos and details are with us now.')}
        ${step(2, 'We review your photos', 'We confirm your price and set a date — before you pay anything.')}
        ${step(3, step3Title, step3Desc)}
      </tbody>
    </table>

    ${divider}

    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">What you submitted</p>
    ${infoTable(rows)}
  `

  return {
    subject,
    html: baseTemplate(content, `Got it! We're reviewing your photos and will be in touch as soon as possible.`),
  }
}
