# Скрипт для запуска локального сервера
# Поддерживает Python и Node.js

Write-Host "🚀 Запуск локального сервера..." -ForegroundColor Cyan
Write-Host ""

# Проверяем Python
$pythonExists = Get-Command python -ErrorAction SilentlyContinue
$python3Exists = Get-Command python3 -ErrorAction SilentlyContinue

# Проверяем Node.js
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
$npxExists = Get-Command npx -ErrorAction SilentlyContinue

if ($pythonExists) {
    Write-Host "✅ Python найден" -ForegroundColor Green
    Write-Host "📂 Запуск сервера на http://localhost:8000" -ForegroundColor Yellow
    Write-Host "⚠️  Нажмите Ctrl+C для остановки" -ForegroundColor Yellow
    Write-Host ""
    python -m http.server 8000
}
elseif ($python3Exists) {
    Write-Host "✅ Python3 найден" -ForegroundColor Green
    Write-Host "📂 Запуск сервера на http://localhost:8000" -ForegroundColor Yellow
    Write-Host "⚠️  Нажмите Ctrl+C для остановки" -ForegroundColor Yellow
    Write-Host ""
    python3 -m http.server 8000
}
elseif ($nodeExists -and $npxExists) {
    Write-Host "✅ Node.js найден" -ForegroundColor Green
    Write-Host "📂 Запуск сервера на http://localhost:8000" -ForegroundColor Yellow
    Write-Host "⚠️  Нажмите Ctrl+C для остановки" -ForegroundColor Yellow
    Write-Host ""
    npx http-server -p 8000
}
else {
    Write-Host "❌ Не найден Python или Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите один из:" -ForegroundColor Yellow
    Write-Host "  1. Python: https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host "  2. Node.js: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Или используйте альтернативный метод:" -ForegroundColor Yellow
    Write-Host "  - Откройте файлы напрямую в браузере (file://)" -ForegroundColor Cyan
    Write-Host "  - Используйте VS Code Live Server расширение" -ForegroundColor Cyan
    Write-Host ""
    pause
}
