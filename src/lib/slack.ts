/**
 * Slack Incoming Webhook notifications — multi-channel.
 * Each function targets a specific channel via its own webhook URL.
 * Never throws — same non-blocking pattern as email.
 *
 * IMPORTANT: Env var names in Vercel must be exactly:
 *   SLACK_WEBHOOK_JOBS      (not SLACK_WEBHOOK_JOBS_URL)
 *   SLACK_WEBHOOK_BILLING   (not SLACK_WEBHOOK_BILLING_URL)
 *   SLACK_WEBHOOK_ERRORS
 */

async function post(webhookUrl: string, text: string): Promise<void> {
  if (!webhookUrl) {
    console.warn('[Slack] Skipped — webhook URL not set. Check SLACK_WEBHOOK_* env vars in Vercel.')
    return
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      console.error('[Slack] Webhook returned non-200:', res.status, await res.text())
    }
  } catch (err) {
    console.error('[Slack] Notification failed (non-blocking):', err)
  }
}

/** #jobs — fires when a new booking form is submitted */
export async function notifyNewBooking(text: string): Promise<void> {
  await post(process.env.SLACK_WEBHOOK_JOBS ?? '', text)
}

/** #jobs — fires when owner sends a quote + deposit link to a customer */
export async function notifyQuoteSent(text: string): Promise<void> {
  await post(process.env.SLACK_WEBHOOK_JOBS ?? '', text)
}

/** #billing — fires when a deposit is paid via Stripe or cash */
export async function notifyDepositPaid(text: string): Promise<void> {
  await post(process.env.SLACK_WEBHOOK_BILLING ?? '', text)
}

/** #errors — reserved for future system error alerts */
export async function notifyError(text: string): Promise<void> {
  await post(process.env.SLACK_WEBHOOK_ERRORS ?? '', text)
}
