# Скрипт для установки адаптивного меню на все страницы
Write-Host "🚀 Установка адаптивного меню на все страницы..." -ForegroundColor Cyan
Write-Host ""

# Список страниц для обновления
$pages = @(
    "blog.html",
    "career.html",
    "contacts.html",
    "course.html",
    "courses.html",
    "dashboard.html",
    "faq.html",
    "help.html",
    "pricing.html"
)

$successCount = 0
$skippedCount = 0

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Проверка $page..." -ForegroundColor Yellow
        
        $content = Get-Content $page -Raw -Encoding UTF8
        
        # Проверяем, есть ли уже shared-nav.css
        if ($content -match 'shared-nav\.css') {
            Write-Host "  ✓ $page уже имеет shared-nav.css" -ForegroundColor Green
            $skippedCount++
        } else {
            # Добавляем CSS link перед </head>
            $content = $content -replace '</head>', '  <link rel="stylesheet" href="shared-nav.css">`n</head>'
            
            # Сохраняем с UTF-8 BOM
            $utf8WithBom = New-Object System.Text.UTF8Encoding $true
            [System.IO.File]::WriteAllText("$PWD/$page", $content, $utf8WithBom)
            
            Write-Host "  ✓ $page обновлен" -ForegroundColor Green
            $successCount++
        }
    } else {
        Write-Host "  ⚠ $page не найден" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Готово!" -ForegroundColor Green
Write-Host "Обновлено: $successCount страниц" -ForegroundColor Green
Write-Host "Пропущено: $skippedCount страниц (уже имеют CSS)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Адаптивное меню установлено на все страницы!" -ForegroundColor Green
Write-Host ""
Write-Host "Breakpoints:" -ForegroundColor Cyan
Write-Host "  • 1400px+ - Extra large screens" -ForegroundColor White
Write-Host "  • 1200px - Medium desktops" -ForegroundColor White
Write-Host "  • 1024px - Tablets landscape" -ForegroundColor White
Write-Host "  • 900px - Tablets portrait" -ForegroundColor White
Write-Host "  • 768px - Mobile landscape" -ForegroundColor White
Write-Host "  • 600px - Mobile portrait" -ForegroundColor White
Write-Host "  • 480px - Small mobile" -ForegroundColor White
Write-Host "  • 360px - Extra small mobile" -ForegroundColor White
Write-Host ""

Read-Host "Нажмите Enter для выхода"
