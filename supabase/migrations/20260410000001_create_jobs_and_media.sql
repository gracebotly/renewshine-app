-- ============================================================
-- Migration: create_jobs_and_media
-- Created: 2026-04-10
-- Description: Initial schema for RenewShine booking system.
--              Creates jobs and job_media tables with RLS.
--              Applied to Supabase project nueoothgsydbdrseinyu
--              via MCP on 2026-04-10. This file documents that
--              change for version control.
-- ============================================================

create table if not exists jobs (
  id                     uuid      primary key default gen_random_uuid(),
  type                   text      check (type in ('residential', 'commercial')),
  status                 text      check (
                                     status in (
                                       'new',
                                       'under_review',
                                       'approved',
                                       'scheduled',
                                       'completed',
                                       'cancelled'
                                     )
                                   ) default 'new',
  client_name            text      not null,
  client_phone           text,
  client_email           text      not null,
  address                text,
  service_type           text      check (service_type in ('standard', 'deep', 'move_out')),
  bedrooms               int,
  bathrooms              int,
  add_ons                jsonb     default '[]',
  square_footage         int,
  condition              text,
  business_name          text,
  service_frequency      text,
  availability_start     date,
  availability_end       date,
  availability_time_pref text      check (
                                     availability_time_pref in (
                                       'morning',
                                       'afternoon',
                                       'flexible'
                                     )
                                   ),
  confirmed_date         timestamp,
  estimated_price_low    numeric,
  estimated_price_high   numeric,
  approved_price         numeric,
  deposit_amount         numeric   default 100,
  remaining_amount       numeric,
  deposit_paid           boolean   default false,
  stripe_payment_link    text,
  stripe_session_id      text,
  notes                  text,
  created_at             timestamp default now()
);

create table if not exists job_media (
  id         uuid      primary key default gen_random_uuid(),
  job_id     uuid      references jobs(id) on delete cascade,
  file_url   text      not null,
  file_type  text,
  created_at timestamp default now()
);

-- Row Level Security
alter table jobs      enable row level security;
alter table job_media enable row level security;

-- Service role has full access (API routes use the service role key)
create policy "Service role full access"
  on jobs for all using (true);

create policy "Service role full access"
  on job_media for all using (true);
