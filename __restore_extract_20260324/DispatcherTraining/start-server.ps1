# Простой веб-сервер для тестирования сайта
# Запуск: щелкни правой кнопкой -> "Выполнить с помощью PowerShell"

$port = 8000
$path = Get-Location

Write-Host "🚀 Запуск веб-сервера..." -ForegroundColor Green
Write-Host "📂 Папка: $path" -ForegroundColor Cyan
Write-Host "🌐 Адрес: http://localhost:$port" -ForegroundColor Yellow
Write-Host ""
Write-Host "Нажми Ctrl+C чтобы остановить сервер" -ForegroundColor Gray
Write-Host ""

# Открываем браузер
Start-Process "http://localhost:$port/index.html"

# Запускаем сервер
python -m http.server $port
