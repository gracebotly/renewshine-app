import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient as createSupabaseServer } from '@supabase/supabase-js'


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin')

  // Not an admin route — pass through
  if (!isAdminRoute) return NextResponse.next()

  // Login page itself — always allow (prevent redirect loop)
  if (pathname === '/admin/login') return NextResponse.next()

  // Auth callback — always allow
  if (pathname.startsWith('/auth/')) return NextResponse.next()

  // Read Supabase session from cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createSupabaseServer(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/auth/:path*'],
}
