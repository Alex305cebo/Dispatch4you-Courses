# Fix footer encoding in all module files

$moduleFiles = Get-ChildItem "pages/doc-module-*.html"

foreach ($file in $moduleFiles) {
    Write-Host "Processing: $($file.Name)"
    
    # Read with UTF8 encoding
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if footer exists
    if ($content -notmatch '<footer') {
        Write-Host "  No footer found" -ForegroundColor Yellow
        continue
    }
    
    # Save with UTF8 BOM to fix encoding
    $utf8WithBom = New-Object System.Text.UTF8Encoding $true
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
    
    Write-Host "  Encoding fixed!" -ForegroundColor Green
}

Write-Host "`nDone! Processed: $($moduleFiles.Count) files" -ForegroundColor Cyan
