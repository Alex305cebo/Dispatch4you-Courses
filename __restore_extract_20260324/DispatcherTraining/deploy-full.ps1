# PowerShell script for deployment to GitHub and Hostinger

Write-Host "Deploy dispatch4you-site" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for changes
$status = git status -s
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to deploy" -ForegroundColor Yellow
    exit 0
}

# Show changes
Write-Host "Changed files:" -ForegroundColor Green
git status -s
Write-Host ""

# Request commit message
$commitMessage = Read-Host "Enter commit message"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Git operations
Write-Host ""
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error pushing to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "GitHub updated" -ForegroundColor Green

# Push to Hostinger (if configured)
$hasHostinger = git remote | Select-String -Pattern "hostinger"

if ($hasHostinger) {
    Write-Host "Pushing to Hostinger..." -ForegroundColor Yellow
    git push hostinger main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Hostinger updated" -ForegroundColor Green
        Write-Host ""
        Write-Host "Deployment completed successfully!" -ForegroundColor Green
        Write-Host "GitHub: https://github.com/Alex305cebo/dispatch4you-site" -ForegroundColor Cyan
        Write-Host "Website: https://dispatch4you.com/" -ForegroundColor Cyan
    } else {
        Write-Host "Error pushing to Hostinger" -ForegroundColor Yellow
        Write-Host "GitHub updated, but Hostinger was not updated" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "GitHub deployment completed!" -ForegroundColor Green
    Write-Host "https://github.com/Alex305cebo/dispatch4you-site" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Hostinger remote not configured" -ForegroundColor Yellow
    Write-Host "Follow instructions in DEPLOY-HOSTINGER.md to configure" -ForegroundColor Gray
}
