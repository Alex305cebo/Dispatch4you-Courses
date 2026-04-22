#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../Truck Pic');
const targetDir = path.join(__dirname, '../dist/assets/Truck Pic');

// Создаём папку если её нет
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Копируем все картинки траков (PNG и WebP)
const files = fs.readdirSync(sourceDir);
let copiedCount = 0;

files.forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.webp')) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied: ${file}`);
    copiedCount++;
  }
});

console.log(`\n✅ ${copiedCount} truck images copied to ${targetDir}`);
