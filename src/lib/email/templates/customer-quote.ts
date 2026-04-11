import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow, lineItem } from './base'

export function customerQuoteTemplate(job: Job, stripeUrl: string): { subject: string; html: string } {
  const subject = `Your RenewShine quote is ready — $${job.approved_price}`
  const firstName = job.client_name.split(' ')[0]

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Cleaning Service'

  let basePrice: number | null = null
  if (job.service_type === 'standard') {
    basePrice = Math.max((job.bedrooms ?? 0) * 60 + (job.bathrooms ?? 0) * 40, 200)
  } else if (job.service_type === 'deep') {
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
    ${heading(`${firstName}, here's your confirmed quote.`)}
    ${para('We reviewed your home and confirmed the price below. Pay the $100 deposit to lock in your date — the remaining balance is due only after the clean is complete.')}
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;">Price breakdown</p>
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
    ${divider}
    ${ctaButton('Pay $100 Deposit →', stripeUrl)}
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">This link expires in 48 hours. Questions? Reply to this email.</p>
  `

  return { subject, html: baseTemplate(content, `Your confirmed price is $${job.approved_price} — pay the $100 deposit to lock in your date.`) }
}
