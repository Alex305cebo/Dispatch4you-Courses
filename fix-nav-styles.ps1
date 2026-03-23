# Fix navigation styles - remove inline nav styles from HTML files
# This script removes inline navigation styles that conflict with shared-nav.css

Write-Host "Fixing navigation styles..." -ForegroundColor Cyan
Write-Host ""

$filesToFix = @(
    "index.html",
    "pages\simulator.html",
    "pages\doc-module-1-complete.html",
    "pages\modules-index.html"
)

$navStylePatterns = @(
    # Navigation container styles
    '\.navbar\s*\{[^}]+\}',
    '\.nav-container\s*\{[^}]+\}',
    '\.nav-content\s*\{[^}]+\}',
    '\.nav-links\s*\{[^}]+\}',
    '\.nav-link\s*\{[^}]+\}',
    '\.nav-actions\s*\{[^}]+\}',
    
    # Button styles
    '\.btn-login\s*\{[^}]+\}',
    '\.btn-signup\s*\{[^}]+\}',
    
    # Logo styles
    '\.logo\s*\{[^}]+\}',
    '\.logo-icon\s*\{[^}]+\}',
    '\.logo-text\s*\{[^}]+\}',
    
    # Dropdown styles
    '\.nav-dropdown\s*\{[^}]+\}',
    '\.dropdown-content\s*\{[^}]+\}',
    
    # Mobile menu
    '\.mobile-menu-toggle\s*\{[^}]+\}',
    '\.burger\s*\{[^}]+\}',
    
    # Hover states
    '\.nav-link:hover\s*\{[^}]+\}',
    '\.btn-login:hover\s*\{[^}]+\}',
    '\.btn-signup:hover\s*\{[^}]+\}',
    '\.logo:hover\s*\{[^}]+\}'
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        # Create backup
        $backupFile = $file -replace '\.html$', '_backup_nav_fix.html'
        Copy-Item $file $backupFile -Force
        Write-Host "  Backup created: $backupFile" -ForegroundColor Gray
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalLength = $content.Length
        
        # Remove nav style patterns
        foreach ($pattern in $navStylePatterns) {
            $content = $content -replace $pattern, ''
        }
        
        # Clean up multiple empty lines
        $content = $content -replace '(\r?\n){3,}', "`r`n`r`n"
        
        # Save
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        
        $newLength = $content.Length
        $removed = $originalLength - $newLength
        
        if ($removed -gt 0) {
            Write-Host "  Removed $removed characters of inline nav styles" -ForegroundColor Green
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
        
        Write-Host ""
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "Done! Please test the pages on localhost:8000" -ForegroundColor Green
Write-Host "If something breaks, restore from *_backup_nav_fix.html files" -ForegroundColor Yellow
