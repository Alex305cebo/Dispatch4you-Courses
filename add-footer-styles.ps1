$footerCSS = @'

        /* Footer Styles */
        .footer {
            padding: 80px 0 40px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 80px;
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 32px;
            margin-bottom: 48px;
        }

        .footer-section h4 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--text-primary);
        }

        .footer-section p {
            color: var(--text-secondary);
            font-size: 14px;
            line-height: 1.7;
        }

        .footer-section a {
            display: block;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
        }

        .footer-section a:hover {
            color: var(--primary);
            transform: translateX(4px);
        }

        .footer-bottom {
            text-align: center;
            padding-top: 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-muted);
            font-size: 14px;
        }
'@

$files = Get-ChildItem "pages/doc-module-*.html"

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    if ($content.Contains('.footer {')) {
        Write-Host "  Already has footer CSS" -ForegroundColor Yellow
        continue
    }
    
    $content = $content.Replace('</style>', $footerCSS + "`n    </style>")
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($true))
    Write-Host "  CSS added!" -ForegroundColor Green
}

Write-Host "`nDone!" -ForegroundColor Cyan
