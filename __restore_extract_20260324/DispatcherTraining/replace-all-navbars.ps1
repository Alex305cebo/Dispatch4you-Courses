# Скрипт для замены всех встроенных navbar на единое загружаемое меню

Write-Host "🔄 Замена всех navbar на nav-placeholder..." -ForegroundColor Cyan

$files = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.next\*" -and
    $_.FullName -notlike "*\BACKUP-*" -and
    $_.FullName -notlike "*\audio-learning-platform\*"
}

$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Проверяем есть ли встроенный navbar
    if ($content -match '<nav class="navbar">') {
        Write-Host "📝 Обрабатываю: $($file.Name)" -ForegroundColor Yellow
        
        # Удаляем весь блок navbar (от <nav до закрывающего </div> мобильного меню)
        $content = $content -replace '(?s)<!-- Navigation -->.*?<nav class="navbar">.*?</div>\s*</div>\s*<!-- Mobile Menu -->', '<div id="nav-placeholder"></div>'
        $content = $content -replace '(?s)<nav class="navbar">.*?</div>\s*</div>\s*<!-- Mobile Menu -->', '<div id="nav-placeholder"></div>'
        $content = $content -replace '(?s)<!-- Navigation -->.*?<nav class="navbar">.*?</div>\s*</div>', '<div id="nav-placeholder"></div>'
        $content = $content -replace '(?s)<nav class="navbar">.*?</div>\s*</div>', '<div id="nav-placeholder"></div>'
        
        # Проверяем есть ли уже nav-loader.js
        if ($content -notmatch 'nav-loader\.js') {
            # Определяем правильный путь к nav-loader.js
            $relativePath = if ($file.DirectoryName -like "*\pages\*") { "../nav-loader.js" } else { "nav-loader.js" }
            
            # Добавляем скрипт после nav-placeholder
            $content = $content -replace '(<div id="nav-placeholder"></div>)', "`$1`n  <script src=`"$relativePath`"></script>"
        }
        
        # Сохраняем файл
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $count++
    }
}

Write-Host "`n✅ Готово! Обработано файлов: $count" -ForegroundColor Green
Write-Host "📋 Теперь все страницы используют единое меню из nav.html" -ForegroundColor Cyan
