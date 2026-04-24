#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = path.join(__dirname, '../TruckPic');
const optimizedDir = path.join(__dirname, '../TruckPicOptimized');

// Создаём папку для оптимизированных картинок
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

async function optimizeImages() {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));
  
  console.log(`🖼️  Найдено ${files.length} картинок траков для оптимизации...\n`);
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(optimizedDir, file);
    
    const originalStats = fs.statSync(sourcePath);
    const originalSize = originalStats.size;
    totalOriginal += originalSize;
    
    // Оптимизируем: конвертируем в WebP с качеством 85
    // WebP даёт лучшее сжатие чем PNG без потери качества
    const webpPath = targetPath.replace('.png', '.webp');
    
    await sharp(sourcePath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    
    // Также сохраняем оптимизированный PNG для совместимости
    await sharp(sourcePath)
      .png({ quality: 85, compressionLevel: 9, effort: 10 })
      .toFile(targetPath);
    
    const optimizedStats = fs.statSync(targetPath);
    const webpStats = fs.statSync(webpPath);
    const optimizedSize = optimizedStats.size;
    const webpSize = webpStats.size;
    totalOptimized += Math.min(optimizedSize, webpSize);
    
    const savedPercent = Math.round((1 - optimizedSize / originalSize) * 100);
    const webpSavedPercent = Math.round((1 - webpSize / originalSize) * 100);
    
    console.log(`✅ ${file}`);
    console.log(`   Оригинал: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   PNG:      ${(optimizedSize / 1024).toFixed(1)} KB (экономия ${savedPercent}%)`);
    console.log(`   WebP:     ${(webpSize / 1024).toFixed(1)} KB (экономия ${webpSavedPercent}%)`);
    console.log('');
  }
  
  const totalSaved = totalOriginal - totalOptimized;
  const totalSavedPercent = Math.round((totalSaved / totalOriginal) * 100);
  
  console.log(`\n📊 ИТОГО:`);
  console.log(`   Оригинал:       ${(totalOriginal / 1024).toFixed(1)} KB`);
  console.log(`   Оптимизировано: ${(totalOptimized / 1024).toFixed(1)} KB`);
  console.log(`   Экономия:       ${(totalSaved / 1024).toFixed(1)} KB (${totalSavedPercent}%)`);
  console.log(`\n✅ Оптимизированные картинки сохранены в: ${optimizedDir}`);
  console.log(`\n💡 Рекомендация: используйте WebP формат для лучшего сжатия`);
}

optimizeImages().catch(err => {
  console.error('❌ Ошибка оптимизации:', err);
  process.exit(1);
});
