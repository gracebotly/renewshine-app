import type { Job } from '@/types/database'
import { baseTemplate, ctaButton, divider } from './base'

export function customerDeclinedTemplate(
  job: Job,
  reason: string,
  referral: string | null
): { subject: string; html: string } {
  const firstName = job.client_name.split(' ')[0]
  const subject = `Your RenewShine request — an update from us`

  const referralLine = referral && referral.trim().length > 0
    ? `<p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">For your needs, we recommend reaching out to <strong style="color:#0f172a;">${referral.trim()}</strong> — they may be better equipped to help.</p>`
    : `<p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">We encourage you to reach out to another provider who may be better equipped for this job.</p>`

  const content = `
  <p style="margin:0 0 6px;font-size:14px;color:#64748b;">Hi ${firstName},</p>
  <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">Thank you for reaching out to RenewShine.</p>

  <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">After reviewing your request, we are not able to take this job on at this time.</p>

  <div style="margin:0 0 20px;padding:16px 20px;background:#f8fafc;border-left:4px solid #4A7C59;border-radius:0 8px 8px 0;">
    <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">${reason}</p>
  </div>

  ${referralLine}

  <p style="margin:0 0 0;font-size:14px;color:#475569;line-height:1.7;">We appreciate you considering us and wish you the best.</p>

  ${divider}

  <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
    Questions? Reply to this email.<br/>
    RenewShine · DMV Area
  </p>
`

  return {
    subject,
    html: baseTemplate(content, `An update on your cleaning request from RenewShine.`),
  }
}
