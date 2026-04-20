import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Check for a Supabase session cookie.
  // Supabase names its session cookie: sb-<project-ref>-auth-token
  // We check for any cookie matching that pattern.
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
  matcher: ['/admin/:path*', '/api/admin/:path*', '/auth/:path*'],
}
