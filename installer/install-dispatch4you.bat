@echo off
REM Installs the Dispatch4you extension into Google Chrome.
REM Needs administrator rights: Windows protects the Chrome policy branch,
REM so a normal user cannot write it. We write to HKLM via a UAC prompt.
REM (ASCII only on purpose - cmd misreads non-ASCII .bat files.)

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

reg add "HKLM\Software\Policies\Google\Chrome\ExtensionInstallForcelist" /v 1 /t REG_SZ /d "ahbjapbcfgplnnjempddicmohpbdloin;https://dispatch4you.com/ext/update.xml" /f >nul
if %errorlevel%==0 (
  echo.
  echo   DONE - extension installed.
  echo   Close Google Chrome completely, then open it again.
) else (
  echo.
  echo   Write failed. Please run again and click YES on the prompt.
)
echo.
pause
