/**
 * service-worker.js v3
 * ─────────────────────────────────────────────────────────────
 *  СТРОГО:
 *   • Не трогаем /map-trainer/ и /game/ — у них свой билд-лайфтайм.
 *     Там актуальность контролирует Vite/Expo через хешированные имена assets,
 *     а HTML идёт с Cache-Control: no-cache.
 *   • Не трогаем Firebase, Google OAuth, любые сторонние https.
 *   • HTML главного сайта — network-first, чтобы новые релизы приезжали сразу.
 *   • Статика (css/js/шрифты/картинки) — stale-while-revalidate.
 *
 *  Бампай CACHE_VERSION при каждом значимом изменении логики SW.
 */
const CACHE_VERSION = 'v3-2026-05-09';
const STATIC_CACHE  = `d4y-static-${CACHE_VERSION}`;
const HTML_CACHE    = `d4y-html-${CACHE_VERSION}`;

// Пути которые SW ВООБЩЕ не обслуживает — пропускает прямо в сеть
const BYPASS_PATHS = [
  '/map-trainer/',
  '/game/',
];

function shouldBypass(url) {
  // Пропускаем не-GET
  // (вызывается отдельно в fetch handler)
  const path = url.pathname;
  return BYPASS_PATHS.some((p) => path.startsWith(p));
}

// ── Install: сразу активируем новую версию ───────────────────
self.addEventListener('install', (event) => {
  // skipWaiting → новый SW не ждёт закрытия всех вкладок
  self.skipWaiting();
});

// ── Activate: чистим все старые кеши и забираем клиентов ────
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Удаляем все кеши других версий
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n !== STATIC_CACHE && n !== HTML_CACHE)
        .map((n) => caches.delete(n))
    );
    // Берём контроль над всеми открытыми вкладками без F5
    await self.clients.claim();
  })());
});

// ── Fetch: маршрутизация ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Только GET, только http(s) на своём origin
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Чужой origin (Firebase, Google, Maps и т.п.) — не вмешиваемся
  if (url.origin !== self.location.origin) return;

  // /map-trainer/, /game/ — не трогаем, пусть идёт как обычный сетевой запрос
  if (shouldBypass(url)) return;

  // HTML документы — network-first
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(networkFirstHTML(req));
    return;
  }

  // Всё остальное (css/js/шрифты/картинки на главном сайте) — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirstHTML(req) {
  try {
    const fresh = await fetch(req);
    // Кладём свежий в кеш для офлайна
    const cache = await caches.open(HTML_CACHE);
    cache.put(req, fresh.clone()).catch(() => {});
    return fresh;
  } catch {
    // Нет сети — отдаём что было
    const cached = await caches.match(req);
    if (cached) return cached;
    // Крайний случай — редирект на корневой index
    const root = await caches.match('/index.html');
    if (root) return root;
    throw new Error('Offline and no cache');
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  const networkPromise = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);

  return cached || networkPromise || fetch(req);
}

// ── Сообщения (для ручной очистки из DevTools) ───────────────
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'CLEAR_ALL') {
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
  }
});
