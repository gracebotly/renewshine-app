import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.signOut()

  // Explicitly delete the Supabase auth cookie by name so it's
  // fully cleared even if signOut() has propagation issues.
  // Supabase SSR uses sb-<project-ref>-auth-token as the cookie name.
  const allCookies = cookieStore.getAll()
  const response = NextResponse.redirect(
    new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.renewshine.co'),
    { status: 303 }
  )

  // Wipe every sb-* auth cookie found on the request
  allCookies
    .filter((c) => c.name.startsWith('sb-') && c.name.includes('auth'))
    .forEach((c) => {
      response.cookies.set(c.name, '', {
        maxAge: 0,
        path: '/',
      })
    })

  return response
}
