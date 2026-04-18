#!/usr/bin/env node
// Фиксирует пути для локального сервера (без /game/ префикса)
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(/href="\/game\/_expo\//g, 'href="/_expo/');
html = html.replace(/src="\/game\/_expo\//g, 'src="/_expo/');
html = html.replace(/href="\/game\/favicon\.ico"/g, 'href="/favicon.ico"');
html = html.replace(/href="\/game\/favicon\.png"/g, 'href="/favicon.png"');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Paths fixed for LOCAL server (no /game/ prefix)');
