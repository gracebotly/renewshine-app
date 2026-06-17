import webpush from 'web-push'
import { createServerClient } from '@/lib/supabase/server'

if (process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

interface PushPayload {
  title: string
  body: string
  url?: string
  conversationId?: string
}

export async function sendPushNotification(payload: PushPayload): Promise<void> {
  if (!process.env.VAPID_PRIVATE_KEY) return

  const supabase = createServerClient()
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (!subscriptions?.length) return

  const notification = JSON.stringify({
    ...payload,
    url: payload.url ?? '/',
  })

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notification
      )
    } catch (err: unknown) {
      const pushError = err as { statusCode?: number; status?: number }
      const statusCode = pushError.statusCode ?? pushError.status

      if (statusCode === 410 || statusCode === 404) {
        console.warn('[push] Stale subscription deleted:', sub.endpoint.slice(0, 60))
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id)
      } else {
        console.error('[push] sendNotification failed:', err)
      }
    }
  }
}
