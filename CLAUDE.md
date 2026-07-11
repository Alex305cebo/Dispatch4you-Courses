# Dispatch Academy — Project Context

## Stack
- React 18 + Vite + TypeScript + TailwindCSS
- Zustand + persist (localStorage key: `dispatch-academy-progress`)
- framer-motion, react-router-dom v6
- Firebase Auth (eager) + Firestore (lazy via `getDb()`)
- Vitest for tests

## Key files
- `src/store/useProgressStore.ts` — XP, level, streak, achievements, dayStatuses
- `src/store/useUIStore.ts` — toasts, achievementModal
- `src/components/layout/AppLayout.tsx` — header, bottom nav, all panels
- `src/services/firebase.ts` — Firebase init, lazy `getDb()`
- `src/services/firestore-progress.ts` — save/load/leaderboard (Firestore)
- `src/hooks/useAuth.ts` — Google sign-in, AcademyUser type
- `src/hooks/useFirestoreSync.ts` — debounced save + cloud restore on sign-in
- `src/logic/achievements.ts` — 14 achievements, deriveStats, evaluateUnlocked
- `src/pages/LeaderboardPage.tsx` — reads `academy-leaderboard` Firestore collection
- `src/pages/SettingsPage.tsx` — daily goal, notifications, achievements grid
- `public/sw.js` — service worker (network-first)
- `public/manifest.webmanifest` — PWA manifest

## Routes (basename: /dispatch-academy-app)
/, /map, /day/:dayId, /day/:dayId/task/:n, /exam/mini/:weekId, /exam/final,
/flashcards, /glossary, /certificate, /settings, /leaderboard, /login

## Deploy
- Branch `main` → GitHub Actions → Hostinger (auto)
- Dev branch: `claude/session-context-qcmlai`
- Build: `cd games/dispatch-academy-app && npm run build`
- Test: `cd games/dispatch-academy-app && npm test`

## Rules
- NEVER run dev server, browser, or screenshots without explicit user request
- NEVER push to main without explicit user request
- ALWAYS ask before any action outside direct coding task
- Commit only to `claude/session-context-qcmlai`, merge to main only when user says

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
