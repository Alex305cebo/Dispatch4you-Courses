# Auto Deploy Script - Automatically commit and push changes to Git

param(
    [string]$message = "Auto deploy: Update navigation with responsive shortcuts"
)

Write-Host "=== Auto Deploy to Git ===" -ForegroundColor Cyan
Write-Host ""

# Check if there are any changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Green
git status --short

Write-Host ""
Write-Host "Adding all changes..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m $message

Write-Host ""
Write-Host "Pushing to remote repository..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "=== Deploy Complete! ===" -ForegroundColor Green
Write-Host ""
