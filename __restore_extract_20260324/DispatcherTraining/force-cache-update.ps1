# Force cache update with timestamp

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
Write-Host "Forcing cache update with timestamp: $timestamp" -ForegroundColor Cyan

# Get all HTML files
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\backup*" -and
    $_.Name -notlike "*_backup_*"
}

$updatedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $updated = $false
    
    # Update shared-nav.css with timestamp
    if ($content -match 'shared-nav\.css\?v=[\d\.]+') {
        $content = $content -replace 'shared-nav\.css\?v=[\d\.]+', "shared-nav.css?v=5.0.$timestamp"
        $updated = $true
    }
    
    # Update nav-loader.js with timestamp
    if ($content -match 'nav-loader\.js\?v=[\d\.]+') {
        $content = $content -replace 'nav-loader\.js\?v=[\d\.]+', "nav-loader.js?v=5.0.$timestamp"
        $updated = $true
    }
    
    if ($updated -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "Done! Updated $updatedCount files with cache-busting timestamp" -ForegroundColor Green
