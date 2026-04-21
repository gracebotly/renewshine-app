import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Browser-side Supabase client using the anon key.
 * Safe to use in client components. Respects RLS policies.
 *
 * flowType: 'pkce' forces the magic link to use a ?code= query parameter
 * instead of the default #access_token= hash. The code is readable by the
 * server-side /auth/callback route, which exchanges it for a session cookie.
 */
export const supabaseBrowser = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
    },
  }
)
