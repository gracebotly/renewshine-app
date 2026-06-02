import type { Job } from '@/types/database'
import { baseTemplate, heading, para, divider } from './base'

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')           return 'Standard Clean'
  if (serviceType === 'deep')               return 'Deep Clean'
  if (serviceType === 'move_out')           return 'Move-In / Move-Out'
  if (serviceType === 'post_construction')  return 'Post-Construction'
  return 'Cleaning Service'
}

function getTimePref(pref: string | null): string {
  const map: Record<string, string> = {
    morning:         '8am – 12pm',
    afternoon:       '12pm – 5pm',
    early_morning:   '8am – 10am',
    mid_morning:     '10am – 12pm',
    noon:            '12pm – 2pm',
    early_afternoon: '2pm – 4pm',
    late_afternoon:  '4pm – 6pm',
    flexible:        'Morning to Afternoon',
  }
  return pref ? (map[pref] ?? 'Morning to Afternoon') : 'Morning to Afternoon'
}

export function customerBookedTemplate(job: Job): { subject: string; html: string } {
  const firstName      = job.client_name.split(' ')[0]
  const serviceLabel   = getServiceLabel(job.service_type ?? null)
  const timePref       = getTimePref(job.availability_time_pref ?? null)

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : 'your scheduled date'

  // Short day name for the reminder line e.g. "Friday"
  const dayName = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', { weekday: 'long' })
    : 'your appointment day'

  const subject = `${firstName}, your ${serviceLabel} is confirmed — ${confirmedDateStr}`

  const content = `
    ${heading(`Hi ${firstName} — your ${serviceLabel} is confirmed.`)}

    ${para(`Your appointment is set for <strong style="color:#0f172a;">${confirmedDateStr}</strong>, arrival window <strong style="color:#0f172a;">${timePref}</strong>.`)}

    ${para(`Here are a few quick notes before we arrive:`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:10px;margin:0 0 22px;padding:0;">
      <tbody>
        <tr><td style="padding:14px 20px;font-size:13px;color:#0f172a;line-height:1.6;border-bottom:1px solid #e8f0eb;">
          <span style="color:#4A7C59;font-weight:700;">·</span>&nbsp; Please have floors, countertops, and other surfaces reasonably clear of personal items.
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#0f172a;line-height:1.6;border-bottom:1px solid #e8f0eb;">
          <span style="color:#4A7C59;font-weight:700;">·</span>&nbsp; If you have any priority areas you'd like us to focus on, just let me know beforehand.
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#0f172a;line-height:1.6;border-bottom:1px solid #e8f0eb;">
          <span style="color:#4A7C59;font-weight:700;">·</span>&nbsp; For safety reasons, we don't move heavy furniture or appliances.
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#0f172a;line-height:1.6;">
          <span style="color:#4A7C59;font-weight:700;">·</span>&nbsp; Pets should be secured if they may be uncomfortable around cleaning equipment.
        </td></tr>
      </tbody>
    </table>

    ${para(`We'll bring all cleaning supplies and equipment needed for the service.`)}

    ${para(`We'll also give you a call 48 hours before your appointment to go over any last details.`)}

    ${divider}

    ${para(`If you have any questions before ${dayName}, feel free to reply to this email.`)}

    <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
      — <strong style="color:#0f172a;">Grace</strong><br/>
      <span style="color:#4A7C59;font-weight:500;">RenewShine</span>
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your ${serviceLabel} is confirmed for ${confirmedDateStr}. We'll see you then.`
    ),
  }
}
