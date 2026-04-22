import type { Job } from '@/types/database'
import {
  baseTemplate,
  badge,
  heading,
  para,
  divider,
  ctaButton,
  infoTable,
  infoRow,
  trustStrip,
} from './base'

/**
 * Quote reminder template
 * Fires: when owner clicks "Resend Link" in admin on an approved, unpaid job
 * To: customer (job.client_email)
 * Purpose: Re-engage customer who hasn't paid yet, with urgency framing
 */
export function customerQuoteReminderTemplate(
  job: Job,
  stripeUrl: string
): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]

  const subject = `${firstName}, your RenewShine quote is still open`

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

  const deposit = 100
  const remaining = (job.approved_price ?? 0) - deposit

  const content = `
    ${badge('Quote Still Active', 'amber')}
    ${heading(`${firstName}, your quote is still waiting.`)}
    ${para(`We sent your estimate a little while ago and wanted to follow up. Your price and date window are still open.`)}

    ${infoTable(
      infoRow('Confirmed date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Address', job.address ?? '—') +
      infoRow('Deposit to confirm', `$${deposit}`) +
      infoRow('Balance after clean', `$${remaining}`)
    )}

    <p style="margin:16px 0;font-size:13px;color:#64748b;line-height:1.6;">
      Your date is not confirmed until the deposit is paid. If you have any questions before booking, just reply to this email.
    </p>

    ${trustStrip()}
    ${divider}
    ${ctaButton(`Confirm my appointment for $${deposit}`, stripeUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Questions? Reply to this email and we will get back to you quickly.
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `Your RenewShine quote is still active — pay the $100 deposit to lock in your date.`
    ),
  }
}
