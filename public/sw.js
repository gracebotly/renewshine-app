// RenewShine Service Worker — Web Push + offline shell

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()))

self.addEventListener('push', (event) => {
  if (!event.data) return
  let data
  try { data = event.data.json() }
  catch { data = { title: 'New message', body: event.data.text() } }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'RenewShine', {
      body:      data.body ?? '',
      icon:      '/logo-mark.png',
      badge:     '/favicon-32.png',
      tag:       data.conversationId ?? 'sms',
      renotify:  true,
      data:      { url: data.url ?? '/admin/inbox' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/admin/inbox'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes('/admin') && 'focus' in w) { w.navigate(url); return w.focus() }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
