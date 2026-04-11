import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Browser-side Supabase client using the anon key.
 * Safe to use in client components. Respects RLS policies.
 */
export const supabaseBrowser = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
