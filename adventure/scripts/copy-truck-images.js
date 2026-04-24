#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../TruckPic');
const targetDir = path.join(__dirname, '../dist/assets/TruckPic');

// Создаём папку если её нет
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Копируем только если файл изменился или отсутствует
const files = fs.readdirSync(sourceDir);
let copiedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.webp')) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Проверяем нужно ли копировать
    let needsCopy = false;
    
    if (!fs.existsSync(targetPath)) {
      needsCopy = true; // Файл не существует
    } else {
      // Сравниваем размер и время модификации
      const sourceStats = fs.statSync(sourcePath);
      const targetStats = fs.statSync(targetPath);
      
      if (sourceStats.size !== targetStats.size || 
          sourceStats.mtimeMs > targetStats.mtimeMs) {
        needsCopy = true; // Файл изменился
      }
    }
    
    if (needsCopy) {
      fs.copyFileSync(sourcePath, targetPath);
      copiedCount++;
    } else {
      skippedCount++;
    }
  }
});

if (copiedCount > 0) {
  console.log(`✅ ${copiedCount} truck images copied to ${targetDir}`);
}
if (skippedCount > 0) {
  console.log(`⏭️  ${skippedCount} images skipped (already up to date)`);
}

