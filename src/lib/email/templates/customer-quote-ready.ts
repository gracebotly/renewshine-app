import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, infoTable, infoRow } from './base'

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')          return 'Standard Clean'
  if (serviceType === 'deep')              return 'Deep Clean'
  if (serviceType === 'move_out')          return 'Move-In / Move-Out'
  if (serviceType === 'post_construction') return 'Post-Construction'
  return 'Cleaning Service'
}

export function customerQuoteReadyTemplate(job: Job): { subject: string; html: string } {
  const firstName    = job.client_name.split(' ')[0]
  const price        = job.approved_price ?? 0
  const deposit      = job.deposit_amount ?? 100
  const remaining    = Math.max(price - deposit, 0)
  const serviceLabel = getServiceLabel(job.service_type ?? null)
  const subject      = `Your ${serviceLabel} quote is ready — RenewShine`

  const content = `
    ${badge('Quote ready', 'green')}
    ${heading(`${firstName}, your quote is ready.`)}
    ${para(`We've reviewed your photos and prepared your quote for the ${serviceLabel}.`)}

    ${infoTable(
      infoRow('Service', serviceLabel) +
      infoRow('Address', job.address ?? '—') +
      (job.bedrooms ? infoRow('Home size', `${job.bedrooms} bed · ${job.bathrooms} bath`) : '') +
      infoRow('Total', `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) +
      infoRow('Deposit due today', `$${deposit.toFixed(2)}`) +
      infoRow('Remaining after service', `$${remaining.toFixed(2)}`)
    )}

    ${para(`To move forward, email us at hello@renewshine.co or text (771) 253-9204 and we'll send your deposit link to confirm the appointment.`)}

    ${divider}

    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;text-align:center;">
      Questions? Email us at <a href="mailto:hello@renewshine.co" style="color:#4A7C59;text-decoration:none;">hello@renewshine.co</a> or text <a href="sms:+17712539204" style="color:#4A7C59;text-decoration:none;">(771) 253-9204</a>
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your ${serviceLabel} quote is ready — $${price.toLocaleString()} total, $${deposit} deposit to confirm.`
    ),
  }
}
