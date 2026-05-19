import type { Job } from '@/types/database'
import { baseTemplate } from './base'

export function customerContactPhotosTemplate(job: Job): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]

  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : job.service_type === 'post_construction' ? 'Post-Construction Cleaning'
    : 'cleaning service'

  const bedroomLine =
    job.bedrooms && job.bathrooms
      ? `your ${job.bedrooms} bed / ${job.bathrooms} bath`
      : 'your home'

  const subject = `We need photos to complete your ${serviceLabel} quote`
  const content = `
  <p style="margin:0 0 20px;font-size:15px;color:#0f172a;line-height:1.7;">Hi ${firstName},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">We received your ${serviceLabel} request for ${bedroomLine}. Thank you!</p>
  <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">We weren't able to confirm a price yet because no photos were included with your booking. Our quotes are always based on a photo review first, which is how we guarantee your final price before you pay anything.</p>
  <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">To get you a quote, just reply with a few photos or a short walkthrough video of the spaces you'd like cleaned. If that's easier over FaceTime, we can do that too. Just let us know what works best for you.</p>
  <p style="margin:0 0 32px;font-size:15px;color:#0f172a;line-height:1.7;">Once we have a look, we'll send your confirmed quote.</p>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;"><tr><td style="border-top:1px solid #e2e8f0;padding-top:24px;"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0f172a;">Grace Gbadamosi</p><p style="margin:0 0 2px;font-size:13px;color:#64748b;">Founder, RenewShine</p><p style="margin:0 0 6px;font-size:13px;color:#64748b;">Premium Residential &amp; Commercial Cleaning &middot; DMV Area</p><p style="margin:0;font-size:13px;"><a href="https://renewshine.co" style="color:#4A7C59;text-decoration:none;">renewshine.co</a>&nbsp;&middot;&nbsp;<a href="tel:+17712539204" style="color:#4A7C59;text-decoration:none;">(771) 253-9204</a></p></td></tr></table>`

  return { subject, html: baseTemplate(content, `We need a few photos to confirm your ${serviceLabel} price.`) }
}
