-- Track the separate admin confirmation step after a deposit is paid.
alter table jobs
  add column if not exists appointment_confirmed boolean default false;
