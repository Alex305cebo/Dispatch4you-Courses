/* Dispatch: Career Path service worker.
 *
 * Strategy:
 *  - Navigations: network-first, falling back to the cached app shell when
 *    offline. This keeps the app fresh after every deploy (no stale HTML)
 *    while still loading offline.
 *  - Other same-origin GETs (hashed JS/CSS, images, sounds): stale-while-
 *    revalidate — serve from cache instantly and refresh in the background.
 *  - Range requests (streaming video) and non-GET requests are bypassed.
 */

const VERSION = 'v1';
const CACHE = `dispatch-academy-${VERSION}`;
const BASE = '/games/dispatch-academy-app/';
const APP_SHELL = `${BASE}index.html`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([BASE, APP_SHELL]).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests; bypass range/streaming requests.
  if (request.method !== 'GET') return;
  if (request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App navigations: network-first with offline fallback to the shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(APP_SHELL, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(APP_SHELL).then((r) => r || caches.match(BASE)))
    );
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
