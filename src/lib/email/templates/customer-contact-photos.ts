import type { Job } from '@/types/database'
import { baseTemplate, heading, para, divider } from './base'

export function customerContactPhotosTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]

  const subject = `A Quick Follow-Up About Your Cleaning Request`

  const content = `
    ${heading(`Hi ${firstName},`)}

    ${para(`Thank you for contacting RenewShine.`)}

    ${para(`Before I can provide an accurate quote, I'd like to take a quick look at the space.`)}

    ${para(`You can simply reply to this email with a few photos or a short walkthrough video. If it's easier, we can also schedule a quick FaceTime call.`)}

    ${para(`Once I review everything, I'll send over your quote and available appointment options.`)}

    ${divider}

    <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
      Thank you,<br/>
      <strong style="color:#0f172a;">Grace</strong><br/>
      <span style="color:#4A7C59;font-weight:500;">RenewShine</span>
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, send a few photos and I'll have your quote ready — Grace, RenewShine`
    ),
  }
}
