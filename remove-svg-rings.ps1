# Script to remove SVG ring elements from all audio player pages

$pages = @(
    "pages/negotiation.html",
    "pages/intro.html",
    "pages/role.html",
    "pages/routes.html",
    "pages/equipment.html",
    "pages/loadboards.html",
    "pages/brokers.html",
    "pages/docs.html"
)

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Processing $page..."
        $content = Get-Content $page -Raw -Encoding UTF8
        
        # Remove SVG ring elements with onclick
        $content = $content -replace '<svg class="la-ring"[^>]*onclick="laSeek\(event[^)]*\)"[^>]*>[\s\S]*?</svg>\s*', ''
        
        # Remove SVG ring elements without onclick
        $content = $content -replace '<svg class="la-ring"[^>]*>[\s\S]*?</svg>\s*', ''
        
        # Remove la-seek divs
        $content = $content -replace '<div class="la-seek"[^>]*>[\s\S]*?</div>\s*', ''
        
        Set-Content $page -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✓ Cleaned $page"
    }
}

Write-Host "`n✓ All pages cleaned!"
