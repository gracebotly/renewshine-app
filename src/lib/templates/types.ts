export type TemplateId = 'photos' | 'quote_dep' | 'quote_no' | 'appt' | 'reminder' | 'invoice'
export type TemplateChannel = 'email' | 'sms'

export interface MessageTemplate {
  templateId: TemplateId
  channel: TemplateChannel
  subject: string | null
  body: string
}

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  photos: 'Request photos / video',
  quote_dep: 'Quote + deposit link',
  quote_no: 'Quote — no deposit',
  appt: 'Appointment confirmation',
  reminder: 'Day-before reminder',
  invoice: 'Invoice (balance due)',
}

// Tokens available per template — shown as helper text in the settings page.
export const TEMPLATE_TOKENS: Record<TemplateId, string[]> = {
  photos: ['firstName', 'roomCallout'],
  quote_dep: ['firstName', 'service', 'serviceDetail', 'bedBath', 'availabilityWindow', 'timePreference', 'total', 'deposit', 'balance', 'recurringLine'],
  quote_no: ['firstName', 'service', 'bedBath', 'availabilityWindow', 'total'],
  appt: ['firstName', 'service', 'date', 'arrivalWindow'],
  reminder: ['firstName', 'service', 'date', 'arrivalWindow', 'address'],
  invoice: ['firstName', 'service', 'serviceDateLine', 'invoiceNumber', 'amountDue', 'total', 'balance', 'lineItems'],
}

// Special-case placeholders, not regular {{tokens}} — preserved exactly as
// they work today. Do not let the settings page treat these as removable.
//
// [deposit link included] — replaced with the real Stripe URL at send time
// in send-deposit-link/route.ts (quote_dep) and, once wired in a later
// prompt, the invoice send route. QuoteCard.tsx replaces it with a preview
// URL for on-screen display only.
//
// {{lineItems}} — only valid in the invoice email template. Marks where
// the dynamically generated line-items HTML table is inserted. Everything
// before this token in the body is the intro, everything after is the
// closing. Do not allow this to be used in any other template.
export const DEPOSIT_LINK_PLACEHOLDER = '[deposit link included]'
export const LINE_ITEMS_MARKER = '{{lineItems}}'
