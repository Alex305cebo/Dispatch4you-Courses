# Fix simulator.html - remove ALL inline navigation styles

Write-Host "Fixing simulator.html navigation..." -ForegroundColor Cyan

$file = "pages\simulator.html"

if (Test-Path $file) {
    $content = Get-Content $file -Raw -Encoding UTF8
    
    # Find and remove the entire navigation styles block
    # From "/* Navigation */" to just before ".container {"
    
    $pattern = '(?s)/\*\s*Navigation\s*\*/.*?(?=\.container\s*\{)'
    
    if ($content -match $pattern) {
        Write-Host "Found navigation styles block" -ForegroundColor Yellow
        $content = $content -replace $pattern, ''
        
        # Clean up multiple empty lines
        $content = $content -replace '(\r?\n\s*){3,}', "`r`n`r`n"
        
        # Save
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        
        Write-Host "[OK] Removed inline navigation styles" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Navigation block not found or already removed" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERROR] File not found: $file" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done! Test on localhost:8000/pages/simulator.html" -ForegroundColor Cyan
