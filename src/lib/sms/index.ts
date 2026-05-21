import { twilioClient } from './client'

export async function sendSms(
  to: string | null,
  body: string,
  mediaUrls?: string[]
): Promise<void> {
  if (!to) return
  if (!twilioClient) return

  const from = process.env.TWILIO_PHONE_NUMBER!
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  try {
    const params: Parameters<typeof twilioClient.messages.create>[0] = {
      to,
      from,
      body,
      // Delivery status callback — populates twilio_status in sms_messages
      statusCallback: siteUrl ? `${siteUrl}/api/twilio/sms/status` : undefined,
    }

    if (mediaUrls && mediaUrls.length > 0) {
      params.mediaUrl = mediaUrls
    }

    await twilioClient.messages.create(params)
  } catch (err) {
    console.error('SMS send failed (non-blocking):', err)
  }
}
