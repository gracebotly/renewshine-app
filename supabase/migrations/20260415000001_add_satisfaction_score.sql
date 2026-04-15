-- ============================================================
-- Migration: add_satisfaction_score
-- Created: 2026-04-15
-- Description: Adds satisfaction_score column to jobs table.
--   Stores post-job customer rating (1–5) collected via SMS
--   after job completion. Used by WF-04 (n8n post-job rating
--   workflow) and the admin panel "Needs Attention" badge.
--
-- IMPORTANT: This migration was already applied to the live
-- database (nueoothgsydbdrseinyu) via Supabase MCP on
-- 2026-04-15. This file is for version control only.
-- Do NOT re-run against the live database.
-- ============================================================

alter table jobs
  add column if not exists satisfaction_score integer
  check (satisfaction_score >= 1 and satisfaction_score <= 5);
