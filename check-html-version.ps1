# Check what CSS version HTML pages are loading

Write-Host "Checking HTML pages..." -ForegroundColor Cyan

$pages = @(
    "https://dispatch4you.com/pages/doc-module-1-complete.html",
    "https://dispatch4you.com/pages/glossary.html"
)

foreach ($page in $pages) {
    Write-Host ""
    Write-Host "Checking: $page" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $page -UseBasicParsing -TimeoutSec 10
        
        # Find CSS link
        if ($response.Content -match 'shared-nav\.css\?v=([\d\.]+)') {
            $version = $matches[1]
            Write-Host "CSS Version: v=$version" -ForegroundColor White
            
            if ($version -match "5\.0\.1774296668") {
                Write-Host "SUCCESS: Using new version with timestamp!" -ForegroundColor Green
            } elseif ($version -match "5\.0") {
                Write-Host "WARNING: Using v5.0 but WITHOUT timestamp!" -ForegroundColor Yellow
                Write-Host "Browser may cache old version!" -ForegroundColor Yellow
            } else {
                Write-Host "ERROR: Using old version!" -ForegroundColor Red
            }
        } else {
            Write-Host "ERROR: Cannot find CSS link!" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "ERROR: Cannot fetch page" -ForegroundColor Red
    }
}
