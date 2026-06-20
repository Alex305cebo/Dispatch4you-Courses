@echo off
chcp 65001 >nul
color 0A
title Voice-to-Chat Extension - Auto Installer

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║         🎤 VOICE-TO-CHAT CHROME EXTENSION INSTALLER           ║
echo ║              Russian Speech → English Translation              ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.

REM Get current directory
set "EXTENSION_PATH=%~dp0"
set "EXTENSION_PATH=%EXTENSION_PATH:~0,-1%"

echo [1/3] Checking Chrome installation...
echo.

REM Check if Chrome is installed
set "CHROME_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME_PATH (
    echo ❌ ERROR: Google Chrome not found!
    echo.
    echo Please install Google Chrome first:
    echo https://www.google.com/chrome/
    echo.
    pause
    exit /b 1
)

echo ✅ Chrome found: %CHROME_PATH%
echo.

echo [2/3] Opening Chrome Extensions page...
echo.
timeout /t 1 /nobreak >nul

REM Open Chrome extensions page
start "" "%CHROME_PATH%" --new-window chrome://extensions/

timeout /t 2 /nobreak >nul

echo ✅ Chrome Extensions page opened
echo.
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    FOLLOW THESE 3 STEPS:                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo    📌 STEP 1: Turn ON "Developer mode"
echo       (Toggle switch in TOP RIGHT corner)
echo.
echo    📌 STEP 2: Click "Load unpacked" button
echo       (Appears after enabling Developer mode)
echo.
echo    📌 STEP 3: Select this folder:
echo       %EXTENSION_PATH%
echo.
echo.
echo ════════════════════════════════════════════════════════════════
echo.

REM Try to open file explorer at extension folder
echo Opening extension folder...
explorer "%EXTENSION_PATH%"
timeout /t 1 /nobreak >nul

echo.
echo ✅ Extension folder opened in Explorer
echo    Copy this path if needed: %EXTENSION_PATH%
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo Press ANY KEY after completing the 3 steps above...
pause >nul

echo.
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✅ INSTALLATION COMPLETE!                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Voice-to-Chat extension is now installed!
echo.
echo 🚀 HOW TO USE:
echo    1. Look for the red microphone icon 🔴 in Chrome toolbar
echo    2. Click it to open Voice-to-Chat
echo    3. Hold the button → Speak in Russian → Release
echo    4. Get English translation instantly!
echo.
echo 💡 TIP: Press Ctrl+Shift+V as a shortcut
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo If you don't see the microphone icon:
echo    - Click the puzzle icon in Chrome toolbar
echo    - Find "Voice-to-Chat: RU → EN"
echo    - Click the PIN icon to keep it visible
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
exit /b 0
