import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow, trustStrip } from './base'

/**
 * Quote reminder template
 * Fires: when owner clicks "Resend Link" in admin on an approved, unpaid job
 * To: customer (job.client_email)
 * Purpose: Re-engage customer who hasn't confirmed yet
 */
export function customerQuoteReminderTemplate(
  job: Job,
  stripeUrl: string
): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `${firstName}, your RenewShine quote is still available`

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
    ${badge('Quote still active', 'amber')}
    ${heading(`${firstName}, your quote is still open.`)}
    ${para('We sent your estimate and wanted to follow up. Your confirmed price and date are still available — but your date isn’t held until you confirm.')}

    ${infoTable(
      infoRow('Date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Address', job.address ?? '—') +
      infoRow('Confirmed price', job.approved_price ? `$${job.approved_price.toFixed(2)}` : '—')
    )}

    ${trustStrip()}
    ${divider}

    ${ctaButton('Confirm my appointment', stripeUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Have a question? Text us at (771) 253-9204.
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your RenewShine quote is still open. Confirm your appointment to lock in your date.`
    ),
  }
}
