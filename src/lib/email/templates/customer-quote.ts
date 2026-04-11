import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow, lineItem, trustStrip } from './base'

export function customerQuoteTemplate(job: Job, stripeUrl: string): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `${firstName}, your RenewShine quote is confirmed — $${job.approved_price}`

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'detailed' ? 'Detailed Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Cleaning Service'

  let basePrice: number | null = null
  if (job.service_type === 'standard') {
    basePrice = Math.max((job.bedrooms ?? 0) * 60 + (job.bathrooms ?? 0) * 40, 200)
  } else if (job.service_type === 'detailed') {
    basePrice = Math.max((job.bedrooms ?? 0) * 90 + (job.bathrooms ?? 0) * 55, 350)
  }

  const selectedAddOns = ADD_ONS.filter((a) =>
    Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  )

  const confirmedDateStr = job.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '—'

  const timePref =
    job.availability_time_pref === 'morning' ? 'Morning (8am–12pm)'
    : job.availability_time_pref === 'afternoon' ? 'Afternoon (12pm–5pm)'
    : 'Flexible (Any Time)'

  const deposit = 100
  const remaining = (job.approved_price ?? 0) - deposit

  const content = `
  ${badge('Your Quote is Ready', 'blue')}
  ${heading(`${firstName}, we reviewed your photos.`)}
  ${para(`We looked at your space and confirmed exactly what it will take to get it spotless. Your price is locked — no adjustments when we arrive.`)}

  <p style="margin:16px 0 6px;font-size:14px;font-weight:600;color:#0f172a;">Price breakdown</p>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:1px solid #e2e8f0;border-radius:8px;padding:4px 16px;margin:0 0 16px;">
    <tbody>
      ${lineItem(
        `${serviceLabel}${job.service_type !== 'move_out' && job.bedrooms ? ` · ${job.bedrooms} bed / ${job.bathrooms} bath` : ''}`,
        basePrice != null ? `$${basePrice}` : 'Quoted after review'
      )}
      ${selectedAddOns.map((a) => lineItem(a.label, `$${a.price}`)).join('')}
      ${lineItem('Subtotal', `$${job.approved_price}`)}
      ${lineItem('Deposit due now', `$${deposit}`, true)}
      ${lineItem('Remaining (due after clean)', `$${remaining}`)}
    </tbody>
  </table>

  ${infoTable(
    infoRow('Confirmed date', confirmedDateStr) +
    infoRow('Arrival window', timePref) +
    infoRow('Address', job.address ?? '—')
  )}

  <div style="margin:20px 0;padding:14px 16px;background:#fef9ec;border:1px solid #fde68a;border-radius:8px;">
    <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">
      ⚠️ Your requested date is not reserved until the deposit is paid.
    </p>
    <p style="margin:6px 0 0;font-size:13px;color:#92400e;">
      This quote and your date window are held for 48 hours. After that, we cannot guarantee availability.
    </p>
  </div>

  ${trustStrip()}
  ${divider}
  ${ctaButton('Pay $100 Deposit — Lock In My Date →', stripeUrl)}

  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
    This link expires in 48 hours. The remaining $${remaining} is due only after the clean is complete.<br/>
    Questions? Just reply to this email.
  </p>
`

  return { subject, html: baseTemplate(content, `Your confirmed price is $${job.approved_price} — pay the $100 deposit to lock in your date.`) }
}
