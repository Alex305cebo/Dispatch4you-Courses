# Move navigation block script
$files = @("pages/routes.html", "pages/equipment.html", "pages/intro.html")

foreach ($file in $files) {
    Write-Host "Processing $file..."
    $content = Get-Content $file -Raw
    
    # Pattern for navigation block
    $navPattern = '(?s)<section class="section"[^>]*>\s*<div class="container">\s*<div class="sector-wrapper sector-navigation.*?</section>'
    
    if ($content -match $navPattern) {
        $navBlock = $matches[0]
        # Remove from current position
        $content = $content.Replace($navBlock, '')
        
        # Find insertion point after page header
        $headerEnd = '</div>\s*</section>\s*<!-- Gradient Line -->'
        if ($content -match $headerEnd) {
            $content = $content -replace $headerEnd, ($matches[0] + "`n`n    " + $navBlock)
            $content | Set-Content $file -NoNewline
            Write-Host "Done: $file"
        }
    }
}
