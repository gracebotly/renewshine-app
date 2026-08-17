import type { MessageDocument, MessageKey } from './types'
import { documentKey } from './types'

export const DEFAULT_DOCUMENTS: Record<string, MessageDocument> = {
  'quote_dep:email': {
    channel: 'email',
    subject: '{{firstName}}, your RenewShine quote is ready',
    blocks: [
      { id: 'badge', type: 'badge', text: 'Quote ready', color: 'green' },
      {
        id: 'heading',
        type: 'heading',
        text: '{{firstName}}, your quote is ready.',
      },
      {
        id: 'intro',
        type: 'paragraph',
        text: "Hi {{firstName}},\n\nWe've reviewed your request and your quote is ready.",
      },
      {
        id: 'schedule',
        type: 'scheduleCard',
        header: 'Your requested window',
        pill: 'Exact date confirmed after deposit',
        headerConfirmed: 'Your appointment',
      },
      { id: 'details', type: 'detailsCard', header: 'Your service details' },
      {
        id: 'payment',
        type: 'paymentCard',
        header: 'Payment summary',
        totalLabel: 'Total service',
        dueLabel: 'Due today',
        dueNote: '(deposit)',
        balanceLabel: 'Remaining balance',
        balanceNote: '(after service)',
        disclaimer:
          "No hidden fees. Fully insured cleaning professionals. If anything differs from the photos provided, we'll discuss it with you before any additional work is performed.",
      },
      {
        id: 'trust',
        type: 'bulletList',
        header: 'Why homeowners choose RenewShine',
        lines: [
          'Confirmed pricing before service',
          'Professional equipment and supplies included',
          'Fully insured cleaning professionals',
          'Satisfaction guaranteed',
        ],
      },
      {
        id: 'cta',
        type: 'button',
        label: 'Pay Deposit',
        target: 'deposit_link',
      },
      { id: 'div', type: 'divider' },
      {
        id: 'steps',
        type: 'numberedSteps',
        header: 'What happens next',
        lines: [
          'Reserve your date with the payment above to hold your spot',
          "We'll confirm your exact date and send a booking confirmation",
          'We show up and take care of everything. No surprises.',
        ],
      },
    ],
  },
  'quote_dep:sms': {
    channel: 'sms',
    subject: null,
    blocks: [
      {
        id: 'l1',
        type: 'textLine',
        text: "Hi {{firstName}}, we've reviewed your request and your quote is ready.",
      },
      { id: 'b1', type: 'blankLine' },
      { id: 'l2', type: 'textLine', text: 'Service: {{serviceDetail}}' },
      { id: 'l3', type: 'textLine', text: '{{scheduleLabel}}: {{schedule}}' },
      { id: 'l4', type: 'textLine', text: 'Total: {{total}}' },
      {
        id: 'l5',
        type: 'textLine',
        text: 'Deposit to reserve your date: {{deposit}}',
      },
      {
        id: 'l6',
        type: 'textLine',
        text: 'Balance after service: {{balance}}',
      },
      { id: 'b2', type: 'blankLine' },
      { id: 'l7', type: 'textLine', text: 'Reserve here:' },
      { id: 'link', type: 'linkLine', target: 'deposit_link' },
      { id: 'b3', type: 'blankLine' },
      { id: 'sig', type: 'textLine', text: 'RenewShine' },
    ],
  },
  'photos:email': {
    channel: 'email',
    subject: 'One quick step before your quote',
    blocks: [
      {
        id: 'heading',
        type: 'heading',
        text: 'One quick step before your quote',
      },
      { id: 'p1', type: 'paragraph', text: 'Hi {{firstName}},' },
      {
        id: 'p3',
        type: 'paragraph',
        text: 'Before we confirm a price, our team reviews photos of every space. Please send a few photos or a short walkthrough video{{roomCallout}} to hello@renewshine.co, or text them to (771) 253-9204.',
      },
      {
        id: 'p4',
        type: 'paragraph',
        text: 'A short video call works too. Just text us to arrange a time.',
      },
      {
        id: 'p5',
        type: 'paragraph',
        text: "Once we've reviewed everything, we'll send your confirmed quote and reach out to schedule.",
      },
      { id: 'p6', type: 'paragraph', text: 'RenewShine' },
    ],
  },
  'photos:sms': {
    channel: 'sms',
    subject: null,
    blocks: [
      {
        id: 'l1',
        type: 'textLine',
        text: 'Hi {{firstName}}, one quick step before your quote.',
      },
      { id: 'b1', type: 'blankLine' },
      {
        id: 'l2',
        type: 'textLine',
        text: 'Please send a few photos or a short video{{roomCallout}}. Text them here or to (771) 253-9204.',
      },
      { id: 'b2', type: 'blankLine' },
      {
        id: 'l3',
        type: 'textLine',
        text: "A short video call works too. We'll have your quote ready as soon as possible.",
      },
      { id: 'b3', type: 'blankLine' },
      { id: 'sig', type: 'textLine', text: 'RenewShine' },
    ],
  },
  'quote_no:email': {
    channel: 'email',
    subject: '{{firstName}}, your RenewShine quote is ready',
    blocks: [
      {
        id: 'heading',
        type: 'heading',
        text: '{{firstName}}, your RenewShine quote is ready',
      },
      { id: 'p1', type: 'paragraph', text: 'Hi {{firstName}},' },
      {
        id: 'p2',
        type: 'paragraph',
        text: "We've reviewed your request. Your quote is ready.",
      },
      {
        id: 'p3',
        type: 'paragraph',
        text: 'Service: {{service}}{{bedBath}}\nRequested dates: {{schedule}}\nTotal: {{total}}',
      },
      {
        id: 'p4',
        type: 'paragraph',
        text: "We'll be in touch to confirm your appointment.",
      },
      { id: 'p5', type: 'paragraph', text: 'RenewShine' },
    ],
  },
  'quote_no:sms': {
    channel: 'sms',
    subject: null,
    blocks: [
      {
        id: 'l1',
        type: 'textLine',
        text: 'Hi {{firstName}}, your {{service}} quote is {{total}}.',
      },
      { id: 'b1', type: 'blankLine' },
      { id: 'l2', type: 'textLine', text: 'Service: {{service}}{{bedBath}}' },
      {
        id: 'l3',
        type: 'textLine',
        text: 'Requested dates: {{schedule}}',
      },
      { id: 'b2', type: 'blankLine' },
      {
        id: 'l4',
        type: 'textLine',
        text: "Reply YES to confirm and we'll get you scheduled.",
      },
      { id: 'b3', type: 'blankLine' },
      { id: 'sig', type: 'textLine', text: 'RenewShine' },
    ],
  },
  'appt:email': {
    channel: 'email',
    subject: '{{firstName}}, your {{service}} is confirmed for {{date}}',
    blocks: [
      { id: 'heading', type: 'heading', text: 'Your {{service}} is confirmed' },
      { id: 'greeting', type: 'paragraph', text: 'Hi {{firstName}},' },
      {
        id: 'schedule',
        type: 'scheduleCard',
        header: 'Your appointment',
        pill: 'Your appointment',
        headerConfirmed: 'Your appointment',
      },
      { id: 'signoff', type: 'paragraph', text: 'RenewShine' },
    ],
  },
  'appt:sms': {
    channel: 'sms',
    subject: null,
    blocks: [
      {
        id: 'l1',
        type: 'textLine',
        text: 'Hi {{firstName}}, your {{service}} is confirmed for {{date}}, {{arrivalWindow}}.',
      },
      {
        id: 'l2',
        type: 'textLine',
        text: 'Please clear countertops of small items and secure pets before we arrive. We bring all supplies and equipment.',
      },
      {
        id: 'l3',
        type: 'textLine',
        text: "You'll get a reminder text the day before.",
      },
      { id: 'sig', type: 'textLine', text: 'RenewShine' },
    ],
  },
  // Reminder wording uses the shared context labels ('Flexible'), not the
  // route's old local map ('Morning to Afternoon'). Deliberate — one source
  // of truth for time windows across every message.
  'reminder:email': {
    channel: 'email',
    subject: 'Reminder: your {{service}} is tomorrow',
    blocks: [
      {
        id: 'heading',
        type: 'heading',
        text: 'Reminder: your {{service}} is tomorrow',
      },
      { id: 'p1', type: 'paragraph', text: 'Hi {{firstName}},' },
      {
        id: 'p2',
        type: 'paragraph',
        text: 'This is a reminder that your {{service}} is tomorrow, {{date}}, {{arrivalWindow}}.',
      },
      { id: 'p3', type: 'paragraph', text: 'Address on file: {{address}}' },
      {
        id: 'p4',
        type: 'paragraph',
        text: "We're looking forward to helping you enjoy a cleaner home tomorrow.",
      },
      { id: 'p5', type: 'paragraph', text: 'RenewShine' },
    ],
  },
  'reminder:sms': {
    channel: 'sms',
    subject: null,
    blocks: [
      {
        id: 'l1',
        type: 'textLine',
        text: 'Hi {{firstName}}, your {{service}} is tomorrow, {{date}}, {{arrivalWindow}}.',
      },
      { id: 'b1', type: 'blankLine' },
      { id: 'l2', type: 'textLine', text: 'Address: {{address}}.' },
      { id: 'b2', type: 'blankLine' },
      {
        id: 'l3',
        type: 'textLine',
        text: 'Reply YES to confirm or let us know if anything has changed.',
      },
      { id: 'b3', type: 'blankLine' },
      { id: 'sig', type: 'textLine', text: 'RenewShine' },
    ],
  },
  'invoice:email': {
    channel: 'email',
    subject: 'Your RenewShine invoice {{invoiceNumber}} ({{amountDue}})',
    blocks: [
      {
        id: 'heading',
        type: 'heading',
        text: 'Your RenewShine invoice {{invoiceNumber}}',
      },
      { id: 'p1', type: 'paragraph', text: 'Hi {{firstName}},' },
      {
        id: 'p2',
        type: 'paragraph',
        text: 'Thank you for choosing RenewShine. Here is your invoice for {{service}}.',
      },
      { id: 'items', type: 'invoiceTable', header: 'Invoice details' },
      {
        id: 'payment',
        type: 'paymentCard',
        header: 'Payment summary',
        totalLabel: 'Total service',
        dueLabel: 'Amount due',
        dueNote: '',
        balanceLabel: 'Deposit credit',
        balanceNote: '',
        disclaimer: '',
      },
      {
        id: 'p3',
        type: 'paragraph',
        text: 'Payment is due within 24 hours of service.',
      },
      {
        id: 'pay',
        type: 'button',
        label: 'Pay Invoice',
        target: 'payment_link',
      },
      { id: 'p4', type: 'paragraph', text: 'RenewShine' },
    ],
  },
  'invoice:sms': {
    channel: 'sms',
    subject: null,
    blocks: [
      {
        id: 'l1',
        type: 'textLine',
        text: 'Hi {{firstName}}, your RenewShine invoice is ready.',
      },
      { id: 'b1', type: 'blankLine' },
      { id: 'l2', type: 'textLine', text: 'Service: {{service}}' },
      { id: 'l3', type: 'textLine', text: 'Total: {{total}}' },
      { id: 'l4', type: 'textLine', text: 'Balance due: {{balance}}' },
      { id: 'b2', type: 'blankLine' },
      { id: 'l5', type: 'textLine', text: 'Pay here:' },
      { id: 'link', type: 'linkLine', target: 'payment_link' },
      { id: 'b3', type: 'blankLine' },
      { id: 'sig', type: 'textLine', text: 'RenewShine' },
    ],
  },
}

export function getDefaultDocument(
  key: MessageKey,
  channel: 'email' | 'sms'
): MessageDocument | null {
  return DEFAULT_DOCUMENTS[documentKey(key, channel)] ?? null
}
