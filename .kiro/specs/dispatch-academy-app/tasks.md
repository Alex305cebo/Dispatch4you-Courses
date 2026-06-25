# Implementation Plan: Dispatch Academy App

## Overview

Standalone React SPA (Vite + React 18 + TypeScript) implementing a gamified 4-week dispatcher training platform with 11 interactive task types, SM-2 spaced repetition, XP/Levels/Streaks, Firebase Auth + Firestore persistence, Framer Motion animations, offline support via Workbox, and certificate generation via jsPDF. All UI in Russian.

## Tasks

- [x] 1. Project scaffolding and core infrastructure
  - [x] 1.1 Initialize Vite + React 18 + TypeScript project
    - Create `dispatch-academy-app/` directory with `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
    - Install dependencies: react, react-dom, react-router-dom, zustand, tailwindcss, framer-motion, firebase, jspdf, workbox-webpack-plugin
    - Install dev dependencies: vitest, fast-check, @testing-library/react, @testing-library/jest-dom, playwright, @axe-core/react
    - Configure Tailwind CSS with dark theme as default, mobile-first breakpoints (320px, 768px, 1024px)
    - Configure Vite for route-based code splitting and build output
    - _Requirements: 1.1, 1.2, 12.3_

  - [x] 1.2 Define core TypeScript interfaces and types
    - Create `src/types/index.ts` with all interfaces: Task, TaskType, TaskData variants (QuizData, EmailSimData, PhoneDialogData, CalculatorData, MapRoutingData, CrisisData, DocReviewData, DragMatchData, FillBlankData, AudioTermData)
    - Create `src/types/progress.ts` with DayStatus, TaskResult, XPEvent, LevelDefinition, FlashcardReviewState, ExamSession, ExamQuestion
    - Create `src/types/store.ts` with ProgressState, UIState interfaces
    - _Requirements: 1.4, 6.1_

  - [x] 1.3 Set up React Router v6 with lazy routes
    - Create `src/App.tsx` with router configuration and route-based code splitting using `React.lazy()`
    - Define routes: `/login`, `/map`, `/day/:dayId`, `/day/:dayId/task/:n`, `/exam/mini/:weekId`, `/exam/final`, `/flashcards`, `/certificate`, `/settings`
    - Wrap routes with `<Suspense>` and skeleton fallbacks
    - Add `ErrorBoundary` components (top-level and per-route)
    - _Requirements: 1.3, 13.1_

  - [x] 1.4 Configure Firebase initialization
    - Create `src/services/firebase.ts` with Firebase app init, Auth instance, and Firestore instance
    - Create `.env.example` with Firebase config placeholders
    - Add `src/services/auth.ts` with email/password and Google sign-in methods
    - _Requirements: 2.1_

- [x] 2. State management and business logic engines
  - [x] 2.1 Implement Zustand progress store with persist middleware
    - Create `src/store/useProgressStore.ts` with all ProgressState fields and actions
    - Implement Zustand persist middleware with localStorage for offline support
    - Implement `addXP`, `completeTask`, `unlockNextDay`, `updateStreak`, `submitExam` actions
    - _Requirements: 1.4, 2.3, 2.5_

  - [x] 2.2 Implement Zustand UI store
    - Create `src/store/useUIStore.ts` with UIState fields: soundEnabled, isOffline, pendingSyncCount, showLevelUpModal, toastMessage
    - Implement actions: toggleSound, setOffline, showToast, triggerLevelUp
    - _Requirements: 11.1, 11.6_

  - [x] 2.3 Implement SM-2 spaced repetition engine
    - Create `src/logic/sm2.ts` with `calculateSM2(card, rating)` function
    - Enforce constraints: easeFactor ≥ 1.3, interval 1–365, initial intervals (1, 6), rating-specific formulas
    - Create `src/logic/flashcard-filter.ts` with due card filtering (nextReviewDate ≤ today) and sorting (most overdue first)
    - _Requirements: 7.2, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 2.4 Write property test for SM-2 algorithm (Property 1)
    - **Property 1: SM-2 Algorithm Correctness**
    - **Validates: Requirements 7.2, 7.5, 7.6, 7.7, 7.8**
    - Create `src/__tests__/properties/sm2-algorithm.property.test.ts`
    - Test: ease factor never below 1.3, interval 1–365, Again resets to 1, Hard = ceil(old×1.2), Good = ceil(old×EF), Easy = ceil(old×EF×1.3)

  - [x] 2.5 Implement XP and Level calculation engine
    - Create `src/logic/xp.ts` with `getXPForTask(taskType, isFirstCompletion)`, `getBonusXP(score, isFirstAttempt)`, `getDayPerfectBonus(dayScores)`
    - Create `src/logic/levels.ts` with LEVELS constant array and `getLevelForXP(xp)` function
    - Implement first-completion-only rule: retries never award additional XP
    - _Requirements: 5.1, 5.2, 5.3, 5.9_

  - [ ]* 2.6 Write property test for XP calculation (Property 2)
    - **Property 2: XP Calculation Invariants**
    - **Validates: Requirements 5.1, 5.2, 5.9**
    - Create `src/__tests__/properties/xp-calculation.property.test.ts`
    - Test: total XP equals sum of base + bonuses, retries never increase XP

  - [ ]* 2.7 Write property test for Level determination (Property 3)
    - **Property 3: Level Determination from XP**
    - **Validates: Requirements 5.3, 5.4**
    - Create `src/__tests__/properties/level-determination.property.test.ts`
    - Test: level is highest where threshold ≤ XP, level-up triggers iff level changes

  - [x] 2.8 Implement Streak calculation engine
    - Create `src/logic/streak.ts` with `calculateStreak(activityDates, today)` and `checkMilestone(streak)` functions
    - Implement midnight-to-midnight calendar day logic using student's local timezone
    - Implement milestone detection at streak values 3, 7, 14, 30
    - _Requirements: 5.5, 5.6, 5.8_

  - [ ]* 2.9 Write property test for Streak calculation (Property 4)
    - **Property 4: Streak Calculation**
    - **Validates: Requirements 5.5, 5.6, 5.8**
    - Create `src/__tests__/properties/streak-calculation.property.test.ts`
    - Test: streak equals longest consecutive-day suffix, resets to 0 after gap, milestones at 3/7/14/30

  - [x] 2.10 Implement Day unlock logic
    - Create `src/logic/unlock.ts` with `shouldUnlockNextDay(dayId, taskScores)` — unlocks iff all tasks completed AND mean score ≥ 70%
    - Implement `shouldUnlockMiniExam(weekId, dayStatuses)` — unlocks iff all 5 days completed
    - Implement `shouldUnlockFinalExam(miniExamPassed)` — unlocks iff all 4 mini-exams passed
    - _Requirements: 3.3, 3.5, 3.8, 8.1, 9.1_

  - [ ]* 2.11 Write property test for Day unlock logic (Property 5)
    - **Property 5: Day Unlock Logic**
    - **Validates: Requirements 3.3, 3.8**
    - Create `src/__tests__/properties/day-unlock.property.test.ts`
    - Test: next day unlocks iff all tasks completed AND mean ≥ 70%

  - [ ]* 2.12 Write property test for Sequential unlock chain (Property 6)
    - **Property 6: Sequential Unlock Chain**
    - **Validates: Requirements 3.5, 8.1, 9.1**
    - Create `src/__tests__/properties/sequential-unlock.property.test.ts`
    - Test: Mini_Exam unlocks iff all 5 days completed, Final_Exam iff all 4 mini-exams passed

  - [x] 2.13 Implement Exam logic engine
    - Create `src/logic/exam.ts` with `selectMiniExamQuestions(weekId, pool)` — 25 questions, ≥3 per type
    - Implement `selectFinalExamQuestions(pool)` — 100 questions (50 terminology + 50 situational), ≥4 per module
    - Implement `evaluateExam(answers, examType)` — pass threshold 70% mini, 80% final
    - Implement cooldown enforcement: 30min mini, 24h final
    - _Requirements: 8.2, 8.4, 8.5, 9.2, 9.5, 9.6_

  - [ ]* 2.14 Write property test for Exam threshold (Property 7)
    - **Property 7: Exam Pass/Fail Threshold**
    - **Validates: Requirements 8.4, 9.5**
    - Create `src/__tests__/properties/exam-threshold.property.test.ts`
    - Test: pass iff score ≥ threshold, XP awarded only on first pass

  - [ ]* 2.15 Write property test for Cooldown enforcement (Property 8)
    - **Property 8: Cooldown Enforcement**
    - **Validates: Requirements 8.5, 9.6**
    - Create `src/__tests__/properties/cooldown-enforcement.property.test.ts`
    - Test: retake blocked if T2-T < cooldown, allowed if T2-T ≥ cooldown

  - [ ]* 2.16 Write property test for Exam question selection (Property 9)
    - **Property 9: Exam Question Selection Constraints**
    - **Validates: Requirements 8.2, 9.2**
    - Create `src/__tests__/properties/exam-question-selection.property.test.ts`
    - Test: mini produces 25 from week with ≥3 per type, final produces 100 (50+50) with ≥4 per module

  - [x] 2.17 Implement Calculator tolerance and Document review scoring
    - Create `src/logic/scoring.ts` with `validateCalculatorAnswer(input, correct)` — tolerance ±2% for non-zero, exact match for zero
    - Implement `calculateDocReviewScore(totalErrors, incorrectTaps, missedErrors)` — max(0, 100 - K×10 - M/N×100)
    - _Requirements: 6.6, 6.9_

  - [ ]* 2.18 Write property test for Calculator tolerance (Property 10)
    - **Property 10: Calculator Tolerance Validation**
    - **Validates: Requirements 6.6**
    - Create `src/__tests__/properties/calculator-tolerance.property.test.ts`
    - Test: true iff |input-correct|/|correct| ≤ 0.02, zero must equal zero exactly

  - [ ]* 2.19 Write property test for Document review score (Property 11)
    - **Property 11: Document Review Score Formula**
    - **Validates: Requirements 6.9**
    - Create `src/__tests__/properties/doc-review-score.property.test.ts`
    - Test: score = max(0, 100 - K×10 - M/N×100), always 0–100

  - [x] 2.20 Implement Offline sync and merge strategy
    - Create `src/services/sync.ts` with offline queue management (max 50 pending updates, FIFO eviction)
    - Implement per-field maximum value merge: max XP, max level, max streak, furthest day status, latest flashcard date
    - Implement `syncPendingUpdates()` that drains queue on reconnect
    - Add online/offline event listeners to update UIStore
    - _Requirements: 2.5, 2.7_

  - [ ]* 2.21 Write property test for Offline merge strategy (Property 12)
    - **Property 12: Offline Merge Strategy (Per-Field Maximum)**
    - **Validates: Requirements 2.5**
    - Create `src/__tests__/properties/offline-merge.property.test.ts`
    - Test: merged totalXP = max(local, remote), level = max, streak = max, dayStatus = furthest, nextReviewDate = latest

  - [ ]* 2.22 Write property test for Flashcard due card filtering (Property 13)
    - **Property 13: Flashcard Due Card Filtering and Sorting**
    - **Validates: Requirements 7.3**
    - Create `src/__tests__/properties/flashcard-due-filter.property.test.ts`
    - Test: due list contains exactly cards with nextReviewDate ≤ today, sorted most overdue first

- [x] 3. Checkpoint — Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Firebase integration and authentication
  - [x] 4.1 Implement Login screen with Firebase Auth
    - Create `src/pages/LoginPage.tsx` with email/password form and Google sign-in button
    - All UI labels in Russian; display specific error messages (invalid credentials, network error, account not found)
    - Preserve entered email on failure; responsive layout (mobile-first)
    - _Requirements: 2.1, 2.6, 2.8_

  - [x] 4.2 Implement AuthGuard and Firestore sync service
    - Create `src/components/AuthGuard.tsx` that redirects unauthenticated users to `/login`
    - Create `src/services/firestore.ts` with `saveProgress(userId, state)` and `loadProgress(userId)` functions
    - Implement initial document creation on first sign-in (Level 1, 0 XP, Day 1 unlocked, Streak 0)
    - Implement 5-second timeout for Firestore operations with fallback to localStorage
    - _Requirements: 2.2, 2.3, 2.4, 2.7_

  - [ ]* 4.3 Write unit tests for auth flow and Firestore service
    - Test sign-in success, sign-in failure messages, first-time document creation
    - Test Firestore timeout fallback to localStorage
    - Test offline indicator visibility
    - _Requirements: 2.1, 2.7, 2.8_

- [x] 5. Content data layer and migration
  - [x] 5.1 Create lesson content JSON files (Days 1–20)
    - Create `src/data/lessons/day-01.json` through `day-20.json` with structure: dayId, weekId, title, estimatedMinutes, tasks[]
    - Migrate content from existing `doc-module-1-complete.html` through `doc-module-12-complete.html`
    - Map modules to weeks: Week 1 (Modules 1–3), Week 2 (Modules 4–6), Week 3 (Modules 7–9), Week 4 (Modules 10–12)
    - Include 84 quiz items (7 per module) as multiple-choice tasks within corresponding days
    - Create `src/data/lessons/index.ts` manifest file with metadata
    - _Requirements: 10.1, 10.2, 3.1, 3.2_

  - [x] 5.2 Create exam question pools and flashcard data
    - Create `src/data/exams/mini-exam-pool-week1.json` through `week4.json` with questions from respective modules
    - Create `src/data/exams/final-exam-pool.json` with 50 terminology + 50 situational questions from `testing.html`
    - Create `src/data/flashcards.json` with all 80 flashcards from `trainer-data.js` (id, category, difficulty, term, definition, example)
    - Create `src/data/levels.json` with 10 level definitions
    - All content in Russian with English terms preserved without transliteration
    - _Requirements: 10.3, 10.4, 10.5, 10.6_

  - [x] 5.3 Implement content loader with lazy loading
    - Create `src/services/content-loader.ts` with `loadDayContent(dayId)` — lazy-loads JSON on demand
    - Implement background pre-fetching of next sequential day at low priority
    - Implement 15-second fetch timeout with error message and retry button
    - _Requirements: 13.2, 13.5, 13.8_

  - [ ]* 5.4 Write unit tests for content loader
    - Test lazy loading, pre-fetch trigger, timeout handling, retry mechanism
    - _Requirements: 13.2, 13.5, 13.8_

- [x] 6. Progress Map and navigation UI
  - [x] 6.1 Implement Progress Map page
    - Create `src/pages/ProgressMapPage.tsx` with vertical scrollable path of 20 Day nodes + 5 Exam nodes
    - Group by weeks with visual separators; auto-scroll to current active node on load
    - Implement node states: locked (grey/dimmed), available (glowing pulse), in-progress (partial fill), completed (green checkmark)
    - Add Week separator labels and estimated time per day
    - _Requirements: 4.1, 4.2, 4.7_

  - [x] 6.2 Implement Progress Map header and interactions
    - Create fixed header with Level badge, XP counter, Streak counter (🔥), and daily goal indicator (empty/filled circle)
    - Implement tap interactions: completed node → summary popup (score, XP, time), available node → navigate to Day, locked node → toast message
    - Implement node completion animation (fill over 800ms) and path illumination with Framer Motion
    - Display skeleton placeholders while loading
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 11.5_

  - [ ]* 6.3 Write unit tests for Progress Map
    - Test node state rendering, tap interactions, auto-scroll, skeleton loading state
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

- [x] 7. Task Renderers — Standard types
  - [x] 7.1 Implement TaskRenderer dispatcher component
    - Create `src/components/tasks/TaskRenderer.tsx` that determines task type and renders appropriate component
    - Accept `TaskRendererProps` (task, onComplete, isRetry)
    - Handle correct/incorrect feedback: green checkmark + confetti (1.5s) for correct, red highlight + shake (300ms) + explanation for incorrect
    - Play success sound on correct (if sound enabled)
    - _Requirements: 6.1, 6.14, 11.1, 11.2_

  - [x] 7.2 Implement QuizTask component
    - Create `src/components/tasks/QuizTask.tsx` with question + 4 options layout
    - Highlight correct (green) or incorrect (red) on selection
    - Display explanation paragraph after answer
    - _Requirements: 6.2_

  - [x] 7.3 Implement FillBlankTask component
    - Create `src/components/tasks/FillBlankTask.tsx` with sentence display and blank indicators
    - Support both text input (case-insensitive, trimmed) and word bank (4–5 options) modes
    - _Requirements: 6.11_

  - [x] 7.4 Implement DragMatchTask component
    - Create `src/components/tasks/DragMatchTask.tsx` with two columns (4–6 pairs)
    - Implement drag-and-drop via Framer Motion; validate after all pairs placed; show green/red per pair
    - Implement keyboard-accessible alternative: select term → select definition (for screen readers)
    - _Requirements: 6.10, 12.9_

  - [x] 7.5 Implement AudioTermTask component
    - Create `src/components/tasks/AudioTermTask.tsx` with audio playback (max 3 replays) and 4 option buttons
    - Implement audio load failure fallback: display English term as text instead
    - _Requirements: 6.12, 6.13_

  - [ ]* 7.6 Write unit tests for standard task types
    - Test QuizTask option selection and feedback display
    - Test FillBlankTask validation (case-insensitive, trimmed, word bank)
    - Test DragMatchTask pair validation and keyboard alternative
    - Test AudioTermTask replay limit and fallback
    - _Requirements: 6.2, 6.10, 6.11, 6.12, 6.13_

- [x] 8. Task Renderers — Simulation types
  - [x] 8.1 Implement EmailSimTask component
    - Create `src/components/tasks/EmailSimTask.tsx` with inbox UI (sender, subject, body) and 3–4 response options
    - Display consequence feedback after selection
    - _Requirements: 6.4_

  - [x] 8.2 Implement PhoneDialogTask component
    - Create `src/components/tasks/PhoneDialogTask.tsx` with chat-bubble interface
    - Implement 3–5 turn conversation with 2–3 reply options per turn
    - Complete dialog when all turns exhausted or conversation-ending option selected
    - _Requirements: 6.5_

  - [x] 8.3 Implement CalculatorTask component
    - Create `src/components/tasks/CalculatorTask.tsx` with problem description, context, and numeric input
    - Validate answer using ±2% tolerance logic from `src/logic/scoring.ts`
    - Display unit label and formatted result feedback
    - _Requirements: 6.6_

  - [x] 8.4 Implement MapRoutingTask component
    - Create `src/components/tasks/MapRoutingTask.tsx` with simplified US map showing 3–4 route options
    - Display origin, destination, mileage, and rate per route
    - Require student to select lowest cost-per-mile route
    - _Requirements: 6.7_

  - [x] 8.5 Implement CrisisTask component
    - Create `src/components/tasks/CrisisTask.tsx` with 60-second countdown timer
    - Display problem description with 3–4 solution options
    - Auto-fail if timer reaches zero (show correct answer); mark passed if correct selected before expiry
    - Implement animated countdown timer with urgency visual states
    - _Requirements: 6.8_

  - [x] 8.6 Implement DocReviewTask component
    - Create `src/components/tasks/DocReviewTask.tsx` with Rate Con/BOL document display
    - Render 3–5 fields with intentional errors; track taps on erroneous and non-erroneous fields
    - Calculate score using `calculateDocReviewScore()` formula; each incorrect tap = -10% penalty (min 0%)
    - _Requirements: 6.9_

  - [ ]* 8.7 Write unit tests for simulation task types
    - Test EmailSimTask feedback display
    - Test PhoneDialogTask multi-turn flow and completion
    - Test CalculatorTask tolerance validation integration
    - Test MapRoutingTask route selection logic
    - Test CrisisTask timer expiry and success paths
    - Test DocReviewTask score calculation with taps
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ] 9. Checkpoint — Task renderers verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Day lesson view and task flow
  - [x] 10.1 Implement Day lesson page
    - Create `src/pages/DayPage.tsx` that loads day content via content-loader
    - Display tasks sequentially; track completion progress (partial fill on Progress Map node)
    - Show loading skeleton while content loads; display error + retry on fetch failure
    - _Requirements: 3.3, 13.2, 13.7, 13.8_

  - [x] 10.2 Implement Day completion flow
    - On all tasks completed: calculate mean score, invoke `unlockNextDay` if mean ≥ 70%
    - Display completion summary card (XP earned, accuracy %, time spent, "Продолжить" button)
    - Award XP (base + bonuses), update streak, save to Firestore
    - If mean < 70%: allow immediate retry of any task, keep next day locked
    - _Requirements: 3.3, 3.8, 5.1, 5.2, 11.3_

  - [ ]* 10.3 Write unit tests for Day lesson flow
    - Test task sequential progression, score calculation, unlock logic integration
    - Test completion summary display, retry flow when < 70%
    - _Requirements: 3.3, 3.8, 11.3_

- [x] 11. Flashcard review system
  - [x] 11.1 Implement Flashcard review page
    - Create `src/pages/FlashcardPage.tsx` with card front (English term) / back (Russian definition + example) flip interaction
    - Show self-rating buttons (Снова, Трудно, Хорошо, Легко) after reveal
    - Integrate with SM-2 engine to schedule next review after rating
    - Display daily stats: cards reviewed today, cards remaining, retention rate (Good+Easy / total last 30 days)
    - Show "no cards due" message with next review date when queue empty
    - _Requirements: 7.1, 7.3, 7.4, 7.9, 7.10_

  - [ ]* 11.2 Write unit tests for Flashcard page
    - Test card flip interaction, rating button integration with SM-2
    - Test due card filtering and empty state display
    - Test retention rate calculation
    - _Requirements: 7.3, 7.9, 7.10_

- [x] 12. Exam system (Mini-Exams and Final Exam)
  - [x] 12.1 Implement Mini-Exam page
    - Create `src/pages/ExamPage.tsx` (shared for mini and final) with progress bar, question counter "N/25", and 45-min timer
    - Load questions via `selectMiniExamQuestions(weekId, pool)` ensuring ≥3 per required type
    - Implement timer auto-submit on expiry; count only answered questions as correct
    - On pass (≥70%): award 50 XP, unlock next week's Day 1 or Final_Exam
    - On fail: show per-topic breakdown, enforce 30-min cooldown, allow retake with regenerated questions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 12.2 Implement Final Exam flow
    - Extend ExamPage to support final exam mode: 100 questions, 90-min timer, 80% threshold
    - Load questions via `selectFinalExamQuestions(pool)` — 50 terminology + 50 situational, ≥4 per module
    - On pass: award 100 XP, generate certificate, trigger full-screen confetti (3s)
    - On fail: show per-module breakdown, enforce 24h cooldown
    - Implement session persistence (answers + remaining time in localStorage) for interruption recovery
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.9_

  - [x] 12.3 Implement Certificate generation and display
    - Create `src/pages/CertificatePage.tsx` with certificate preview
    - Implement PDF generation using jsPDF: student name, date, score, unique certificate ID
    - Add download PDF button and copy shareable link functionality
    - Store certificateId in Firestore progress
    - _Requirements: 9.5, 9.8_

  - [ ]* 12.4 Write unit tests for exam system
    - Test question selection constraints (count, type distribution, module coverage)
    - Test timer auto-submit, cooldown enforcement, score calculation
    - Test certificate PDF generation with correct fields
    - Test session interruption recovery from localStorage
    - _Requirements: 8.2, 8.5, 9.2, 9.4, 9.6, 9.9_

- [ ] 13. Checkpoint — Feature integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Gamification animations and feedback
  - [ ] 14.1 Implement gamification animation components
    - Create `src/components/animations/ConfettiAnimation.tsx` using Framer Motion (correct answer: 1.5s, exam pass: 3s)
    - Create `src/components/animations/LevelUpModal.tsx` — full-screen modal with level number, Russian title, progress ring (1s fill), "Продолжить" button
    - Create `src/components/animations/StreakBadge.tsx` — badge animation (2s) for milestones 3/7/14/30 with congratulatory Russian message
    - Create `src/components/animations/ShakeAnimation.tsx` — 300ms horizontal shake for incorrect answers
    - Ensure all animations run at 60fps using Framer Motion
    - _Requirements: 11.1, 11.2, 11.4, 11.6, 11.7_

  - [ ] 14.2 Implement sound system
    - Create `src/services/sound.ts` with success sound effect playback (≤1s duration)
    - Integrate with UIStore.soundEnabled toggle
    - Mute if sound disabled in settings
    - _Requirements: 11.1_

  - [ ]* 14.3 Write unit tests for animation triggers
    - Test LevelUpModal display on level threshold cross
    - Test StreakBadge display at milestone values
    - Test sound mute when disabled
    - _Requirements: 11.1, 11.4, 11.6_

- [ ] 15. Responsive design, accessibility, and settings
  - [ ] 15.1 Implement responsive layout and AppLayout component
    - Create `src/components/layout/AppLayout.tsx` with responsive container
    - Implement breakpoints: mobile (320–767px), tablet (768–1023px), desktop (1024px+)
    - Ensure minimum 44×44px touch targets on mobile; no horizontal overflow
    - Implement dark theme as default with correct text colors (#fff/#e2e8f0 primary, #94a3b8 secondary minimum)
    - Ensure min font size 14px body, 12px labels; 4.5:1 contrast ratio for all text
    - _Requirements: 1.5, 12.1, 12.2, 12.3, 12.4, 12.5, 12.8_

  - [ ] 15.2 Implement keyboard navigation and ARIA accessibility
    - Add keyboard navigation for desktop (1024px+): Tab for focus, Enter for selection, Escape for dismiss, Arrow keys for grouped controls
    - Add visible focus indicators (2px outline, 3:1 contrast)
    - Add semantic HTML and ARIA labels for all interactive components
    - Implement accessible drag-and-drop alternative (select-based matching)
    - _Requirements: 12.6, 12.7, 12.9_

  - [ ] 15.3 Implement Settings page
    - Create `src/pages/SettingsPage.tsx` with sound toggle and other preferences
    - All labels in Russian
    - _Requirements: 11.1, 13.3_

  - [ ]* 15.4 Write accessibility tests
    - Run axe-core checks on critical pages (Login, Progress Map, Day view, Exam)
    - Test keyboard navigation flow on all 11 task types
    - Test focus indicator visibility and contrast
    - _Requirements: 12.6, 12.7_

- [ ] 16. Service Worker and offline support
  - [ ] 16.1 Implement Workbox Service Worker configuration
    - Create `src/sw.ts` with Workbox precaching for app shell and runtime caching for lesson JSON/audio
    - Configure strategies: CacheFirst for static assets, StaleWhileRevalidate for lesson content
    - Implement registration in `src/main.tsx` with console warning on registration failure
    - Ensure previously viewed days available offline via SW cache
    - _Requirements: 1.7, 1.8, 13.6, 13.9_

  - [ ] 16.2 Implement offline indicator and queue display
    - Add persistent offline indicator visible on all screens when Firestore unreachable
    - Display pending sync count; clear on successful sync
    - Integrate with UIStore.isOffline and pendingSyncCount
    - _Requirements: 2.7_

  - [ ]* 16.3 Write unit tests for Service Worker and offline behavior
    - Test SW registration success and failure paths
    - Test offline indicator display/hide based on connectivity
    - Test cache hit for previously loaded content
    - _Requirements: 1.7, 1.8, 13.9_

- [ ] 17. Performance optimization and bundle verification
  - [ ] 17.1 Implement performance optimizations
    - Configure Vite build for optimal code splitting; verify initial JS bundle < 200KB gzipped
    - Implement lazy loading for all route-level pages
    - Add loading skeletons for all content areas (Progress Map nodes, Day content)
    - Verify Time to Interactive < 3s on simulated 4G (Lighthouse CI)
    - _Requirements: 1.6, 13.1, 13.7_

  - [ ]* 17.2 Write performance budget tests
    - Add CI script to check bundle size < 200KB gzipped
    - Add Lighthouse CI configuration for TTI and LCP metrics
    - _Requirements: 1.6, 13.1_

- [ ] 18. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breaks
- Property tests validate the 13 universal correctness properties defined in the design
- Unit tests validate specific examples, edge cases, and component behavior
- All UI text is in Russian; English dispatch terms preserved as-is
- The design uses TypeScript throughout — all code examples and implementation use TypeScript
- Content migration (Task 5.1) is the largest effort, requiring parsing 12 HTML modules into structured JSON

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "2.5", "2.8", "2.17"] },
    { "id": 4, "tasks": ["2.4", "2.6", "2.7", "2.9", "2.10", "2.18", "2.19"] },
    { "id": 5, "tasks": ["2.11", "2.12", "2.13", "2.20", "2.22"] },
    { "id": 6, "tasks": ["2.14", "2.15", "2.16", "2.21"] },
    { "id": 7, "tasks": ["4.1", "5.1", "5.2"] },
    { "id": 8, "tasks": ["4.2", "5.3", "4.3"] },
    { "id": 9, "tasks": ["5.4", "6.1"] },
    { "id": 10, "tasks": ["6.2", "7.1"] },
    { "id": 11, "tasks": ["6.3", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 12, "tasks": ["7.6", "8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 13, "tasks": ["8.7", "10.1"] },
    { "id": 14, "tasks": ["10.2", "11.1"] },
    { "id": 15, "tasks": ["10.3", "11.2", "12.1"] },
    { "id": 16, "tasks": ["12.2", "12.3"] },
    { "id": 17, "tasks": ["12.4", "14.1", "14.2"] },
    { "id": 18, "tasks": ["14.3", "15.1"] },
    { "id": 19, "tasks": ["15.2", "15.3", "16.1"] },
    { "id": 20, "tasks": ["15.4", "16.2"] },
    { "id": 21, "tasks": ["16.3", "17.1"] },
    { "id": 22, "tasks": ["17.2"] }
  ]
}
```
