import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider } from './base'

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
  const firstName    = job.client_name.split(' ')[0]
  const serviceLabel = getServiceLabel(job.service_type ?? null)
  const timePref     = getTimePref(job.availability_time_pref ?? null)
  const deposit      = job.deposit_amount ?? 100
  const remaining    = job.remaining_amount ?? Math.max((job.approved_price ?? 0) - deposit, 0)

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : 'your scheduled date'

  const dayName = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', { weekday: 'long' })
    : 'your appointment day'

  const subject = `Booking confirmed — your ${serviceLabel} on ${confirmedDateStr}`

  // ── Appointment details card ─────────────────────────────────────────────
  const appointmentCard = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Appointment details</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;width:40%;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;">Date</td>
          <td style="padding:12px 18px;font-size:15px;font-weight:700;color:#0f172a;vertical-align:middle;">${confirmedDateStr}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;">Arrival window</td>
          <td style="padding:12px 18px;font-size:14px;font-weight:600;color:#0f172a;vertical-align:middle;">${timePref}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;">Service</td>
          <td style="padding:12px 18px;font-size:14px;font-weight:600;color:#0f172a;vertical-align:middle;">${serviceLabel}</td>
        </tr>
        <tr>
          <td style="padding:12px 18px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Address</td>
          <td style="padding:12px 18px;font-size:14px;color:#0f172a;line-height:1.5;vertical-align:top;">${job.address ?? '—'}</td>
        </tr>
      </tbody>
    </table>`

  // ── Before we arrive — prep notes ────────────────────────────────────────
  const prepCard = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Before we arrive</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:13px 18px;font-size:13px;color:#0f172a;line-height:1.6;">
            <span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>Please have floors, countertops, and other surfaces reasonably clear of personal items.
          </td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:13px 18px;font-size:13px;color:#0f172a;line-height:1.6;">
            <span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>If you have priority areas you'd like us to focus on, please let us know in advance.
          </td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:13px 18px;font-size:13px;color:#0f172a;line-height:1.6;">
            <span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>For safety reasons, our team does not move heavy furniture or appliances.
          </td>
        </tr>
        <tr>
          <td style="padding:13px 18px;font-size:13px;color:#0f172a;line-height:1.6;">
            <span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>Pets should be secured if they may be uncomfortable around cleaning equipment.
          </td>
        </tr>
      </tbody>
    </table>`

  // ── Payment summary ──────────────────────────────────────────────────────
  const paymentCard = remaining > 0 ? `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Payment summary</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr style="background:#f0f9f4;border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;font-size:13px;color:#1A2E1F;font-weight:600;vertical-align:middle;">
            Deposit paid
          </td>
          <td style="padding:12px 18px;font-size:14px;font-weight:700;color:#1A2E1F;font-family:'Courier New',monospace;text-align:right;vertical-align:middle;">
            $${deposit.toFixed(2)} ✓
          </td>
        </tr>
        <tr>
          <td style="padding:12px 18px;font-size:13px;color:#64748b;vertical-align:middle;">
            Remaining balance <span style="color:#94a3b8;">(due after service)</span>
          </td>
          <td style="padding:12px 18px;font-size:14px;font-weight:600;color:#64748b;font-family:'Courier New',monospace;text-align:right;vertical-align:middle;">
            $${remaining.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>` : ''

  const content = `
    ${badge('Booking confirmed', 'green')}
    ${heading(`Your ${serviceLabel} is officially scheduled, ${firstName}.`)}
    ${para(`We look forward to taking care of your home. Here's everything you need for your appointment.`)}

    ${appointmentCard}
    ${prepCard}

    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">What we provide</p>
    <p style="margin:0 0 24px;font-size:14px;color:#334155;line-height:1.6;padding:14px 18px;border:1px solid #e2e8f0;border-radius:10px;">
      We bring all cleaning supplies and equipment needed for the service. There's nothing you need to provide.
    </p>

    ${paymentCard}

    ${divider}

    ${para(`We'll reach out 48 hours before your appointment to confirm access and go over any final details.`)}
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
      Questions before ${dayName}? Reply to this email or text us at
      <a href="sms:+17712539204" style="color:#4A7C59;text-decoration:none;">(771) 253-9204</a>.
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your ${serviceLabel} is confirmed for ${confirmedDateStr}. Arrival window: ${timePref}.`
    ),
  }
}
