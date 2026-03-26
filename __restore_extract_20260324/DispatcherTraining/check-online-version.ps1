# Check online CSS version

Write-Host "Checking online CSS version..." -ForegroundColor Cyan

try {
    $url = "https://dispatch4you.com/shared-nav.css?v=5.0.1774296668"
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    
    $firstLine = ($response.Content -split "`n")[0]
    
    Write-Host ""
    Write-Host "URL: $url" -ForegroundColor Yellow
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "First line: $firstLine" -ForegroundColor White
    Write-Host ""
    
    # Check for v5.0
    if ($response.Content -match "v5\.0 UNIFIED DESIGN") {
        Write-Host "SUCCESS: CSS v5.0 is online!" -ForegroundColor Green
        
        # Check button styles
        if ($response.Content -match "padding:\s*7px\s*14px") {
            Write-Host "SUCCESS: Compact buttons (7px 14px) found!" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Compact buttons NOT found!" -ForegroundColor Red
        }
    } else {
        Write-Host "ERROR: Old CSS version is still online!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: Cannot fetch CSS from server" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
