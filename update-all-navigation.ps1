# Скрипт для обновления навигации на всех страницах

Write-Host "=== Обновление навигации на всех страницах ===" -ForegroundColor Cyan

# Список файлов для обработки
$files = @(
    "pages/equipment.html",
    "pages/routes.html", 
    "pages/loadboards.html",
    "pages/negotiation.html",
    "pages/docs.html",
    "pages/regulations.html",
    "pages/technology.html",
    "pages/communication.html",
    "pages/problems.html",
    "pages/finances.html",
    "pages/career.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "`nОбработка: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $changed = $false
        
        # Добавляем стрелки в заголовки (разные варианты классов)
        if ($content -match 'РАЗДЕЛЫ</h4>' -and $content -notmatch 'РАЗДЕЛЫ<span class="section-arrow">') {
            $content = $content -replace '(РАЗДЕЛЫ)</h4>', '$1<span class="section-arrow">▼</span></h4>'
            $changed = $true
            Write-Host "  + Добавлена стрелка в РАЗДЕЛЫ" -ForegroundColor Green
        }
        
        if ($content -match 'МОДУЛИ</h4>' -and $content -notmatch 'МОДУЛИ<span class="section-arrow">') {
            $content = $content -replace '(МОДУЛИ)</h4>', '$1<span class="section-arrow">▼</span></h4>'
            $changed = $true
            Write-Host "  + Добавлена стрелка в МОДУЛИ" -ForegroundColor Green
        }
        
        if ($content -match 'ИНСТРУМЕНТЫ</h4>' -and $content -notmatch 'ИНСТРУМЕНТЫ<span class="section-arrow">') {
            $content = $content -replace '(ИНСТРУМЕНТЫ)</h4>', '$1<span class="section-arrow">▼</span></h4>'
            $changed = $true
            Write-Host "  + Добавлена стрелка в ИНСТРУМЕНТЫ" -ForegroundColor Green
        }
        
        # Добавляем CSS и JS файлы перед </body>
        if ($content -notmatch 'course-navigation.css') {
            $content = $content -replace '</body>', '<link rel="stylesheet" href="../course-navigation.css">' + "`n" + '<script src="../course-navigation.js"></script>' + "`n" + '<link rel="stylesheet" href="../scroll-to-top.css">' + "`n" + '<script src="../scroll-to-top.js"></script>' + "`n" + '</body>'
            $changed = $true
            Write-Host "  + Добавлены CSS и JS файлы" -ForegroundColor Green
        }
        
        if ($changed) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  ✓ Файл обновлен" -ForegroundColor Green
        } else {
            Write-Host "  - Изменения не требуются" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Файл не найден: $file" -ForegroundColor Red
    }
}

Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host "Обработано файлов: $($files.Count)" -ForegroundColor Cyan
