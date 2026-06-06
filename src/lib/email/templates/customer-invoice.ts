import { baseTemplate, ctaButton } from './base'

export interface InvoiceLineItem {
  description: string
  amount: number // dollars
}

export interface InvoiceEmailData {
  clientName: string
  clientEmail: string
  businessName?: string | null
  address?: string | null
  invoiceNumber: string
  lineItems: InvoiceLineItem[]
  total: number
  depositPaid: number   // 0 if no deposit was taken
  amountDue: number     // total - depositPaid
  dueDate: string       // formatted string e.g. "May 20, 2026"
  paymentUrl: string
  serviceDate?: string | null
  notes?: string | null
}

export function customerInvoiceTemplate(data: InvoiceEmailData): { subject: string; html: string } {
  const subject = `Invoice ${data.invoiceNumber} — $${data.amountDue.toFixed(2)} due ${data.dueDate}`

  const lineItemRows = data.lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#334155;border-bottom:1px solid #e2e8f0;">${item.description}</td>
        <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;font-family:'Courier New',monospace;text-align:right;border-bottom:1px solid #e2e8f0;">$${item.amount.toFixed(2)}</td>
      </tr>`
    )
    .join('')

  const depositRow =
    data.depositPaid > 0
      ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">Deposit paid</td>
          <td style="padding:8px 0;font-size:13px;color:#64748b;font-family:'Courier New',monospace;text-align:right;">−$${data.depositPaid.toFixed(2)}</td>
        </tr>`
      : ''

  // ── FROM / TO header ─────────────────────────────────────────────────────
  const fromToBlock = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="margin:0 0 28px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:16px 20px;width:50%;vertical-align:top;border-right:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">From</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">RenewShine</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Premium Residential &amp; Commercial Cleaning</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">DMV Area</p>
          <p style="margin:4px 0 0;font-size:12px;color:#4A7C59;">
            <a href="https://renewshine.co" style="color:#4A7C59;text-decoration:none;">renewshine.co</a>
            &nbsp;·&nbsp;(771) 253-9204
          </p>
        </td>
        <td style="padding:16px 20px;width:50%;vertical-align:top;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Billed To</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${data.clientName}</p>
          ${data.businessName ? `<p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.businessName}</p>` : ''}
          ${data.address ? `<p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.address}</p>` : ''}
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.clientEmail}</p>
        </td>
      </tr>
    </table>`

  const serviceDateLine = data.serviceDate
    ? `<p style="margin:0 0 6px;font-size:13px;color:#64748b;">Service date: <strong style="color:#0f172a;">${data.serviceDate}</strong></p>`
    : ''

  const notesBlock = data.notes?.trim()
    ? `<div style="margin:0 0 20px;border-left:4px solid #e2e8f0;padding:10px 16px;background:#f8fafc;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Notes</p>
        <p style="margin:0;font-size:13px;color:#334155;line-height:1.65;white-space:pre-line;">${data.notes}</p>
      </div>`
    : ''

  const content = `
  ${fromToBlock}

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
    <tr>
      <td style="vertical-align:top;">
        <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Invoice</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;font-family:'Courier New',monospace;">${data.invoiceNumber}</p>
      </td>
      <td style="vertical-align:top;text-align:right;">
        ${serviceDateLine}
        <p style="margin:0;font-size:13px;color:#64748b;">Due: <strong style="color:#0f172a;">${data.dueDate}</strong></p>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 20px;">
    <thead>
      <tr style="background:#f8fafc;">
        <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;text-align:left;">Description</th>
        <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr><td colspan="2" style="padding:0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tbody>${lineItemRows}</tbody>
        </table>
      </td></tr>
    </tbody>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
    <tbody>
      ${depositRow}
      <tr style="background:#4A7C59;">
        <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#ffffff;">Amount Due</td>
        <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#ffffff;font-family:'Courier New',monospace;text-align:right;">$${data.amountDue.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;text-align:center;">Questions before paying?</p>
  <p style="margin:0 0 16px;font-size:13px;color:#64748b;text-align:center;">Email us at <a href="mailto:hello@renewshine.co" style="color:#4A7C59;text-decoration:none;">hello@renewshine.co</a> or text <a href="sms:+17712539204" style="color:#4A7C59;text-decoration:none;">(771) 253-9204</a></p>
  ${ctaButton(`Submit Payment — $${data.amountDue.toFixed(2)}`, data.paymentUrl)}

  ${notesBlock}

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border-left:4px solid #4A7C59;background:#f4f7f5;border-radius:0 8px 8px 0;margin:0 0 20px;overflow:hidden;">
    <tr>
      <td style="padding:14px 18px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0f172a;">Next Steps</p>
        <p style="margin:0;font-size:13px;color:#334155;line-height:1.65;">
          Pay securely online using the button above. Once received, you will get a confirmation email.
          Questions? Email us at hello@renewshine.co or text (771) 253-9204.
        </p>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
    Thank you for choosing RenewShine. We look forward to serving you again.
  </p>
`

  return {
    subject,
    html: baseTemplate(content, `Invoice ${data.invoiceNumber} — $${data.amountDue.toFixed(2)} due ${data.dueDate}`),
  }
}
