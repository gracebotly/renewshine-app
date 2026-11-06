import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, infoTable, infoRow, ctaButton } from './base'

export function ownerBalancePaidTemplate(
  job: Job,
  amountPaid: number
): { subject: string; html: string } {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://renewshine.co'
  const jobUrl = `${siteUrl}/admin/jobs/${job.id}`
  const amount = `$${amountPaid.toFixed(2)}`

  const content =
    badge('Balance paid', 'green') +
    heading(`${job.client_name} paid their balance`) +
    para(`Stripe confirmed a ${amount} balance payment. The job is now marked complete with $0 remaining.`) +
    infoTable(
      infoRow('Client', job.client_name) +
      infoRow('Email', job.client_email) +
      infoRow('Phone', job.client_phone ?? '—') +
      infoRow('Balance paid', amount) +
      infoRow('Total job price', `$${Number(job.approved_price ?? 0).toFixed(2)}`)
    ) +
    ctaButton('Open job in admin', jobUrl)

  return {
    subject: `Balance paid: ${job.client_name} (${amount})`,
    html: baseTemplate(content, `${job.client_name} paid ${amount}`),
  }
}
