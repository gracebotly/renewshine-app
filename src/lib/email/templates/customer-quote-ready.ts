import type { Job } from '@/types/database'
import { baseTemplate, heading, para, divider, infoTable, infoRow } from './base'

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')          return 'Standard Clean'
  if (serviceType === 'deep')              return 'Deep Clean'
  if (serviceType === 'move_out')          return 'Move-In / Move-Out'
  if (serviceType === 'post_construction') return 'Post-Construction'
  return 'Cleaning Service'
}

export function customerQuoteReadyTemplate(job: Job): { subject: string; html: string } {
  const firstName   = job.client_name.split(' ')[0]
  const price       = job.approved_price ?? 0
  const deposit     = job.deposit_amount ?? 100
  const remaining   = Math.max(price - deposit, 0)
  const serviceLabel = getServiceLabel(job.service_type ?? null)
  const subject     = `Your RenewShine Cleaning Quote`

  const content = `
    ${heading(`Hi ${firstName},`)}
    ${para(`Thank you for sending the photos.`)}
    ${para(`Based on the information provided, your quote is ready.`)}
    ${infoTable(`
      ${infoRow('Service', serviceLabel)}
      ${infoRow('Total', `$${price.toLocaleString()}`)}
      ${infoRow('Deposit required', `$${deposit}`)}
      ${infoRow('Remaining balance', `$${remaining.toLocaleString()}`)}
    `)}
    ${para(`To move forward, simply reply to this email or submit your deposit once the payment link is provided.`)}
    ${para(`We look forward to taking care of your home.`)}
    ${divider}
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
      Thank you,<br/>
      <strong style="color:#0f172a;">Grace</strong><br/>
      <span style="color:#4A7C59;font-weight:500;">RenewShine</span><br/>
      <span style="color:#94a3b8;font-size:12px;">Premium Cleaning Services</span>
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, your RenewShine quote is ready. — Grace`
    ),
  }
}
