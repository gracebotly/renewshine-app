-- ============================================================
-- Migration: create_missed_calls_and_reactivation_log
-- Created: 2026-04-15
-- Description: Creates two supporting tables for the SMS
--   automation layer.
--
--   missed_calls — logs missed call events received on the
--     Twilio number, written by the missed-call-log webhook.
--
--   reactivation_log — logs 90-day reactivation SMS events
--     fired by n8n, written by the reactivation-trigger webhook.
--
-- IMPORTANT: Already applied to nueoothgsydbdrseinyu via MCP.
-- This file is for version control only.
-- Do NOT re-run against the live database.
-- ============================================================

create table if not exists missed_calls (
  id             uuid      primary key default gen_random_uuid(),
  caller_phone   text      not null,
  called_at      timestamp not null,
  text_back_sent boolean   default true,
  created_at     timestamp default now()
);

alter table missed_calls enable row level security;

create policy "Service role full access"
  on missed_calls for all using (true);

create table if not exists reactivation_log (
  id           uuid      primary key default gen_random_uuid(),
  job_id       uuid      references jobs(id) on delete set null,
  client_phone text,
  fired_at     timestamp default now()
);

alter table reactivation_log enable row level security;

create policy "Service role full access"
  on reactivation_log for all using (true);
