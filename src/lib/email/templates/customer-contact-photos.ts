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

    ${para(`Before we confirm a price, our team reviews photos of every space. Could you send a few photos or a short walkthrough video of ${rooms}?`)}

    ${para(`Send them to hello@renewshine.co, or text them to (771) 253-9204. A short video call works too — just text us to arrange a time.`)}

    ${para(`Once we’ve reviewed everything, we’ll send your confirmed quote and reach out to schedule.`)}

    ${divider}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${firstName}, send a few photos and we’ll have your quote ready the same business day.`
    ),
  }
}
