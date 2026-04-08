# Автоматическая интеграция Lazy Loading во все модули
# Скрипт добавляет lazy-load-sections.js перед </body>

Write-Host "🚀 Интеграция Lazy Loading в модули..." -ForegroundColor Cyan
Write-Host ""

# Путь к папке с модулями
$pagesFolder = "pages"

# Проверка существования папки
if (-not (Test-Path $pagesFolder)) {
    Write-Host "❌ Папка pages не найдена!" -ForegroundColor Red
    exit 1
}

# Находим все файлы модулей
$moduleFiles = Get-ChildItem -Path $pagesFolder -Filter "doc-module-*-complete.html"

if ($moduleFiles.Count -eq 0) {
    Write-Host "⚠️  Модули не найдены в папке pages" -ForegroundColor Yellow
    exit 0
}

Write-Host "📁 Найдено модулей: $($moduleFiles.Count)" -ForegroundColor Green
Write-Host ""

$successCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $moduleFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    
    Write-Host "📄 Обработка: $fileName" -ForegroundColor White
    
    try {
        # Читаем содержимое файла
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Проверяем, не добавлен ли уже скрипт
        if ($content -match "lazy-load-sections\.js") {
            Write-Host "   ⏭️  Уже интегрирован, пропускаем" -ForegroundColor Yellow
            $skippedCount++
            continue
        }
        
        # Ищем закрывающий тег </body>
        if ($content -match "</body>") {
            # Подготавливаем код для вставки
            $lazyLoadScript = @"

    <!-- Lazy Loading для оптимизации производительности -->
    <script src="../lazy-load-sections.js"></script>
</body>
"@
            
            # Заменяем </body> на наш код + </body>
            $newContent = $content -replace "</body>", $lazyLoadScript
            
            # Сохраняем файл
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8 -NoNewline
            
            Write-Host "   ✅ Успешно интегрирован" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "   ⚠️  Тег </body> не найден" -ForegroundColor Yellow
            $errorCount++
        }
    }
    catch {
        Write-Host "   ❌ Ошибка: $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Итоговая статистика
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 РЕЗУЛЬТАТЫ ИНТЕГРАЦИИ" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Успешно:  $successCount" -ForegroundColor Green
Write-Host "⏭️  Пропущено: $skippedCount" -ForegroundColor Yellow
Write-Host "❌ Ошибок:   $errorCount" -ForegroundColor Red
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "🎉 Lazy Loading успешно интегрирован!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Следующие шаги:" -ForegroundColor Cyan
    Write-Host "   1. Открой любой модуль в браузере" -ForegroundColor White
    Write-Host "   2. Нажми F12 → Console" -ForegroundColor White
    Write-Host "   3. Должно быть: ✅ Lazy loading initialized" -ForegroundColor White
    Write-Host "   4. Прокрути страницу и наслаждайся плавной анимацией!" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Подробнее: LAZY-LOAD-INTEGRATION.md" -ForegroundColor Cyan
}

Write-Host ""
