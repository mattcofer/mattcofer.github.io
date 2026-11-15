const CACHE_NAME = 'mattcofer-recipes-v6';

function isCacheableResponse(response) {
  return (
    response &&
    response.status === 200 &&
    (response.type === 'basic' || response.type === 'cors')
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    // Network-first for HTML pages so new or updated recipes appear immediately when online
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (isCacheableResponse(networkResponse)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('index.html'))
        )
    );
    return;
  }

  // Stale-while-revalidate for static & CDN assets (CSS, JS, fonts, icons, MathJax)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (isCacheableResponse(networkResponse)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
