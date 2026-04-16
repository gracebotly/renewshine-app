import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow } from './base'

export function ownerNewJobTemplate(job: Job): { subject: string; html: string } {
  const subject = `⚡ New Request — ${job.client_name} needs review`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Commercial / Custom'

  const availWindow =
    job.availability_start && job.availability_end
      ? `${job.availability_start} → ${job.availability_end}`
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

  const priceRange =
    job.estimated_price_low && job.estimated_price_high
      ? `$${job.estimated_price_low} – $${job.estimated_price_high}`
      : 'Manual quote required'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const content = `
    ${badge('New Booking Request', 'amber')}
    ${heading('New request — needs your review.')}
    ${para('A customer submitted photos and their availability window. Open the admin panel, review the photos, set a confirmed date and price, then send the deposit link.')}
    ${infoTable(
      infoRow('Client name', job.client_name) +
      infoRow('Email', job.client_email) +
      infoRow('Phone', job.client_phone ?? '—') +
      infoRow('Job type', job.type ?? '—') +
      infoRow('Service', serviceLabel) +
      (job.type === 'residential'
        ? infoRow('Home size', `${job.bedrooms ?? '—'} bed · ${job.bathrooms ?? '—'} bath`)
        : '') +
      (job.type === 'commercial' && job.business_name
        ? infoRow('Business', job.business_name)
        : '') +
      infoRow('Address', job.address ?? '—') +
      infoRow('Frequency', job.service_frequency ?? '—') +
      infoRow('Availability', availWindow) +
      infoRow('Time preference', timePref) +
      infoRow('Estimated price', priceRange)
    )}
    ${divider}
    ${ctaButton('Review in Admin →', `${siteUrl}/admin/jobs/${job.id}`)}
  `

  return { subject, html: baseTemplate(content, `New request from ${job.client_name} — review now`) }
}
