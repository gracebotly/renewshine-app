// Shared in-memory admin session store.
// Imported by both the login API route and middleware.
// Resets on server restart — admin must re-login after each deploy.

import crypto from 'crypto'

const validTokens = new Set<string>()

export function createAdminSession(): string {
  const token = crypto.randomUUID()
  validTokens.add(token)
  return token
}

export function validateAdminSession(token: string): boolean {
  return validTokens.has(token)
}
