# Requirements Document

## Introduction

Dispatch Academy — единое React-приложение (размещённое по адресу `/academy/` на dispatch4you.com), объединяющее 12 обучающих модулей, тестирование, флеш-карточки и симуляторы в геймифицированную интерактивную платформу в стиле Duolingo. Целевая аудитория — русскоязычные студенты, обучающиеся диспетчерству грузоперевозок в США. Платформа организована как 4-недельный курс (20 учебных дней) от новичка до сертифицированного диспетчера, с разнообразными типами заданий, системой прогрессии и Firebase-интеграцией для аутентификации и сохранения прогресса.

## Glossary

- **Academy_App**: React SPA-приложение Dispatch Academy, развёрнутое по пути `/academy/`
- **Student**: Зарегистрированный пользователь, проходящий обучение в Academy_App
- **Day**: Учебная единица (урок-день) внутри 4-недельной структуры курса; всего 20 дней
- **Week**: Группа из 5 учебных дней, объединённых общей темой; всего 4 недели
- **Task**: Интерактивное задание внутри учебного дня (quiz, flashcard, simulation и т.д.)
- **XP**: Очки опыта, начисляемые за выполнение заданий
- **Level**: Уровень студента, определяемый накопленным XP
- **Streak**: Счётчик непрерывных дней обучения подряд
- **Progress_Map**: Визуальная карта прогрессии по дням курса в стиле Duolingo
- **Spaced_Repetition_Engine**: Алгоритм повторения флеш-карточек на основе интервального повторения (SM-2)
- **Crisis_Timer**: Таймер обратного отсчёта в кризисных сценариях, ограничивающий время решения
- **Mini_Exam**: Еженедельный экзамен по итогам недели (25 вопросов)
- **Final_Exam**: Итоговый экзамен (100 вопросов) с выдачей сертификата
- **Certificate**: PDF-документ, выдаваемый при успешной сдаче Final_Exam
- **Firebase_Backend**: Сервисы Firebase (Auth + Firestore), используемые для аутентификации и хранения данных

## Requirements

### Requirement 1: Application Architecture and Deployment

**User Story:** As a student, I want to access the entire learning platform as a single, fast-loading application, so that I have a seamless learning experience without navigating between separate HTML pages.

#### Acceptance Criteria

1. THE Academy_App SHALL be a React single-page application built with Vite, deployed at the `/academy/` path on dispatch4you.com
2. THE Academy_App SHALL use React Router for client-side navigation between all screens (Progress_Map, lessons, exams, settings)
3. THE Academy_App SHALL use Zustand for global state management (student progress, XP, streaks, current day)
4. THE Academy_App SHALL render correctly on viewports from 320px to 1920px width following mobile-first responsive design
5. THE Academy_App SHALL load the initial screen within 3 seconds on a 4G mobile connection
6. THE Academy_App SHALL support offline access to previously loaded lesson content via Service Worker caching

### Requirement 2: Authentication and Data Persistence

**User Story:** As a student, I want my progress to be saved and synchronized across devices, so that I can continue learning from any browser.

#### Acceptance Criteria

1. THE Firebase_Backend SHALL authenticate students using Firebase Auth (email/password and Google sign-in methods)
2. WHEN a Student signs in for the first time, THE Academy_App SHALL create a Firestore document with initial progress state (Level 1, 0 XP, Day 1 unlocked, empty streak)
3. THE Academy_App SHALL save Student progress to Firestore after each completed Task within 2 seconds
4. WHEN a Student opens Academy_App on a new device, THE Academy_App SHALL load the latest progress from Firestore and restore the session state
5. IF Firestore is unreachable, THEN THE Academy_App SHALL cache progress updates in localStorage and synchronize them when connectivity resumes
6. THE Academy_App SHALL display a login screen with language toggle (Russian primary) before granting access to course content

### Requirement 3: Course Structure — 4-Week Journey

**User Story:** As a student, I want a clearly structured 20-day learning path, so that I can follow a logical progression from beginner to certified dispatcher.

#### Acceptance Criteria

1. THE Academy_App SHALL organize content into 4 Weeks, each containing 5 Days, for a total of 20 Days
2. THE Academy_App SHALL assign thematic focus to each Week: Week 1 — Industry Foundations (Modules 1–3), Week 2 — Operations (Modules 4–6), Week 3 — Business Skills (Modules 7–9), Week 4 — Advanced & Certification (Modules 10–12 + Final_Exam)
3. WHEN a Student completes all Tasks in a Day with a passing score of 70% or higher, THE Academy_App SHALL unlock the next Day
4. THE Academy_App SHALL lock Days beyond the current unlocked Day to prevent skipping ahead
5. WHEN a Student completes all 5 Days of a Week, THE Academy_App SHALL unlock the Mini_Exam for that Week
6. THE Academy_App SHALL display estimated time per Day (30–60 minutes)

### Requirement 4: Progress Map (Duolingo-style)

**User Story:** As a student, I want to see a visual map of my journey through the course, so that I feel motivated by my progress and know what comes next.

#### Acceptance Criteria

1. THE Progress_Map SHALL display all 20 Days as nodes on a scrollable vertical path, grouped by Week
2. THE Progress_Map SHALL indicate each Day's state: locked (grey), unlocked-available (glowing), in-progress (partial fill), completed (green checkmark)
3. THE Progress_Map SHALL show the Student's current Level, total XP, and Streak counter at the top of the screen
4. WHEN a Student taps a completed Day node, THE Progress_Map SHALL display a summary (score, XP earned, time spent)
5. WHEN a Student taps an unlocked-available Day node, THE Academy_App SHALL navigate to that Day's lesson view
6. THE Progress_Map SHALL include Mini_Exam nodes at the end of each Week and a Final_Exam node at the end of Week 4
7. THE Progress_Map SHALL animate transitions when a Day is completed (node fills, path illuminates to next node)

### Requirement 5: XP, Levels, and Streaks System

**User Story:** As a student, I want to earn XP, level up, and maintain a streak, so that I am motivated to study daily and track my growth.

#### Acceptance Criteria

1. THE Academy_App SHALL award XP for each completed Task: 10 XP for standard tasks, 20 XP for simulation tasks, 50 XP for Mini_Exams, 100 XP for Final_Exam
2. THE Academy_App SHALL award bonus XP: +5 XP for a perfect score (100%) on a Task, +10 XP for completing a full Day without errors
3. THE Academy_App SHALL define Levels based on cumulative XP thresholds: Level 1 (0 XP), Level 2 (100 XP), Level 3 (250 XP), Level 4 (500 XP), Level 5 (1000 XP), Level 6 (1500 XP), Level 7 (2000 XP), Level 8 (2500 XP), Level 9 (3000 XP), Level 10 (4000 XP)
4. WHEN a Student's cumulative XP crosses a Level threshold, THE Academy_App SHALL display a level-up animation with congratulatory message
5. THE Academy_App SHALL increment the Streak counter by 1 for each calendar day the Student completes at least one Task
6. IF a Student does not complete any Task for 24 hours (based on local midnight), THEN THE Academy_App SHALL reset the Streak counter to 0
7. THE Academy_App SHALL display the current Streak with a fire emoji and days count on the Progress_Map header

### Requirement 6: Diverse Interactive Task Types

**User Story:** As a student, I want varied types of exercises beyond multiple-choice, so that I practice real dispatcher skills in an engaging way.

#### Acceptance Criteria

1. THE Academy_App SHALL support the following Task types: multiple-choice quiz, flashcard with spaced repetition, email/inbox simulation, phone call dialog, calculator task, map-based task, crisis scenario with timer, document review, drag-and-drop matching, fill-in-the-blank, and audio pronunciation
2. WHEN a Task is of type multiple-choice quiz, THE Academy_App SHALL present a question with 4 answer options, highlight correct/incorrect on selection, and show an explanation
3. WHEN a Task is of type flashcard, THE Spaced_Repetition_Engine SHALL schedule card reviews using SM-2 intervals (1 day, 3 days, 7 days, 14 days, 30 days) based on Student self-rating (Easy/Good/Hard/Again)
4. WHEN a Task is of type email simulation, THE Academy_App SHALL present an inbox with a broker email and provide 3–4 response options with consequences displayed after selection
5. WHEN a Task is of type phone call dialog, THE Academy_App SHALL present a chat-style conversation with a broker where the Student selects dialog replies from 2–3 options at each turn
6. WHEN a Task is of type calculator, THE Academy_App SHALL present a numeric problem (margin calculation, RPM computation, fuel cost estimate) with an input field, and validate the answer within ±2% tolerance
7. WHEN a Task is of type map-based, THE Academy_App SHALL display a US map with route options and require the Student to select the optimal route or backhaul location
8. WHEN a Task is of type crisis scenario, THE Crisis_Timer SHALL start a 60-second countdown, and THE Academy_App SHALL present a problem with 3–4 solution options; IF the timer expires before selection, THEN THE Academy_App SHALL mark the Task as failed
9. WHEN a Task is of type document review, THE Academy_App SHALL display a Rate Con or BOL document with intentional errors, and require the Student to identify all errors by tapping highlighted fields
10. WHEN a Task is of type drag-and-drop matching, THE Academy_App SHALL present two columns (terms and definitions) and require the Student to match pairs by dragging items
11. WHEN a Task is of type fill-in-the-blank, THE Academy_App SHALL display a sentence with a missing word and provide a text input or word bank for completion
12. WHEN a Task is of type audio pronunciation, THE Academy_App SHALL play an English term audio clip and present 3–4 written options for the Student to identify the correct term

### Requirement 7: Flashcard System with Spaced Repetition

**User Story:** As a student, I want flashcards that automatically repeat at optimal intervals, so that I memorize terminology efficiently.

#### Acceptance Criteria

1. THE Academy_App SHALL import all 80 flashcards from the existing trainer-data.js organized by category (Термины, Переговоры, Документы, Проблемы, Технологии, Маршруты, Финансы, Брокеры, Безопасность)
2. THE Spaced_Repetition_Engine SHALL track per-card review state: next review date, ease factor, and interval
3. WHEN a Student opens the flashcard review screen, THE Spaced_Repetition_Engine SHALL present cards due for review sorted by overdue time (most overdue first)
4. THE Academy_App SHALL display each flashcard with the English term on front and Russian definition + example sentence on back
5. WHEN a Student rates a flashcard as "Again", THE Spaced_Repetition_Engine SHALL reset the card interval to 1 day and decrease the ease factor by 0.2 (minimum 1.3)
6. THE Academy_App SHALL show daily flashcard review statistics: cards reviewed, cards remaining, average retention rate

### Requirement 8: Weekly Mini-Exams

**User Story:** As a student, I want weekly exams that test cumulative knowledge, so that I confirm mastery before advancing.

#### Acceptance Criteria

1. WHEN a Student completes all 5 Days of a Week, THE Academy_App SHALL unlock the corresponding Mini_Exam
2. THE Mini_Exam SHALL contain 25 questions drawn from the completed Week's topics, mixing Task types (multiple-choice, fill-in-the-blank, calculator, matching)
3. THE Academy_App SHALL display a progress bar and question counter during the Mini_Exam
4. WHEN a Student scores 70% or higher on a Mini_Exam, THE Academy_App SHALL mark the exam as passed and award 50 XP
5. IF a Student scores below 70% on a Mini_Exam, THEN THE Academy_App SHALL allow retaking the exam after a 30-minute cooldown period
6. THE Academy_App SHALL display detailed results after Mini_Exam completion: correct/incorrect per topic, time spent, and recommendations for review

### Requirement 9: Final Exam and Certificate

**User Story:** As a student, I want a comprehensive final exam that certifies my knowledge, so that I can prove my competence as a dispatcher.

#### Acceptance Criteria

1. WHEN a Student passes all 4 Mini_Exams, THE Academy_App SHALL unlock the Final_Exam
2. THE Final_Exam SHALL contain 100 questions: 50 terminology questions and 50 situational questions, drawn from all 12 modules
3. THE Academy_App SHALL enforce a 90-minute time limit for the Final_Exam with a visible countdown timer
4. WHEN a Student scores 80% or higher on the Final_Exam, THE Academy_App SHALL generate a Certificate as a downloadable PDF containing the Student's name, completion date, score, and a unique certificate ID
5. IF a Student scores below 80% on the Final_Exam, THEN THE Academy_App SHALL allow retaking after a 24-hour cooldown period and display a breakdown of weak areas
6. THE Academy_App SHALL award 100 XP for passing the Final_Exam and display a celebration animation

### Requirement 10: Content Migration from Existing Modules

**User Story:** As a course author, I want all existing educational content integrated into the new platform, so that students access a unified experience without losing any material.

#### Acceptance Criteria

1. THE Academy_App SHALL incorporate educational content from all 12 existing module pages (doc-module-1-complete.html through doc-module-12-complete.html) as structured JSON lesson data
2. THE Academy_App SHALL migrate all 7 inline quizzes from each module (84 quizzes total) as multiple-choice Task items
3. THE Academy_App SHALL migrate the existing 50 terminology questions and 50 situational questions from testing.html into the exam question pools
4. THE Academy_App SHALL import all 80 flashcards from trainer-data.js preserving categories, difficulty levels, terms, definitions, and example sentences
5. THE Academy_App SHALL present migrated content in Russian with English terms displayed in their original form (not transliterated)

### Requirement 11: Gamification Feedback and Animations

**User Story:** As a student, I want immediate visual and auditory feedback when I complete tasks, so that learning feels rewarding and engaging.

#### Acceptance Criteria

1. WHEN a Student answers a Task correctly, THE Academy_App SHALL display a green success animation (checkmark with confetti particles) and play a success sound
2. WHEN a Student answers a Task incorrectly, THE Academy_App SHALL display the correct answer with a red highlight and explanation text
3. WHEN a Student completes a Day, THE Academy_App SHALL show a completion summary card with XP earned, accuracy percentage, and time spent
4. WHEN a Student achieves a new Streak milestone (3, 7, 14, 30 days), THE Academy_App SHALL display a milestone badge animation
5. THE Academy_App SHALL display a daily goal indicator (complete at least 1 Day per session) on the Progress_Map screen
6. WHEN a Student levels up, THE Academy_App SHALL display a full-screen level-up modal with the new level number, a title (e.g., "Стажёр", "Новичок", "Диспетчер", "Профи"), and a motivational message

### Requirement 12: Responsive Design and Accessibility

**User Story:** As a student, I want to use the platform on my phone and tablet equally well, so that I can study anywhere.

#### Acceptance Criteria

1. THE Academy_App SHALL adapt layout for viewports: desktop (1024px+), tablet (768px–1023px), mobile (320px–767px)
2. THE Academy_App SHALL ensure all interactive elements (buttons, cards, drag targets) have a minimum touch target of 44×44 pixels on mobile
3. THE Academy_App SHALL support both light and dark themes, defaulting to dark theme consistent with the parent site (dispatch4you.com)
4. THE Academy_App SHALL use minimum font size of 14px for body text and 12px for labels
5. THE Academy_App SHALL ensure color contrast ratio of at least 4.5:1 for all text content
6. THE Academy_App SHALL support keyboard navigation for all Task types on desktop

### Requirement 13: Performance and Localization

**User Story:** As a student with a variable internet connection, I want the app to load quickly and work smoothly, so that I can study without frustration.

#### Acceptance Criteria

1. THE Academy_App SHALL implement code splitting by route so that initial bundle size does not exceed 200KB gzipped
2. THE Academy_App SHALL lazy-load lesson content and assets only when a Student navigates to a specific Day
3. THE Academy_App SHALL display all UI text in Russian as the primary language
4. THE Academy_App SHALL display dispatch industry terms in English within lesson content (Rate Con, BOL, ELD, etc.) without transliteration
5. THE Academy_App SHALL pre-fetch the next Day's content when the Student is within the current Day to reduce perceived load time
