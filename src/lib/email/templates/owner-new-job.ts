import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow } from './base'

export function ownerNewJobTemplate(job: Job): { subject: string; html: string } {
  const subject = `New booking request — ${job.client_name} (${job.service_type ?? 'commercial'})`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Commercial / Custom'

  const availWindow =
    job.availability_start && job.availability_end
      ? `${job.availability_start} → ${job.availability_end}`
      : '—'

  const timePref =
    job.availability_time_pref === 'morning' ? 'Morning (8am–12pm)'
    : job.availability_time_pref === 'afternoon' ? 'Afternoon (12pm–5pm)'
    : job.availability_time_pref === 'flexible' ? 'Flexible (Any Time)'
    : '—'

  const priceRange =
    job.estimated_price_low && job.estimated_price_high
      ? `$${job.estimated_price_low} – $${job.estimated_price_high}`
      : 'Manual quote required'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const content = `
    ${badge('New Booking Request', 'amber')}
    ${heading('A new quote request just came in.')}
    ${para('Review the details below, then open the admin panel to approve and send the deposit link.')}
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
