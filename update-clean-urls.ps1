# PowerShell скрипт для обновления всех ссылок на clean URLs

Write-Host "Обновление ссылок на clean URLs..." -ForegroundColor Green

# Список HTML файлов для обновления
$htmlFiles = @(
    "about.html",
    "career.html", 
    "contacts.html",
    "courses.html",
    "dashboard.html",
    "faq.html",
    "help.html",
    "login.html",
    "register.html",
    "pricing.html",
    "course.html",
    "cargo-stats.html",
    "cards_quiz_standalone.html"
)

# Список замен (старая ссылка -> новая ссылка)
$replacements = @{
    'pages/modules.html' = 'modules'
    'pages/modules-index.html' = 'modules'
    'pages/simulator.html' = 'simulator'
    'pages/calls.html' = 'calls'
    'pages/cases.html' = 'cases'
    'pages/testing.html' = 'testing'
    'pages/loadboard.html' = 'loadboard'
    'pages/load-finder.html' = 'load-finder'
    'pages/dispatcher-cards.html' = 'dispatcher-cards'
    'pages/documentation.html' = 'documentation-old'
    'pages/documentation-new.html' = 'documentation'
    'pages/doc-module-1.html' = 'doc-module-1'
    'pages/doc-module-2.html' = 'doc-module-2'
}

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "Обновляю $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $updated = $false
        
        foreach ($oldUrl in $replacements.Keys) {
            $newUrl = $replacements[$oldUrl]
            
            # Обновляем href ссылки
            if ($content -match "href=`"$([regex]::Escape($oldUrl))`"") {
                $content = $content -replace "href=`"$([regex]::Escape($oldUrl))`"", "href=`"$newUrl`""
                $updated = $true
                Write-Host "  $oldUrl -> $newUrl" -ForegroundColor Green
            }
            
            # Обновляем data-link атрибуты
            if ($content -match "data-link=`"$([regex]::Escape($oldUrl))`"") {
                $content = $content -replace "data-link=`"$([regex]::Escape($oldUrl))`"", "data-link=`"$newUrl`""
                $updated = $true
                Write-Host "  data-link: $oldUrl -> $newUrl" -ForegroundColor Green
            }
            
            # Обновляем onclick ссылки
            if ($content -match "window\.location\.href='$([regex]::Escape($oldUrl))'") {
                $content = $content -replace "window\.location\.href='$([regex]::Escape($oldUrl))'", "window.location.href='$newUrl'"
                $updated = $true
                Write-Host "  onclick: $oldUrl -> $newUrl" -ForegroundColor Green
            }
        }
        
        if ($updated) {
            Set-Content $file -Value $content -Encoding UTF8
            Write-Host "  Файл обновлен" -ForegroundColor Green
        } else {
            Write-Host "  Изменений не найдено" -ForegroundColor Gray
        }
    } else {
        Write-Host "Файл $file не найден" -ForegroundColor Red
    }
}

Write-Host "Обновление завершено!" -ForegroundColor Green