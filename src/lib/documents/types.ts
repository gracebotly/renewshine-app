export type DocumentChannel = 'email' | 'sms'

export type MessageKey =
  | 'photos'
  | 'quote_dep'
  | 'quote_no'
  | 'appt'
  | 'reminder'
  | 'invoice'

export const MESSAGE_KEYS: MessageKey[] = [
  'photos',
  'quote_dep',
  'quote_no',
  'appt',
  'reminder',
  'invoice',
]

export const MESSAGE_LABELS: Record<MessageKey, string> = {
  photos: 'Request photos / video',
  quote_dep: 'Quote + deposit link',
  quote_no: 'Quote — no deposit',
  appt: 'Appointment confirmation',
  reminder: 'Day-before reminder',
  invoice: 'Invoice (balance due)',
}

export type BadgeColor = 'green' | 'amber' | 'blue' | 'navy'
export type LinkTarget = 'deposit_link' | 'payment_link' | 'booking_url' | 'custom'

export type EmailBlock =
  | { id: string; type: 'badge'; text: string; color: BadgeColor }
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'scheduleCard'; header: string; pill?: string }
  | { id: string; type: 'detailsCard'; header: string }
  | {
      id: string
      type: 'paymentCard'
      header: string
      totalLabel: string
      dueLabel: string
      dueNote: string
      balanceLabel: string
      balanceNote: string
      disclaimer: string
    }
  | { id: string; type: 'invoiceTable'; header: string }
  | { id: string; type: 'bulletList'; header: string; lines: string[] }
  | { id: string; type: 'numberedSteps'; header: string; lines: string[] }
  | { id: string; type: 'button'; label: string; target: LinkTarget; url?: string }
  | { id: string; type: 'divider' }

export type SmsBlock =
  | { id: string; type: 'textLine'; text: string }
  | { id: string; type: 'linkLine'; target: LinkTarget; url?: string }
  | { id: string; type: 'blankLine' }

export interface EmailDocument {
  channel: 'email'
  subject: string
  blocks: EmailBlock[]
}

export interface SmsDocument {
  channel: 'sms'
  subject: null
  blocks: SmsBlock[]
}

export type MessageDocument = EmailDocument | SmsDocument

export const EMAIL_BLOCK_TYPES = [
  'badge',
  'heading',
  'paragraph',
  'scheduleCard',
  'detailsCard',
  'paymentCard',
  'invoiceTable',
  'bulletList',
  'numberedSteps',
  'button',
  'divider',
] as const

export const SMS_BLOCK_TYPES = ['textLine', 'linkLine', 'blankLine'] as const

export function documentKey(key: MessageKey, channel: DocumentChannel): string {
  return `${key}:${channel}`
}

export function isValidDocument(value: unknown): value is MessageDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as Record<string, unknown>
  if (doc.channel !== 'email' && doc.channel !== 'sms') return false
  if (!Array.isArray(doc.blocks)) return false
  const allowed: readonly string[] =
    doc.channel === 'email' ? EMAIL_BLOCK_TYPES : SMS_BLOCK_TYPES
  return doc.blocks.every(b => {
    if (!b || typeof b !== 'object') return false
    const block = b as Record<string, unknown>
    return typeof block.id === 'string' && typeof block.type === 'string' && allowed.includes(block.type)
  })
}
