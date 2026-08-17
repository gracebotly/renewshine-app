import {
  baseTemplate,
  badge,
  heading,
  ctaButton,
  divider,
} from '@/lib/email/templates/base'
import { renderTemplate } from './tokens'
import type { EmailBlock, EmailDocument, LinkTarget } from './types'
import type { RenderContext } from './context'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
function t(value: string, ctx: RenderContext): string {
  return escapeHtml(renderTemplate(value, ctx.tokens))
}
function sectionLabel(text: string): string {
  return `<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">${text}</p>`
}
function resolveUrl(
  target: LinkTarget,
  custom: string | undefined,
  ctx: RenderContext
): string {
  if (target === 'custom') return custom?.trim() || '#'
  return ctx.urls[target] ?? '#'
}
function paragraphHtml(text: string, ctx: RenderContext): string {
  return renderTemplate(text, ctx.tokens)
    .trim()
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;white-space:pre-line;">${escapeHtml(p)}</p>`
    )
    .join('')
}

function renderBlock(block: EmailBlock, ctx: RenderContext): string {
  switch (block.type) {
    case 'badge':
      return badge(t(block.text, ctx), block.color)
    case 'heading':
      return heading(t(block.text, ctx))
    case 'paragraph':
      return paragraphHtml(block.text, ctx)
    case 'divider':
      return divider
    case 'scheduleCard': {
      // Confirmed wording replaces the requested-date copy and intentionally does not
      // inherit its pill, because the date is already locked.
      const header = ctx.hasConfirmedDate
        ? block.headerConfirmed?.trim() || block.header
        : block.header
      const pill = ctx.hasConfirmedDate
        ? block.pillConfirmed?.trim()
        : block.pill?.trim()
      return `
    ${sectionLabel(t(header, ctx))}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:16px 18px ${pill ? '12px' : '16px'};">
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;line-height:1.3;">${escapeHtml(ctx.scheduleValue)}</p>
            <p style="margin:0${pill ? ' 0 12px' : ''};font-size:13px;color:#64748b;">${escapeHtml(ctx.addressLine)}</p>
            ${pill ? `<span style="display:inline-block;background:#fef9ec;color:#92600a;font-size:11px;font-weight:600;padding:4px 10px;border-radius:99px;letter-spacing:0.02em;">${t(pill, ctx)}</span>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`
    }
    case 'detailsCard': {
      const addOnRows = ctx.addOnLabels
        .map(
          (label) => `
      <tr>
        <td style="padding:3px 0 3px 0;font-size:13px;color:#334155;line-height:1.5;">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#4A7C59;margin-right:8px;vertical-align:middle;margin-bottom:2px;"></span>${escapeHtml(label)}
        </td>
      </tr>`
        )
        .join('')
      return `
    ${sectionLabel(t(block.header, ctx))}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(ctx.serviceLabel)}</p>
            ${ctx.bedBathLine ? `<p style="margin:0 0 ${ctx.addOnLabels.length > 0 ? '10px' : '0'};font-size:12px;color:#64748b;">${escapeHtml(ctx.bedBathLine)}</p>` : ''}
            ${ctx.addOnLabels.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${addOnRows}</table>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`
    }
    case 'paymentCard':
      return `
    ${sectionLabel(t(block.header, ctx))}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 8px;">
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">${t(block.totalLabel, ctx)}</p>
            <p style="margin:0;font-size:26px;font-weight:700;color:#0f172a;font-family:'Courier New',monospace;letter-spacing:-0.5px;">${escapeHtml(ctx.totalDisplay)}</p>
          </td>
        </tr>
        <tr style="background:#f0f9f4;border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td style="font-size:13px;font-weight:600;color:#1A2E1F;">${t(block.dueLabel, ctx)} <span style="font-weight:400;color:#4A7C59;">${t(block.dueNote, ctx)}</span></td>
              <td style="text-align:right;font-size:15px;font-weight:700;color:#1A2E1F;font-family:'Courier New',monospace;">${escapeHtml(ctx.depositDisplay)}</td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:12px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
            <td style="font-size:13px;color:#64748b;">${t(block.balanceLabel, ctx)} <span style="color:#94a3b8;">${t(block.balanceNote, ctx)}</span></td>
            <td style="text-align:right;font-size:13px;font-weight:600;color:#64748b;font-family:'Courier New',monospace;">${escapeHtml(ctx.balanceDisplay)}</td>
          </tr></table>
        </td></tr>
      </tbody>
    </table>
    ${block.disclaimer.trim() ? `<p style="margin:0 0 24px;font-size:12px;color:#94a3b8;line-height:1.6;">${t(block.disclaimer, ctx)}</p>` : ''}`
    case 'invoiceTable': {
      if (ctx.invoiceLines.length === 0 && ctx.quoteLineItems.length === 0)
        return ''
      const rows =
        ctx.invoiceLines.length > 0
          ? ctx.invoiceLines.map(
              (l) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 18px;font-size:13px;color:#0f172a;line-height:1.5;">${escapeHtml(l.description)}</td>
      <td style="padding:10px 18px;text-align:right;font-size:13px;font-weight:600;color:#0f172a;font-family:'Courier New',monospace;white-space:nowrap;">$${l.amount.toLocaleString()}</td>
    </tr>`
            )
          : ctx.quoteLineItems.map(
              (l) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 18px;font-size:13px;color:#0f172a;line-height:1.5;">${escapeHtml(l.label)}</td>
      <td style="padding:10px 18px;text-align:right;font-size:13px;font-weight:600;color:#0f172a;font-family:'Courier New',monospace;white-space:nowrap;">$${l.price.toLocaleString()}</td>
    </tr>`
            )
      return `
    ${sectionLabel(t(block.header, ctx))}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>${rows.join('')}</tbody>
    </table>`
    }
    case 'bulletList': {
      const rows = block.lines
        .map((line) => renderTemplate(line, ctx.tokens).trim())
        .filter(Boolean)
        .map(
          (line) =>
            `<tr><td style="padding:3px 0;font-size:13px;color:#0f172a;line-height:1.5;"><span style="color:#4A7C59;font-weight:700;margin-right:8px;">·</span>${escapeHtml(line)}</td></tr>`
        )
        .join('')
      if (!rows) return ''
      return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 20px;padding:16px 20px;">
      <tr><td>
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#4A7C59;text-transform:uppercase;letter-spacing:0.08em;">${t(block.header, ctx)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table>
      </td></tr>
    </table>`
    }
    case 'numberedSteps': {
      const lines = block.lines
        .map((l) => renderTemplate(l, ctx.tokens).trim())
        .filter(Boolean)
      if (lines.length === 0) return ''
      const rows = lines
        .map(
          (line, index) => `
        <tr>
          <td style="padding:13px 16px;vertical-align:middle;width:40px;${index < lines.length - 1 ? 'border-bottom:1px solid #e8f0eb;' : ''}">
            <div style="width:24px;height:24px;border-radius:50%;background:#4A7C59;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:24px;">${index + 1}</div>
          </td>
          <td style="padding:13px 16px 13px 0;font-size:13px;color:#0f172a;line-height:1.5;vertical-align:middle;${index < lines.length - 1 ? 'border-bottom:1px solid #e8f0eb;' : ''}">${escapeHtml(line)}</td>
        </tr>`
        )
        .join('')
      return `
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">${t(block.header, ctx)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f8faf9;border:1px solid #d1e7d9;border-radius:8px;margin:0 0 20px;">
      <tbody>${rows}</tbody>
    </table>`
    }
    case 'button':
      return ctaButton(
        t(block.label, ctx),
        resolveUrl(block.target, block.url, ctx)
      )
  }
}

export function renderEmailDocument(
  doc: EmailDocument,
  ctx: RenderContext
): { subject: string; html: string } {
  const content = doc.blocks.map((b) => renderBlock(b, ctx)).join('\n')
  const firstHeading = doc.blocks.find((b) => b.type === 'heading')
  const preview = firstHeading
    ? renderTemplate(firstHeading.text, ctx.tokens)
    : renderTemplate(doc.subject, ctx.tokens)
  return {
    subject: renderTemplate(doc.subject, ctx.tokens),
    html: baseTemplate(content, escapeHtml(preview)),
  }
}
