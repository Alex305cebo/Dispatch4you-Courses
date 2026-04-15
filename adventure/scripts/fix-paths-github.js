#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

// Читаем index.html
let html = fs.readFileSync(indexPath, 'utf8');

// GitHub Pages деплоит adventure/dist как корень репо
// URL: alex305cebo.github.io/Dispatch4you-Courses/
// Пути должны быть /Dispatch4you-Courses/_expo/ (без /game/)
html = html.replace(/\/_expo\//g, '/Dispatch4you-Courses/_expo/');
html = html.replace(/\/favicon\.ico/g, '/Dispatch4you-Courses/favicon.ico');

// Записываем обратно
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ Paths fixed for GitHub Pages');
console.log('   /_expo/ → /Dispatch4you-Courses/_expo/');
