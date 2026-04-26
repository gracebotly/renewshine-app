/**
 * Slack Incoming Webhook notifications.
 * Never throws — same non-blocking pattern as email and SMS.
 * Silently skips if SLACK_WEBHOOK_URL is not set.
 */

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL ?? ''

export async function sendSlackAlert(text: string): Promise<void> {
  if (!WEBHOOK_URL) return

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (err) {
    console.error('Slack alert failed (non-blocking):', err)
  }
}
