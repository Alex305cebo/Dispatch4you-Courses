@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   📚 ОТКРЫТИЕ ДОКУМЕНТАЦИИ
echo ═══════════════════════════════════════════════════════════
echo.
echo Открываю документацию...
echo.
start "" "%~dp0pages\documentation-new.html"
echo.
echo ✅ Документация открыта!
echo.
timeout /t 2 /nobreak >nul
