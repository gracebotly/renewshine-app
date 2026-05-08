-- Set bucket to private
update storage.buckets
set public = false
where id = 'job-media';

drop policy if exists "allow_anon_upload" on storage.objects;

create policy "Service role full access"
  on storage.objects
  for all
  using (bucket_id = 'job-media' and auth.role() = 'service_role')
  with check (bucket_id = 'job-media' and auth.role() = 'service_role');
