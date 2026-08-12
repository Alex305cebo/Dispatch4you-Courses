#!/bin/bash
# Broker Call — запуск на своей машине. Близнец start-local.bat для mac, Linux
# и WSL: тот же порядок действий, чтобы «у меня по-другому» не зависело от
# того, откуда запускаешь.
set -uo pipefail

cd "$(dirname "$0")" || exit 1

BRANCH="claude/broker-call-first-live"
URL="http://localhost:5180/broker-call/"

echo
echo "=========================================="
echo "  Broker Call — локальный запуск"
echo "=========================================="
echo

command -v git >/dev/null || { echo "[!] Не найден git."; exit 1; }
command -v npm >/dev/null || { echo "[!] Не найден npm. Нужен Node.js 22."; exit 1; }

echo "[1/4] Ветка $BRANCH"
if git fetch origin "$BRANCH"; then
  git checkout "$BRANCH" || { echo "    [!] Не перейти на ветку — посмотрите git status"; exit 1; }
  # --ff-only намеренно: молчаливый merge-коммит здесь означал бы, что история
  # разъехалась, а мы этого не заметили.
  if ! git pull --ff-only origin "$BRANCH"; then
    echo "    [!] Ветка разошлась: локально есть свои коммиты."
    echo "        Разберитесь вручную: git status и git pull --rebase"
    exit 1
  fi
else
  echo "    [!] До GitHub не достучались. Работаем с тем, что лежит на диске."
fi

cd broker-call || exit 1

echo
echo "[2/4] Зависимости"
npm install --no-audit --no-fund || { echo "    [!] npm install не прошёл."; exit 1; }

echo
echo "[3/4] Ключи"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "    Создан broker-call/.env.local — он пустой."
  echo "    Впишите ключи и запустите снова:"
  echo "      GROQ_API_KEY    — распознавание и озвучка (запасной путь)"
  echo "      GEMINI_API_KEY  — разговор целиком: aistudio.google.com/apikey"
  exit 0
fi
echo "    .env.local на месте"

echo
echo "[4/4] Дев-сервер"
echo "    Откроется: $URL"
echo "    Второй адрес на экране (http://192.168.x.x:5180/broker-call/) открывается"
echo "    с телефона, если он в той же Wi-Fi."
echo "    Остановить — Ctrl+C."
echo

# Браузер с задержкой: до первой сборки Vite ещё пара секунд.
(
  sleep 5
  if command -v open >/dev/null; then open "$URL"
  elif command -v xdg-open >/dev/null; then xdg-open "$URL"
  fi
) >/dev/null 2>&1 &

npm run dev
