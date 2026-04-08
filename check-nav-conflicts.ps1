# Скрипт для поиска конфликтов inline стилей навигации с shared-nav.css

Write-Host "🔍 Проверка конфликтов стилей навигации..." -ForegroundColor Cyan
Write-Host ""

$conflictPatterns = @(
    "\.navbar\s*\{",
    "\.nav-content\s*\{",
    "\.nav-links\s*\{",
    "\.nav-actions\s*\{",
    "\.btn-login\s*\{",
    "\.btn-signup\s*\{",
    "\.logo\s*\{"
)

$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.next\*" -and
    $_.FullName -notlike "*\dispatcher-cards-app\*" -and
    $_.FullName -notlike "*\audio-learning-platform\*"
}

$filesWithConflicts = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content) {
        $hasConflict = $false
        $conflictsFound = @()
        
        foreach ($pattern in $conflictPatterns) {
            if ($content -match $pattern) {
                $hasConflict = $true
                $conflictsFound += $pattern
            }
        }
        
        if ($hasConflict) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            $filesWithConflicts += [PSCustomObject]@{
                File = $relativePath
                Conflicts = $conflictsFound.Count
                Patterns = $conflictsFound -join ", "
            }
        }
    }
}

if ($filesWithConflicts.Count -eq 0) {
    Write-Host "✅ Конфликтов не найдено!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Найдено файлов с конфликтами: $($filesWithConflicts.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    $filesWithConflicts | Sort-Object -Property Conflicts -Descending | Format-Table -AutoSize
    
    Write-Host ""
    Write-Host "📝 Рекомендации:" -ForegroundColor Cyan
    Write-Host "  1. Удалить inline стили навигации из этих файлов" -ForegroundColor White
    Write-Host "  2. Оставить только <link rel='stylesheet' href='shared-nav.css?v=5.0.1774296668'>" -ForegroundColor White
    Write-Host "  3. Или добавить !important к shared-nav.css (не рекомендуется)" -ForegroundColor White
    Write-Host ""
    
    # Сохраняем список в файл
    $filesWithConflicts | Export-Csv -Path "nav-conflicts-report.csv" -NoTypeInformation -Encoding UTF8
    Write-Host "💾 Отчет сохранен в: nav-conflicts-report.csv" -ForegroundColor Green
}

Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
