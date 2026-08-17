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
export type LinkTarget =
  | 'deposit_link'
  | 'payment_link'
  | 'booking_url'
  | 'custom'

export type EmailBlock =
  | { id: string; type: 'badge'; text: string; color: BadgeColor }
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | {
      id: string
      type: 'scheduleCard'
      header: string
      pill?: string
      headerConfirmed?: string
      pillConfirmed?: string
    }
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
  | {
      id: string
      type: 'button'
      label: string
      target: LinkTarget
      url?: string
    }
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
  return doc.blocks.every((b) => {
    if (!b || typeof b !== 'object') return false
    const block = b as Record<string, unknown>
    return (
      typeof block.id === 'string' &&
      typeof block.type === 'string' &&
      allowed.includes(block.type)
    )
  })
}

function newId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `blk_${rand}`
}

export function createEmailBlock(type: EmailBlock['type']): EmailBlock {
  const id = newId()
  switch (type) {
    case 'badge':
      return { id, type, text: 'Label', color: 'green' }
    case 'heading':
      return { id, type, text: 'Heading' }
    case 'paragraph':
      return { id, type, text: '' }
    case 'scheduleCard':
      return { id, type, header: 'Your appointment' }
    case 'detailsCard':
      return { id, type, header: 'Your service details' }
    case 'paymentCard':
      return {
        id,
        type,
        header: 'Payment summary',
        totalLabel: 'Total service',
        dueLabel: 'Due today',
        dueNote: '(deposit)',
        balanceLabel: 'Remaining balance',
        balanceNote: '(after service)',
        disclaimer: '',
      }
    case 'invoiceTable':
      return { id, type, header: 'Invoice details' }
    case 'bulletList':
      return {
        id,
        type,
        header: 'Why homeowners choose RenewShine',
        lines: [''],
      }
    case 'numberedSteps':
      return { id, type, header: 'What happens next', lines: [''] }
    case 'button':
      return { id, type, label: 'Pay Deposit', target: 'deposit_link' }
    case 'divider':
      return { id, type }
  }
}

export function createSmsBlock(type: SmsBlock['type']): SmsBlock {
  const id = newId()
  switch (type) {
    case 'textLine':
      return { id, type, text: '' }
    case 'linkLine':
      return { id, type, target: 'deposit_link' }
    case 'blankLine':
      return { id, type }
  }
}

export const EMAIL_BLOCK_LABELS: Record<EmailBlock['type'], string> = {
  badge: 'Badge pill',
  heading: 'Heading',
  paragraph: 'Paragraph',
  scheduleCard: 'Schedule card',
  detailsCard: 'Service details card',
  paymentCard: 'Payment summary card',
  invoiceTable: 'Invoice line items',
  bulletList: 'Bullet list',
  numberedSteps: 'Numbered steps',
  button: 'Button',
  divider: 'Divider',
}

export const SMS_BLOCK_LABELS: Record<SmsBlock['type'], string> = {
  textLine: 'Text line',
  linkLine: 'Link',
  blankLine: 'Blank line',
}

export const LINK_TARGET_LABELS: Record<LinkTarget, string> = {
  deposit_link: 'Stripe deposit link',
  payment_link: 'Stripe payment link',
  booking_url: 'Booking page',
  custom: 'Custom URL',
}

const MAX_TEXT = 4000
const MAX_LINES = 20
const MAX_BLOCKS = 40

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.slice(0, MAX_TEXT) : fallback
}
function optStr(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0
    ? value.slice(0, MAX_TEXT)
    : undefined
}
function lines(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((l): l is string => typeof l === 'string')
        .slice(0, MAX_LINES)
        .map((l) => l.slice(0, MAX_TEXT))
    : []
}
function target(value: unknown): LinkTarget {
  return value === 'payment_link' ||
    value === 'booking_url' ||
    value === 'custom'
    ? value
    : 'deposit_link'
}

/** Rebuilds a client document field by field, discarding unrecognized data. */
export function sanitizeDocument(value: unknown): MessageDocument | null {
  if (!isValidDocument(value)) return null
  const doc = value as MessageDocument
  if (doc.channel === 'sms') {
    const blocks = (doc.blocks as SmsBlock[])
      .slice(0, MAX_BLOCKS)
      .map((b): SmsBlock => {
        const id = str((b as { id: unknown }).id, 'blk')
        switch (b.type) {
          case 'textLine':
            return {
              id,
              type: 'textLine',
              text: str((b as { text?: unknown }).text),
            }
          case 'linkLine':
            return {
              id,
              type: 'linkLine',
              target: target((b as { target?: unknown }).target),
              url: optStr((b as { url?: unknown }).url),
            }
          case 'blankLine':
            return { id, type: 'blankLine' }
        }
      })
    return { channel: 'sms', subject: null, blocks }
  }
  const blocks = (doc.blocks as EmailBlock[])
    .slice(0, MAX_BLOCKS)
    .map((b): EmailBlock => {
      const raw = b as unknown as Record<string, unknown>
      const id = str(raw.id, 'blk')
      switch (b.type) {
        case 'badge':
          return {
            id,
            type: 'badge',
            text: str(raw.text),
            color:
              raw.color === 'amber' ||
              raw.color === 'blue' ||
              raw.color === 'navy'
                ? raw.color
                : 'green',
          }
        case 'heading':
          return { id, type: 'heading', text: str(raw.text) }
        case 'paragraph':
          return { id, type: 'paragraph', text: str(raw.text) }
        case 'divider':
          return { id, type: 'divider' }
        case 'scheduleCard':
          return {
            id,
            type: 'scheduleCard',
            header: str(raw.header),
            pill: optStr(raw.pill),
            headerConfirmed: optStr(raw.headerConfirmed),
            pillConfirmed: optStr(raw.pillConfirmed),
          }
        case 'detailsCard':
          return { id, type: 'detailsCard', header: str(raw.header) }
        case 'invoiceTable':
          return { id, type: 'invoiceTable', header: str(raw.header) }
        case 'paymentCard':
          return {
            id,
            type: 'paymentCard',
            header: str(raw.header),
            totalLabel: str(raw.totalLabel),
            dueLabel: str(raw.dueLabel),
            dueNote: str(raw.dueNote),
            balanceLabel: str(raw.balanceLabel),
            balanceNote: str(raw.balanceNote),
            disclaimer: str(raw.disclaimer),
          }
        case 'bulletList':
          return {
            id,
            type: 'bulletList',
            header: str(raw.header),
            lines: lines(raw.lines),
          }
        case 'numberedSteps':
          return {
            id,
            type: 'numberedSteps',
            header: str(raw.header),
            lines: lines(raw.lines),
          }
        case 'button':
          return {
            id,
            type: 'button',
            label: str(raw.label),
            target: target(raw.target),
            url: optStr(raw.url),
          }
      }
    })
  return {
    channel: 'email',
    subject: str((doc as { subject?: unknown }).subject),
    blocks,
  }
}
