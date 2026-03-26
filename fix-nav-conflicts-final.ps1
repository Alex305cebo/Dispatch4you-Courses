# Исправляем конфликты navbar только в рабочих файлах
# Стратегия: переименовываем конфликтующие классы в inline стилях
# .navbar -> .page-navbar (старое встроенное меню)
# .nav-link -> .page-nav-link
# .nav-actions -> .page-nav-actions
# .nav-btn -> .module-nav-btn

$targetFiles = @(
    "pages\modules-index.html",
    "pages\simulator.html"
)

foreach ($path in $targetFiles) {
    if (-not (Test-Path $path)) { Write-Host "NOT FOUND: $path"; continue }
    
    $content = Get-Content $path -Raw -Encoding UTF8
    $original = $content
    
    # Проверяем есть ли nav-placeholder (значит уже используется единое меню)
    $hasNavPlaceholder = $content -match 'id="nav-placeholder"'
    
    if ($hasNavPlaceholder) {
        # Файл уже использует единое меню - просто убираем конфликтующие inline стили
        # Удаляем весь старый <nav> блок если он есть
        # И переименовываем конфликтующие CSS классы в style блоке
        
        # Переименовываем в CSS (только внутри <style> блоков)
        $content = $content -replace '(?s)(<style[^>]*>.*?)(\.navbar\s*\{)', '$1.old-navbar {'
        $content = $content -replace '(?s)(<style[^>]*>.*?)(\.nav-link\s*\{)', '$1.old-nav-link {'
        $content = $content -replace '(?s)(<style[^>]*>.*?)(\.nav-actions\s*\{)', '$1.old-nav-actions {'
        $content = $content -replace '\.nav-btn\s*\{', '.module-nav-btn {'
        $content = $content -replace 'class="nav-btn\b', 'class="module-nav-btn'
        
        Write-Host "Updated (has nav-placeholder): $path"
    } else {
        Write-Host "SKIP (no nav-placeholder): $path"
    }
    
    if ($content -ne $original) {
        Set-Content $path -Value $content -Encoding UTF8 -NoNewline
    }
}

Write-Host "Done."
