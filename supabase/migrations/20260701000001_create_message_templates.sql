-- ============================================================
-- Migration: create_message_templates
-- Created: 2026-07-01
-- Description: Single source of truth for the 6 customer-contact
--   templates (photos, quote_dep, quote_no, appt, reminder, invoice),
--   each with an email and sms row - 12 total. Body text uses
--   {{token}} placeholders resolved at render time by
--   src/lib/templates/render.ts.
--
--   A missing row for a given (template_id, channel) is not an
--   error - the API falls back to the hardcoded defaults in
--   src/lib/templates/defaults.ts.
-- ============================================================

create table if not exists message_templates (
  template_id  text not null,
  channel      text not null check (channel in ('email', 'sms')),
  subject      text,
  body         text not null,
  updated_at   timestamp default now(),
  primary key (template_id, channel)
);

alter table message_templates enable row level security;

create policy "Service role full access"
  on message_templates for all using (true);

-- ── Seed with current defaults ──────────────────────────────
-- These must stay byte-for-byte identical to src/lib/templates/defaults.ts.
-- If you edit one, edit the other.

insert into message_templates (template_id, channel, subject, body) values

('photos', 'email', 'One quick step before your quote',
'Hi {{firstName}},

One quick step before your quote.

Before we confirm a price, our team reviews photos of every space. Please send a few photos or a short walkthrough video{{roomCallout}} to hello@renewshine.co, or text them to (771) 253-9204.

A short video call works too. Just text us to arrange a time.

Once we''ve reviewed everything, we''ll send your confirmed quote and reach out to schedule.

RenewShine'),

('photos', 'sms', null,
'Hi {{firstName}}, one quick step before your quote.

Please send a few photos or a short video{{roomCallout}}. Text them here or to (771) 253-9204.

A short video call works too. We''ll have your quote ready as soon as possible.

RenewShine'),

('quote_dep', 'email', '{{firstName}}, your RenewShine quote is ready',
'Hi {{firstName}},

We''ve reviewed your request and your quote is ready.

Service: {{serviceDetail}}
Requested dates: {{availabilityWindow}}
Preferred time: {{timePreference}}
Total: {{total}}
Deposit to reserve your date: {{deposit}}
Balance after service: {{balance}}
{{recurringLine}}
Reserve here:
[deposit link included]

RenewShine'),

('quote_dep', 'sms', null,
'Hi {{firstName}}, we''ve reviewed your request and your quote is ready.

Service: {{serviceDetail}}
Requested dates: {{availabilityWindow}}
Preferred time: {{timePreference}}
Total: {{total}}
Deposit to reserve your date: {{deposit}}
Balance after service: {{balance}}
{{recurringLine}}
Reserve here:
[deposit link included]

RenewShine'),

('quote_dep_bullets', 'email', null,
'Confirmed pricing before service
Professional equipment and supplies included
Fully insured cleaning professionals
Satisfaction guaranteed'),

('quote_dep_next_steps', 'email', null,
'Reserve your date with the payment above to hold your spot
We''ll confirm your exact date and send a booking confirmation
We show up and take care of everything. No surprises.'),

('quote_no', 'email', '{{firstName}}, your RenewShine quote is ready',
'Hi {{firstName}},

We''ve reviewed your request. Your quote is ready.

Service: {{service}}{{bedBath}}
Requested dates: {{availabilityWindow}}
Total: {{total}}

We''ll be in touch to confirm your appointment.

RenewShine'),

('quote_no', 'sms', null,
'Hi {{firstName}}, your {{service}} quote is {{total}}.

Service: {{service}}{{bedBath}}
Requested dates: {{availabilityWindow}}

Reply YES to confirm and we''ll get you scheduled.

RenewShine'),

('appt', 'email', '{{firstName}}, your {{service}} is confirmed for {{date}}',
'Hi {{firstName}},

Your {{service}} is confirmed for {{date}}, {{arrivalWindow}}.

Before we arrive:
- Clear countertops of small appliances, dishes, and personal items so our team can clean every surface.
- Secure pets in a separate room or outside the home during the visit.
- Let us know in advance about any fragile, high-value, or sentimental items.
- If you won''t be home, share your access details such as a door code, lockbox, or key location.

We bring all supplies and equipment. You''ll get a reminder text the day before your appointment.

RenewShine'),

('appt', 'sms', null,
'Hi {{firstName}}, your {{service}} is confirmed for {{date}}, {{arrivalWindow}}.

Please clear countertops of small items and secure pets before we arrive. We bring all supplies and equipment.

You''ll get a reminder text the day before.

RenewShine'),

('reminder', 'email', 'Reminder: your {{service}} is tomorrow',
'Hi {{firstName}},

This is a reminder that your {{service}} is tomorrow, {{date}}, {{arrivalWindow}}.

Address on file: {{address}}

We''re looking forward to helping you enjoy a cleaner home tomorrow.

RenewShine'),

('reminder', 'sms', null,
'Hi {{firstName}}, your {{service}} is tomorrow, {{date}}, {{arrivalWindow}}.

Address: {{address}}.

Reply YES to confirm or let us know if anything has changed.

RenewShine'),

('invoice', 'email', 'Your RenewShine invoice {{invoiceNumber}} ({{amountDue}})',
'Hi {{firstName}},

Thank you for choosing RenewShine. Here is your invoice for {{service}}{{serviceDateLine}}.

{{lineItems}}

Payment is due within 24 hours of service.

RenewShine'),

('invoice', 'sms', null,
'Hi {{firstName}}, your RenewShine invoice is ready.

Service: {{service}}
Total: {{total}}
Balance due: {{balance}}

Pay here:
[deposit link included]

RenewShine')

on conflict (template_id, channel) do nothing;
