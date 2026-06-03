import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, badge, heading, para, ctaButton, divider } from './base'

export function customerQuoteTemplate(job: Job, stripeUrl: string, depositAmountOverride?: number): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const serviceLabel =
    job.service_type === 'standard'            ? 'Standard Clean'
    : job.service_type === 'deep'              ? 'Deep Clean'
    : job.service_type === 'move_out'          ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'Cleaning Service'
  const subject = `Your ${serviceLabel} quote is ready — RenewShine`

  const timePrefMap: Record<string, string> = {
    morning:         '8am – 12pm',
    afternoon:       '12pm – 5pm',
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

  // Quote email always shows the availability window the customer submitted.
  // confirmed_date is ONLY used in customer-booked.ts (Template 4, post-deposit).
  // Do not add hasConfirmedDate logic back here.
  const availabilityWindowStr = (() => {
    const start = job.availability_start
      ? new Date(job.availability_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : null
    const end = job.availability_end
      ? new Date(job.availability_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null
    if (start && end && start !== end) return `${start} – ${end}`
    if (start) return start
    return 'Dates to be confirmed'
  })()

  const appointmentLine = timePref !== 'Flexible'
    ? `${availabilityWindowStr} · ${timePref}`
    : availabilityWindowStr

  const approvedPrice = job.approved_price ?? 0
  // Use the passed deposit amount, then fall back to job.deposit_amount, then 100
  const depositAmount = depositAmountOverride ?? job.deposit_amount ?? 100
  const remainingAmount = Math.max(approvedPrice - depositAmount, 0)

  const totalDisplay = `$${approvedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const depositDisplay = `$${depositAmount.toFixed(2)}`
  const remainingDisplay = `$${remainingAmount.toFixed(2)}`

  const bedroomLine =
    job.bedrooms
      ? `${job.bedrooms} Bedroom${job.bedrooms !== 1 ? 's' : ''} · ${job.bathrooms} Bathroom${(job.bathrooms ?? 0) !== 1 ? 's' : ''}`
      : ''

  const selectedAddOns = ADD_ONS.filter((a) =>
    Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  )

  const addOnRows = selectedAddOns
    .map((a) => `
      <tr>
        <td style="padding:3px 0 3px 0;font-size:13px;color:#334155;line-height:1.5;">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#4A7C59;margin-right:8px;vertical-align:middle;margin-bottom:2px;"></span>${a.label}
        </td>
      </tr>`)
    .join('')

  // ── Section: Appointment ─────────────────────────────────────────────────
  const appointmentSection = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your requested window</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:16px 18px 12px;">
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;line-height:1.3;">${appointmentLine}</p>
            <p style="margin:0 0 12px;font-size:13px;color:#64748b;">${job.address ?? ''}</p>
            <span style="display:inline-block;background:#fef9ec;color:#92600a;font-size:11px;font-weight:600;padding:4px 10px;border-radius:99px;letter-spacing:0.02em;">Exact date confirmed after deposit</span>
          </td>
        </tr>
      </tbody>
    </table>`

  // ── Section: Service details ──────────────────────────────────────────────
  const serviceSection = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your service details</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">${serviceLabel}</p>
            ${bedroomLine ? `<p style="margin:0 0 ${selectedAddOns.length > 0 ? '10px' : '0'};font-size:12px;color:#64748b;">${bedroomLine}</p>` : ''}
            ${selectedAddOns.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${addOnRows}</table>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`

  // ── Section: Payment summary card ────────────────────────────────────────
  const paymentSection = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Payment summary</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 8px;">
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Total service</p>
            <p style="margin:0;font-size:26px;font-weight:700;color:#0f172a;font-family:'Courier New',monospace;letter-spacing:-0.5px;">${totalDisplay}</p>
          </td>
        </tr>
        <tr style="background:#f0f9f4;border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:13px;font-weight:600;color:#1A2E1F;">Due today <span style="font-weight:400;color:#4A7C59;">(deposit)</span></td>
                <td style="text-align:right;font-size:15px;font-weight:700;color:#1A2E1F;font-family:'Courier New',monospace;">${depositDisplay}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:13px;color:#64748b;">Remaining balance <span style="color:#94a3b8;">(after service)</span></td>
                <td style="text-align:right;font-size:13px;font-weight:600;color:#64748b;font-family:'Courier New',monospace;">${remainingDisplay}</td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0 0 24px;font-size:12px;color:#94a3b8;line-height:1.6;">No hidden fees. If anything differs from your submitted photos or request details, we'll confirm with you before proceeding.</p>`

  // ── Section: What happens next ───────────────────────────────────────────
  const nextStepsSection = `
    ${divider}
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 20px;">
      <tbody>
        <tr>
          <td style="padding:13px 16px;vertical-align:middle;width:40px;border-bottom:1px solid #e8f0eb;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">1</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;border-bottom:1px solid #e8f0eb;">Pay the $${depositAmount.toFixed(0)} deposit above to hold your spot</td>
        </tr>
        <tr>
          <td style="padding:13px 16px;vertical-align:middle;width:40px;border-bottom:1px solid #e8f0eb;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">2</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;border-bottom:1px solid #e8f0eb;">We'll confirm your exact date and send a booking confirmation</td>
        </tr>
        <tr>
          <td style="padding:13px 16px;vertical-align:middle;width:40px;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">3</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;">We arrive and handle everything — no surprises</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0;font-size:13px;color:#64748b;text-align:center;line-height:1.6;">Questions? Reach us at <a href="mailto:hello@renewshine.co" style="color:#4A7C59;text-decoration:none;">hello@renewshine.co</a></p>`

  // ── Full email body ───────────────────────────────────────────────────────
  const content = `
    ${badge('Quote ready', 'green')}
    ${heading(`${firstName}, your quote is ready.`)}
    ${para('Review the details below and submit your deposit to secure your appointment.')}

    ${appointmentSection}
    ${serviceSection}
    ${paymentSection}

    ${ctaButton('Confirm Booking', stripeUrl)}

    ${nextStepsSection}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your ${serviceLabel} quote is ready. Submit your deposit to secure your appointment.`
    ),
  }
}
