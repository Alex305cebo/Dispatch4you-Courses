# Script to add new dialogues to scenarios-data-test.js

Write-Host "Adding new dialogues to scenarios-data-test.js..." -ForegroundColor Green

# Read the main file
$mainFile = "pages/scenarios-data-test.js"
$content = Get-Content $mainFile -Raw

# Remove the closing ]; from the end
$content = $content -replace '\];[\s]*$', ''

# Add comma after last dialogue
$content = $content.TrimEnd()
if (-not $content.EndsWith(',')) {
    $content += ','
}

# Read new dialogue files
$dialogue2 = Get-Content "SIMUL-NEW-DIALOGUE-3.js" -Raw
$dialogue3 = Get-Content "SIMUL-NEW-DIALOGUE-4.js" -Raw

# Add new dialogues
$content += "`n`n    // ============================================`n"
$content += $dialogue2.Trim()
$content += ",`n`n    // ============================================`n"
$content += $dialogue3.Trim()

# Add closing ];
$content += "`n];`n"

# Write back to file
$content | Set-Content $mainFile -NoNewline

Write-Host "Successfully added 2 new dialogues!" -ForegroundColor Green
Write-Host "Total dialogues now: 4 (IDs: 0, 1, 2, 3)" -ForegroundColor Cyan
Write-Host ""
Write-Host "New dialogues added:" -ForegroundColor Yellow
Write-Host "  - Dialogue #2: Dallas TX → Atlanta GA (Dry Van, 20 steps)" -ForegroundColor White
Write-Host "  - Dialogue #3: Phoenix AZ → Denver CO (Dry Van, 18 steps, проблемная ситуация)" -ForegroundColor White
