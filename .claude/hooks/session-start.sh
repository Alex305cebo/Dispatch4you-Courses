#!/bin/bash
# Подготовка сессии. Одна и та же в облаке и на машине пользователя.
#
# Работа идёт в двух местах: в одноразовом облачном контейнере и локально в
# C:\DispatcherTraining. Расходятся они молча — контейнер поднимается с чистой
# копией репозитория и ничего не знает про то, что было сделано на машине, а
# машина не знает про облако. Обнаруживается это обычно посреди правки, когда
# половина работы уже сделана поверх старого кода.
#
# Поэтому хук делает две вещи: ставит зависимости активного проекта, чтобы
# тесты и сборка работали с первой команды, и сразу говорит, где мы и не ушла
# ли ветка вперёд.
#
# Намеренно без set -e: не установились зависимости — это повод сказать вслух,
# а не повод не дать начать сессию.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$ROOT" 2>/dev/null || exit 0

# ── Зависимости ─────────────────────────────────────────────────────────────
# Только broker-call: у корневого package.json тяжёлые sqlite3 и firebase,
# которые к текущей работе отношения не имеют, а ставятся минуту.
# Появится второй активный проект — добавить его сюда одной строкой.
for APP in broker-call; do
  [ -f "$APP/package.json" ] || continue

  # Переустанавливаем, только если список зависимостей новее установленного.
  if [ -d "$APP/node_modules" ] && [ ! "$APP/package-lock.json" -nt "$APP/node_modules" ]; then
    echo "$APP: зависимости на месте"
    continue
  fi

  # npm install, а не ci: состояние контейнера кэшируется между сессиями, и
  # install переиспользует уже скачанное, а ci каждый раз сносит node_modules.
  if (cd "$APP" && npm install --no-audit --no-fund) >/tmp/npm-$APP.log 2>&1; then
    echo "$APP: зависимости поставлены"
  else
    echo "$APP: npm install НЕ ПРОШЁЛ — тесты и сборка работать не будут, лог в /tmp/npm-$APP.log"
  fi
done

# ── Где мы ──────────────────────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
echo "ветка: $BRANCH"

DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
[ "$DIRTY" != "0" ] && echo "незакоммиченных файлов: $DIRTY"

# Расхождение с GitHub — главный признак того, что работа шла в другом месте.
# Сеть может не ответить, поэтому с ограничением по времени и без паники.
# timeout есть не везде — в macOS его нет вовсе. Без него просто ждём git,
# у него свои таймауты; ронять из-за этого старт сессии незачем.
if command -v timeout >/dev/null 2>&1; then
  FETCH="timeout 20 git fetch --quiet origin $BRANCH"
else
  FETCH="git fetch --quiet origin $BRANCH"
fi

if $FETCH 2>/dev/null; then
  COUNTS=$(git rev-list --left-right --count "HEAD...origin/$BRANCH" 2>/dev/null)
  AHEAD=$(echo "$COUNTS" | cut -f1)
  BEHIND=$(echo "$COUNTS" | cut -f2)
  [ "${AHEAD:-0}" != "0" ] && echo "не отправлено на GitHub: $AHEAD коммит(ов)"
  if [ "${BEHIND:-0}" != "0" ]; then
    echo "ВНИМАНИЕ: на GitHub есть $BEHIND коммит(ов), которых тут нет."
    echo "Работа шла в другом месте. Сначала git pull --rebase, потом правки."
  fi
else
  echo "до GitHub не достучались — состояние ветки неизвестно"
fi

# ── Сгенерированный серверный конфиг ────────────────────────────────────────
# Промпт брокера и схемы инструментов живут в TypeScript, а на боевой сервер
# уезжают собранным api/broker-config.php. Разъезжаются они беззвучно: фронт
# новый, брокер ведёт себя по-старому.
if ! git diff --quiet -- api/broker-config.php 2>/dev/null; then
  echo "api/broker-config.php разошёлся со сборкой: cd broker-call && npm run build:server-config"
fi

exit 0
