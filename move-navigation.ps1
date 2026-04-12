# Script to move navigation block right after page header on all course pages

$files = @(
    "pages/routes.html",
    "pages/equipment.html",
    "pages/loadboards.html",
    "pages/negotiation.html",
    "pages/communication.html",
    "pages/problems.html",
    "pages/finances.html",
    "pages/regulations.html",
    "pages/technology.html",
    "pages/intro.html",
    "pages/glossary.html",
    "pages/role.html",
    "pages/docs.html",
    "pages/brokers.html",
    "pages/career.html",
    "pages/documentation.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Find and extract navigation block
        if ($content -match '(?s)(<section class="section"[^>]*>\s*<div class="container">\s*<div class="sector-wrapper sector-navigation.*?</div>\s*</div>\s*</section>)') {
            $navBlock = $matches[1]
            
            # Remove navigation block from current position
            $content = $content -replace [regex]::Escape($navBlock), ''
            
            # Find the page header end (after </div> that closes page-header container)
            # Insert navigation right after page header section
            if ($content -match '(?s)(</div>\s*</section>\s*<!-- Gradient Line -->)') {
                $insertPoint = $matches[1]
                $replacement = $insertPoint + "`n`n    " + $navBlock
                $content = $content -replace [regex]::Escape($insertPoint), $replacement
                
                # Save file
                $content | Set-Content $file -Encoding UTF8 -NoNewline
                Write-Host "  ✓ Moved navigation block in $file"
            } else {
                Write-Host "  ✗ Could not find insertion point in $file"
            }
        } else {
            Write-Host "  ✗ Navigation block not found in $file"
        }
    } else {
        Write-Host "  ✗ File not found: $file"
    }
}

Write-Host "`nDone!"
