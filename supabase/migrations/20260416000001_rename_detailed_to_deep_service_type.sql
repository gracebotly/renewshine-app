-- ============================================================
-- Migration: rename_detailed_to_deep_service_type
-- Created: 2026-04-16
-- Description: Renames the service_type value 'detailed' to
--   'deep' across the database constraint.
--
--   Reason: SEO refactor — "deep clean" has search volume,
--   "detailed clean" does not. All customer-facing copy
--   already uses "Deep Clean". This aligns the DB value.
--
--   Pre-migration: All existing jobs (2 test records) were
--   deleted before applying this constraint change.
--   No real customer data was affected.
--
-- Applied to Supabase project nueoothgsydbdrseinyu via MCP
-- on 2026-04-16. This file is for version control only.
-- Do NOT re-run against the live database.
-- ============================================================

-- Delete all test data (only test jobs existed at migration time)
DELETE FROM jobs;

-- Drop old constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_service_type_check;

-- Add updated constraint with 'deep' replacing 'detailed'
ALTER TABLE jobs
  ADD CONSTRAINT jobs_service_type_check
  CHECK (service_type IN ('standard', 'deep', 'move_out'));
