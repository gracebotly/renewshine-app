import { baseTemplate, badge, heading, para, ctaButton, divider } from './base'

// Business contact email — shown at bottom of email so customer
// can reach out directly. Sent FROM noreply so we cannot include
// "reply to this email" copy anywhere in this template.
const BUSINESS_EMAIL = 'renewshinedmv@gmail.com'

interface AbandonedEmailParams {
  firstName: string
  clientEmail: string
  resumeUrl: string
}

export function customerAbandonedTemplate(
  params: AbandonedEmailParams
): { subject: string; html: string } {
  const { firstName, resumeUrl } = params

  const subject = `${firstName}, still want that quote?`

  const content = `
    ${badge('Almost There', 'green')}
    ${heading(`You were so close, ${firstName}.`)}
    ${para(`You started a quote request with us earlier but didn't quite finish. It only takes about 2 more minutes — pick up right where you left off.`)}

    ${ctaButton('Finish my quote', resumeUrl)}

    ${divider}

    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;text-align:center;">
      Have a question first? Reach us at
      <a href="mailto:${BUSINESS_EMAIL}" style="color:#4A7C59;text-decoration:none;">${BUSINESS_EMAIL}</a>
    </p>
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `You started a RenewShine quote — it only takes 2 more minutes to finish.`
    ),
  }
}
