import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_secret', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })
  return res
}
