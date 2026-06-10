import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow } from './base'

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
  const hasDate      = !!job.confirmed_date

  // ── Confirmed date (Mode B only) ─────────────────────────────────────────
  const confirmedDateStr = hasDate
    ? new Date(job.confirmed_date!).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : ''

  // ── Availability window (Mode A only) ────────────────────────────────────
  const availabilityStr = (() => {
    const start = job.availability_start
      ? new Date(job.availability_start + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short', month: 'long', day: 'numeric',
        })
      : null
    const end = job.availability_end
      ? new Date(job.availability_end + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short', month: 'long', day: 'numeric',
        })
      : null
    if (start && end && start !== end) return `${start} – ${end}`
    if (start) return start
    return 'To be confirmed'
  })()

  // ── Subject ───────────────────────────────────────────────────────────────
  const subject = hasDate
    ? `Your ${serviceLabel} is confirmed for ${confirmedDateStr} — RenewShine`
    : `Deposit received — we’ll confirm your date soon`

  // ── Payment summary (both modes) ─────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // MODE A — No confirmed date: deposit received, date TBD
  // ─────────────────────────────────────────────────────────────────────────
  if (!hasDate) {
    const availCard = `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">What you submitted</p>
      ${infoTable(
        infoRow('Service', serviceLabel) +
        (job.bedrooms && job.bathrooms
          ? infoRow('Home size', `${job.bedrooms} bed / ${job.bathrooms} bath`)
          : '') +
        infoRow('Availability', availabilityStr) +
        infoRow('Arrival window', timePref) +
        infoRow('Address', job.address ?? '—')
      )}`

    const content = `
      ${badge('Deposit received', 'green')}
      ${heading(`Deposit received, ${firstName}.`)}
      ${para(`We’ve got your $${deposit.toFixed(0)} deposit. We’ll reach out shortly to confirm your exact date.`)}

      ${availCard}

      ${paymentCard}

      ${divider}

      ${para(`We’ll contact you within 1 business day to confirm your exact date and arrival window.`)}
    `

    return {
      subject,
      html: baseTemplate(
        content,
        `${firstName}, your deposit is received. We’ll follow up to confirm your exact date.`
      ),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE B — Confirmed date is set: full booking confirmation
  // ─────────────────────────────────────────────────────────────────────────
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
            <span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>If you have priority areas you’d like us to focus on, please let us know in advance.
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

  const content = `
    ${badge('Booking confirmed', 'green')}
    ${heading(`Your ${serviceLabel} is confirmed, ${firstName}.`)}
    ${para(`Your home is in good hands. Here’s everything you need for your appointment.`)}

    ${appointmentCard}
    ${prepCard}

    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">What we provide</p>
    <p style="margin:0 0 24px;font-size:14px;color:#334155;line-height:1.6;padding:14px 18px;border:1px solid #e2e8f0;border-radius:10px;">
      We bring all cleaning supplies and equipment needed for the service. There’s nothing you need to provide.
    </p>

    ${paymentCard}

    ${divider}

    ${para(`You’ll receive a reminder text the day before your appointment.`)}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your ${serviceLabel} is confirmed for ${confirmedDateStr}.`
    ),
  }
}
