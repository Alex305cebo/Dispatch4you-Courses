#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const jsDir = path.join(distPath, '_expo/static/js/web');
const cssDir = path.join(distPath, '_expo/static/css');

const BASE = '/Dispatch4you-Courses';

// Исправляем index.html
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/\/_expo\//g, `${BASE}/_expo/`);
html = html.replace(/\/favicon\.ico/g, `${BASE}/favicon.ico`);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html paths fixed');

// Исправляем все JS файлы (динамические импорты внутри чанков)
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    // Заменяем все ссылки на /_expo/ внутри JS чанков
    const before = content.length;
    content = content.replace(/"\/_expo\//g, `"${BASE}/_expo/`);
    content = content.replace(/'\/_expo\//g, `'${BASE}/_expo/`);
    content = content.replace(/`\/_expo\//g, `\`${BASE}/_expo/`);
    // Также исправляем пути к ассетам
    content = content.replace(/"\/favicon\.ico"/g, `"${BASE}/favicon.ico"`);
    fs.writeFileSync(filePath, content, 'utf8');
    if (content.length !== before || content.includes(BASE)) {
      console.log(`  ✅ Fixed: ${file}`);
    }
  }
}

// Исправляем CSS файлы
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  for (const file of cssFiles) {
    const filePath = path.join(cssDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/url\(\/_expo\//g, `url(${BASE}/_expo/`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`✅ All paths fixed for GitHub Pages (base: ${BASE})`);
