import twilio from 'twilio'

// Twilio client singleton
// Only instantiated when env vars are present — safe in dev without credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

export const twilioClient = accountSid && authToken
  ? twilio(accountSid, authToken)
  : null
