# Script to add scroll-to-top button to all HTML pages

$cssLink = '<link rel="stylesheet" href="../scroll-to-top.css">'
$jsScript = '<script src="../scroll-to-top.js"></script>'
$cssLinkRoot = '<link rel="stylesheet" href="scroll-to-top.css">'
$jsScriptRoot = '<script src="scroll-to-top.js"></script>'

function Add-ScrollButton {
    param(
        [string]$FilePath,
        [bool]$IsRootLevel = $false
    )
    
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    if ($content -match 'scroll-to-top') {
        Write-Host "Already exists: $FilePath" -ForegroundColor Yellow
        return
    }
    
    if ($IsRootLevel) {
        $css = $cssLinkRoot
        $js = $jsScriptRoot
    } else {
        $css = $cssLink
        $js = $jsScript
    }
    
    if ($content -match '</body>') {
        $newContent = $content -replace '</body>', "$css`n$js`n</body>"
        Set-Content -Path $FilePath -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Added: $FilePath" -ForegroundColor Green
    } else {
        Write-Host "Skipped (no body tag): $FilePath" -ForegroundColor Red
    }
}

Write-Host "Processing root pages..." -ForegroundColor Cyan
$rootPages = @('index.html', 'dashboard.html', 'courses.html', 'course.html')

foreach ($page in $rootPages) {
    if (Test-Path $page) {
        Add-ScrollButton -FilePath $page -IsRootLevel $true
    }
}

Write-Host "Processing pages folder..." -ForegroundColor Cyan
$pagesFolder = Get-ChildItem -Path "pages" -Filter "*.html" -File | Where-Object {
    $_.Name -notmatch 'BACKUP' -and $_.Name -ne 'cases.html' -and $_.Name -ne 'dispatcher-cards.OLD.html'
}

foreach ($file in $pagesFolder) {
    Add-ScrollButton -FilePath $file.FullName -IsRootLevel $false
}

Write-Host "Done!" -ForegroundColor Green
