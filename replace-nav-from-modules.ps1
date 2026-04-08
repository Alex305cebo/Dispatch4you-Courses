# Replace navigation in all module and test files with correct one from index.html

Write-Host "Reading correct navigation from index.html..." -ForegroundColor Cyan
$indexContent = Get-Content "index.html" -Raw -Encoding UTF8

# Extract navigation block
$navPattern = '(?s)  <!-- Navigation -->.*?  </nav>\s*\n'
if ($indexContent -match $navPattern) {
    $correctNav = $matches[0]
    Write-Host "Navigation extracted successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not find navigation in index.html" -ForegroundColor Red
    exit
}

# Get all module and test files
$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

foreach ($file in $files) {
    Write-Host "`nProcessing: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Remove old navigation if exists
    $content = $content -replace '(?s)  <!-- Navigation -->.*?  </nav>\s*\n', ''
    
    # Remove mobile menu if exists
    $content = $content -replace '(?s)  <!-- Mobile Menu Overlay -->.*?  </div>\s*\n\s*\n', ''
    
    # Add correct navigation after <body>
    $content = $content -replace '(<body>\s*\n)', "`$1$correctNav`n`n"
    
    # Save with UTF8 encoding
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    
    Write-Host "Updated: $($file.Name)" -ForegroundColor Green
}

Write-Host "`nAll files updated with correct navigation!" -ForegroundColor Cyan
