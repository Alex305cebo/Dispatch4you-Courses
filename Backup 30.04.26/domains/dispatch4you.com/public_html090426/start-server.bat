@echo off
echo.
echo ========================================
echo   ЛОКАЛЬНЫЙ СЕРВЕР
echo ========================================
echo.

REM Проверяем Python
where python >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Python найден
    echo.
    echo Запуск сервера на http://localhost:8000
    echo Нажмите Ctrl+C для остановки
    echo.
    python -m http.server 8000
    goto :end
)

REM Проверяем Python3
where python3 >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Python3 найден
    echo.
    echo Запуск сервера на http://localhost:8000
    echo Нажмите Ctrl+C для остановки
    echo.
    python3 -m http.server 8000
    goto :end
)

REM Проверяем Node.js
where node >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Node.js найден
    echo.
    echo Установка http-server...
    call npm install -g http-server
    echo.
    echo Запуск сервера на http://localhost:8000
    echo Нажмите Ctrl+C для остановки
    echo.
    http-server -p 8000
    goto :end
)

echo [ERROR] Не найден Python или Node.js
echo.
echo Установите один из:
echo   1. Python: https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
pause
goto :end

:end
