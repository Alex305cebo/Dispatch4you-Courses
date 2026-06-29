@echo off
REM Removes the Dispatch4you extension from Chrome. Needs administrator rights.

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

reg delete "HKLM\Software\Policies\Google\Chrome\ExtensionInstallForcelist" /v 1 /f >nul 2>&1
echo.
echo   Removed. Please restart Google Chrome.
echo.
pause
