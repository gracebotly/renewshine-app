import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider } from './base'

export function customerContactPhotosTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]

  const serviceLabel =
    job.service_type === 'standard'           ? 'Standard Clean'
    : job.service_type === 'deep'             ? 'Deep Clean'
    : job.service_type === 'move_out'         ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction'
    : 'cleaning service'

  const bedroomLine =
    job.bedrooms && job.bathrooms
      ? `your ${job.bedrooms} bed / ${job.bathrooms} bath`
      : 'your space'

  const subject = `${firstName}, we need a few details to complete your quote`

  const content = `
    ${badge('One more step', 'amber')}
    ${heading(`${firstName}, we’re almost ready.`)}
    ${para(`We received your ${serviceLabel} request for ${bedroomLine}. To confirm your price, we need a few photos of the spaces you’d like cleaned.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 22px;">
      <tbody>
        <tr>
          <td style="padding:13px 16px;vertical-align:top;width:36px;border-bottom:1px solid #e8f0eb;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">1</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;border-bottom:1px solid #e8f0eb;">Send a few photos or a short walkthrough video of the areas you’d like cleaned</td>
        </tr>
        <tr>
          <td style="padding:13px 16px;vertical-align:top;width:36px;border-bottom:1px solid #e8f0eb;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">2</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;border-bottom:1px solid #e8f0eb;">We review and confirm your price — before you pay anything</td>
        </tr>
        <tr>
          <td style="padding:13px 16px;vertical-align:top;width:36px;">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">3</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;">We send your confirmed quote and lock in your date</td>
        </tr>
      </tbody>
    </table>

    ${para('Text your photos directly to (771) 253-9204 and we’ll get your quote ready.')}

    ${divider}
  `

  return {
    subject,
    html: baseTemplate(content, `${firstName}, send over a few photos and we’ll have your quote ready shortly.`),
  }
}
