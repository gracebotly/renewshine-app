import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow, trustStrip } from './base'

export function customerBookedTemplate(job: Job): { subject: string; html: string } {
  const subject = `You're booked — RenewShine is confirmed`
  const firstName = job.client_name.split(' ')[0]

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'detailed' ? 'Detailed Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Cleaning Service'

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

  <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#0f172a;">What to expect on service day</p>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
    <tbody>
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">🕐</td>
        <td style="padding:10px 0 10px 10px;vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">We arrive in your confirmed window</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">${timePref} on ${confirmedDateStr}. No need to wait around — we'll get started the moment we arrive.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">✅</td>
        <td style="padding:10px 0 10px 10px;vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">We handle everything on your service checklist</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Every task included in your ${serviceLabel} will be completed. We reviewed your photos — we arrive prepared.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">💳</td>
        <td style="padding:10px 0 10px 10px;vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Pay the remaining balance only after the clean</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">You'll receive a payment link for $${remaining.toFixed(2)} once the job is complete. Not before.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">💬</td>
        <td style="padding:10px 0 10px 10px;vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Questions before your appointment?</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Just reply to this email. We respond quickly.</p>
        </td>
      </tr>
    </tbody>
  </table>

  ${trustStrip()}
`

  return { subject, html: baseTemplate(content, `You're booked! Your cleaner arrives ${confirmedDateStr}.`) }
}
