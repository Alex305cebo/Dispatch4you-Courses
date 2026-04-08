# Final fix - remove ALL remaining inline nav styles

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL FIX - ALL NAVIGATION CONFLICTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

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

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalLength = $content.Length
        
        # Remove ALL nav-related inline styles
        $patterns = @(
            # Button styles
            '\.btn-login\s*\{[^}]*\}',
            '\.btn-signup\s*\{[^}]*\}',
            '\.btn-login:hover\s*\{[^}]*\}',
            '\.btn-signup:hover\s*\{[^}]*\}',
            
            # Nav actions
            '\.nav-actions\s*\.btn-login\s*,\s*\.nav-actions\s*\.btn-signup\s*\{[^}]*\}',
            '\.nav-actions\s*\{[^}]*padding[^}]*\}',
            
            # Logo styles
            '\.logo\s*\{[^}]*font-size[^}]*\}',
            '\.logo-icon\s*\{[^}]*font-size[^}]*\}',
            
            # Navbar
            '\.navbar\s*\{[^}]*padding[^}]*\}',
            '\.nav-content\s*\{[^}]*padding[^}]*\}'
        )
        
        foreach ($pattern in $patterns) {
            $content = $content -replace $pattern, ''
        }
        
        # Clean up
        $content = $content -replace '(\r?\n\s*){3,}', "`r`n`r`n"
        
        $newLength = $content.Length
        $removed = $originalLength - $newLength
        
        if ($removed -gt 0) {
            $content | Set-Content $file -Encoding UTF8 -NoNewline
            Write-Host "[OK] $file - Removed $removed chars" -ForegroundColor Green
            $fixed++
        } else {
            Write-Host "[SKIP] $file - Already clean" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "Fixed $fixed files" -ForegroundColor Green
Write-Host ""
Write-Host "Test on localhost:8000 and then commit!" -ForegroundColor Cyan
