-- 1. Confirmed arrival window, separate from the customer's request.
--    lock-in-booking previously wrote the owner's chosen arrival window
--    into availability_time_pref, destroying what the customer submitted.
--    These are two different facts and need two different columns.

alter table jobs add column if not exists confirmed_arrival_pref text;

alter table jobs drop constraint if exists jobs_confirmed_arrival_pref_check;
alter table jobs add constraint jobs_confirmed_arrival_pref_check
  check (confirmed_arrival_pref is null or confirmed_arrival_pref = any (array[
    'morning', 'afternoon', 'flexible',
    'early_morning', 'mid_morning', 'noon',
    'early_afternoon', 'late_afternoon'
  ]));

-- 2. Backfill: any job that already has a confirmed_date had its arrival
--    window written into availability_time_pref by the old code. Copy it
--    across so existing approved/scheduled jobs keep rendering correctly.
update jobs
  set confirmed_arrival_pref = availability_time_pref
  where confirmed_date is not null
    and confirmed_arrival_pref is null
    and availability_time_pref is not null;

-- 3. Editable schedule copy — replaces the hardcoded strings in
--    src/lib/email/templates/customer-quote.ts.
--    Line 1 = inline label, line 2 = card header, line 3 = badge (may be blank).
--    Follows the same seed pattern as 20260701000002.

insert into message_templates (template_id, channel, subject, body) values
('quote_dep_schedule_requested', 'email', null,
'Requested window
Your requested window
Exact date confirmed after deposit'),
('quote_dep_schedule_confirmed', 'email', null,
'Appointment
Your appointment')
on conflict (template_id, channel) do update set
  subject = excluded.subject,
  body = excluded.body,
  updated_at = now();
