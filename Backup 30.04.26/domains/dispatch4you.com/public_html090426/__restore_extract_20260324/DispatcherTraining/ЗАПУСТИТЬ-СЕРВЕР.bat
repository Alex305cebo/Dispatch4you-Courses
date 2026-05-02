@echo off
chcp 65001 >nul
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo   🚀 ЗАПУСК ЛОКАЛЬНОГО ВЕБ-СЕРВЕРА
echo ═══════════════════════════════════════════════════════════
echo.

REM Проверяем PHP
where php >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PHP найден! Запускаю PHP сервер...
    echo.
    echo 📍 Сервер будет доступен по адресу:
    echo    http://localhost:8000
    echo.
    echo 🔗 Откройте в браузере:
    echo    http://localhost:8000/modules
    echo    http://localhost:8000/doc-module-1
    echo    http://localhost:8000/simulator
    echo.
    echo ⏹️  Для остановки нажмите Ctrl+C
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo.
    
    REM Открываем браузер через 2 секунды
    start /B timeout /t 2 /nobreak >nul && start http://localhost:8000/server-check.html
    
    REM Запускаем сервер
    php -S localhost:8000
    goto :end
)

REM Проверяем Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python найден! Запускаю Python сервер...
    echo.
    echo 📍 Сервер будет доступен по адресу:
    echo    http://localhost:8000
    echo.
    echo ⚠️  ВНИМАНИЕ: Python сервер НЕ поддерживает .htaccess!
    echo    Clean URLs работать не будут.
    echo    Используйте прямые ссылки: /pages/modules-index.html
    echo.
    echo ⏹️  Для остановки нажмите Ctrl+C
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo.
    
    REM Открываем браузер через 2 секунды
    start /B timeout /t 2 /nobreak >nul && start http://localhost:8000/server-check.html
    
    REM Запускаем сервер
    python -m http.server 8000
    goto :end
)

REM Если ничего не найдено
echo ❌ Ошибка: Не найден ни PHP, ни Python!
echo.
echo 📥 Установите один из вариантов:
echo    1. PHP: https://www.php.net/downloads
echo    2. Python: https://www.python.org/downloads/
echo    3. XAMPP (включает Apache + PHP): https://www.apachefriends.org/
echo.
echo 💡 Или используйте VS Code расширение 'Live Server'
echo.
echo 🔗 Пока что можете использовать: test-local-navigation.html
echo.
pause
goto :end

:end
