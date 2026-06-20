@echo off
echo ========================================
echo  Voice-to-Chat Extension Installer
echo ========================================
echo.
echo Installing Chrome Extension...
echo.
echo STEPS:
echo.
echo 1. Opening Chrome extensions page...
start chrome://extensions/
timeout /t 2 /nobreak >nul
echo.
echo 2. Follow these steps in Chrome:
echo    - Turn ON "Developer mode" (top right)
echo    - Click "Load unpacked"
echo    - Select this folder: %~dp0
echo.
echo Extension folder: %~dp0
echo.
echo ========================================
echo Press any key when done...
pause >nul
echo.
echo Installation complete!
echo You can now use the extension by:
echo   - Clicking the icon in Chrome toolbar
echo   - Or pressing Ctrl+Shift+V
echo.
pause
