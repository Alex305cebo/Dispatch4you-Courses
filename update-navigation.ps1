# Script to update navigation on all pages
# Remove back buttons and add unified navigation

$pages = @(
    "pages/loadboard.html",
    "pages/simulator.html",
    "pages/dispatcher-cards.html",
    "pages/calls.html",
    "pages/cases.html",
    "pages/modules.html",
    "pages/documentation.html"
)

Write-Host "Updating navigation on pages..." -ForegroundColor Cyan

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Processing: $page" -ForegroundColor Yellow
        # File will be processed manually
    }
}

Write-Host "Done! Now manually update each page:" -ForegroundColor Green
Write-Host "1. Remove back-button elements" -ForegroundColor White
Write-Host "2. Add: <link rel='stylesheet' href='../includes/navigation-styles.css'>" -ForegroundColor White
Write-Host "3. Add: <div id='navigation-placeholder'></div>" -ForegroundColor White
Write-Host "4. Add: <script src='../includes/load-navigation.js'></script>" -ForegroundColor White
