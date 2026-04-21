-- ============================================================
-- Migration: add_post_construction_service_type
-- Created: 2026-04-21
-- Description: Adds 'post_construction' as a valid service_type
--   value. Post-construction jobs route through the commercial
--   booking flow and are always manually quoted after photo
--   review. No estimate is generated.
--
--   Also cleans up one stale test record with service_type
--   'detailed' (legacy value from before the rename migration)
--   that was blocking the constraint update.
--
-- Applied to Supabase project nueoothgsydbdrseinyu via MCP
-- on 2026-04-21. This file is for version control only.
-- Do NOT re-run against the live database.
-- ============================================================

-- Drop old constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_service_type_check;

-- Clean up stale test record with legacy 'detailed' value
UPDATE jobs SET service_type = 'deep' WHERE service_type = 'detailed';

-- Add updated constraint including post_construction
ALTER TABLE jobs
  ADD CONSTRAINT jobs_service_type_check
  CHECK (service_type IN ('standard', 'deep', 'move_out', 'post_construction'));
