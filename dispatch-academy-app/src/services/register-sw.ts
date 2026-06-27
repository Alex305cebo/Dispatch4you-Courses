/**
 * Registers the service worker for offline support and installability.
 * Only runs in production builds and where the API is available, so local
 * development is never affected by stale caches.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      /* Registration failed (e.g. unsupported context) — app still works online. */
    });
  });
}
