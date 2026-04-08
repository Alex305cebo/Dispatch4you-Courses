# Fix encoding for all module files
$files = Get-ChildItem -Path "pages" -Filter "doc-module-*.html"

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    # Read file as bytes
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    
    # Try to detect if it's already corrupted UTF-8
    $utf8Text = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Check if text contains corrupted characters
    if ($utf8Text -match 'Р СљР С•Р Т'РЎС"Р В»РЎРЉ|РњРѕРґСѓР»СЊ') {
        Write-Host "  - File has encoding issues, attempting to fix..."
        
        # The text is double-encoded: originally UTF-8, saved as Windows-1251, read as UTF-8
        # We need to reverse this: UTF-8 -> bytes -> interpret as Windows-1251 -> save as UTF-8
        
        # Get the corrupted UTF-8 bytes
        $corruptedBytes = [System.Text.Encoding]::UTF8.GetBytes($utf8Text)
        
        # Interpret those bytes as Windows-1251
        $fixedText = [System.Text.Encoding]::GetEncoding("windows-1251").GetString($corruptedBytes)
        
        # Save as proper UTF-8
        [System.IO.File]::WriteAllText($file.FullName, $fixedText, [System.Text.Encoding]::UTF8)
        
        Write-Host "  - Fixed!" -ForegroundColor Green
    } else {
        Write-Host "  - File encoding looks OK" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! All files processed." -ForegroundColor Cyan
