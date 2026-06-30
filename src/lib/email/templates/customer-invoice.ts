import { baseTemplate, ctaButton } from './base'
import { renderTemplate } from '@/lib/templates/render'
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaults'
import { LINE_ITEMS_MARKER } from '@/lib/templates/types'
import { createServerClient } from '@/lib/supabase/server'

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
  arrivalTime?: string | null
  notes?: string | null
}

export async function customerInvoiceTemplate(data: InvoiceEmailData): Promise<{ subject: string; html: string }> {
  const subjectTemplate = await getInvoiceTemplate('email')
  const tokens = {
    firstName: data.clientName.split(' ')[0],
    service: data.businessName ? data.businessName : 'your service',
    serviceDateLine: data.serviceDate ? ` on ${data.serviceDate}` : '',
    invoiceNumber: data.invoiceNumber,
    amountDue: `$${data.amountDue.toFixed(2)}`,
  }
  const subject = renderTemplate(subjectTemplate.subject ?? '', tokens)

  // ── Line item rows ─────────────────────────────────────────────────────
  const lineItemRows = data.lineItems
    .map(
      (item, i) => `
      <tr style="${i % 2 === 1 ? 'background:#f8fafc;' : ''}">
        <td style="padding:12px 16px;font-size:13px;color:#334155;border-bottom:1px solid #e2e8f0;">${item.description}</td>
        <td style="padding:12px 16px;font-size:13px;color:#0f172a;font-weight:600;font-family:'Courier New',monospace;text-align:right;border-bottom:1px solid #e2e8f0;">$${item.amount.toFixed(2)}</td>
      </tr>`
    )
    .join('')

  // ── Deposit credit row ─────────────────────────────────────────────────
  const depositRow = data.depositPaid > 0
    ? `<tr>
        <td style="padding:10px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">
          Deposit paid
        </td>
        <td style="padding:10px 16px;font-size:13px;color:#64748b;font-family:'Courier New',monospace;text-align:right;border-bottom:1px solid #e2e8f0;">
          −$${data.depositPaid.toFixed(2)}
        </td>
      </tr>`
    : ''

  // ── FROM / TO header ───────────────────────────────────────────────────
  const fromToBlock = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:16px 20px;width:50%;vertical-align:top;border-right:1px solid #e2e8f0;">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">From</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">RenewShine</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Premium Residential &amp; Commercial Cleaning</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">DMV Area</p>
          <p style="margin:5px 0 0;font-size:12px;">
            <a href="https://renewshine.co" style="color:#4A7C59;text-decoration:none;">renewshine.co</a>
            &nbsp;·&nbsp;
            <a href="tel:+17712539204" style="color:#64748b;text-decoration:none;">(771) 253-9204</a>
          </p>
        </td>
        <td style="padding:16px 20px;width:50%;vertical-align:top;">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Billed To</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${data.clientName}</p>
          ${data.businessName ? `<p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.businessName}</p>` : ''}
          ${data.address ? `<p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.address}</p>` : ''}
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.clientEmail}</p>
        </td>
      </tr>
    </table>`

  // ── Invoice number / date row ──────────────────────────────────────────
  const invoiceHeaderRow = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
      <tr>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Invoice</p>
          <p style="margin:3px 0 0;font-size:12px;color:#94a3b8;font-family:'Courier New',monospace;">${data.invoiceNumber}</p>
        </td>
        <td style="vertical-align:top;text-align:right;">
          ${data.serviceDate ? `<p style="margin:0 0 4px;font-size:13px;color:#64748b;">Service date: <strong style="color:#0f172a;">${data.serviceDate}</strong></p>` : ''}
          ${data.arrivalTime ? `<p style="margin:0 0 4px;font-size:13px;color:#64748b;">Arrival: <strong style="color:#0f172a;">${data.arrivalTime}</strong></p>` : ''}
          <p style="margin:0;font-size:13px;color:#64748b;">Due: <strong style="color:#0f172a;">${data.dueDate}</strong></p>
        </td>
      </tr>
    </table>`

  // ── Line items table ───────────────────────────────────────────────────
  const lineItemsTable = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 12px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;text-align:left;">Description</th>
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemRows}
        ${depositRow}
      </tbody>
    </table>`

  // ── Amount Due hero ────────────────────────────────────────────────────
  // Most prominent element on the invoice — cannot be missed
  const amountDueHero = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#4A7C59;border-radius:12px;overflow:hidden;margin:0 0 20px;">
      <tr>
        <td style="padding:22px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:0.1em;">
            Amount Due
          </p>
          <p style="margin:0;font-size:38px;font-weight:700;color:#ffffff;font-family:'Courier New',monospace;letter-spacing:-1px;line-height:1;">
            $${data.amountDue.toFixed(2)}
          </p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">
            Due ${data.dueDate}
          </p>
        </td>
      </tr>
    </table>`

  // ── Notes block ────────────────────────────────────────────────────────
  const notesBlock = data.notes?.trim()
    ? `<div style="margin:0 0 20px;border-left:4px solid #d1e7d9;padding:10px 16px;background:#f4f7f5;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Notes</p>
        <p style="margin:0;font-size:13px;color:#334155;line-height:1.65;white-space:pre-line;">${data.notes}</p>
      </div>`
    : ''

  // ── Full email content ─────────────────────────────────────────────────
  const content = `
  ${fromToBlock}
  ${invoiceHeaderRow}
  ${lineItemsTable}
  ${amountDueHero}

  ${notesBlock}

  ${ctaButton(`Pay Now — $${data.amountDue.toFixed(2)}`, data.paymentUrl)}
`

  const [introRaw, closingRaw] = renderTemplate(subjectTemplate.body, tokens).split(LINE_ITEMS_MARKER)
  const intro = (introRaw ?? '').trim()
  const closing = (closingRaw ?? '').trim()

  const introHtml = intro
    ? intro.split(/\n{2,}/).map(p => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;">${p}</p>`).join('')
    : ''
  const closingHtml = closing
    ? closing.split(/\n{2,}/).map(p => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;">${p}</p>`).join('')
    : ''

  return {
    subject,
    html: baseTemplate(
      `${introHtml}${content}${closingHtml}`,
      `Invoice from RenewShine — Total: $${data.amountDue.toFixed(2)}`
    ),
  }
}

async function getInvoiceTemplate(channel: 'email' | 'sms') {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('message_templates')
      .select('subject, body')
      .eq('template_id', 'invoice')
      .eq('channel', channel)
      .maybeSingle()
    if (data) return data
  } catch {
    // fall through to default
  }
  const def = DEFAULT_TEMPLATES.find(t => t.templateId === 'invoice' && t.channel === channel)!
  return { subject: def.subject, body: def.body }
}
