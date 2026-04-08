# Скрипт для исправления процента диспетчера на всем сайте

Write-Host "=== Исправление процента диспетчера ===" -ForegroundColor Cyan

# Список файлов для обработки
$files = Get-ChildItem -Path . -Include *.html,*.md -Recurse | Where-Object {
    $_.FullName -notmatch '\\(node_modules|\.git|BACKUP|Old Modules)\\' -and
    $_.Name -notmatch 'BACKUP'
}

$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $fileChanges = 0
    
    # Замена 5-10% на 2-3% (может доходить до 5%+)
    $content = $content -replace '5–10%\s+от\s+(gross|выручки|ставки)', '2–3% (может доходить до 5%+) от $1'
    $content = $content -replace '5-10%\s+от\s+(gross|выручки|ставки)', '2-3% (может доходить до 5%+) от $1'
    
    # Замена примеров с 8%
    $content = $content -replace '\$2000\s*×\s*8%\s*=\s*\$160', '$2000 × 3% = $60'
    $content = $content -replace '\$2000\s*x\s*8%\s*=\s*\$160', '$2000 × 3% = $60'
    
    # Замена в тексте "5-10%" без контекста
    $content = $content -replace '(<[^>]*>)?5-10%(<[^>]*>)?(\s+от\s+gross|\s+Fee|\s+комиссия)', '$1 2-3%$2$3'
    $content = $content -replace '(<[^>]*>)?5–10%(<[^>]*>)?(\s+от\s+gross|\s+Fee|\s+комиссия)', '$12–3%$2$3'
    
    # Замена в примерах расчетов
    $content = $content -replace '×\s*7%\s*=', '× 3% ='
    $content = $content -replace 'x\s*7%\s*=', '× 3% ='
    
    # Замена диапазонов 5-8%
    $content = $content -replace '5-8%\s+от\s+gross', '2-3% от gross'
    
    # Пересчет примеров
    $content = $content -replace '\$15,000\s*×\s*7%\s*=\s*\$1,050', '$15,000 × 3% = $450'
    $content = $content -replace '\$15K\s*×\s*7%\s*=\s*\$1,050', '$15K × 3% = $450'
    $content = $content -replace '\$5,250/мес', '$2,250/мес'
    $content = $content -replace '\$63K/год', '$27K/год (с 5 траками)'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $fileChanges = ($originalContent.Length - $content.Length)
        $totalChanges++
        Write-Host "✓ $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host "Обновлено файлов: $totalChanges" -ForegroundColor Cyan
