import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow } from './base'

export function ownerBookedTemplate(job: Job): { subject: string; html: string } {
  const subject = `💰 Deposit Paid — ${job.client_name} is on the calendar`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Commercial / Custom'

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '—'

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

  const remaining = job.remaining_amount ?? ((job.approved_price ?? 0) - 100)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const content = `
    ${badge('Deposit Received — Job Scheduled', 'green')}
    ${heading('A job has been confirmed and is on the calendar.')}
    ${para(`${job.client_name} paid the $100 deposit. The job is now scheduled.`)}
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;">Job summary</p>
    ${infoTable(
      infoRow('Client name', job.client_name) +
      infoRow('Email', job.client_email) +
      infoRow('Phone', job.client_phone ?? '—') +
      infoRow('Address', job.address ?? '—') +
      infoRow('Service', serviceLabel) +
      (job.type === 'residential'
        ? infoRow('Home size', `${job.bedrooms ?? '—'} bed · ${job.bathrooms ?? '—'} bath`)
        : '') +
      infoRow('Confirmed date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Total approved', `$${job.approved_price?.toFixed(2) ?? '—'}`) +
      infoRow('Deposit paid', '$100.00 ✓') +
      infoRow('Remaining balance', `$${remaining.toFixed(2)}`)
    )}
    ${divider}
    ${ctaButton('View Job in Admin →', `${siteUrl}/admin/jobs/${job.id}`)}
  `

  return { subject, html: baseTemplate(content, `${job.client_name} paid the deposit — job is scheduled for ${confirmedDateStr}.`) }
}
