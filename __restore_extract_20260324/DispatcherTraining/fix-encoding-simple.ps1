# Fix encoding for all module files
$files = Get-ChildItem -Path "pages" -Filter "doc-module-*.html"

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    # Read file content as UTF-8
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if file contains corrupted characters (look for specific pattern)
    if ($content -match '\xD0\x A0|\xC3\x90') {
        Write-Host "  - File has encoding issues, attempting to fix..."
        
        # Read as bytes and reinterpret
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $win1251 = [System.Text.Encoding]::GetEncoding("windows-1251")
        $utf8 = [System.Text.Encoding]::UTF8
        
        # Convert UTF-8 bytes to string as if they were Windows-1251
        $text = $win1251.GetString($bytes)
        
        # Save back as proper UTF-8
        [System.IO.File]::WriteAllText($file.FullName, $text, $utf8)
        
        Write-Host "  - Fixed!" -ForegroundColor Green
    } else {
        Write-Host "  - Checking..." -ForegroundColor Yellow
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
