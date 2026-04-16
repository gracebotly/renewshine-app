-- ============================================================
-- Migration: add_pets_home_entry_and_constraints
-- Created: 2026-04-13
-- Description: Documents schema changes applied to
--              nueoothgsydbdrseinyu via Supabase MCP:
--
--              1. Added 'partial' to status CHECK constraint
--              2. Added pets column with CHECK constraint
--              3. Added home_entry column with CHECK constraint
--              4. Added CHECK constraint to condition column
--              5. Updated service_type CHECK to use canonical 'deep'
--              6. Expanded availability_time_pref CHECK from
--                 3 values to 8 values
--
-- NOTE: These changes were applied live via MCP and are
--       documented here for version control only. Do not
--       re-run this file against the live database.
-- ============================================================

-- 1. Status CHECK — add 'partial'
alter table jobs drop constraint if exists jobs_status_check;
alter table jobs add constraint jobs_status_check
  check (status = any (array[
    'partial', 'new', 'under_review', 'approved',
    'scheduled', 'completed', 'cancelled'
  ]));

-- 2. Pets column
alter table jobs add column if not exists pets text
  check (pets = any (array['none', 'cat', 'dog', 'other']));

-- 3. Home entry column
alter table jobs add column if not exists home_entry text
  check (home_entry = any (array['home', 'lockbox', 'fob', 'other']));

-- 4. Condition CHECK constraint
alter table jobs drop constraint if exists jobs_condition_check;
alter table jobs add constraint jobs_condition_check
  check (condition = any (array[
    'maintained', 'some_buildup', 'heavy_buildup', 'reset'
  ]));

-- 5. Service type CHECK (canonical: 'deep')
alter table jobs drop constraint if exists jobs_service_type_check;
alter table jobs add constraint jobs_service_type_check
  check (service_type = any (array['standard', 'deep', 'move_out']));

-- 6. Availability time pref CHECK (expanded)
alter table jobs drop constraint if exists jobs_availability_time_pref_check;
alter table jobs add constraint jobs_availability_time_pref_check
  check (availability_time_pref = any (array[
    'morning', 'afternoon', 'flexible',
    'early_morning', 'mid_morning', 'noon',
    'early_afternoon', 'late_afternoon'
  ]));
