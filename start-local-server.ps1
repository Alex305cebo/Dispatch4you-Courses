# Скрипт для запуска локального веб-сервера
# Использует встроенный PHP сервер (если установлен PHP)
# Или Python SimpleHTTPServer

Write-Host "🚀 Запуск локального веб-сервера..." -ForegroundColor Cyan
Write-Host ""

# Проверяем наличие PHP
$phpExists = Get-Command php -ErrorAction SilentlyContinue

if ($phpExists) {
    Write-Host "✅ PHP найден! Запускаем PHP сервер..." -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Сервер будет доступен по адресу:" -ForegroundColor Yellow
    Write-Host "   http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Откройте в браузере:" -ForegroundColor Yellow
    Write-Host "   http://localhost:8000/modules" -ForegroundColor White
    Write-Host "   http://localhost:8000/doc-module-1" -ForegroundColor White
    Write-Host "   http://localhost:8000/simulator" -ForegroundColor White
    Write-Host ""
    Write-Host "⏹️  Для остановки нажмите Ctrl+C" -ForegroundColor Red
    Write-Host ""
    
    # Запускаем PHP сервер
    php -S localhost:8000
}
else {
    # Проверяем наличие Python
    $pythonExists = Get-Command python -ErrorAction SilentlyContinue
    
    if ($pythonExists) {
        Write-Host "✅ Python найден! Запускаем Python сервер..." -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Сервер будет доступен по адресу:" -ForegroundColor Yellow
        Write-Host "   http://localhost:8000" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  ВНИМАНИЕ: Python сервер НЕ поддерживает .htaccess!" -ForegroundColor Yellow
        Write-Host "   Clean URLs работать не будут." -ForegroundColor Yellow
        Write-Host "   Используйте прямые ссылки: /pages/modules-index.html" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⏹️  Для остановки нажмите Ctrl+C" -ForegroundColor Red
        Write-Host ""
        
        # Запускаем Python сервер
        python -m http.server 8000
    }
    else {
        Write-Host "❌ Ошибка: Не найден ни PHP, ни Python!" -ForegroundColor Red
        Write-Host ""
        Write-Host "📥 Установите один из вариантов:" -ForegroundColor Yellow
        Write-Host "   1. PHP: https://www.php.net/downloads" -ForegroundColor White
        Write-Host "   2. Python: https://www.python.org/downloads/" -ForegroundColor White
        Write-Host "   3. XAMPP (включает Apache + PHP): https://www.apachefriends.org/" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Или используйте VS Code расширение 'Live Server'" -ForegroundColor Cyan
        Write-Host ""
        
        Read-Host "Нажмите Enter для выхода"
    }
}
