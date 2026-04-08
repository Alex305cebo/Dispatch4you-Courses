# Скрипт для создания страниц модулей

Write-Host "`n=== СОЗДАНИЕ СТРАНИЦ МОДУЛЕЙ ===" -ForegroundColor Cyan

# Копируем существующий модуль 1 как шаблон
if (Test-Path "pages/doc-module-1.html") {
    Copy-Item "pages/doc-module-1.html" "pages/module-1-introduction.html" -Force
    Write-Host "✓ module-1-introduction.html создан" -ForegroundColor Green
}

# Создаем заглушки для остальных модулей (2-12)
$modules = @(
    @{num=2; name="regulations"; title="Регулирование и законодательство"},
    @{num=3; name="equipment"; title="Типы оборудования и грузов"},
    @{num=4; name="loadboards"; title="Работа с Load Boards"},
    @{num=5; name="negotiations"; title="Переговоры с брокерами"},
    @{num=6; name="routing"; title="Планирование маршрутов"},
    @{num=7; name="documentation"; title="Документооборот и оформление"},
    @{num=8; name="technology"; title="TMS системы и технологии"},
    @{num=9; name="safety"; title="Безопасность и CSA Scores"},
    @{num=10; name="finance"; title="Финансы и расчет прибыли"},
    @{num=11; name="crisis"; title="Кризисные ситуации"},
    @{num=12; name="practice"; title="Практические кейсы и карьера"}
)

foreach ($module in $modules) {
    $filename = "pages/module-$($module.num)-$($module.name).html"
    
    # Создаем простую заглушку
    $content = @"
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Модуль $($module.num): $($module.title) | DispatcherPro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0e1a;
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            font-size: 1.2rem;
            color: #b8c5d6;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Модуль $($module.num): $($module.title)</h1>
        <p>Этот модуль находится в разработке и скоро будет доступен.</p>
        <a href="modules-index.html" class="btn">← Вернуться к списку модулей</a>
    </div>
</body>
</html>
"@
    
    $content | Out-File -FilePath $filename -Encoding UTF8
    Write-Host "✓ module-$($module.num)-$($module.name).html создан" -ForegroundColor Green
}

Write-Host "`n=== ГОТОВО! ===" -ForegroundColor Green
Write-Host "Создано 12 страниц модулей" -ForegroundColor Cyan
