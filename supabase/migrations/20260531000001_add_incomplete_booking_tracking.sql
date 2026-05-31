-- Track the last completed booking step for partial residential jobs.
alter table jobs
  add column if not exists last_completed_step integer,
  add column if not exists dropped_at_label text;
