-- Facebook Lead Ads capture.
-- Leads arrive from Meta Instant Forms with contact info only. They are stored
-- as `partial` jobs and resumed via an unguessable token so the customer does
-- not retype their name, email, and phone.

alter table jobs
  add column if not exists source text not null default 'website',
  add column if not exists external_lead_id text,
  add column if not exists resume_token uuid;

alter table jobs
  drop constraint if exists jobs_source_check;

alter table jobs
  add constraint jobs_source_check
  check (source = any (array['website'::text, 'facebook'::text, 'instagram'::text, 'phone'::text, 'referral'::text]));

-- Partial unique index: unlimited NULLs for the website flow, which uses no token.
create unique index if not exists jobs_resume_token_key
  on jobs (resume_token)
  where resume_token is not null;

-- Idempotency guard for Meta redelivering the same leadgen webhook.
create unique index if not exists jobs_external_lead_id_key
  on jobs (external_lead_id)
  where external_lead_id is not null;

create index if not exists jobs_source_status_idx on jobs (source, status);

comment on column jobs.source is 'Acquisition channel. Defaults to website.';
comment on column jobs.external_lead_id is 'Meta leadgen_id. Used for webhook idempotency.';
comment on column jobs.resume_token is 'Unguessable token for prefilling /booking. Null for website-originated jobs.';
