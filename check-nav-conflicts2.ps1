$files = Get-ChildItem -Path . -Include *.html -Recurse | Where-Object { 
    $_.FullName -notmatch '\\(BACKUP|Old Modules|\.git)\\'
}

$results = @()
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $conflicts = @()
    if ($content -match '\.nav-btn\s*\{') { $conflicts += 'nav-btn' }
    if ($content -match '\.navbar\s*\{') { $conflicts += 'navbar' }
    if ($content -match '\.nav-link\s*\{') { $conflicts += 'nav-link' }
    if ($content -match '\.nav-actions\s*\{') { $conflicts += 'nav-actions' }
    if ($conflicts.Count -gt 0) {
        $results += "$($file.FullName.Replace('C:\DispatcherTraining\',''))|$($conflicts -join ',')"
    }
}
$results | Out-File -FilePath "nav-conflicts-report.txt" -Encoding UTF8
Write-Host "Found $($results.Count) files with conflicts. See nav-conflicts-report.txt"
