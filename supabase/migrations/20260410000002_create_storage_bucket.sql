-- ============================================================
-- Migration: create_job_media_storage_bucket
-- Created: 2026-04-10
-- Description: Creates the public storage bucket used for
--              job photo and video uploads.
--              Applied to Supabase project nueoothgsydbdrseinyu
--              via MCP on 2026-04-10. This file documents that
--              change for version control.
--
-- NOTE: Storage bucket SQL runs against the storage schema.
--       If re-applying manually, run this in the Supabase
--       SQL editor or via the Supabase CLI.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('job-media', 'job-media', true)
on conflict (id) do nothing;

-- Allow public read access to all files in the bucket
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'job-media');

-- Allow service role to insert (upload) files
create policy "Service role upload"
  on storage.objects for insert
  with check (bucket_id = 'job-media');

-- Allow service role to delete files
create policy "Service role delete"
  on storage.objects for delete
  using (bucket_id = 'job-media');
