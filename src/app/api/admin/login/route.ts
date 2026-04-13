import { NextResponse } from 'next/server'

// Deprecated — admin auth is now handled by Supabase magic link.
// This route is kept to prevent 404s but does nothing.
export async function POST() {
  return NextResponse.json(
    { error: 'Password login is no longer available. Use the magic link flow.' },
    { status: 410 }
  )
}
