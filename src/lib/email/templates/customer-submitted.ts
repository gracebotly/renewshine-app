import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow, step } from './base'

export function customerSubmittedTemplate(job: Job): { subject: string; html: string } {
  const subject = `We received your request — RenewShine`
  const firstName = job.client_name.split(' ')[0]

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'detailed' ? 'Detailed Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Commercial Cleaning'

  const addOnsCount = Array.isArray(job.add_ons) ? job.add_ons.length : 0

  const timePrefMap: Record<string, string> = {
    morning:         'Morning (8am–12pm)',
    afternoon:       'Afternoon (12pm–5pm)',
    early_morning:   '8am – 10am',
    mid_morning:     '10am – 12pm',
    noon:            '12pm – 2pm',
    early_afternoon: '2pm – 4pm',
    late_afternoon:  '4pm – 6pm',
    flexible:        'Flexible (Any Time)',
  }
  const timePref = job.availability_time_pref
    ? (timePrefMap[job.availability_time_pref] ?? 'Flexible (Any Time)')
    : 'Flexible (Any Time)'

  const availWindow =
    job.availability_start && job.availability_end
      ? `${job.availability_start} to ${job.availability_end}`
      : '—'

  const steps = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
      <tbody>
        ${step(1, 'Request submitted ✓', 'Your details and photos are with us.')}
        ${step(2, 'We review your space (within 1–4 hrs)', 'We look at your photos, confirm the price, and set a date.')}
        ${step(3, 'You approve and pay a $100 deposit', 'Only after you\'re happy with the confirmed price.')}
      </tbody>
    </table>`

  const content = `
    ${badge('Request Received', 'green')}
    ${heading(`Thanks, ${firstName}!`)}
    ${para(`We've received your cleaning request and we're reviewing it now. You'll hear from us within 1–4 hours with a confirmed price and available date.`)}
    ${steps}
    ${divider}
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;">Your submission summary</p>
    ${infoTable(
      infoRow('Service', serviceLabel) +
      (job.type === 'residential'
        ? infoRow('Home size', `${job.bedrooms ?? '—'} bed · ${job.bathrooms ?? '—'} bath`)
        : '') +
      infoRow('Add-ons', addOnsCount > 0 ? `${addOnsCount} selected` : 'None') +
      infoRow('Availability', availWindow) +
      infoRow('Time preference', timePref) +
      infoRow('Frequency', job.service_frequency ?? '—')
    )}
    ${para('No payment is needed right now. We\'ll send you a full quote to review before anything is charged.')}
  `

  return { subject, html: baseTemplate(content, `Got it! We'll review your home and confirm your price within 1–4 hours.`) }
}
