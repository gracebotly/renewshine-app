import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ALLOWED_ADMIN_EMAILS } from '@/lib/allowed-emails'

export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email?.toLowerCase() ?? ''
  const allowed = ALLOWED_ADMIN_EMAILS.map((e) => e.toLowerCase())

  if (!allowed.includes(email)) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
