import { twilioClient } from './client'

/**
 * Send an SMS or MMS via Twilio.
 * - Pass `mediaUrls` (array of publicly accessible URLs) to send MMS.
 * - Never throws — same non-blocking pattern as Resend email functions.
 * - Silently skips if `to` is null/empty or Twilio env vars are not set.
 */
export async function sendSms(
  to: string | null,
  body: string,
  mediaUrls?: string[]
): Promise<void> {
  if (!to) return
  if (!twilioClient) return

  const from = process.env.TWILIO_PHONE_NUMBER!

  try {
    const params: Parameters<typeof twilioClient.messages.create>[0] = {
      to,
      from,
      body,
    }

    // Only attach mediaUrl if we have actual URLs to send
    if (mediaUrls && mediaUrls.length > 0) {
      params.mediaUrl = mediaUrls
    }

    await twilioClient.messages.create(params)
  } catch (err) {
    console.error('SMS send failed (non-blocking):', err)
  }
}
