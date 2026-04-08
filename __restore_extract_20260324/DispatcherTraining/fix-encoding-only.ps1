# Fix encoding for all module files - convert to UTF-8

$files = Get-ChildItem "pages/doc-module-*.html"

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    # Try to read with different encodings
    try {
        # Read as Windows-1251 (current encoding)
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::GetEncoding(1251))
        
        # Save as UTF-8 without BOM
        $utf8 = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8)
        
        Write-Host "  Converted from Windows-1251 to UTF-8" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host "`nDone! Processed $($files.Count) files" -ForegroundColor Cyan
Write-Host "Please refresh your browser (Ctrl+F5)" -ForegroundColor Yellow
