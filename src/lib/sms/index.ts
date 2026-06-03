import { twilioClient } from './client'

export async function sendSms(
  to: string | null,
  body: string,
  mediaUrls?: string[]
): Promise<string | null> {
  if (!to) return null
  if (!twilioClient) return null

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

    const message = await twilioClient.messages.create(params)
    return message.sid
  } catch (err) {
    console.error('SMS send failed (non-blocking):', err)
    return null
  }
}
