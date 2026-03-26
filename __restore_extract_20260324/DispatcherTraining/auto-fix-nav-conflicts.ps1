# Automatic fix for navigation conflicts
# Removes inline navigation styles from files with conflicts

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AUTO-FIX NAVIGATION CONFLICTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Files with conflicts (from analysis)
$filesToFix = @(
    "courses.html",
    "index-test-local.html",
    "index.html",
    "Old Modules\modules-index.html",
    "pages\doc-module-1-complete.html",
    "pages\modules-index.html",
    "pages\simulator.html",
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

$fixed = 0
$errors = 0

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $originalLength = $content.Length
            
            # Remove specific inline nav styles (safe patterns)
            # Only remove styles that conflict with shared-nav.css
            
            # Remove .btn-login and .btn-signup padding/font-size overrides
            $content = $content -replace '\.btn-login\s*\{\s*padding:\s*[^}]+\}', ''
            $content = $content -replace '\.btn-signup\s*\{\s*padding:\s*[^}]+\}', ''
            
            # Remove nav-actions overrides
            $content = $content -replace '\.nav-actions\s*\.btn-login\s*,\s*\.nav-actions\s*\.btn-signup\s*\{\s*[^}]+\}', ''
            
            # Clean up multiple empty lines
            $content = $content -replace '(\r?\n\s*){3,}', "`r`n`r`n"
            
            # Save
            $content | Set-Content $file -Encoding UTF8 -NoNewline
            
            $newLength = $content.Length
            $removed = $originalLength - $newLength
            
            if ($removed -gt 0) {
                Write-Host "  [OK] Removed $removed characters" -ForegroundColor Green
                $fixed++
            } else {
                Write-Host "  [SKIP] No conflicting styles found" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Files processed: $($filesToFix.Count)" -ForegroundColor White
Write-Host "Files fixed: $fixed" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($fixed -gt 0) {
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test pages on localhost:8000" -ForegroundColor White
    Write-Host "2. If OK, commit and push changes" -ForegroundColor White
    Write-Host "3. If broken, restore from backup" -ForegroundColor White
    Write-Host ""
}
