#!/usr/bin/env node
// Hostinger: dispatch4you.com/game/
// Нужно добавить /game/ префикс ко всем путям

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const BASE = '/game';

function fixContent(content) {
  // src="/_expo/ → src="/game/_expo/
  content = content.replace(/src="\/_expo\//g, `src="${BASE}/_expo/`);
  content = content.replace(/href="\/_expo\//g, `href="${BASE}/_expo/`);
  content = content.replace(/href="\/favicon/g, `href="${BASE}/favicon`);
  // JS: "/_expo/ и '/_expo/
  content = content.replace(/"\/(_expo\/)/g, `"${BASE}/$1`);
  content = content.replace(/'\/(_expo\/)/g, `'${BASE}/$1`);
  // assets
  content = content.replace(/src="\/assets\//g, `src="${BASE}/assets/`);
  content = content.replace(/"\/assets\//g, `"${BASE}/assets/`);
  return content;
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fixContent(content);
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`  ✅ Fixed: ${path.relative(distPath, filePath)}`);
  }
}

// index.html
fixFile(path.join(distPath, 'index.html'));

// JS бандлы
const jsDir = path.join(distPath, '_expo/static/js/web');
if (fs.existsSync(jsDir)) {
  fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).forEach(f => fixFile(path.join(jsDir, f)));
}

// CSS
const cssDir = path.join(distPath, '_expo/static/css');
if (fs.existsSync(cssDir)) {
  fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).forEach(f => fixFile(path.join(cssDir, f)));
}

console.log(`✅ Done. Base: ${BASE}`);
