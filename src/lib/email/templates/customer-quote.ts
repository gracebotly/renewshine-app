import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, badge, heading, para, ctaButton } from './base'

export function customerQuoteTemplate(job: Job, stripeUrl: string): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `${firstName}, your cleaning plan is ready`

  const serviceLabel =
    job.service_type === 'standard'            ? 'Standard Clean'
    : job.service_type === 'deep'              ? 'Deep Clean'
    : job.service_type === 'move_out'          ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'Cleaning Service'

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

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  const approvedPrice = job.approved_price ?? 0
  const depositAmount = 100
  const remainingAmount = Math.max(approvedPrice - depositAmount, 0)

  const totalDisplay = approvedPrice > 0
    ? `$${approvedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Confirmed after review'

  const bedroomLine =
    job.service_type !== 'move_out' && job.bedrooms
      ? `${job.bedrooms} bed · ${job.bathrooms} bath`
      : ''

  const selectedAddOns = ADD_ONS.filter((a) =>
    Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  )

  const addOnItems = selectedAddOns
    .map((a) => `
      <tr>
        <td style="padding:3px 0 3px 14px;font-size:13px;color:#334155;line-height:1.5;">
          <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:#4A7C59;margin-right:8px;vertical-align:middle;margin-bottom:2px;"></span>${a.label}
        </td>
      </tr>`)
    .join('')

  const content = `
    ${badge('Your appointment is almost reserved', 'green')}
    ${heading(`${firstName}, your cleaning plan is ready.`)}
    ${para('We reviewed your request and prepared your confirmed cleaning plan. Your service window, pricing, and deposit details are below. Secure your appointment when you\'re ready.')}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border-left:4px solid #4A7C59;background:#f4f7f5;border-radius:0 8px 8px 0;margin:0 0 24px;overflow:hidden;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;">${confirmedDateStr}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">${timePref}&nbsp;&nbsp;·&nbsp;&nbsp;${job.address ?? ''}</p>
          <p style="margin:0;font-size:11px;font-weight:600;color:#4A7C59;text-transform:uppercase;letter-spacing:0.05em;">Reserved pending deposit</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.06em;">Your cleaning plan</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:12px 14px 8px;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">${serviceLabel}</p>
            ${bedroomLine ? `<p style="margin:0 0 8px;font-size:12px;color:#64748b;">${bedroomLine}</p>` : '<p style="margin:0 0 8px;"></p>'}
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${addOnItems || ''}
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Your confirmed total</p>
    <p style="margin:0 0 4px;font-size:32px;font-weight:700;color:#0f172a;font-family:'Courier New',monospace;letter-spacing:-0.5px;">${totalDisplay}</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 6px;">
      <tbody>
        <tr>
          <td style="padding:2px 0;font-size:13px;color:#334155;">$${depositAmount.toFixed(2)} due today</td>
        </tr>
        <tr>
          <td style="padding:2px 0;font-size:13px;color:#334155;">$${remainingAmount.toFixed(2)} due after service</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0 0 24px;font-size:12px;color:#94a3b8;">Finalized after reviewing your request.</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border-left:4px solid #4A7C59;background:#f4f7f5;border-radius:0 8px 8px 0;margin:0 0 16px;overflow:hidden;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Transparent pricing guarantee</p>
          <p style="margin:0;font-size:13px;color:#334155;line-height:1.65;">
            If something differs from the photos or request details, we'll confirm with you before any additional work. <strong style="color:#0f172a;">No unexpected charges.</strong>
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-align:center;">Your appointment window is reserved temporarily.</p>
    <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-align:center;">Complete your deposit within 48 hours to lock in your date.</p>

    ${ctaButton('Reserve My Date — $100 Deposit', stripeUrl)}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your cleaning plan is ready. Reserve your date with a $100 deposit.`
    ),
  }
}
