import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    // No code in URL — redirect to login
    return NextResponse.redirect(`${origin}/admin/login`)
  }

  // Build the response object first so we can attach cookies to it
  const response = NextResponse.redirect(`${origin}/admin`)

  // Create a Supabase client with a custom cookie storage adapter.
  // This is the correct pattern for plain @supabase/supabase-js v2 in
  // Next.js App Router without @supabase/ssr or auth-helpers installed.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ← ANON key, never service role
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: true,
        storage: {
          // Read cookies from the incoming request
          getItem(key: string): string | null {
            const cookie = request.cookies.get(key)
            return cookie?.value ?? null
          },
          // Write cookies onto the outgoing response
          setItem(key: string, value: string): void {
            response.cookies.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
          },
          removeItem(key: string): void {
            response.cookies.delete(key)
          },
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Exchange failed — send back to login with error indicator
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
  }

  // Session is now written to response cookies — redirect to admin
  return response
}
