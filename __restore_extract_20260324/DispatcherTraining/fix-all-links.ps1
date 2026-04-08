# Исправление всех ссылок на clean URLs

Write-Host "Исправление всех ссылок..." -ForegroundColor Green

# Список всех файлов для обновления
$allFiles = @(
    "shared-header.html",
    "test-nav-inline.html"
)

# Замены
$replacements = @{
    'href="pages/modules.html"' = 'href="modules"'
    'href="pages/modules-index.html"' = 'href="modules"'
    'href="pages/simulator.html"' = 'href="simulator"'
    'href="pages/calls.html"' = 'href="calls"'
    'href="pages/cases.html"' = 'href="cases"'
    'href="pages/testing.html"' = 'href="testing"'
    'href="pages/loadboard.html"' = 'href="loadboard"'
    'href="pages/load-finder.html"' = 'href="load-finder"'
    'href="pages/dispatcher-cards.html"' = 'href="dispatcher-cards"'
    'href="pages/documentation.html"' = 'href="documentation-old"'
    'href="pages/documentation-new.html"' = 'href="documentation"'
}

foreach ($file in $allFiles) {
    if (Test-Path $file) {
        Write-Host "Обновляю $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $updated = $false
        
        foreach ($oldLink in $replacements.Keys) {
            $newLink = $replacements[$oldLink]
            
            if ($content -match [regex]::Escape($oldLink)) {
                $content = $content -replace [regex]::Escape($oldLink), $newLink
                $updated = $true
                Write-Host "  $oldLink -> $newLink" -ForegroundColor Green
            }
        }
        
        if ($updated) {
            Set-Content $file -Value $content -Encoding UTF8
            Write-Host "  Файл обновлен" -ForegroundColor Green
        } else {
            Write-Host "  Изменений не найдено" -ForegroundColor Gray
        }
    }
}

Write-Host "Готово!" -ForegroundColor Green