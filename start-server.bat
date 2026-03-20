@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 Запуск локального веб-сервера
echo ========================================
echo.
echo 📂 Папка: %CD%
echo 🌐 Адрес: http://localhost:8000
echo.
echo Нажми Ctrl+C чтобы остановить сервер
echo.
echo ========================================
echo.

REM Открываем браузер
start http://localhost:8000/index.html

REM Запускаем Python сервер
python -m http.server 8000

pause
