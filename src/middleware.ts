import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (!isAdminRoute) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()
  const secret = request.cookies.get('admin_secret')?.value
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
