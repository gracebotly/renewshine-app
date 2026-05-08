import twilio from 'twilio'

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? ''
  if (!authToken) return false
  return twilio.validateRequest(authToken, signature, url, params)
}
