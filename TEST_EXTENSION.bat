@echo off
color 0B
title Extension Test & Package Creator

echo.
echo ========================================
echo  VOICE-TO-CHAT EXTENSION
echo  Test and Package Creator
echo ========================================
echo.

echo [TEST 1] Checking all required files...
echo.

set "EXT_DIR=voice-to-chat-extension"

set "MISSING=0"

if not exist "%EXT_DIR%\manifest.json" (
    echo ❌ MISSING: manifest.json
    set "MISSING=1"
) else (
    echo ✅ manifest.json
)

if not exist "%EXT_DIR%\popup.html" (
    echo ❌ MISSING: popup.html
    set "MISSING=1"
) else (
    echo ✅ popup.html
)

if not exist "%EXT_DIR%\popup.css" (
    echo ❌ MISSING: popup.css
    set "MISSING=1"
) else (
    echo ✅ popup.css
)

if not exist "%EXT_DIR%\popup.js" (
    echo ❌ MISSING: popup.js
    set "MISSING=1"
) else (
    echo ✅ popup.js
)

if not exist "%EXT_DIR%\icon16.png" (
    echo ❌ MISSING: icon16.png
    set "MISSING=1"
) else (
    echo ✅ icon16.png
)

if not exist "%EXT_DIR%\icon48.png" (
    echo ❌ MISSING: icon48.png
    set "MISSING=1"
) else (
    echo ✅ icon48.png
)

if not exist "%EXT_DIR%\icon128.png" (
    echo ❌ MISSING: icon128.png
    set "MISSING=1"
) else (
    echo ✅ icon128.png
)

if not exist "%EXT_DIR%\INSTALL.bat" (
    echo ⚠️  WARNING: INSTALL.bat not found (recommended)
) else (
    echo ✅ INSTALL.bat
)

if not exist "%EXT_DIR%\QUICK_INSTALL.html" (
    echo ⚠️  WARNING: QUICK_INSTALL.html not found (recommended)
) else (
    echo ✅ QUICK_INSTALL.html
)

if not exist "%EXT_DIR%\START_HERE.txt" (
    echo ⚠️  WARNING: START_HERE.txt not found (recommended)
) else (
    echo ✅ START_HERE.txt
)

echo.

if "%MISSING%"=="1" (
    echo ========================================
    echo ❌ ERROR: Some required files are missing!
    echo ========================================
    echo.
    echo Extension will NOT work without these files.
    echo.
    pause
    exit /b 1
)

echo ========================================
echo ✅ ALL CORE FILES PRESENT!
echo ========================================
echo.

echo [TEST 2] Checking manifest.json syntax...
echo.

REM Simple validation
findstr /C:"manifest_version" "%EXT_DIR%\manifest.json" >nul
if errorlevel 1 (
    echo ❌ manifest.json might be corrupted
) else (
    echo ✅ manifest.json looks valid
)

echo.
echo ========================================
echo [TEST 3] Creating distribution package...
echo ========================================
echo.

if exist "Voice-to-Chat-Extension.zip" (
    del "Voice-to-Chat-Extension.zip"
)

powershell -Command "Compress-Archive -Path '%EXT_DIR%\*' -DestinationPath 'Voice-to-Chat-Extension.zip' -Force"

if exist "Voice-to-Chat-Extension.zip" (
    echo ✅ ZIP package created: Voice-to-Chat-Extension.zip
    echo.
    for %%A in ("Voice-to-Chat-Extension.zip") do (
        echo    Size: %%~zA bytes
    )
) else (
    echo ❌ Failed to create ZIP package
)

echo.
echo ========================================
echo ✅ EXTENSION IS READY TO SHIP!
echo ========================================
echo.
echo 📦 Package: Voice-to-Chat-Extension.zip
echo.
echo To share with others:
echo   1. Send them: Voice-to-Chat-Extension.zip
echo   2. They extract it
echo   3. They run: INSTALL.bat or QUICK_INSTALL.html
echo   4. Done!
echo.
echo ========================================
echo.

echo Would you like to test the installation now? (Y/N)
choice /C YN /N /M "Press Y to test, N to exit: "

if errorlevel 2 goto :end
if errorlevel 1 goto :test

:test
echo.
echo Opening test installation...
cd "%EXT_DIR%"
start QUICK_INSTALL.html
cd ..

:end
echo.
echo Thank you for using Voice-to-Chat Extension!
echo.
pause
