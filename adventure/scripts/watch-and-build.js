const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Запуск watch режима...');
console.log('📁 Отслеживаем изменения в adventure/');
console.log('🎯 Автосборка в ../game/');
console.log('');

let isBuilding = false;
let buildQueued = false;

function build() {
  if (isBuilding) {
    buildQueued = true;
    console.log('⏳ Сборка уже идёт, новая сборка в очереди...');
    return;
  }

  isBuilding = true;
  console.log('🔨 Начинаем сборку...');
  const startTime = Date.now();

  exec('npm run build:local', (error, stdout, stderr) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (error) {
      console.error('❌ Ошибка сборки:', error.message);
      isBuilding = false;
      return;
    }

    console.log(`✅ Сборка завершена за ${duration}s`);
    console.log('🔄 Ожидание изменений...\n');
    
    isBuilding = false;

    // Если была запрошена ещё одна сборка
    if (buildQueued) {
      buildQueued = false;
      setTimeout(build, 500);
    }
  });
}

// Начальная сборка
build();

// Отслеживаем изменения
const chokidar = require('chokidar');

const watcher = chokidar.watch([
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'store/**/*.{ts,tsx,js,jsx}',
  'utils/**/*.{ts,tsx,js,jsx}',
  'hooks/**/*.{ts,tsx,js,jsx}',
  'data/**/*.{ts,tsx,js,jsx}',
  'constants/**/*.{ts,tsx,js,jsx}',
], {
  ignored: /(^|[\/\\])\../, // игнорируем скрытые файлы
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

watcher
  .on('change', (filePath) => {
    console.log(`📝 Изменён: ${filePath}`);
    build();
  })
  .on('add', (filePath) => {
    console.log(`➕ Добавлен: ${filePath}`);
    build();
  })
  .on('unlink', (filePath) => {
    console.log(`➖ Удалён: ${filePath}`);
    build();
  })
  .on('error', (error) => {
    console.error('❌ Ошибка watcher:', error);
  });

console.log('👀 Отслеживание запущено. Нажмите Ctrl+C для остановки.');
