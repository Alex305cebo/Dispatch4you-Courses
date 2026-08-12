@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

rem ============================================================================
rem  Broker Call — запуск на своей машине.
rem
rem  Двойной клик по этому файлу. Скрипт подтягивает рабочую ветку, ставит
rem  зависимости, заводит файл ключей, если его нет, и поднимает дев-сервер.
rem
rem  Зачем: работа идёт в двух местах — в облачном контейнере и здесь. Ручной
rem  порядок «не забыть fetch, не забыть install, не забыть какая ветка»
rem  ломается ровно тогда, когда про него забываешь, и правки уезжают поверх
rem  старого кода. Пусть про это помнит скрипт.
rem
rem  На боевой сайт этот запуск не влияет: dispatch4you.com собирается из
rem  ветки main, а работаем мы в дев-ветке.
rem ============================================================================

set "BRANCH=claude/ai-broker-chat-investigation-tfm3gf"
set "URL=http://localhost:5180/broker-call/"

echo.
echo ==========================================
echo   Broker Call — локальный запуск
echo ==========================================
echo.

git --version >nul 2>nul
if errorlevel 1 (
  echo [!] Не найден git. Поставьте Git for Windows: https://git-scm.com/download/win
  pause
  exit /b 1
)

npm --version >nul 2>nul
if errorlevel 1 (
  echo [!] Не найден npm. Поставьте Node.js 22: https://nodejs.org
  pause
  exit /b 1
)

echo [1/4] Ветка %BRANCH%
git fetch origin %BRANCH%
if errorlevel 1 (
  echo     [!] До GitHub не достучались. Работаем с тем, что лежит на диске.
) else (
  git checkout %BRANCH%
  if errorlevel 1 (
    echo     [!] Не удалось перейти на ветку. Скорее всего мешают незакоммиченные правки.
    echo         Посмотрите: git status
    pause
    exit /b 1
  )
  rem --ff-only намеренно: молчаливый merge-коммит здесь означал бы, что
  rem история разъехалась, а мы этого не заметили.
  git pull --ff-only origin %BRANCH%
  if errorlevel 1 (
    echo     [!] Ветка разошлась: локально есть коммиты, которых нет на GitHub.
    echo         Разберитесь вручную:  git status  и  git pull --rebase
    pause
    exit /b 1
  )
)

cd broker-call

echo.
echo [2/4] Зависимости
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo     [!] npm install не прошёл. Дальше идти незачем.
  pause
  exit /b 1
)

echo.
echo [3/4] Ключи
if not exist ".env.local" (
  copy ".env.example" ".env.local" >nul
  echo     Создан broker-call\.env.local — он пустой.
  echo     Впишите ключи в открывшемся блокноте, сохраните и запустите снова:
  echo       GROQ_API_KEY    — распознавание и озвучка (запасной путь)
  echo       GEMINI_API_KEY  — разговор целиком: aistudio.google.com/apikey
  echo.
  notepad ".env.local"
  pause
  exit /b 0
)
echo     .env.local на месте

echo.
echo [4/4] Дев-сервер
echo.
echo     Откроется:  %URL%
echo     Сервер слушает и по сети — во втором адресе на экране будет
echo     что-то вроде http://192.168.x.x:5180/broker-call/ . По нему тренажёр
echo     открывается с телефона, если он в той же Wi-Fi.
echo.
echo     Остановить — Ctrl+C в этом окне.
echo.

rem Браузер открываем с задержкой: до первой сборки Vite ещё пара секунд, и
rem мгновенно открытая вкладка показала бы отказ соединения.
start "" /b cmd /c "ping -n 6 127.0.0.1 >nul & explorer %URL%"

call npm run dev

endlocal
