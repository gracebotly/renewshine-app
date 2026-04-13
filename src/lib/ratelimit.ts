// Simple in-memory rate limiter — no external packages required.
// Resets automatically as entries expire. Works per-instance (sufficient for MVP).

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 *
 * @param key       Unique key per client (e.g. IP address)
 * @param limit     Max requests allowed per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

/**
 * Extracts the best available IP from a Next.js Request.
 * Checks x-forwarded-for (Vercel/proxy), then x-real-ip, then falls back to 'unknown'.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
