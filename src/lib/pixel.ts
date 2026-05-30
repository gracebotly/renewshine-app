// src/lib/pixel.ts
// Facebook Pixel helper — typed event functions for use in client components

declare global {
  interface Window {
    fbq: (
      type: 'track' | 'trackCustom' | 'init',
      event: string,
      params?: Record<string, unknown>
    ) => void
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

/**
 * Fire a standard Meta Pixel event.
 * Safe to call — silently no-ops if fbq is not loaded yet.
 */
export function trackEvent(
  event: 'Lead' | 'InitiateCheckout' | 'Purchase' | 'ViewContent' | 'PageView',
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return
  if (!window.fbq) return
  window.fbq('track', event, params)
}
