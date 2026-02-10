const CACHE_NAME = 'pandaduck-admin-v1'
const STATIC_ASSETS = [
  '/admin-mobile',
  '/admin-manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests (always fetch from network)
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/admin-mobile')
          }
        })
      })
  )
})

// Handle push notifications (future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/admin-icon-192x192.png',
      badge: '/icons/admin-icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/admin-mobile'
      }
    }
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/admin-mobile'
  event.waitUntil(
    clients.openWindow(url)
  )
})
