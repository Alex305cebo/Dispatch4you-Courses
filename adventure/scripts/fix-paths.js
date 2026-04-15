#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

// Читаем index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Заменяем все пути /_expo на /game/_expo
html = html.replace(/\/_expo\//g, '/game/_expo/');
html = html.replace(/\/favicon\.ico/g, '/game/favicon.ico');

// Записываем обратно
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ Paths fixed in index.html');
console.log('   /_expo/ → /game/_expo/');
console.log('   /favicon.ico → /game/favicon.ico');
