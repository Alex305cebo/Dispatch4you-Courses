const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // Декодируем %20 и другие URL-encoded символы
  const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
  
  let filePath = path.join(DIST_DIR, decodedUrl === '/' ? 'index.html' : decodedUrl);
  
  // Убираем /game/ префикс если есть
  if (decodedUrl.startsWith('/game/')) {
    filePath = path.join(DIST_DIR, decodedUrl.replace('/game/', ''));
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Если файл не найден, отдаём index.html (для SPA роутинга)
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dispatch Office запущен!\n`);
  console.log(`   Открой в браузере: http://localhost:${PORT}\n`);
});
