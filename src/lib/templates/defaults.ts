import type { MessageTemplate } from './types'

// Must stay byte-for-byte identical to the seed data in
// supabase/migrations/20260701000001_create_message_templates.sql.
// Runtime fallback used when a row is missing from the database
// (deleted, reset, or not yet seeded) - the app must never break or
// show blank copy because of a missing row.

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    templateId: 'photos',
    channel: 'email',
    subject: 'One quick step before your quote',
    body: `Hi {{firstName}},

One quick step before your quote.

Before we confirm a price, our team reviews photos of every space. Please send a few photos or a short walkthrough video{{roomCallout}} to hello@renewshine.co, or text them to (771) 253-9204.

A short video call works too. Just text us to arrange a time.

Once we've reviewed everything, we'll send your confirmed quote and reach out to schedule.

RenewShine`,
  },
  {
    templateId: 'photos',
    channel: 'sms',
    subject: null,
    body: `Hi {{firstName}}, one quick step before your quote.

Please send a few photos or a short video{{roomCallout}}. Text them here or to (771) 253-9204.

A short video call works too. We'll have your quote ready as soon as possible.

RenewShine`,
  },
  {
    templateId: 'quote_dep',
    channel: 'email',
    subject: '{{firstName}}, your RenewShine quote is ready',
    body: `Hi {{firstName}},

We've reviewed your request and your quote is ready.

Service: {{serviceDetail}}
{{scheduleLabel}}: {{schedule}}
Total: {{total}}
Deposit to reserve your date: {{deposit}}
Balance after service: {{balance}}
{{recurringLine}}
Reserve here:
[deposit link included]

RenewShine`,
  },
  {
    templateId: 'quote_dep',
    channel: 'sms',
    subject: null,
    body: `Hi {{firstName}}, we've reviewed your request and your quote is ready.

Service: {{serviceDetail}}
{{scheduleLabel}}: {{schedule}}
Total: {{total}}
Deposit to reserve your date: {{deposit}}
Balance after service: {{balance}}
{{recurringLine}}
Reserve here:
[deposit link included]

RenewShine`,
  },
  {
    templateId: 'quote_dep_bullets',
    channel: 'email',
    subject: null,
    body: `Confirmed pricing before service
Professional equipment and supplies included
Fully insured cleaning professionals
Satisfaction guaranteed`,
  },
  {
    templateId: 'quote_dep_next_steps',
    channel: 'email',
    subject: null,
    body: `Reserve your date with the payment above to hold your spot
We'll confirm your exact date and send a booking confirmation
We show up and take care of everything. No surprises.`,
  },
  {
    templateId: 'quote_dep_schedule_requested',
    channel: 'email',
    subject: null,
    body: `Requested window
Your requested window
Exact date confirmed after deposit`,
  },
  {
    templateId: 'quote_dep_schedule_confirmed',
    channel: 'email',
    subject: null,
    body: `Appointment
Your appointment`,
  },
  {
    templateId: 'quote_dep_chrome',
    channel: 'email',
    subject: null,
    body: `badge: Quote ready
heading: {{firstName}}, your quote is ready.
preheader: {{firstName}}, your {{service}} quote is ready. Reserve your date with the payment below.
locationsHeader: Your service locations
serviceHeader: Your service details
paymentHeader: Payment summary
totalLabel: Total service
dueTodayLabel: Due today
dueTodayNote: (deposit)
balanceLabel: Remaining balance
balanceNote: (after service)
disclaimer: No hidden fees. Fully insured cleaning professionals. If anything differs from the photos provided, we'll discuss it with you before any additional work is performed.
trustHeader: Why homeowners choose RenewShine
ctaLabel: Pay Deposit
nextStepsHeader: What happens next`,
  },
  {
    templateId: 'quote_no',
    channel: 'email',
    subject: '{{firstName}}, your RenewShine quote is ready',
    body: `Hi {{firstName}},

We've reviewed your request. Your quote is ready.

Service: {{service}}{{bedBath}}
Requested dates: {{availabilityWindow}}
Total: {{total}}

We'll be in touch to confirm your appointment.

RenewShine`,
  },
  {
    templateId: 'quote_no',
    channel: 'sms',
    subject: null,
    body: `Hi {{firstName}}, your {{service}} quote is {{total}}.

Service: {{service}}{{bedBath}}
Requested dates: {{availabilityWindow}}

Reply YES to confirm and we'll get you scheduled.

RenewShine`,
  },
  {
    templateId: 'appt',
    channel: 'email',
    subject: '{{firstName}}, your {{service}} is confirmed for {{date}}',
    body: `Hi {{firstName}},

Your {{service}} is confirmed for {{date}}, {{arrivalWindow}}.

Before we arrive:
- Clear countertops of small appliances, dishes, and personal items so our team can clean every surface.
- Secure pets in a separate room or outside the home during the visit.
- Let us know in advance about any fragile, high-value, or sentimental items.
- If you won't be home, share your access details such as a door code, lockbox, or key location.

We bring all supplies and equipment. You'll get a reminder text the day before your appointment.

RenewShine`,
  },
  {
    templateId: 'appt',
    channel: 'sms',
    subject: null,
    body: `Hi {{firstName}}, your {{service}} is confirmed for {{date}}, {{arrivalWindow}}.

Please clear countertops of small items and secure pets before we arrive. We bring all supplies and equipment.

You'll get a reminder text the day before.

RenewShine`,
  },
  {
    templateId: 'reminder',
    channel: 'email',
    subject: 'Reminder: your {{service}} is tomorrow',
    body: `Hi {{firstName}},

This is a reminder that your {{service}} is tomorrow, {{date}}, {{arrivalWindow}}.

Address on file: {{address}}

We're looking forward to helping you enjoy a cleaner home tomorrow.

RenewShine`,
  },
  {
    templateId: 'reminder',
    channel: 'sms',
    subject: null,
    body: `Hi {{firstName}}, your {{service}} is tomorrow, {{date}}, {{arrivalWindow}}.

Address: {{address}}.

Reply YES to confirm or let us know if anything has changed.

RenewShine`,
  },
  {
    templateId: 'invoice',
    channel: 'email',
    subject: 'Your RenewShine invoice {{invoiceNumber}} ({{amountDue}})',
    body: `Hi {{firstName}},

Thank you for choosing RenewShine. Here is your invoice for {{service}}{{serviceDateLine}}.

{{lineItems}}

Payment is due within 24 hours of service.

RenewShine`,
  },
  {
    templateId: 'invoice',
    channel: 'sms',
    subject: null,
    body: `Hi {{firstName}}, your RenewShine invoice is ready.

Service: {{service}}
Total: {{total}}
Balance due: {{balance}}

Pay here:
[deposit link included]

RenewShine`,
  },
]
