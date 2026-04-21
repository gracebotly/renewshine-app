import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow, lineItem, trustStrip } from './base'

export function customerQuoteTemplate(job: Job, stripeUrl: string): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `${firstName}, your RenewShine quote is ready — $${job.approved_price}`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Cleaning Service'

  let basePrice: number | null = null
  if (job.service_type === 'standard') {
    basePrice = Math.max((job.bedrooms ?? 0) * 60 + (job.bathrooms ?? 0) * 40, 200)
  } else if (job.service_type === 'deep') {
    basePrice = Math.max((job.bedrooms ?? 0) * 90 + (job.bathrooms ?? 0) * 55, 400)
  }

  const selectedAddOns = ADD_ONS.filter((a) =>
    Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  )

  const timePrefMap: Record<string, string> = {
    morning:         'Morning · 8am – 12pm',
    afternoon:       'Afternoon · 12pm – 5pm',
    early_morning:   '8am – 10am',
    mid_morning:     '10am – 12pm',
    noon:            '12pm – 2pm',
    early_afternoon: '2pm – 4pm',
    late_afternoon:  '4pm – 6pm',
    flexible:        'Flexible · Morning to Afternoon',
  }
  const timePref = job.availability_time_pref
    ? (timePrefMap[job.availability_time_pref] ?? 'Morning to Afternoon')
    : 'Morning to Afternoon'

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '—'

  const deposit = 100
  const remaining = (job.approved_price ?? 0) - deposit

  const bedroomBathroomLine = job.service_type !== 'move_out' && job.bedrooms
    ? `${job.bedrooms} bed / ${job.bathrooms} bath`
    : ''

  const content = `
  ${badge('Quote Ready', 'blue')}
  ${heading(`${firstName}, here's your quote.`)}
  ${para('We reviewed your photos and confirmed exactly what it takes to get your space spotless. Your price is locked — no surprises when we arrive.')}

  <!-- Appointment block — most important info, shown first -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#1e3a5f;border-radius:10px;padding:0;margin:0 0 24px;overflow:hidden;">
    <tr>
      <td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;">Your Confirmed Appointment</p>
        <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;">${confirmedDateStr}</p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:0;width:50%;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);">Arrival window</p>
              <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#ffffff;">${timePref}</p>
            </td>
            <td style="padding:0;width:50%;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);">Address</p>
              <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#ffffff;">${job.address ?? '—'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Service + price breakdown -->
  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Service Breakdown</p>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 20px;">
    <tbody>
      <tr style="background:#f8fafc;">
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#0f172a;">${serviceLabel}</td>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:right;">${bedroomBathroomLine}</td>
      </tr>
      ${basePrice != null ? lineItem('Base service', `$${basePrice}`) : ''}
      ${selectedAddOns.map((a) => lineItem(a.label, `$${a.price}`)).join('')}
      <tr style="background:#f1f5f9;">
        <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">Total</td>
        <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#0f172a;font-family:'Courier New',monospace;text-align:right;border-top:1px solid #e2e8f0;">$${job.approved_price}</td>
      </tr>
    </tbody>
  </table>

  <!-- Payment split -->
  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Payment</p>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 20px;">
    <tbody>
      <tr style="background:#1e3a5f;">
        <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#ffffff;">Deposit due now</td>
        <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#ffffff;font-family:'Courier New',monospace;text-align:right;">$${deposit}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#64748b;">Remaining balance <span style="font-size:12px;">(due after clean)</span></td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0f172a;font-family:'Courier New',monospace;text-align:right;">$${remaining}</td>
      </tr>
    </tbody>
  </table>

  <!-- Urgency -->
  <div style="margin:0 0 20px;padding:14px 16px;background:#fef9ec;border:1px solid #fde68a;border-radius:8px;">
    <p style="margin:0;font-size:13px;color:#92400e;font-weight:700;">⚠️ Your date is not held until the deposit is paid.</p>
    <p style="margin:6px 0 0;font-size:13px;color:#92400e;line-height:1.5;">
      This quote is valid for 48 hours. After that, we cannot guarantee your requested date is available.
    </p>
  </div>

  ${trustStrip()}
  ${divider}
  ${ctaButton('Pay $100 Deposit — Lock In My Date →', stripeUrl)}

  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
    The remaining $${remaining} is due only after the clean is complete and you're satisfied.<br/>
    Questions? Reply to this email — we'll get back to you same day.
  </p>
`

  return { subject, html: baseTemplate(content, `Your confirmed clean is ${confirmedDateStr} · $${deposit} deposit locks in your date.`) }
}
