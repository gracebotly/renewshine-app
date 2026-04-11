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

  const subject = `${firstName}, your spot is still available — but not for long`

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '—'

  const timePref =
    job.availability_time_pref === 'morning' ? 'Morning (8am–12pm)'
    : job.availability_time_pref === 'afternoon' ? 'Afternoon (12pm–5pm)'
    : 'Flexible (Any Time)'

  const deposit = 100
  const remaining = (job.approved_price ?? 0) - deposit

  const content = `
    ${badge('Your Quote is Still Active', 'amber')}
    ${heading(`${firstName}, we still have your date available.`)}
    ${para(`We sent your quote a little while ago and wanted to follow up. Your confirmed price of $${job.approved_price} is still valid — and your date window is still open.`)}

    <div style="margin:20px 0;padding:16px;background:#fef9ec;border:1px solid #fde68a;border-radius:8px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#92400e;">
        ⚠️ Your date is not reserved until the deposit is paid.
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#92400e;">
        We can't hold your spot indefinitely. Once this window closes, we'll need to open your date to other customers.
      </p>
    </div>

    ${infoTable(
      infoRow('Confirmed price', `$${job.approved_price}`) +
      infoRow('Deposit due now', `$${deposit}`) +
      infoRow('Remaining (after clean)', `$${remaining}`) +
      infoRow('Your date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Address', job.address ?? '—')
    )}

    ${trustStrip()}
    ${divider}
    ${ctaButton('Pay $100 Deposit — Reserve My Spot →', stripeUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Questions? Just reply to this email. We're happy to help.
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
