import type { Job } from '@/types/database'
import { baseTemplate, badge, heading, para, divider, ctaButton, infoTable, infoRow } from './base'

export function ownerBookedTemplate(job: Job): { subject: string; html: string } {
  const hasDate = !!job.confirmed_date
  const serviceLabel =
    job.service_type === 'standard' ? 'Standard Clean'
    : job.service_type === 'deep' ? 'Deep Clean'
    : job.service_type === 'move_out' ? 'Move-In / Move-Out'
    : 'Commercial / Custom'

  const confirmedDateStr = hasDate
    ? new Date(job.confirmed_date!).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  const availabilityStr = (() => {
    const start = job.availability_start
      ? new Date(job.availability_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : null
    const end = job.availability_end
      ? new Date(job.availability_end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : null
    if (start && end && start !== end) return `${start} – ${end}`
    if (start) return start
    return 'Not specified'
  })()

  const timePrefMap: Record<string, string> = {
    morning:         'Morning (8am–12pm)',
    afternoon:       'Afternoon (12pm–5pm)',
    early_morning:   '8am – 10am',
    mid_morning:     '10am – 12pm',
    noon:            '12pm – 2pm',
    early_afternoon: '2pm – 4pm',
    late_afternoon:  '4pm – 6pm',
    flexible:        'Flexible (Any Time)',
  }
  const timePref = job.availability_time_pref
    ? (timePrefMap[job.availability_time_pref] ?? 'Flexible (Any Time)')
    : 'Flexible (Any Time)'

  const remaining = job.remaining_amount ?? ((job.approved_price ?? 0) - (job.deposit_amount ?? 100))
  const deposit = job.deposit_amount ?? 100
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  // ── Mode A — date not yet confirmed ──────────────────────────────────────
  if (!hasDate) {
    const subject = `💰 Deposit Paid — ${job.client_name} — date to confirm`

    const content = `
      ${badge('Deposit Received — Confirm the Date', 'amber')}
      ${heading('Deposit received. Set a confirmed date.')}
      ${para(`${job.client_name} paid the $${deposit.toFixed(0)} deposit. The job needs a confirmed date before the booking confirmation can be sent.`)}

      <div style="margin:0 0 20px;padding:14px 16px;background:#fef9ec;border:1px solid #f6d860;border-radius:8px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#92600a;">
          Action needed: set a confirmed date in admin and send the appointment confirmation to this customer.
        </p>
      </div>

      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;">Job summary</p>
      ${infoTable(
        infoRow('Client name', job.client_name) +
        infoRow('Email', job.client_email) +
        infoRow('Phone', job.client_phone ?? '—') +
        infoRow('Address', job.address ?? '—') +
        infoRow('Service', serviceLabel) +
        (job.type === 'residential'
          ? infoRow('Home size', `${job.bedrooms ?? '—'} bed · ${job.bathrooms ?? '—'} bath`)
          : '') +
        infoRow('Availability window', availabilityStr) +
        infoRow('Arrival preference', timePref) +
        infoRow('Total approved', `$${job.approved_price?.toFixed(2) ?? '—'}`) +
        infoRow('Deposit paid', `$${deposit.toFixed(2)} ✓`) +
        infoRow('Remaining balance', `$${remaining.toFixed(2)}`)
      )}
      ${divider}
      ${ctaButton('Set Date in Admin →', `${siteUrl}/admin/jobs/${job.id}`)}
    `

    return {
      subject,
      html: baseTemplate(
        content,
        `${job.client_name} paid the deposit. Set a confirmed date in admin.`
      ),
    }
  }

  // ── Mode B — confirmed date is set ────────────────────────────────────────
  const subject = `💰 Deposit Paid — ${job.client_name} is on the calendar`

  const content = `
    ${badge('Deposit Received — Job Scheduled', 'green')}
    ${heading('A job has been confirmed and is on the calendar.')}
    ${para(`${job.client_name} paid the $${deposit.toFixed(0)} deposit. The job is scheduled.`)}
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;">Job summary</p>
    ${infoTable(
      infoRow('Client name', job.client_name) +
      infoRow('Email', job.client_email) +
      infoRow('Phone', job.client_phone ?? '—') +
      infoRow('Address', job.address ?? '—') +
      infoRow('Service', serviceLabel) +
      (job.type === 'residential'
        ? infoRow('Home size', `${job.bedrooms ?? '—'} bed · ${job.bathrooms ?? '—'} bath`)
        : '') +
      infoRow('Confirmed date', confirmedDateStr) +
      infoRow('Arrival window', timePref) +
      infoRow('Total approved', `$${job.approved_price?.toFixed(2) ?? '—'}`) +
      infoRow('Deposit paid', `$${deposit.toFixed(2)} ✓`) +
      infoRow('Remaining balance', `$${remaining.toFixed(2)}`)
    )}
    ${divider}
    ${ctaButton('View Job in Admin →', `${siteUrl}/admin/jobs/${job.id}`)}
  `

  return {
    subject,
    html: baseTemplate(
      content,
      `${job.client_name} paid the deposit — job is confirmed for ${confirmedDateStr}.`
    ),
  }
}
