const BRAND = '#4A7C59'
const BRAND_DARK = '#3d6b4a'
const BRAND_DEEP = '#1A2E1F'
const BRAND_SAGE = '#A8D4B5'
const BRAND_MUTED = '#e8f3ec'
const TEXT_DARK = '#0f172a'
const TEXT_MUTED = '#64748b'
const BORDER = '#e2e8f0'
const BG_PAGE = '#f4f7f5'

const LOGO_IMG = `<img
  src="https://renewshine.co/logo-primary.png"
  alt="RenewShine Premium Cleaning"
  width="160"
  height="44"
  style="display:block;border:0;outline:none;text-decoration:none;"
/>`

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
              ${LOGO_IMG}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">${content}</td>
          </tr>
          <tr>
            <td style="background:${BG_PAGE};padding:24px 32px 20px;border-top:1px solid ${BORDER};">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;width:48px;">
                    <img
                      src="https://renewshine.co/logo-mark.png"
                      alt="RenewShine"
                      width="40"
                      height="40"
                      style="display:block;border-radius:8px;border:0;"
                    />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:${TEXT_DARK};line-height:1.4;">RenewShine</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;line-height:1.4;">Premium Residential &amp; Commercial Cleaning &nbsp;·&nbsp; DMV Area</p>
                    <p style="margin:4px 0 0;font-size:11px;line-height:1.4;">
                      <a href="https://renewshine.co" style="color:${BRAND};text-decoration:none;">renewshine.co</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="mailto:hello@renewshine.co" style="color:${BRAND};text-decoration:none;">hello@renewshine.co</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="tel:+17712539204" style="color:${TEXT_MUTED};text-decoration:none;">(771) 253-9204</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid ${BORDER};padding-top:14px;">© ${new Date().getFullYear()} RenewShine. All rights reserved.</p>
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
