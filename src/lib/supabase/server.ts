import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS — use only in API routes and server components.
 * Never expose the service role key to the browser.
 */
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}


/**
 * Admin client with full storage access — same credentials as createServerClient().
 * Use when you need to call supabase.storage (signed URLs, uploads, deletes).
 * Named separately for clarity when reviewing storage-related server code.
 */
export function createAdminStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
