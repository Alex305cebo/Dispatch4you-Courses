# ============================================
# ADD VERSION TO auth.js INCLUDES
# Adds cache-busting version to all auth.js script tags
# ============================================

$version = "5.1.1774288314"
$pattern = '<script src="(\.\.\/)?auth\.js"><\/script>'
$replacement = '<script src="$1auth.js?v=' + $version + '"></script>'

Write-Host "🔍 Searching for auth.js includes..." -ForegroundColor Cyan

$files = Get-ChildItem -Path . -Include *.html -Recurse | Where-Object { 
    $_.FullName -notmatch '\\(node_modules|\.git|BACKUP|Old Modules)\\' 
}

$updatedCount = 0
$totalMatches = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    if ($content -match $pattern) {
        $matches = [regex]::Matches($content, $pattern)
        $totalMatches += $matches.Count
        
        $newContent = $content -replace $pattern, $replacement
        
        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            $updatedCount++
            Write-Host "✅ Updated: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host "`n📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "   Total matches found: $totalMatches" -ForegroundColor White
Write-Host "   Files updated: $updatedCount" -ForegroundColor Green
Write-Host "`n✨ Done! All auth.js includes now have version $version" -ForegroundColor Cyan
