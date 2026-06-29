@echo off
chcp 65001 >nul
REM Ставит расширение Dispatch4you в Chrome (per-user, без прав администратора).
REM Аналог .exe — просто прописывает политику force-install. Дать диспетчеру, он 2x кликает.
reg add "HKCU\Software\Policies\Google\Chrome\ExtensionInstallForcelist" /v 1 /t REG_SZ /d "ahbjapbcfgplnnjempddicmohpbdloin;https://dispatch4you.com/ext/update.xml" /f >nul
if %errorlevel%==0 (
  echo.
  echo  Расширение установлено.
  echo  Закройте и снова откройте Google Chrome — оно появится автоматически.
) else (
  echo  Ошибка записи. Попробуйте ещё раз.
)
echo.
pause
