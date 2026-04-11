import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow } from './base'

export function customerBookedTemplate(job: Job): { subject: string; html: string } {
  const subject = `You're booked — RenewShine is confirmed`
  const firstName = job.client_name.split(' ')[0]

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Cleaning Service'

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '—'

  const timePref =
    job.availability_time_pref === 'morning' ? 'Morning (8am–12pm)'
    : job.availability_time_pref === 'afternoon' ? 'Afternoon (12pm–5pm)'
    : 'Flexible (Any Time)'

  const remaining = job.remaining_amount ?? ((job.approved_price ?? 0) - 100)

  const content = `
    ${badge("You're All Set!", 'green')}
    ${heading(`${firstName}, your clean is confirmed.`)}
    ${para('Your deposit has been received and your booking is locked in. Here are your full details:')}
    ${infoTable(
      infoRow('Confirmed date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Service', serviceLabel) +
      infoRow('Address', job.address ?? '—') +
      infoRow('Deposit paid', '$100.00 ✓') +
      infoRow('Remaining balance', `$${remaining.toFixed(2)} (due after clean)`)
    )}
    ${divider}
    ${para('Your cleaner will arrive within the confirmed time window. The remaining balance is due only after the job is complete — no surprises.')}
    ${para('Questions before your appointment? Reply to this email and we\'ll get back to you quickly.')}
  `

  return { subject, html: baseTemplate(content, `You're booked! Your cleaner arrives ${confirmedDateStr}.`) }
}
