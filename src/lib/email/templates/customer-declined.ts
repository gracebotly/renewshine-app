import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider } from './base'

export function customerDeclinedTemplate(
  job: Job,
  reason: string,
  referral: string | null
): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `An update on your RenewShine request`

  const referralLine = referral && referral.trim().length > 0
    ? `<p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">We’d suggest reaching out to <strong style="color:#0f172a;">${referral.trim()}</strong> — they may be a better fit for this job.</p>`
    : `<p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">We’d encourage you to reach out to another provider who may be better equipped for this scope.</p>`

  const content = `
    ${badge('Request reviewed', 'amber')}
    ${heading(`An update on your cleaning request, ${firstName}.`)}
    ${para(`We’ve reviewed your request and we’re not able to take this one on.`)}

    <div style="margin:0 0 20px;padding:16px 20px;background:#f8fafc;border-left:4px solid #4A7C59;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">${reason}</p>
    </div>

    ${referralLine}

    ${para('We appreciate you reaching out.')}

    ${divider}
  `

  return {
    subject,
    html: baseTemplate(content, `An update on your cleaning request from RenewShine.`),
  }
}
