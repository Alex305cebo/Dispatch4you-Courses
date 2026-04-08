# Deep Navigation Analysis - Find all navigation inconsistencies

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "DEEP NAVIGATION ANALYSIS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.next\*" -and
    $_.FullName -notlike "*\dispatcher-cards-app\*" -and
    $_.FullName -notlike "*\audio-learning-platform\*" -and
    $_.FullName -notlike "*_backup*"
}

$results = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if ($content) {
        $analysis = [PSCustomObject]@{
            File = $file.FullName.Replace((Get-Location).Path + "\", "")
            UsesSharedNav = $false
            SharedNavVersion = "N/A"
            HasInlineNavStyles = $false
            HasNavLoader = $false
            NavLoaderVersion = "N/A"
            InlineStylesCount = 0
            Issues = @()
        }
        
        # Check for shared-nav.css
        if ($content -match 'shared-nav\.css\?v=([0-9.]+)') {
            $analysis.UsesSharedNav = $true
            $analysis.SharedNavVersion = $matches[1]
        }
        
        # Check for nav-loader.js
        if ($content -match 'nav-loader\.js\?v=([0-9.]+)') {
            $analysis.HasNavLoader = $true
            $analysis.NavLoaderVersion = $matches[1]
        }
        
        # Check for inline nav styles
        $inlinePatterns = @(
            '\.navbar\s*\{',
            '\.nav-content\s*\{',
            '\.btn-login\s*\{',
            '\.btn-signup\s*\{',
            '\.nav-actions\s*\{',
            '\.logo\s*\{'
        )
        
        foreach ($pattern in $inlinePatterns) {
            if ($content -match $pattern) {
                $analysis.HasInlineNavStyles = $true
                $analysis.InlineStylesCount++
            }
        }
        
        # Detect issues
        if ($analysis.UsesSharedNav -and $analysis.HasInlineNavStyles) {
            $analysis.Issues += "CONFLICT: Has both shared-nav.css AND inline styles"
        }
        
        if ($analysis.UsesSharedNav -and $analysis.SharedNavVersion -ne "5.1.1774288314") {
            $analysis.Issues += "OLD VERSION: Using v$($analysis.SharedNavVersion) instead of v5.1.1774288314"
        }
        
        if (-not $analysis.UsesSharedNav -and -not $analysis.HasInlineNavStyles) {
            $analysis.Issues += "NO NAV: No navigation styles found"
        }
        
        if ($analysis.HasNavLoader -and $analysis.NavLoaderVersion -ne "5.1.1774288314") {
            $analysis.Issues += "OLD LOADER: Using v$($analysis.NavLoaderVersion)"
        }
        
        $results += $analysis
    }
}

# Summary
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host "=======" -ForegroundColor Yellow
Write-Host "Total files analyzed: $($results.Count)" -ForegroundColor White
Write-Host ""

$withSharedNav = ($results | Where-Object { $_.UsesSharedNav }).Count
$withInlineStyles = ($results | Where-Object { $_.HasInlineNavStyles }).Count
$withConflicts = ($results | Where-Object { $_.Issues -like "*CONFLICT*" }).Count
$withOldVersion = ($results | Where-Object { $_.Issues -like "*OLD VERSION*" }).Count

Write-Host "Files using shared-nav.css: $withSharedNav" -ForegroundColor Green
Write-Host "Files with inline nav styles: $withInlineStyles" -ForegroundColor Yellow
Write-Host "Files with CONFLICTS: $withConflicts" -ForegroundColor Red
Write-Host "Files with OLD VERSION: $withOldVersion" -ForegroundColor Red
Write-Host ""

# Show files with issues
$filesWithIssues = $results | Where-Object { $_.Issues.Count -gt 0 }

if ($filesWithIssues.Count -gt 0) {
    Write-Host "FILES WITH ISSUES ($($filesWithIssues.Count)):" -ForegroundColor Red
    Write-Host "===========================================" -ForegroundColor Red
    Write-Host ""
    
    foreach ($file in $filesWithIssues) {
        Write-Host "FILE: $($file.File)" -ForegroundColor Yellow
        Write-Host "  Shared Nav: $($file.UsesSharedNav) (v$($file.SharedNavVersion))" -ForegroundColor Gray
        Write-Host "  Inline Styles: $($file.HasInlineNavStyles) ($($file.InlineStylesCount) patterns)" -ForegroundColor Gray
        Write-Host "  Nav Loader: $($file.HasNavLoader) (v$($file.NavLoaderVersion))" -ForegroundColor Gray
        
        foreach ($issue in $file.Issues) {
            Write-Host "  [!] $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
}

# Export detailed report
$results | Export-Csv -Path "nav-analysis-detailed.csv" -NoTypeInformation -Encoding UTF8
Write-Host "Detailed report saved to: nav-analysis-detailed.csv" -ForegroundColor Green

# Show top priority fixes
Write-Host ""
Write-Host "TOP PRIORITY FIXES:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

$conflicts = $results | Where-Object { $_.Issues -like "*CONFLICT*" } | Select-Object -First 10
if ($conflicts.Count -gt 0) {
    Write-Host ""
    Write-Host "1. REMOVE INLINE STYLES from these files:" -ForegroundColor Yellow
    foreach ($file in $conflicts) {
        Write-Host "   - $($file.File)" -ForegroundColor White
    }
}

$oldVersions = $results | Where-Object { $_.Issues -like "*OLD VERSION*" } | Select-Object -First 10
if ($oldVersions.Count -gt 0) {
    Write-Host ""
    Write-Host "2. UPDATE VERSION in these files:" -ForegroundColor Yellow
    foreach ($file in $oldVersions) {
        Write-Host "   - $($file.File) (currently v$($file.SharedNavVersion))" -ForegroundColor White
    }
}

Write-Host ""
