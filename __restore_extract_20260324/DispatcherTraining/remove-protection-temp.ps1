# Временное удаление подключения site-protection.js из всех HTML файлов

Write-Host "Removing site-protection.js from HTML files..." -ForegroundColor Yellow

$files = @(
    "index.html",
    "dashboard.html",
    "courses.html",
    "contacts.html",
    "course.html",
    "documentation.html",
    "pages/admin.html",
    "pages/documentation.html",
    "pages/doc-module-1-complete.html",
    "pages/doc-module-2-complete.html",
    "pages/doc-module-3-complete.html",
    "pages/doc-module-4-complete.html",
    "pages/doc-module-5-complete.html",
    "pages/doc-module-6-complete.html",
    "pages/doc-module-7-complete.html",
    "pages/doc-module-8-complete.html",
    "pages/doc-module-9-complete.html",
    "pages/doc-module-10-complete.html",
    "pages/doc-module-11-complete.html",
    "pages/doc-module-12-complete.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace '    <!-- 🔒 ЗАЩИТА САЙТА ПАРОЛЕМ -->\r?\n    <script src="(\.\.\/)?site-protection\.js"><\/script>\r?\n', ''
        $content | Set-Content $file -NoNewline
        Write-Host "✅ $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Now commit and push:" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor White
Write-Host 'git commit -m "Temporary: Remove site-protection.js from all pages"' -ForegroundColor White
Write-Host "git push origin main" -ForegroundColor White
