# PowerShell скрипт для обновления версий навигации во всех HTML файлах

Write-Host "🔄 Обновление версий навигации во всех HTML файлах..." -ForegroundColor Cyan

# Получаем все HTML файлы
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\backup*" -and
    $_.Name -notlike "*_backup_*"
}

$updatedCount = 0
$totalFiles = $htmlFiles.Count

Write-Host "📁 Найдено файлов: $totalFiles" -ForegroundColor Yellow

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $updated = $false
    
    # Обновляем shared-nav.css
    if ($content -match 'shared-nav\.css(\?v=[\d\.]+)?') {
        $content = $content -replace 'shared-nav\.css(\?v=[\d\.]+)?', 'shared-nav.css?v=4.0'
        $updated = $true
    }
    
    # Обновляем nav-loader.js
    if ($content -match 'nav-loader\.js(\?v=[\d\.]+)?') {
        $content = $content -replace 'nav-loader\.js(\?v=[\d\.]+)?', 'nav-loader.js?v=4.0'
        $updated = $true
    }
    
    # Сохраняем если были изменения
    if ($updated -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Обновлён: $($file.Name)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "✨ Готово! Обновлено файлов: $updatedCount из $totalFiles" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m '🔧 Fix: Обновлена навигация v4.0 - полная адаптивность'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
