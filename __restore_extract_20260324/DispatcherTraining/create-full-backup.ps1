# Create full backup before navigation fixes

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "BACKUP_BEFORE_NAV_FIX_$timestamp"

Write-Host "Creating full backup..." -ForegroundColor Cyan
Write-Host "Backup folder: $backupFolder" -ForegroundColor Yellow
Write-Host ""

# Create backup folder
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Files to backup
$filesToBackup = @(
    "shared-nav.css",
    "nav-loader.js",
    "index.html",
    "dashboard.html",
    "courses.html",
    "index-test-local.html"
)

# Backup main files
Write-Host "Backing up main files..." -ForegroundColor Green
foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        Copy-Item $file "$backupFolder\" -Force
        Write-Host "  [OK] $file" -ForegroundColor Gray
    }
}

# Backup pages folder
Write-Host ""
Write-Host "Backing up pages folder..." -ForegroundColor Green
$pagesFiles = @(
    "pages\simulator.html",
    "pages\doc-module-1-complete.html",
    "pages\modules-index.html",
    "pages\test-1.html",
    "pages\test-2.html",
    "pages\test-3.html",
    "pages\test-4.html",
    "pages\test-5.html",
    "pages\test-6.html",
    "pages\test-7.html",
    "pages\test-8.html",
    "pages\test-9.html",
    "pages\test-10.html",
    "pages\test-11.html",
    "pages\test-12.html"
)

New-Item -ItemType Directory -Path "$backupFolder\pages" -Force | Out-Null

foreach ($file in $pagesFiles) {
    if (Test-Path $file) {
        Copy-Item $file "$backupFolder\pages\" -Force
        Write-Host "  [OK] $file" -ForegroundColor Gray
    }
}

# Backup Old Modules
Write-Host ""
Write-Host "Backing up Old Modules..." -ForegroundColor Green
if (Test-Path "Old Modules\modules-index.html") {
    New-Item -ItemType Directory -Path "$backupFolder\Old Modules" -Force | Out-Null
    Copy-Item "Old Modules\modules-index.html" "$backupFolder\Old Modules\" -Force
    Write-Host "  [OK] Old Modules\modules-index.html" -ForegroundColor Gray
}

# Create restore script
$restoreScript = @"
# Restore from backup
Write-Host "Restoring from backup: $backupFolder" -ForegroundColor Yellow

Get-ChildItem -Path "$backupFolder" -Recurse -File | ForEach-Object {
    `$relativePath = `$_.FullName.Replace((Get-Location).Path + "\$backupFolder\", "")
    `$targetPath = `$relativePath
    
    `$targetDir = Split-Path `$targetPath -Parent
    if (`$targetDir -and !(Test-Path `$targetDir)) {
        New-Item -ItemType Directory -Path `$targetDir -Force | Out-Null
    }
    
    Copy-Item `$_.FullName `$targetPath -Force
    Write-Host "Restored: `$targetPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Restore completed!" -ForegroundColor Green
"@

$restoreScript | Out-File "$backupFolder\RESTORE.ps1" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "BACKUP COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Location: $backupFolder" -ForegroundColor Cyan
Write-Host "Files backed up: $($filesToBackup.Count + $pagesFiles.Count + 1)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore, run: .\$backupFolder\RESTORE.ps1" -ForegroundColor Yellow
Write-Host ""
