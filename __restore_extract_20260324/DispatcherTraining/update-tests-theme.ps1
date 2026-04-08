# Script to update all test files to dark theme

$testFiles = @(
    "pages/test-2.html",
    "pages/test-3.html",
    "pages/test-4.html",
    "pages/test-5.html",
    "pages/test-6.html",
    "pages/test-7.html",
    "pages/test-8.html",
    "pages/test-9.html",
    "pages/test-10.html",
    "pages/test-11.html",
    "pages/test-12.html"
)

$oldPattern = @'
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 80px 20px 40px; display: flex; flex-direction: column; align-items: center; }
        .container { max-width: 800px;
'@

$newPattern = @'
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: #f1f5f9; min-height: 100vh; padding: 80px 20px 40px; display: flex; flex-direction: column; align-items: center; }
        .container { max-width: 1000px;
'@

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Replace container width
        $content = $content -replace 'max-width: 800px;', 'max-width: 1000px;'
        
        # Replace body background and font
        $content = $content -replace "font-family: 'Segoe UI'[^;]+;", "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
        $content = $content -replace 'background: linear-gradient\(135deg, #667eea 0%, #764ba2 100%\);', 'background: #020617; color: #f1f5f9;'
        
        # Replace header styles
        $content = $content -replace 'background: white;', 'background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);'
        
        # Replace test badge
        $content = $content -replace 'background: linear-gradient\(135deg, #667eea 0%, #764ba2 100%\); color: white;', 'background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399;'
        
        # Replace back button
        $content = $content -replace 'background: #f3f4f6; color: #374151;', 'background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f1f5f9;'
        $content = $content -replace 'background: #e5e7eb;', 'background: rgba(255, 255, 255, 0.08);'
        
        # Replace h1 color
        $content = $content -replace 'h1 { color: #2d3748;', 'h1 { color: #f1f5f9;'
        
        # Replace subtitle color
        $content = $content -replace '\.subtitle { color: #718096;', '.subtitle { color: #94a3b8;'
        
        # Replace progress bar
        $content = $content -replace 'background: #e5e7eb; height: 8px;', 'background: rgba(255, 255, 255, 0.08); height: 8px;'
        $content = $content -replace 'background: linear-gradient\(90deg, #16a34a, #22c55e\);', 'background: linear-gradient(90deg, #34d399, #10b981);'
        
        # Replace question card
        $content = $content -replace '\.question-card { background: white;', '.question-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);'
        
        # Replace question number color
        $content = $content -replace '\.question-number { color: #16a34a;', '.question-number { color: #34d399;'
        
        # Replace question text color
        $content = $content -replace '\.question-text { color: #2d3748;', '.question-text { color: #f1f5f9;'
        
        # Replace answer styles
        $content = $content -replace '\.answer { background: #f7fafc;', '.answer { background: rgba(255, 255, 255, 0.04); border: 2px solid rgba(255, 255, 255, 0.08);'
        $content = $content -replace 'border: 2px solid transparent;', ''
        $content = $content -replace 'color: #4a5568;', 'color: #cbd5e1;'
        $content = $content -replace 'background: #edf2f7; border-color: #16a34a;', 'background: rgba(255, 255, 255, 0.08); border-color: rgba(52, 211, 153, 0.3);'
        
        # Replace selected answer
        $content = $content -replace '\.answer\.selected { background: #dcfce7; border-color: #16a34a; color: #166534;', '.answer.selected { background: rgba(52, 211, 153, 0.15); border-color: #34d399; color: #34d399;'
        
        # Replace correct answer
        $content = $content -replace '\.answer\.correct { background: linear-gradient\(135deg, #d1fae5 0%, #a7f3d0 100%\); border-color: #10b981; color: #065f46;', '.answer.correct { background: rgba(52, 211, 153, 0.2); border-color: #10b981; color: #34d399;'
        
        # Replace incorrect answer
        $content = $content -replace '\.answer\.incorrect { background: linear-gradient\(135deg, #fee2e2 0%, #fecaca 100%\); border-color: #ef4444; color: #991b1b;', '.answer.incorrect { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #fca5a5;'
        
        # Replace primary button
        $content = $content -replace '\.btn-primary { background: linear-gradient\(135deg, #667eea 0%, #764ba2 100%\);', '.btn-primary { background: linear-gradient(135deg, #34d399, #10b981);'
        $content = $content -replace 'box-shadow: 0 4px 15px rgba\(22, 163, 74, 0\.4\);', 'box-shadow: 0 4px 15px rgba(52, 211, 153, 0.4);'
        
        # Replace secondary button
        $content = $content -replace '\.btn-secondary { background: white; backdrop-filter: blur\(10px\); color: #16a34a; border: 2px solid #16a34a;', '.btn-secondary { background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(52, 211, 153, 0.3); color: #34d399;'
        $content = $content -replace '\.btn-secondary:hover { background: #16a34a; color: white;', '.btn-secondary:hover { background: rgba(52, 211, 153, 0.15);'
        
        # Replace results
        $content = $content -replace '\.results { background: white;', '.results { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);'
        
        # Replace score colors
        $content = $content -replace '\.score\.pass { color: #16a34a;', '.score.pass { color: #34d399;'
        
        # Replace result message color
        $content = $content -replace '\.result-message { font-size: 24px; color: #2d3748;', '.result-message { font-size: 24px; color: #f1f5f9;'
        
        # Replace background animation
        $content = $content -replace 'radial-gradient\(circle at 20% 50%, rgba\(120, 119, 198, 0\.3\), transparent 50%\),\s+radial-gradient\(circle at 80% 80%, rgba\(138, 43, 226, 0\.3\), transparent 50%\),\s+radial-gradient\(circle at 40% 20%, rgba\(75, 0, 130, 0\.2\), transparent 50%\);', 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15), transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15), transparent 50%);'
        
        $content = $content -replace '@keyframes backgroundMove \{[^}]+\}', '@keyframes backgroundMove {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-5%, 5%) scale(1.05); }
}'
        
        Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll test files updated successfully!" -ForegroundColor Cyan
