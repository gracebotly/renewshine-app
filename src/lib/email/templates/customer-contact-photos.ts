import type { Job } from '@/types/database'
import { baseTemplate, heading, para, divider } from './base'

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep') {
    return 'the kitchen, bathrooms, bedrooms, and living areas'
  }
  if (serviceType === 'move_out') {
    return 'the property, including the kitchen, bathrooms, and any areas needing extra attention'
  }
  return 'the space'
}

export function customerContactPhotosTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const rooms     = getRoomCallout(job.service_type ?? null)
  const subject   = `One more step before your quote — RenewShine`

  const content = `
    ${heading(`${firstName}, one quick step before your quote.`)}

    ${para(`Thank you for contacting RenewShine.`)}

    ${para(`Before we can provide an accurate quote, our team reviews photos of every space. Could you send a few photos or a short walkthrough video of ${rooms}?`)}

    ${para(`If photos are difficult, a quick FaceTime or video call works just as well — text us at (771) 253-9204 and we'll arrange a time.`)}

    ${para(`Once we've reviewed everything, we'll send over your confirmed quote and available appointment options.`)}

    ${divider}

    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
      Email us at <a href="mailto:hello@renewshine.co" style="color:#4A7C59;text-decoration:none;">hello@renewshine.co</a> or text us at
      <a href="sms:+17712539204" style="color:#4A7C59;text-decoration:none;">(771) 253-9204</a>.
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, send a few photos of the space and we'll have your quote ready — RenewShine`
    ),
  }
}
