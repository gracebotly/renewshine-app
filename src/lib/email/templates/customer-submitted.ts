import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow, step } from './base'

export function customerSubmittedTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `Got it, ${firstName}. We're reviewing your request now.`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
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


  const content = `
    ${badge('Request Received', 'green')}
    ${heading(`Thanks, ${firstName}.`)}
    ${para(`Your request is in. We&apos;re reviewing your photos now and will be in touch as soon as possible. No payment is needed until you approve the quote.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
      <tbody>
        ${step(1, 'Request received', 'Your photos and details are with us now.')}
        ${step(2, 'We review your photos', 'We confirm your price and set a date — before you pay anything.')}
        ${step(3, 'You approve and pay a $100 deposit', 'Nothing is charged until you see the quote and agree.')}
      </tbody>
    </table>

    ${divider}

    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">What you submitted</p>
    ${infoTable(
      infoRow('Service', serviceLabel) +
      (job.type === 'residential'
        ? infoRow('Home size', `${job.bedrooms ?? '?'} bed / ${job.bathrooms ?? '?'} bath`)
        : '') +
      infoRow('Add-ons', addOnsCount > 0 ? `${addOnsCount} selected` : 'None') +
      infoRow('Time preference', timePref) +
      infoRow('Frequency', job.service_frequency ?? 'One-time')
    )}
  `

  return { subject, html: baseTemplate(content, `Got it! We're reviewing your photos and will be in touch as soon as possible.`) }
}
