# Fix corrupted symbols in modules 3-12
$arrowDown = [char]0x25BC  # ▼
$arrowRight = [char]0x2192  # →

Write-Host "Fixing symbols in modules 3-12...`n"

for ($i = 3; $i -le 12; $i++) {
    $file = "pages/doc-module-$i.html"
    
    Write-Host "Module $i..." -NoNewline
    
    try {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        $count = 0
        
        # Fix corrupted symbols
        if ($content -match "content: 'РІвЂ") {
            $content = $content -replace "content: 'РІвЂ"С'", "content: '$arrowDown'"
            $content = $content -replace "content: 'РІвЂ вЂ™'", "content: '$arrowRight'"
            $count++
        }
        
        if ($count -gt 0) {
            [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
            Write-Host " ✓ ($count fixes)" -ForegroundColor Green
        } else {
            Write-Host " OK" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
