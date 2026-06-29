@echo off
chcp 65001 >nul
REM Удаляет расширение Dispatch4you из Chrome (снимает политику force-install).
reg delete "HKCU\Software\Policies\Google\Chrome\ExtensionInstallForcelist" /v 1 /f >nul 2>&1
echo.
echo  Расширение удалено. Перезапустите Google Chrome.
echo.
pause
