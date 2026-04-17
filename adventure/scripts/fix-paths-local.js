#!/usr/bin/env node
// Local test: remove /game/ prefix

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');

function fixContent(content) {
  // /game/_expo/ → /_expo/
  content = content.replace(/\/game\/_expo\//g, '/_expo/');
  content = content.replace(/\/game\/favicon/g, '/favicon');
  content = content.replace(/\/game\/assets\//g, '/assets/');
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

console.log('✅ Done. Paths fixed for local testing');
