import { Resend } from 'resend'
import type { Job } from '@/types/database'
import { ownerNewJobTemplate } from './templates/owner-new-job'
import { customerSubmittedTemplate } from './templates/customer-submitted'
import { customerQuoteTemplate } from './templates/customer-quote'
import { customerBookedTemplate } from './templates/customer-booked'
import { ownerBookedTemplate } from './templates/owner-booked'
import { customerQuoteReminderTemplate } from './templates/customer-quote-reminder'
import { customerLinkExpiredTemplate } from './templates/customer-link-expired'
import { customerDeclinedTemplate } from './templates/customer-declined'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = 'RenewShine <noreply@renewshine.co>'
const OWNER_EMAIL = 'renewshinedmv@gmail.com'

/** Template 1 — fires when customer submits booking form. To: owner. */
export async function sendOwnerNewJobAlert(job: Job): Promise<void> {
  const { subject, html } = ownerNewJobTemplate(job)
  await resend.emails.send({ from: FROM, to: OWNER_EMAIL, subject, html })
}

/** Template 2 — fires when customer submits booking form. To: customer. */
export async function sendCustomerSubmittedConfirmation(job: Job): Promise<void> {
  const { subject, html } = customerSubmittedTemplate(job)
  await resend.emails.send({ from: FROM, to: job.client_email, subject, html })
}

/** Template 3 — fires when owner clicks "Approve & Send Deposit Link". To: customer. */
export async function sendCustomerQuote(job: Job, stripeUrl: string): Promise<void> {
  const { subject, html } = customerQuoteTemplate(job, stripeUrl)
  await resend.emails.send({ from: FROM, to: job.client_email, subject, html })
}

/** Template 4 — fires after deposit paid (Stripe webhook OR cash path). To: customer. */
export async function sendCustomerBooked(job: Job): Promise<void> {
  const { subject, html } = customerBookedTemplate(job)
  await resend.emails.send({ from: FROM, to: job.client_email, subject, html })
}

/** Template 5 — fires after deposit paid (Stripe webhook OR cash path). To: owner. */
export async function sendOwnerBooked(job: Job): Promise<void> {
  const { subject, html } = ownerBookedTemplate(job)
  await resend.emails.send({ from: FROM, to: OWNER_EMAIL, subject, html })
}

/**
 * Quote reminder — fires when owner clicks "Resend Link" on an approved,
 * unpaid job. Creates a fresh Stripe Payment Link and sends urgency copy.
 * To: customer.
 */
export async function sendQuoteReminder(job: Job, newStripeUrl: string): Promise<void> {
  const { subject, html } = customerQuoteReminderTemplate(job, newStripeUrl)
  await resend.emails.send({ from: FROM, to: job.client_email, subject, html })
}

/**
 * Expired link recovery — fires when owner regenerates a link for a job
 * where the original link has expired (job.status === 'approved' and
 * deposit_paid === false and original link is stale).
 * To: customer.
 */
export async function sendExpiredLinkRecovery(job: Job, newStripeUrl: string): Promise<void> {
  const { subject, html } = customerLinkExpiredTemplate(job, newStripeUrl)
  await resend.emails.send({ from: FROM, to: job.client_email, subject, html })
}

/** Decline email — fires when owner clicks "Send Decline & Email Customer". To: customer. */
export async function sendCustomerDeclined(
  job: Job,
  reason: string,
  referral: string | null
): Promise<void> {
  const { subject, html } = customerDeclinedTemplate(job, reason, referral)
  await resend.emails.send({ from: FROM, to: job.client_email, subject, html })
}
