const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = 8081;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// ── Live Reload скрипт — инжектируется в HTML ──
const LIVE_RELOAD_SCRIPT = `
<script>
(function() {
  var ws = new WebSocket('ws://localhost:${PORT}/__livereload');
  ws.onmessage = function(e) {
    if (e.data === 'reload') {
      console.log('[LiveReload] Перезагрузка...');
      location.reload();
    }
  };
  ws.onclose = function() {
    // Переподключаемся каждые 2 секунды если сервер перезапустился
    setTimeout(function() { location.reload(); }, 2000);
  };
  console.log('[LiveReload] Подключён ✓');
})();
</script>
</body>`;

// ── HTTP сервер ──
const server = http.createServer((req, res) => {
  const decodedUrl = decodeURIComponent(req.url.split('?')[0]);

  // /game/ и /game → index.html (это baseUrl приложения)
  // /game/assets/... → dist/game/assets/... (статика)
  let filePath;
  if (decodedUrl === '/game' || decodedUrl === '/game/') {
    filePath = path.join(DIST_DIR, 'index.html');
  } else if (decodedUrl.startsWith('/game/')) {
    // Сначала пробуем как статику внутри dist/game/
    const assetPath = path.join(DIST_DIR, 'game', decodedUrl.replace('/game/', ''));
    // Если файл существует — отдаём его, иначе fallback на index.html
    filePath = fs.existsSync(assetPath) ? assetPath : path.join(DIST_DIR, decodedUrl.replace('/game/', ''));
  } else if (decodedUrl === '/') {
    filePath = path.join(DIST_DIR, 'index.html');
  } else {
    filePath = path.join(DIST_DIR, decodedUrl);
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // SPA fallback — отдаём index.html
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, html) => {
        if (err2) { res.writeHead(500); res.end('Server Error'); return; }
        const injected = html.toString().replace('</body>', LIVE_RELOAD_SCRIPT);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(injected, 'utf-8');
      });
    } else {
      // Инжектируем live reload в HTML файлы
      if (ext === '.html') {
        const injected = content.toString().replace('</body>', LIVE_RELOAD_SCRIPT);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(injected, 'utf-8');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    }
  });
});

// ── WebSocket сервер для live reload ──
const wss = new WebSocketServer({ server, path: '/__livereload' });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

function notifyReload() {
  for (const client of clients) {
    if (client.readyState === 1) client.send('reload');
  }
}

// ── Следим за изменениями в dist ──
let reloadTimer = null;
fs.watch(DIST_DIR, { recursive: true }, (event, filename) => {
  if (!filename) return;
  // Дебаунс — не спамим перезагрузками
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    console.log(`[LiveReload] Изменён: ${filename} → перезагрузка`);
    notifyReload();
  }, 150);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dispatch Office — Live Reload сервер\n`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log(`   Следит за изменениями в dist/`);
  console.log(`   После сборки (expo export) страница обновится автоматически\n`);
});
