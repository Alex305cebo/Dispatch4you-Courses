# Update navigation version to v5.1 with new timestamp

$newTimestamp = [int][double]::Parse((Get-Date -UFormat %s))
$oldVersion = "v=5.0.1774296668"
$newVersion = "v=5.1.$newTimestamp"

Write-Host "Updating navigation version..." -ForegroundColor Cyan
Write-Host "Old: $oldVersion" -ForegroundColor Yellow
Write-Host "New: $newVersion" -ForegroundColor Green
Write-Host ""

$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.next\*" -and
    $_.FullName -notlike "*\dispatcher-cards-app\*" -and
    $_.FullName -notlike "*\audio-learning-platform\*" -and
    $_.FullName -notlike "*_backup*"
}

$updated = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if ($content -and $content -match $oldVersion) {
        $content = $content -replace [regex]::Escape($oldVersion), $newVersion
        $content | Set-Content $file.FullName -Encoding UTF8 -NoNewline
        $updated++
        Write-Host "Updated: $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Updated $updated files" -ForegroundColor Green
Write-Host "New version: $newVersion" -ForegroundColor Cyan
