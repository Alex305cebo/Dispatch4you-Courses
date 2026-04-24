#!/usr/bin/env node
// Копирует готовый favicon.ico из assets/ в dist/
// (ранее генерировал пиксельный D4Y — заменён на реальный логотип)

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../assets/favicon.ico');
const distPath = path.join(__dirname, '../dist/favicon.ico');

if (!fs.existsSync(src)) {
  console.error('❌ assets/favicon.ico not found!');
  process.exit(1);
}

const ico = fs.readFileSync(src);

if (fs.existsSync(path.join(__dirname, '../dist'))) {
  fs.writeFileSync(distPath, ico);
  console.log(`✅ dist/favicon.ico copied from assets (${ico.length} bytes)`);
}

console.log('✅ favicon.ico ready');
