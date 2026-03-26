# Script to update all module files to match main page styling

$moduleFiles = @(
    "pages/module-1.html",
    "pages/module-2.html",
    "pages/module-3.html",
    "pages/module-4.html",
    "pages/module-5.html",
    "pages/module-6.html",
    "pages/module-7.html",
    "pages/module-8.html",
    "pages/module-9.html",
    "pages/module-10.html",
    "pages/module-11.html",
    "pages/module-12.html"
)

foreach ($file in $moduleFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Keep container width at 800px (no change needed)
        
        # Replace body background color to match main page
        $content = $content -replace 'background: #0a0e1a;', 'background: #020617;'
        
        # Replace body font to match main page
        $content = $content -replace 'font-family: system-ui, -apple-system, sans-serif;', "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
        
        # Replace text color to match main page
        $content = $content -replace 'color: #ffffff;', 'color: #f1f5f9;'
        
        # Add animated background if not present
        if ($content -notmatch 'body::before') {
            $backgroundStyle = @'

    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15), transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15), transparent 50%);
      animation: backgroundMove 20s ease infinite;
      z-index: -1;
    }

    @keyframes backgroundMove {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-5%, 5%) scale(1.05); }
    }
'@
            # Insert before closing </style> tag
            $content = $content -replace '</style>', "$backgroundStyle`n  </style>"
        }
        
        Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll module files updated successfully!" -ForegroundColor Cyan
