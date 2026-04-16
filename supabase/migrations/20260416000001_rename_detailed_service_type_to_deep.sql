-- ============================================================
-- Migration: rename_detailed_service_type_to_deep
-- Created: 2026-04-16
-- Description: Canonicalizes service_type terminology by renaming
--              legacy 'detailed' values to 'deep'.
--
--              1. Drop existing service_type CHECK constraint
--              2. Backfill existing rows ('detailed' -> 'deep')
--              3. Add updated CHECK constraint with canonical values
-- ============================================================

begin;

alter table jobs drop constraint if exists jobs_service_type_check;

update jobs
set service_type = 'deep'
where service_type = 'detailed';

alter table jobs add constraint jobs_service_type_check
  check (service_type = any (array['standard', 'deep', 'move_out']));

commit;
