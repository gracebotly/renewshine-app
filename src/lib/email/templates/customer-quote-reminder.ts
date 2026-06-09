import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow, trustStrip } from './base'

/**
 * Quote follow-up template — merged T6 + T7.
 *
 * Covers two cases:
 *   isRefreshed = false (default): Grace clicked "Resend Link" — link still valid or recently resent
 *   isRefreshed = true:            Grace regenerated an expired link — fresh Stripe URL
 *
 * Both send the same CTA. The only difference is badge color, subject line, and one
 * sentence in the heading. Customer experience is identical: "your quote is open, here's the link."
 *
 * Fires from: src/lib/email/index.ts → sendQuoteReminder() and sendExpiredLinkRecovery()
 * To: customer (job.client_email)
 */
export function customerQuoteReminderTemplate(
  job: Job,
  stripeUrl: string,
  isRefreshed = false
): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]

  const subject = isRefreshed
    ? `${firstName}, your booking link has been refreshed — RenewShine`
    : `${firstName}, your RenewShine quote is still open`

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

  const badgeColor  = isRefreshed ? 'navy' : 'amber'
  const badgeText   = isRefreshed ? 'Fresh link ready' : 'Quote still open'
  const headingText = isRefreshed
    ? `${firstName}, your booking link has been refreshed.`
    : `${firstName}, your quote is still open.`
  const bodyText = isRefreshed
    ? `Your confirmed price and dates are unchanged. Here’s a fresh link.`
    : `Your quote is still available and your dates haven’t been taken. Submitting your payment is what holds your spot on the calendar.`

  const content = `
    ${badge(badgeText, badgeColor)}
    ${heading(headingText)}
    ${para(bodyText)}

    ${infoTable(
      infoRow('Availability', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Address', job.address ?? '—') +
      infoRow('Confirmed price', job.approved_price ? `$${job.approved_price.toFixed(2)}` : '—')
    )}

    ${trustStrip()}
    ${divider}

    ${ctaButton('Reserve My Date', stripeUrl)}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      isRefreshed
        ? `${firstName}, your RenewShine booking link has been refreshed. Price and dates unchanged.`
        : `${firstName}, your RenewShine quote is still open. Reserve your date to hold your spot.`
    ),
  }
}
