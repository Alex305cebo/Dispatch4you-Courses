/**
 * Финальная проверка favicon после исправления
 * Показывает статистику и оставшиеся проблемы
 */

const fs = require('fs');
const path = require('path');

const stats = {
  total: 0,
  withFavicon: 0,
  correctFavicon: 0,
  multipleIcons: 0,
  brokenLinks: 0
};

const issues = [];

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '_expo'].includes(file)) {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkFile(filePath) {
  stats.total++;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(__dirname, filePath);
  
  // Ищем все favicon теги
  const iconMatches = content.match(/<link[^>]*rel="[^"]*icon[^"]*"[^>]*>/gi) || [];
  
  if (iconMatches.length === 0) {
    return;
  }
  
  stats.withFavicon++;
  
  // Проверяем на правильный favicon
  const correctFavicon = iconMatches.some(tag => 
    tag.includes('favicon.svg') || 
    (relativePath.includes('adventure') && tag.includes('favicon.ico')) ||
    (relativePath.includes('game') && tag.includes('favicon.ico'))
  );
  
  if (correctFavicon) {
    stats.correctFavicon++;
  }
  
  // Проверяем на множественные теги
  if (iconMatches.length > 1) {
    stats.multipleIcons++;
    issues.push({
      file: relativePath,
      type: 'MULTIPLE_ICONS',
      count: iconMatches.length
    });
  }
  
  // Проверяем каждый тег на битые ссылки
  iconMatches.forEach(tag => {
    const hrefMatch = tag.match(/href="([^"]+)"/);
    if (!hrefMatch) return;
    
    const href = hrefMatch[1];
    
    // Пропускаем внешние ссылки
    if (href.startsWith('http')) return;
    
    // Проверяем существование файла
    let checkPath = href.replace(/^\//, '').split('?')[0];
    
    if (href.startsWith('../')) {
      checkPath = path.resolve(path.dirname(filePath), href.split('?')[0]);
    } else {
      checkPath = path.join(__dirname, checkPath);
    }
    
    if (!fs.existsSync(checkPath)) {
      stats.brokenLinks++;
      issues.push({
        file: relativePath,
        type: 'BROKEN_LINK',
        href: href
      });
    }
  });
}

console.log('🔍 Финальная проверка favicon...\n');

const htmlFiles = findHtmlFiles(__dirname);
htmlFiles.forEach(checkFile);

console.log('═══════════════════════════════════════════════════════');
console.log('📊 СТАТИСТИКА:');
console.log('═══════════════════════════════════════════════════════');
console.log(`   Всего HTML файлов: ${stats.total}`);
console.log(`   С favicon: ${stats.withFavicon}`);
console.log(`   С правильным favicon: ${stats.correctFavicon}`);
console.log(`   С множественными иконками: ${stats.multipleIcons}`);
console.log(`   Битых ссылок: ${stats.brokenLinks}`);
console.log('═══════════════════════════════════════════════════════\n');

if (issues.length > 0) {
  console.log(`⚠️  НАЙДЕНО ПРОБЛЕМ: ${issues.length}\n`);
  
  // Группируем по типу
  const byType = {};
  issues.forEach(issue => {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  });
  
  Object.keys(byType).forEach(type => {
    console.log(`\n${type}:`);
    byType[type].slice(0, 5).forEach(issue => {
      console.log(`  • ${issue.file}`);
      if (issue.href) console.log(`    Ссылка: ${issue.href}`);
      if (issue.count) console.log(`    Количество: ${issue.count}`);
    });
    if (byType[type].length > 5) {
      console.log(`  ... и ещё ${byType[type].length - 5} файлов`);
    }
  });
} else {
  console.log('✅ ПРОБЛЕМ НЕ НАЙДЕНО!');
  console.log('\n🎉 Все favicon настроены правильно!');
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('💡 РЕКОМЕНДАЦИИ:');
console.log('═══════════════════════════════════════════════════════');
console.log('1. Очистите кэш браузера: Ctrl+Shift+Delete');
console.log('2. Жёсткая перезагрузка: Ctrl+Shift+R');
console.log('3. Проверьте favicon на всех страницах');
console.log('═══════════════════════════════════════════════════════\n');
