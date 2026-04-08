# Remove navigation from all module and test files

$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Remove navigation block
    $content = $content -replace '(?s)\s*<!-- Navigation -->.*?</nav>\s*\n', ''
    
    # Remove mobile menu overlay and menu
    $content = $content -replace '(?s)\s*<!-- Mobile Menu Overlay -->.*?</div>\s*\n\s*\n', ''
    
    # Remove mobile menu script
    $content = $content -replace '(?s)\s*<!-- Mobile menu script -->.*?</script>\s*\n\s*\n', ''
    
    # Remove auth.js script
    $content = $content -replace '\s*<script src="\.\./auth\.js"></script>\s*\n', ''
    
    # Remove shared-nav.css link
    $content = $content -replace '\s*<link rel="stylesheet" href="\.\./shared-nav\.css">\s*\n', ''
    
    # Remove shared-styles.css link
    $content = $content -replace '\s*<link rel="stylesheet" href="\.\./shared-styles\.css">\s*\n', ''
    
    # Remove dark theme scripts
    $content = $content -replace '\s*<script>!function.*?</script>\s*\n', ''
    $content = $content -replace '\s*<link rel="stylesheet" href="\.\./dark-theme\.css">\s*\n', ''
    $content = $content -replace '\s*<script src="\.\./dark-mode\.js"></script>\s*\n', ''
    $content = $content -replace '\s*<script src="auth-check\.js"></script>\s*\n', ''
    
    # Save with UTF8 encoding
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    
    Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
}

Write-Host "`nAll navigation removed!" -ForegroundColor Cyan
