# Скрипт для исправления ссылок на документацию

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔧 ИСПРАВЛЕНИЕ ССЫЛОК НА ДОКУМЕНТАЦИЮ                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Список файлов для обновления (корневая папка)
$rootFiles = @(
    "index.html",
    "about.html",
    "career.html",
    "contacts.html",
    "courses.html",
    "course.html",
    "dashboard.html",
    "faq.html",
    "help.html",
    "login.html",
    "register.html",
    "pricing.html"
)

# Замены для корневых файлов
$rootReplacements = @{
    'href="documentation-old"' = 'href="documentation"'
    "href='documentation-old'" = "href='documentation'"
}

Write-Host "📂 Обновление корневых файлов:`n" -ForegroundColor Yellow

$updatedCount = 0

foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalContent = $content
        
        foreach ($old in $rootReplacements.Keys) {
            $new = $rootReplacements[$old]
            $content = $content -replace [regex]::Escape($old), $new
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "   ✅ $file" -ForegroundColor Green
            $updatedCount++
        } else {
            Write-Host "   ⏭️  $file (без изменений)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  $file (не найден)" -ForegroundColor Yellow
    }
}

# Обновление файлов в папке pages
Write-Host "`n📂 Обновление файлов в pages/:`n" -ForegroundColor Yellow

$pagesFiles = Get-ChildItem -Path "pages" -Filter "*.html" -File

# Замены для файлов в pages/
$pagesReplacements = @{
    'href="../documentation-old"' = 'href="../documentation"'
    "href='../documentation-old'" = "href='../documentation'"
    'href="documentation-old"' = 'href="../documentation"'
    "href='documentation-old'" = "href='../documentation'"
}

foreach ($file in $pagesFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    foreach ($old in $pagesReplacements.Keys) {
        $new = $pagesReplacements[$old]
        $content = $content -replace [regex]::Escape($old), $new
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "   ✅ $($file.Name)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ ГОТОВО!                                                      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Обновлено файлов: $updatedCount" -ForegroundColor Cyan
Write-Host "`nТеперь все ссылки ведут на: /documentation`n" -ForegroundColor Yellow

Write-Host "Press Enter to exit..."
Read-Host
