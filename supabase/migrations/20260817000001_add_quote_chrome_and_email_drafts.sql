-- 1. Per-job saved message drafts, keyed "<templateId>:<channel>".
--    Example: { "quote_dep:email": "Hi Grace, ..." }
alter table jobs
  add column if not exists email_draft_overrides jsonb not null default '{}'::jsonb;

-- 2. New editable template holding every previously hardcoded label in the
--    quote-deposit email. One "key: value" pair per line. A missing or blank
--    key falls back to the literal that shipped in customer-quote.ts, so a
--    partially filled or deleted row can never blank out the email.
insert into message_templates (template_id, channel, subject, body) values
('quote_dep_chrome', 'email', null,
'badge: Quote ready
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
disclaimer: No hidden fees. Fully insured cleaning professionals. If anything differs from the photos provided, we''ll discuss it with you before any additional work is performed.
trustHeader: Why homeowners choose RenewShine
ctaLabel: Pay Deposit
nextStepsHeader: What happens next')
on conflict (template_id, channel) do update set
  subject = excluded.subject,
  body = excluded.body,
  updated_at = now();
