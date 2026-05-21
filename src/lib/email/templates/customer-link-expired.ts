import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow, trustStrip } from './base'

/**
 * Expired link recovery template
 * Fires: when owner regenerates a Stripe link for an approved, unpaid job
 * To: customer (job.client_email)
 * Purpose: Recover a lost booking with a fresh payment link
 */
export function customerLinkExpiredTemplate(
  job: Job,
  newStripeUrl: string
): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `${firstName}, your booking link has been refreshed`

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '—'

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

  const content = `
    ${badge('New link ready', 'navy')}
    ${heading(`${firstName}, your previous link expired.`)}
    ${para(`No problem — we’ve sent a fresh link. Your confirmed price of $${job.approved_price?.toFixed(2) ?? '—'} and your date are still held for you.`)}

    ${infoTable(
      infoRow('Confirmed price', job.approved_price ? `$${job.approved_price.toFixed(2)}` : '—') +
      infoRow('Your date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Address', job.address ?? '—')
    )}

    <div style="margin:20px 0;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">
        Your price is unchanged. Your date is still available.
      </p>
      <p style="margin:6px 0 0;font-size:13px;color:#166534;">
        This link is valid for 48 hours.
      </p>
    </div>

    ${trustStrip()}
    ${divider}

    ${ctaButton('Confirm my appointment', newStripeUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Have a question? Text us at (771) 253-9204.
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your RenewShine booking link has been refreshed. Your price and date are unchanged.`
    ),
  }
}
