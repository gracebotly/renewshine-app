import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow, trustStrip } from './base'

export function customerBookedTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `Your RenewShine clean is confirmed — see you soon`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'Cleaning Service'

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

  const remaining = job.remaining_amount ?? (job.approved_price ?? 0)

  const content = `
    ${badge('Booking confirmed', 'green')}
    ${heading(`${firstName}, you’re all set.`)}
    ${para('Your booking is confirmed. Here’s everything you need for your appointment.')}

    ${infoTable(
      infoRow('Date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Service', serviceLabel) +
      infoRow('Address', job.address ?? '—')
    )}

    ${divider}

    <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">What happens next</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 22px;">
      <tbody>
        <tr>
          <td style="padding:13px 16px;vertical-align:top;width:36px;border-bottom:1px solid #e8f0eb;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">1</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;border-bottom:1px solid #e8f0eb;">We’ll reach out before your appointment to confirm access and any details</td>
        </tr>
        <tr>
          <td style="padding:13px 16px;vertical-align:top;width:36px;border-bottom:1px solid #e8f0eb;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">2</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;border-bottom:1px solid #e8f0eb;">We arrive in your confirmed window and complete every item in your ${serviceLabel}</td>
        </tr>
        <tr>
          <td style="padding:13px 16px;vertical-align:top;width:36px;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">3</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;">${remaining > 0 ? `A payment link for the remaining balance of $${remaining.toFixed(2)} is sent after the clean is complete—not before` : 'Payment will be handled after the clean is complete'}</td>
        </tr>
      </tbody>
    </table>

    ${trustStrip()}
  `

  return {
    subject,
    html: baseTemplate(content, `You’re booked with RenewShine. We’ll see you on ${confirmedDateStr}.`),
  }
}
