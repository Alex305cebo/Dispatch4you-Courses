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
