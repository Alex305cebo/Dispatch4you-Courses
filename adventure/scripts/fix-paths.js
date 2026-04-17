#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// Expo генерирует пути /_expo/ и /favicon.ico без базового префикса
// На Hostinger игра живёт в /game/ — добавляем префикс
html = html.replace(/href="\/_expo\//g, 'href="/game/_expo/');
html = html.replace(/src="\/_expo\//g, 'src="/game/_expo/');
html = html.replace(/href="\/favicon\.ico"/g, 'href="/game/favicon.ico"');
html = html.replace(/href="\/favicon\.png"/g, 'href="/game/favicon.png"');

// На случай если baseUrl уже прописан как /Dispatch4you-Courses (старый вариант)
html = html.replace(/\/Dispatch4you-Courses\/_expo\//g, '/game/_expo/');
html = html.replace(/\/Dispatch4you-Courses\/favicon\.ico/g, '/game/favicon.ico');
html = html.replace(/\/Dispatch4you-Courses\//g, '/game/');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Paths fixed in index.html for Hostinger /game/');
console.log('   Result:');
console.log(fs.readFileSync(indexPath, 'utf8').match(/href="[^"]*_expo[^"]*"|src="[^"]*_expo[^"]*"/g));
