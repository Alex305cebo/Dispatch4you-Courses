# PowerShell script for updating navigation versions in all HTML files

Write-Host "Updating navigation to v5.0 (Unified Design)..." -ForegroundColor Cyan

# Get all HTML files
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\backup*" -and
    $_.Name -notlike "*_backup_*"
}

$updatedCount = 0
$totalFiles = $htmlFiles.Count

Write-Host "Found files: $totalFiles" -ForegroundColor Yellow

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $updated = $false
    
    # Update shared-nav.css
    if ($content -match 'shared-nav\.css(\?v=[\d\.]+)?') {
        $content = $content -replace 'shared-nav\.css(\?v=[\d\.]+)?', 'shared-nav.css?v=5.0'
        $updated = $true
    }
    
    # Update nav-loader.js
    if ($content -match 'nav-loader\.js(\?v=[\d\.]+)?') {
        $content = $content -replace 'nav-loader\.js(\?v=[\d\.]+)?', 'nav-loader.js?v=5.0'
        $updated = $true
    }
    
    # Save if changed
    if ($updated -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "Done! Updated files: $updatedCount of $totalFiles" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Style: Navigation v5.0 - unified design'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
