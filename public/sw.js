// RouteX AI Offline Map System - Service Worker
const CACHE_NAME = 'routex-offline-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/maps/geojson/ner-boundaries.json',
  '/maps/geojson/ner-highways.json',
  '/maps/ner/ner-locations.json',
  '/maps/ner/ner-offline-pack.json',
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline assets & GeoJSON maps');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // Serve static assets & GeoJSON maps from cache first, then fallback to network
  if (
    event.request.mode === 'navigate' ||
    url.pathname.includes('/maps/') ||
    event.request.destination === 'script' ||
    event.request.destination === 'style'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html') as Promise<Response>;
            }
            return new Response('Offline resource unavailable', { status: 503 });
          });
      })
    );
  }
});
