# Safe copy navigation from module-1.html to all modules and tests

$module1Content = Get-Content "pages/module-1.html" -Raw -Encoding UTF8

$navPattern = '(?s)(<!-- Navigation -->.*?</div>\s+<div class="container">)'
if ($module1Content -match $navPattern) {
    $navBlock = $matches[1] -replace '<div class="container">$', ''
    Write-Host "Navigation extracted from module-1.html"
} else {
    Write-Host "ERROR: Could not find navigation in module-1.html"
    exit
}

$scriptPattern = '(?s)(<script src="\.\./auth\.js"></script>.*?</script>)\s*</body>'
if ($module1Content -match $scriptPattern) {
    $scriptBlock = $matches[1]
    Write-Host "Script extracted from module-1.html"
} else {
    Write-Host "ERROR: Could not find script in module-1.html"
    exit
}

$files = @()
$files += Get-ChildItem -Path "pages" -Filter "module-*.html" | Where-Object { $_.Name -ne "module-1.html" }
$files += Get-ChildItem -Path "pages" -Filter "test-*.html"

$count = 0
$skipped = 0

foreach ($file in $files) {
    Write-Host "`nProcessing: $($file.Name)"
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    if ($content -match '<nav class="navbar">') {
        Write-Host "  SKIP - navigation already exists"
        $skipped++
        continue
    }
    
    if ($content -notmatch 'shared-nav\.css') {
        $content = $content -replace '(<title>.*?</title>)', "`$1`n  <link rel=`"stylesheet`" href=`"../shared-nav.css`">"
        Write-Host "  + Added shared-nav.css link"
    }
    
    $content = $content -replace '(body\s*\{[^}]*padding:\s*)(\d+px)(\s+\d+px)', '$180px$3'
    $content = $content -replace '(body\s*\{[^}]*padding:\s*)(\d+px)(\s+\d+px\s+\d+px)', '$180px$3'
    Write-Host "  + Updated body padding-top"
    
    $content = $content -replace '(<body>\s*)', "`$1`n$navBlock`n  "
    Write-Host "  + Added navigation"
    
    $content = $content -replace '(\s*</body>)', "`n  $scriptBlock`n`$1"
    Write-Host "  + Added mobile menu script"
    
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
    $count++
    Write-Host "  SUCCESS: File updated"
}

Write-Host "`n=================================================="
Write-Host "SUMMARY:"
Write-Host "  Updated: $count files"
Write-Host "  Skipped: $skipped files"
Write-Host "  Total: $($count + $skipped) files"
Write-Host "=================================================="
