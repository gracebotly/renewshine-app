import { twilioClient } from './client'

/**
 * Send an SMS via Twilio.
 * Never throws — same non-blocking pattern as Resend email functions.
 * Silently skips if:
 *   - `to` is null or empty (customer has no phone on file)
 *   - Twilio env vars are not set (local dev without credentials)
 */
export async function sendSms(to: string | null, body: string): Promise<void> {
  if (!to) return
  if (!twilioClient) return // env vars not set — skip silently

  const from = process.env.TWILIO_PHONE_NUMBER!

  try {
    await twilioClient.messages.create({ to, from, body })
  } catch (err) {
    console.error('SMS send failed (non-blocking):', err)
  }
}
