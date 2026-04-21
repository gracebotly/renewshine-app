import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login page itself — always allow (prevent redirect loop)
  if (pathname === '/admin/login') return NextResponse.next()

  // Check for a Supabase session cookie.
  // Supabase JS v2 names its session cookie: sb-<project-ref>-auth-token
  const cookieHeader = request.headers.get('cookie') ?? ''
  const hasSession = cookieHeader
    .split(';')
    .some((c) => c.trim().startsWith('sb-') && c.includes('-auth-token'))

  if (!hasSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Only guard admin routes. Auth callback must NOT be in this matcher
  // or the middleware will intercept it before the route handler runs.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
