# Quick Deploy Script
# Fast commit and push with automatic message

param(
    [string]$message = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   QUICK DEPLOY TO HOSTINGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to deploy" -ForegroundColor Yellow
    exit 0
}

# Show changes
Write-Host "Changes detected:" -ForegroundColor Green
git status --short
Write-Host ""

# Auto commit message
if ([string]::IsNullOrWhiteSpace($message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $message = "Auto deploy: $timestamp"
}

# Git operations
Write-Host "Adding files..." -ForegroundColor Cyan
git add .

Write-Host "Commit: $message" -ForegroundColor Cyan
git commit -m $message

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   DEPLOY STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Status: GitHub -> Actions" -ForegroundColor Yellow
Write-Host "Site will update in 2-5 minutes" -ForegroundColor Yellow
Write-Host "URL: https://dispatch4you.com" -ForegroundColor Cyan
Write-Host ""
