@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   🧪 ОТКРЫТИЕ ТЕСТОВОЙ СТРАНИЦЫ
echo ═══════════════════════════════════════════════════════════
echo.
echo Открываю test-local-navigation.html...
echo.
start "" "%~dp0test-local-navigation.html"
echo.
echo ✅ Страница открыта в браузере!
echo.
echo 💡 На этой странице все ссылки работают напрямую.
echo.
pause
