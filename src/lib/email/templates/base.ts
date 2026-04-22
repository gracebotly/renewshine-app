const BRAND = '#4A7C59'
const BRAND_DARK = '#3d6b4a'
const BRAND_DEEP = '#1A2E1F'
const BRAND_SAGE = '#A8D4B5'
const BRAND_MUTED = '#e8f3ec'
const TEXT_DARK = '#0f172a'
const TEXT_MUTED = '#64748b'
const BORDER = '#e2e8f0'
const BG_PAGE = '#f4f7f5'

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120" width="135" height="90" style="display:block;">
  <rect x="14" y="38" width="44" height="44" rx="10" fill="#ffffff" fill-opacity="0.2"/>
  <path d="M22 60 Q36 46 50 60" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <path d="M22 60 Q36 74 50 60" fill="none" stroke="#A8D4B5" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="36" cy="53" r="3" fill="#ffffff"/>
  <circle cx="36" cy="67" r="3" fill="#A8D4B5"/>
  <text x="68" y="53" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#ffffff" letter-spacing="-0.3">renew</text>
  <text x="68" y="72" font-family="Arial, sans-serif" font-size="17" font-weight="300" fill="#A8D4B5" letter-spacing="-0.3">shine</text>
  <line x1="68" y1="80" x2="156" y2="80" stroke="#A8D4B5" stroke-opacity="0.3" stroke-width="1"/>
  <text x="68" y="92" font-family="Arial, sans-serif" font-size="7.5" font-weight="400" fill="#A8D4B5" letter-spacing="2">PREMIUM CLEANING</text>
</svg>`

export function baseTemplate(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RenewShine</title>
</head>
<body style="margin:0;padding:0;background:${BG_PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;color:${BG_PAGE};">${previewText}</span>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BG_PAGE};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="background:${BRAND};padding:20px 28px;">
              ${LOGO_SVG}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">${content}</td>
          </tr>
          <tr>
            <td style="background:${BG_PAGE};padding:20px 32px;border-top:1px solid ${BORDER};">
              <p style="margin:0;font-size:12px;color:${TEXT_MUTED};text-align:center;">RenewShine · DMV Area · DC, Maryland &amp; Virginia</p>
              <p style="margin:6px 0 0;font-size:12px;color:${TEXT_MUTED};text-align:center;">
                <a href="mailto:renewshinedmv@gmail.com" style="color:${TEXT_MUTED};text-decoration:none;">renewshinedmv@gmail.com</a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;text-align:center;">© ${new Date().getFullYear()} RenewShine. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export const divider = `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />`

export function ctaButton(text: string, url: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
  <tr>
    <td align="center">
      <a href="${url}" target="_blank"
        style="display:inline-block;background:${BRAND};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

export function infoRow(label: string, value: string): string {
  return `
<tr>
  <td style="padding:8px 0;font-size:13px;color:${TEXT_MUTED};width:40%;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;font-size:13px;color:${TEXT_DARK};font-weight:500;vertical-align:top;">${value}</td>
</tr>`
}

export function lineItem(label: string, amount: string, highlight = false): string {
  const bg = highlight ? BRAND : 'transparent'
  const color = highlight ? '#ffffff' : TEXT_DARK
  const padding = highlight ? '10px 12px' : '8px 0'
  return `
<tr style="background:${bg};">
  <td style="padding:${padding};font-size:13px;color:${color};width:60%;">${label}</td>
  <td style="padding:${padding};font-size:13px;color:${color};font-weight:600;font-family:'Courier New',monospace;text-align:right;">${amount}</td>
</tr>`
}

export function badge(text: string, color: 'amber' | 'green' | 'blue' | 'navy'): string {
  const map = {
    amber: { bg: '#fef3c7', text: '#92400e' },
    green: { bg: BRAND_MUTED, text: BRAND_DEEP },
    blue:  { bg: '#dbeafe', text: '#1e40af' },
    navy:  { bg: BRAND_MUTED, text: BRAND },
  }
  const c = map[color]
  return `<span style="display:inline-block;background:${c.bg};color:${c.text};font-size:12px;font-weight:600;padding:4px 12px;border-radius:99px;letter-spacing:0.02em;margin-bottom:16px;">${text}</span>`
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${TEXT_DARK};letter-spacing:-0.3px;">${text}</h1>`
}

export function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:${TEXT_MUTED};line-height:1.6;">${text}</p>`
}

export function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:1px solid ${BORDER};border-radius:8px;padding:4px 16px;margin:16px 0;">
    <tbody>${rows}</tbody>
  </table>`
}

export function step(num: number, title: string, desc: string): string {
  return `
<tr>
  <td style="padding:12px 16px 12px 0;vertical-align:top;width:36px;">
    <div style="width:28px;height:28px;border-radius:50%;background:${BRAND};color:#fff;font-size:13px;font-weight:700;text-align:center;line-height:28px;">${num}</div>
  </td>
  <td style="padding:12px 0;vertical-align:top;">
    <p style="margin:0;font-size:14px;font-weight:600;color:${TEXT_DARK};">${title}</p>
    <p style="margin:4px 0 0;font-size:13px;color:${TEXT_MUTED};">${desc}</p>
  </td>
</tr>`
}

export function trustStrip(): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
  style="margin:20px 0;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};padding:12px 0;">
  <tr>
    <td align="center">
      <p style="margin:0;font-size:12px;color:#64748b;letter-spacing:0.01em;">
        Insured &amp; background-checked &nbsp;·&nbsp;
        Photo-reviewed pricing &nbsp;·&nbsp;
        No surprise charges
      </p>
    </td>
  </tr>
</table>`
}
