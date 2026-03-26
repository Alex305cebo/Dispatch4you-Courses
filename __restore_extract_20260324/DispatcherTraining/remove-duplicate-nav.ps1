# Remove duplicate navigation from all module and test files

$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file with UTF8
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Count how many times navigation appears
    $navCount = ([regex]::Matches($content, '<!-- Navigation -->')).Count
    
    if ($navCount -gt 1) {
        Write-Host "  Found $navCount navigation blocks - removing duplicates..." -ForegroundColor Red
        
        # Find the position of the second navigation block
        $firstNavPos = $content.IndexOf('<!-- Navigation -->')
        $secondNavPos = $content.IndexOf('<!-- Navigation -->', $firstNavPos + 1)
        
        if ($secondNavPos -gt 0) {
            # Find the end of the duplicate block (before <div class="container">)
            $containerPos = $content.IndexOf('<div class="container">', $secondNavPos)
            
            if ($containerPos -gt 0) {
                # Remove everything from second navigation to container
                $beforeDuplicate = $content.Substring(0, $secondNavPos)
                $afterDuplicate = $content.Substring($containerPos)
                
                $content = $beforeDuplicate.TrimEnd() + "`n`n  " + $afterDuplicate
                
                Write-Host "  Removed duplicate navigation" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  No duplicates found" -ForegroundColor Gray
    }
    
    # Save with UTF8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    
    Write-Host "  Saved" -ForegroundColor Green
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan
