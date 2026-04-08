# Update links in pages/ folder

Write-Host "Updating links in pages folder..." -ForegroundColor Green

# Get all HTML files in pages folder
$pagesFiles = Get-ChildItem -Path "pages" -Filter "*.html" | Where-Object { $_.Name -notlike "*backup*" -and $_.Name -notlike "*old*" }

# Replacements for files in pages/ folder
$replacements = @{
    'href="modules.html"' = 'href="../modules"'
    'href="modules-index.html"' = 'href="../modules"'
    'href="simulator.html"' = 'href="../simulator"'
    'href="calls.html"' = 'href="../calls"'
    'href="cases.html"' = 'href="../cases"'
    'href="testing.html"' = 'href="../testing"'
    'href="loadboard.html"' = 'href="../loadboard"'
    'href="load-finder.html"' = 'href="../load-finder"'
    'href="dispatcher-cards.html"' = 'href="../dispatcher-cards"'
    'href="documentation.html"' = 'href="../documentation-old"'
    'href="documentation-new.html"' = 'href="../documentation"'
    'href="doc-module-1.html"' = 'href="../doc-module-1"'
    'href="doc-module-2.html"' = 'href="../doc-module-2"'
}

foreach ($file in $pagesFiles) {
    $filePath = $file.FullName
    Write-Host "Updating $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $updated = $false
    
    foreach ($oldLink in $replacements.Keys) {
        $newLink = $replacements[$oldLink]
        
        if ($content -match [regex]::Escape($oldLink)) {
            $content = $content -replace [regex]::Escape($oldLink), $newLink
            $updated = $true
            Write-Host "  $oldLink -> $newLink" -ForegroundColor Green
        }
    }
    
    if ($updated) {
        Set-Content $filePath -Value $content -Encoding UTF8
        Write-Host "  File updated" -ForegroundColor Green
    } else {
        Write-Host "  No changes found" -ForegroundColor Gray
    }
}

Write-Host "Done!" -ForegroundColor Green