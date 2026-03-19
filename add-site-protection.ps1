# Site Protection Script
# Adds password protection to all HTML pages

Write-Host "Adding site protection..." -ForegroundColor Cyan

$protectionComment = '  <!-- Site Protection -->'
$protectionScriptTag = '  <script src="../site-protection.js"></script>'
$protectionScriptTagRoot = '  <script src="site-protection.js"></script>'

$filesUpdated = 0
$filesSkipped = 0

function Has-Protection {
    param($content)
    return $content -match 'site-protection\.js'
}

# Process root files
Write-Host "Processing root files..." -ForegroundColor Yellow

$rootFiles = Get-ChildItem -Path "." -Filter "*.html" -File | Where-Object { 
    $_.Name -ne "password-gate.html" 
}

foreach ($file in $rootFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    if (Has-Protection $content) {
        Write-Host "  Skip: $($file.Name)" -ForegroundColor Gray
        $filesSkipped++
        continue
    }
    
    $content = $content -replace '(<head[^>]*>)', "`$1`n$protectionComment`n$protectionScriptTagRoot"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "  OK: $($file.Name)" -ForegroundColor Green
    $filesUpdated++
}

# Process pages folder
Write-Host ""
Write-Host "Processing pages folder..." -ForegroundColor Yellow

$pagesFiles = Get-ChildItem -Path "pages" -Filter "*.html" -File

foreach ($file in $pagesFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    if (Has-Protection $content) {
        Write-Host "  Skip: $($file.Name)" -ForegroundColor Gray
        $filesSkipped++
        continue
    }
    
    $content = $content -replace '(<head[^>]*>)', "`$1`n$protectionComment`n$protectionScriptTag"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "  OK: $($file.Name)" -ForegroundColor Green
    $filesUpdated++
}

Write-Host ""
Write-Host "DONE!" -ForegroundColor Green
Write-Host "Updated: $filesUpdated files" -ForegroundColor Green
Write-Host "Skipped: $filesSkipped files" -ForegroundColor Gray
Write-Host ""
Write-Host "Password: dev2026" -ForegroundColor Yellow
Write-Host "Login page: password-gate.html" -ForegroundColor Cyan
