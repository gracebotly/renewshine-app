-- Add editable quote-deposit styled email sections used by
-- src/lib/email/templates/customer-quote.ts.

insert into message_templates (template_id, channel, subject, body) values
('quote_dep_bullets', 'email', null,
'Confirmed pricing before service
Professional equipment and supplies included
Fully insured cleaning professionals
Satisfaction guaranteed'),
('quote_dep_next_steps', 'email', null,
'Reserve your date with the payment above to hold your spot
We''ll confirm your exact date and send a booking confirmation
We show up and take care of everything. No surprises.')
on conflict (template_id, channel) do update set
  subject = excluded.subject,
  body = excluded.body,
  updated_at = now();
