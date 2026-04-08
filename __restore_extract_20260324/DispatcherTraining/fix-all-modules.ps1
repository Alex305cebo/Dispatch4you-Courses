# Fix encoding for all module files - force conversion
$files = @(
    "pages/doc-module-1.html",
    "pages/doc-module-2.html",
    "pages/doc-module-3.html",
    "pages/doc-module-4.html",
    "pages/doc-module-5.html",
    "pages/doc-module-6.html",
    "pages/doc-module-7.html",
    "pages/doc-module-8.html",
    "pages/doc-module-9.html",
    "pages/doc-module-10.html",
    "pages/doc-module-11.html",
    "pages/doc-module-12.html"
)

$win1251 = [System.Text.Encoding]::GetEncoding("windows-1251")
$utf8 = [System.Text.Encoding]::UTF8

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        
        # Read as bytes
        $bytes = [System.IO.File]::ReadAllBytes($file)
        
        # Interpret bytes as Windows-1251
        $text = $win1251.GetString($bytes)
        
        # Save as UTF-8
        [System.IO.File]::WriteAllText($file, $text, $utf8)
        
        Write-Host "  - Done!" -ForegroundColor Green
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan
