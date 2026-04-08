# Скрипт для добавления CSS стилей футера ко всем модулям

$footerCSS = @'
        /* Footer */
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

# Получаем все файлы модулей
$moduleFiles = Get-ChildItem "pages/doc-module-*.html"

foreach ($file in $moduleFiles) {
    Write-Host "Обработка: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Проверяем есть ли уже стили футера
    if ($content -match '\.footer') {
        Write-Host "  CSS футера уже существует, пропускаем" -ForegroundColor Yellow
        continue
    }
    
    # Ищем закрывающий тег style и вставляем CSS перед ним
    $styleCloseTag = "</style>"
    if ($content.Contains($styleCloseTag)) {
        $content = $content.Replace($styleCloseTag, "$footerCSS`n    $styleCloseTag")
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  CSS футера добавлен успешно!" -ForegroundColor Green
    } else {
        Write-Host "  Не найден тег style" -ForegroundColor Red
    }
}

Write-Host "`nГотово! Обработано файлов: $($moduleFiles.Count)" -ForegroundColor Cyan
