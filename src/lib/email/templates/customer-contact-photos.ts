import type { Job } from '@/types/database'
import { baseTemplate, heading, para, divider, ctaButton } from './base'

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep') {
    return 'the kitchen, bathrooms, bedrooms, and living areas'
  }
  if (serviceType === 'move_out') {
    return 'the property — the kitchen, bathrooms, and any areas needing extra attention'
  }
  return 'the space'
}

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard')           return 'Standard Clean'
  if (serviceType === 'deep')               return 'Deep Clean'
  if (serviceType === 'move_out')           return 'Move-In / Move-Out'
  if (serviceType === 'post_construction')  return 'Post-Construction'
  return 'cleaning service'
}

export function customerContactPhotosTemplate(job: Job): { subject: string; html: string } {
  const firstName    = job.client_name.split(' ')[0]
  const serviceLabel = getServiceLabel(job.service_type ?? null)
  const rooms        = getRoomCallout(job.service_type ?? null)

  const bedroomLine =
    job.bedrooms && job.bathrooms
      ? `your ${job.bedrooms} bed / ${job.bathrooms} bath ${serviceLabel.toLowerCase()}`
      : `your ${serviceLabel.toLowerCase()}`

  const subject = `${firstName}, your RenewShine quote is one step away`

  const content = `
    ${heading(`Hi ${firstName} — thanks for reaching out.`)}

    ${para(`We received your request for ${bedroomLine} and we're ready to get started. Before I can confirm your price, I need to take a quick look at the space first.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:10px;margin:0 0 20px;padding:20px 24px;">
      <tr>
        <td>
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0f172a;">
            Could you send a few photos or a short walkthrough video of ${rooms}?
          </p>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
            If photos are tricky, a quick FaceTime call works great too — just reply and we'll set one up.
          </p>
        </td>
      </tr>
    </table>

    ${para(`Once I've reviewed it, I'll send over your confirmed quote. <strong style="color:#0f172a;">You won't pay anything until you've seen and approved the final price.</strong>`)}

    ${ctaButton('Text photos to (771) 253-9204', 'sms:+17712539204')}

    ${divider}

    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
      You can also reply directly to this email or text <a href="sms:+17712539204" style="color:#4A7C59;text-decoration:none;">(771) 253-9204</a>. We typically respond within a few hours during business hours.
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, send a few photos and I'll have your quote ready. — Grace, RenewShine`
    ),
  }
}
