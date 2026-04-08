# Find navigation style conflicts
Write-Host "Checking for navigation style conflicts..." -ForegroundColor Cyan

$patterns = @("\.navbar\s*\{", "\.nav-content\s*\{", "\.btn-login\s*\{", "\.btn-signup\s*\{")
$files = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.next\*"
}

$conflicts = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $found = 0
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) { $found++ }
        }
        if ($found -gt 0) {
            $conflicts += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + "\", "")
                Conflicts = $found
            }
        }
    }
}

if ($conflicts.Count -eq 0) {
    Write-Host "No conflicts found!" -ForegroundColor Green
} else {
    Write-Host "Found $($conflicts.Count) files with conflicts:" -ForegroundColor Yellow
    $conflicts | Sort-Object -Property Conflicts -Descending | Format-Table -AutoSize
    $conflicts | Export-Csv -Path "nav-conflicts.csv" -NoTypeInformation
    Write-Host "Report saved to nav-conflicts.csv" -ForegroundColor Green
}
