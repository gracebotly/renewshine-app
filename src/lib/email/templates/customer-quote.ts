import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, ctaButton, divider, trustStrip } from './base'

export function customerQuoteTemplate(job: Job, stripeUrl: string): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `${firstName}, your RenewShine estimate is ready`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction Cleaning'
    : 'Cleaning Service'

  const timePrefMap: Record<string, string> = {
    morning:         '8am to 12pm',
    afternoon:       '12pm to 5pm',
    early_morning:   '8am to 10am',
    mid_morning:     '10am to 12pm',
    noon:            '12pm to 2pm',
    early_afternoon: '2pm to 4pm',
    late_afternoon:  '4pm to 6pm',
    flexible:        'Morning to Afternoon',
  }
  const timePref = job.availability_time_pref
    ? (timePrefMap[job.availability_time_pref] ?? 'Morning to Afternoon')
    : 'Morning to Afternoon'

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  const deposit = 100
  const remaining = (job.approved_price ?? 0) - deposit

  const selectedAddOns = ADD_ONS.filter((a) =>
    Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  )

  const bedroomLine = job.service_type !== 'move_out' && job.bedrooms
    ? `${job.bedrooms} bed / ${job.bathrooms} bath`
    : ''

  const addOnBullets = selectedAddOns.map((a) =>
    `<tr>
      <td style="padding:4px 0 4px 8px;font-size:13px;color:#334155;">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#4A7C59;margin-right:8px;vertical-align:middle;"></span>${a.label}
      </td>
    </tr>`
  ).join('')

  const estimateLow = job.estimated_price_low ?? job.approved_price ?? 0
  const estimateHigh = job.estimated_price_high ?? Math.round((job.approved_price ?? 0) * 1.15)

  const content = `
  <p style="margin:0 0 6px;font-size:14px;color:#64748b;">Hi ${firstName},</p>
  <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">Your cleaning estimate is ready.</p>

  <!-- Appointment card with left accent -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border-left:4px solid #4A7C59;background:#f4f7f5;border-radius:0 8px 8px 0;margin:0 0 20px;overflow:hidden;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;">${confirmedDateStr}</p>
        <p style="margin:0;font-size:13px;color:#64748b;">${timePref} &nbsp;·&nbsp; ${job.address ?? ''}</p>
      </td>
    </tr>
  </table>

  <!-- What's included -->
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.06em;">What's included</p>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="margin:0 0 20px;">
    <tbody>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#334155;font-weight:600;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#4A7C59;margin-right:8px;vertical-align:middle;"></span>${serviceLabel}${bedroomLine ? ` &nbsp;·&nbsp; ${bedroomLine}` : ''}
        </td>
      </tr>
      ${addOnBullets}
    </tbody>
  </table>

  <!-- Estimate + Deposit side by side -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 16px;">
    <tr>
      <td width="48%" style="padding-right:8px;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Estimate</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">$${estimateLow}<span style="font-size:14px;color:#64748b;"> to $${estimateHigh}</span></p>
            </td>
          </tr>
        </table>
      </td>
      <td width="4%"></td>
      <td width="48%" style="vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#4A7C59;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#A8D4B5;text-transform:uppercase;letter-spacing:0.06em;">Deposit now</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">$${deposit}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 20px;font-size:12px;color:#64748b;line-height:1.6;">
    This is an estimate based on your photos. Final price is confirmed on the day based on actual scope.
  </p>

  <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-align:center;">Your date is not held until the deposit is paid. Estimate valid for 48 hours.</p>

  ${divider}

  ${ctaButton(`Confirm my appointment for $${deposit}`, stripeUrl)}

  <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
    The remaining balance is due only after the clean is complete.<br/>
    Questions? Reply to this email.
  </p>
`

  return {
    subject,
    html: baseTemplate(
      content,
      `Your estimate is $${estimateLow} to $${estimateHigh}. Pay $${deposit} to confirm ${confirmedDateStr}.`
    ),
  }
}
