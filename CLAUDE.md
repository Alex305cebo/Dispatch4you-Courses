# Repo Map — C:\DispatcherTraining (read this first)

This repo = the **dispatch4you.com** static site (RU + EN) + browser extensions + several games.
It is NOT primarily the React academy app — that's ONE subfolder (`games/dispatch-academy-app/`).
Main-site deploy: `main` → GitHub Actions → Hostinger (rsync). See memory `static-site-deploy`.

## Main site (RU) — repo root
- i18n: EN mirror in `en/` (+ `en/pages/`); paired files use `.en.` suffix (`nav.en.html`, `course-navigation.en.js`). Edit a RU page → update its `en/` twin AND bump `?v=` in both. See memory `i18n-multilang-architecture`.

## Games (each self-contained, own build/deploy)
- `games/dispatch-academy-app/` — React+Vite academy app (стек, файлы и роуты читаются из самой папки)
- `games/Survivors/` — HTML5 canvas game (cloud gh-pages flow) → **section below** + memory `survivors-game-deploy`
- `adventure/` — "Office 4 Dispatch" game (main game project; memory `game-office4dispatch`)
- `map-trainer/` + `maps/` + `build_map.js`/`fetch_routes_osrm.js` — US map/route trainer (OSM/OSRM data)
- also: `games/Tetris`, `games/dispatch-office-v2`, `games/game2`, `game/`, `quiz/`

## Broker Call — голосовой тренажёр звонка брокеру
- `broker-call/` (React+Vite) → <https://dispatch4you.com/broker-call/>; сервер — `api/broker-call.php`
- **Начинать с `broker-call/HANDOFF.md`**: состояние, что не проверено, грабли, порядок действий

## Extensions
- `DispatchPro extension/` — Chrome ext for DAT (Groq key on server; memory `dispatch4you-extension-deploy`)
- `voice-to-chat-extension/`, `ext/`, `3.14.4_0/`

## Don't read these when searching (archives/backups — wasted tokens)
`Old Modules/`, `_archive/`, `pages/_archive/`, `games/_archive_old_games/`, `*-BACKUP*`, `*.OLD.html`, `*-old.html`, `node_modules/`, `dist/`, `build/`

## Rules (весь репозиторий)
- NEVER run dev server, browser, or screenshots without explicit user request
- NEVER push to main without explicit user request
- ALWAYS ask before any action outside direct coding task
- Dispatch Academy: dev-ветка `claude/session-context-qcmlai`; коммитить только туда, мержить в main только по просьбе

## Два места работы: облако и своя машина

Работа идёт то в облачном контейнере (claude.ai/code с телефона), то локально в
`C:\DispatcherTraining`. Общего диска между ними нет и быть не может: контейнер
одноразовый и поднимается с чистой копией репозитория. **Единственный мост —
GitHub.** Всё, что не запушено, для второй стороны не существует.

Из-за этого расхождение случается беззвучно: правишь на машине поверх кода
недельной давности, потому что облако успело уйти вперёд, и узнаёшь об этом
на конфликте, когда половина работы уже сделана.

Чтобы этого не было:

- **Хук старта сессии** (`.claude/hooks/session-start.sh`) в начале КАЖДОЙ
  сессии — и в облаке, и локально — ставит зависимости `broker-call` и печатает:
  ветку, число незакоммиченных файлов, расхождение с GitHub и разошёлся ли
  сгенерированный `api/broker-config.php` со сборкой. Если он сказал «на GitHub
  есть N коммитов, которых тут нет» — сначала `git pull --rebase`, только потом
  правки.
- **Локальный запуск** — двойной клик по `start-local.bat` в корне (на mac и в
  WSL — `./start-local.sh`). Скрипт сам подтягивает рабочую ветку, ставит
  зависимости, заводит `broker-call/.env.local` при первом запуске и поднимает
  дев-сервер на <http://localhost:5180/broker-call/>. Второй адрес, который
  печатает Vite (`http://192.168.x.x:5180/broker-call/`), открывается с телефона
  в той же Wi-Fi — так проверяется микрофон и звук, чего в облаке сделать нельзя.
- **Заканчивая работу в любом из мест — `git push`.** Не «когда закончу задачу»,
  а перед тем, как закрыть окно. Контейнер умирает вместе с несохранённым.
- Ключи (`.env.local`) живут ТОЛЬКО на машине пользователя и на боевом сервере.
  В репозиторий они не попадают, в облачном контейнере их нет — поэтому живой
  разговор в облаке не проверить, там доступны сборка, типы и тесты.

`start-local.bat`, `start-local.sh` и `.claude/` исключены из выкладки на сайт
(rsync в `deploy.yml`) — иначе они стали бы публично доступны по адресу домена.

---

# Игра «Выжившие» (Survivors) — работа для ИИ следующей сессии

> Этот раздел — про мини-игру HTML5, а НЕ про dispatch-academy-app выше. Репозиторий содержит несколько проектов.

## Как это запускается
Пользователь работает с телефона/планшета через Claude Code на вебе (claude.ai/code) или в приложении. Он пишет задачу — ИИ выполняется в **облачной эфемерной среде** (временный контейнер со склонированным репо), не на устройстве. **Всё незакоммиченное/незапушенное пропадёт → любое изменение доводить до `git push`.**

## Репозиторий и доступ
- Репо: `Alex305cebo/Dispatch4you-Courses` (приватный).
- К GitHub ходить только через **GitHub MCP** (`mcp__github__*`), а НЕ через `gh` CLI (его в облаке нет). Схемы грузить через `ToolSearch` (напр. `select:mcp__github__actions_run_trigger,mcp__github__actions_list`).
- Обычные git-команды (add/commit/push/fetch/rebase) в терминале работают.

## Ветки и файлы
- Разработка игр — на ветке **gh-pages**, подключённой как git-worktree `.wt-gh-pages/`.
- Главный файл игры: `.wt-gh-pages/survivors/index.html` — цельный HTML5-canvas (~7900+ строк, вся логика в большом IIFE внутри `<script>`).
- Хаб «Выбери игру»: `.wt-gh-pages/index.html` — игры в полноэкранном `<iframe>`, поверх ссылка `#home` («← На сайт»).
- cwd между командами иногда сбрасывается в корень репо — **всегда `cd /home/user/Dispatch4you-Courses/.wt-gh-pages/survivors`** перед файловыми операциями и git.

## Рабочий цикл (проверено)
1. Отредактировать `index.html` (Edit/Write).
2. Синтаксис-чек (обязательно, иначе можно уронить всю игру):
   ```
   node -e "const fs=require('fs');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('syntax OK');"
   ```
3. Коммит и пуш в gh-pages:
   ```
   git add index.html && git commit -m "…" && git push origin gh-pages
   ```
   При `403`/non-fast-forward: `git fetch origin gh-pages && git rebase origin/gh-pages`, затем push. НЕ чейнить `|| (fetch && rebase && push)` из корня репо — cwd мог сброситься, ребейз уйдёт на чужую ветку.
4. Запустить деплой (сайт от пуша сам НЕ обновляется):
   ```
   mcp__github__actions_run_trigger  method=run_workflow  owner=Alex305cebo  repo=Dispatch4you-Courses  workflow_id=deploy-mini-games.yml  ref=main
   ```
   Воркфлоу чекаутит gh-pages и по SSH/rsync выкладывает `./` (весь корень gh-pages) в `public_html/games/`.
5. Проверить статус:
   ```
   mcp__github__actions_list  method=list_workflow_runs  resource_id=deploy-mini-games.yml  per_page=1
   ```
   Ответ большой, сохраняется в файл: `jq -c '.workflow_runs[0]|{status,conclusion,html_url,created_at,updated_at}' <путь_к_файлу>`. Ждать `status:"completed", conclusion:"success"`. Раннер иногда в очереди ~10 мин — это не зависание.

## Где вживую
- Боевой сайт: https://dispatch4you.com/games/survivors/ (Hostinger).
- Версия = git-коммит на gh-pages (отдельной нумерации нет). `?v=NN` в ссылке — только кэш-бастинг, не версия сборки.

## Грабли
- Деплой rsync'ит **весь корень gh-pages** в `/games/` → любой файл там становится публичным. Поэтому ЭТОТ CLAUDE.md держим на `main` (исключён из выкладки как `*.md`), а не на gh-pages.
- Тестирование в браузере (Playwright) в облаке заблокировано, запуск скриптов из `/tmp` запрещён → проверка = синтаксис-чек + разбор кода + пользователь тестит вживую и даёт фидбэк.
- Всё новое прятать за null-проверками (напр. режимы Акта 2 — за `act2Def`/`act2BaseWalls`), чтобы правки не ломали остальную игру.
- Изредка наружу «протекает» служебный код вызова инструмента как непонятный текст — на результат не влияет, просто переотправить команду.

## graphify (граф кодовой базы, только локально)
- Вопрос про код → сперва `graphify query "<вопрос>"`, если есть `graphify-out/graph.json`; связи — `graphify path "<A>" "<B>"`, концепт — `graphify explain "<...>"`. Это дешевле, чем grep или `GRAPH_REPORT.md`.
- После правок кода — `graphify update .` (только AST, без затрат на API).
