#!/usr/bin/env node
// GitHub Pages: alex305cebo.github.io/Dispatch4you-Courses/
// baseUrl=/Dispatch4you-Courses уже прописан в app.json
// Expo с output=single генерирует пути /_expo/ — нужно добавить базовый путь

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const BASE = '/Dispatch4you-Courses';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;

  // Заменяем абсолютные пути /_expo/ → /Dispatch4you-Courses/_expo/
  content = content.replace(/(['"`(])\/(_expo\/)/g, `$1${BASE}/$2`);
  content = content.replace(/(['"`(])\/favicon\.ico/g, `$1${BASE}/favicon.ico`);

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Fixed: ${path.relative(distPath, filePath)}`);
  }
}

// Фиксим index.html
fixFile(path.join(distPath, 'index.html'));

// Фиксим все JS файлы
const jsDir = path.join(distPath, '_expo/static/js/web');
if (fs.existsSync(jsDir)) {
  fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).forEach(f => {
    fixFile(path.join(jsDir, f));
  });
}

// Фиксим все CSS файлы
const cssDir = path.join(distPath, '_expo/static/css');
if (fs.existsSync(cssDir)) {
  fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).forEach(f => {
    fixFile(path.join(cssDir, f));
  });
}

console.log(`✅ All paths fixed for GitHub Pages (base: ${BASE})`);
