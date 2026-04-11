# Исправление структуры аудио плеера на всех страницах

$pages = @(
    'pages/brokers.html',
    'pages/docs.html',
    'pages/equipment.html',
    'pages/intro.html',
    'pages/loadboards.html',
    'pages/negotiation.html',
    'pages/role.html',
    'pages/routes.html'
)

foreach ($page in $pages) {
    Write-Host "Processing $page..."
    $content = Get-Content $page -Raw -Encoding UTF8
    
    # Удаляем SVG кольца
    $content = $content -replace '<svg class="la-ring"[^>]*>.*?</svg>\s*', ''
    
    # Удаляем la-seek divs
    $content = $content -replace '<div class="la-seek"[^>]*></div>\s*', ''
    
    # Исправляем порядок: кнопка должна быть первой
    # Ищем паттерн где кнопка идёт после других элементов и переставляем
    
    Set-Content $page $content -NoNewline -Encoding UTF8
    Write-Host "  ✓ Fixed $page"
}

Write-Host "`nAll pages fixed!"
