#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const jsDir = path.join(distPath, '_expo/static/js/web');

// Читаем index.html
let html = fs.readFileSync(indexPath, 'utf8');

// baseUrl в app.json = /Dispatch4you-Courses
// На Hostinger игра живёт в /game/ — заменяем
html = html.replace(/\/Dispatch4you-Courses\/_expo\//g, '/game/_expo/');
html = html.replace(/\/Dispatch4you-Courses\/favicon\.ico/g, '/game/favicon.ico');
html = html.replace(/\/Dispatch4you-Courses\//g, '/game/');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Paths fixed in index.html for Hostinger');
console.log('   /Dispatch4you-Courses/ → /game/');
