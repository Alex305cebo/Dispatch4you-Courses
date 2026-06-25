# Requirements Document

## Introduction

Dispatch Academy App — полностью самостоятельное React-приложение (Vite + React 18 + TypeScript), размещённое в отдельной папке `dispatch-academy-app/` со своей точкой входа. Приложение объединяет 12 обучающих модулей, тестирование, флеш-карточки и симуляторы в единую геймифицированную интерактивную платформу в стиле Duolingo. Целевая аудитория — русскоязычные студенты, обучающиеся диспетчерству грузоперевозок в США. Платформа организована как 4-недельный курс (20 учебных дней) от новичка до сертифицированного диспетчера, с разнообразными типами заданий, системой прогрессии XP/уровни/серии и Firebase-интеграцией для аутентификации и сохранения прогресса.

## Glossary

- **Academy_App**: Самостоятельное React SPA-приложение Dispatch Academy, размещённое в отдельной папке `dispatch-academy-app/` и развёрнутое по собственному пути
- **Student**: Зарегистрированный пользователь, проходящий обучение в Academy_App
- **Day**: Учебная единица (урок-день) внутри 4-недельной структуры курса; всего 20 дней
- **Week**: Группа из 5 учебных дней, объединённых общей темой; всего 4 недели
- **Task**: Интерактивное задание внутри учебного дня (quiz, flashcard, simulation и т.д.)
- **XP**: Очки опыта, начисляемые за выполнение заданий
- **Level**: Уровень студента (1–10), определяемый накопленным XP
- **Streak**: Счётчик непрерывных календарных дней обучения подряд
- **Progress_Map**: Визуальная карта прогрессии по дням курса в стиле Duolingo (вертикальный путь с узлами)
- **Spaced_Repetition_Engine**: Компонент, реализующий алгоритм интервального повторения SM-2 для флеш-карточек
- **Crisis_Timer**: Таймер обратного отсчёта в кризисных сценариях, ограничивающий время принятия решения
- **Mini_Exam**: Еженедельный экзамен по итогам недели (25 вопросов, порог 70%)
- **Final_Exam**: Итоговый экзамен (100 вопросов, порог 80%) с выдачей сертификата
- **Certificate**: PDF-документ, выдаваемый при успешной сдаче Final_Exam, содержащий имя студента, дату, балл и уникальный ID
- **Firebase_Backend**: Сервисы Firebase (Auth + Firestore), используемые для аутентификации и хранения прогресса
- **TaskRenderer**: Компонент, определяющий тип задания и рендерящий соответствующий интерактивный виджет
- **Content_JSON**: Структурированные JSON-файлы с учебным контентом, мигрированным из существующих HTML-модулей

## Requirements

### Requirement 1: Standalone Application Architecture

**User Story:** As a student, I want to access Dispatch Academy as a fast, standalone application with its own URL, so that I have a dedicated learning environment separate from the main site.

#### Acceptance Criteria

1. THE Academy_App SHALL be a standalone React single-page application built with Vite and TypeScript, located in a separate `dispatch-academy-app/` folder within the workspace root
2. THE Academy_App SHALL have its own `package.json`, `vite.config.ts`, `index.html`, and independent build pipeline that produces a deployable static bundle
3. THE Academy_App SHALL use React Router v6 for client-side navigation between all screens (Progress_Map, lessons, exams, flashcards, settings) with route-based code splitting
4. THE Academy_App SHALL use Zustand for global state management (student progress, XP, streaks, current day)
5. THE Academy_App SHALL render correctly on viewports from 320px to 1920px width following mobile-first responsive design without horizontal overflow
6. THE Academy_App SHALL load the initial screen (Progress_Map) within 3 seconds on a 4G mobile connection (measured as Time to Interactive)
7. THE Academy_App SHALL support offline access to previously loaded lesson content via Service Worker caching with Workbox, serving cached content when the network is unavailable
8. IF the Service Worker fails to register, THEN THE Academy_App SHALL continue functioning without offline support and log a warning to the browser console

### Requirement 2: Authentication and Data Persistence

**User Story:** As a student, I want my progress to be saved and synchronized across devices, so that I can continue learning from any browser without losing data.

#### Acceptance Criteria

1. THE Firebase_Backend SHALL authenticate students using Firebase Auth with email/password and Google sign-in methods
2. WHEN a Student signs in for the first time, THE Academy_App SHALL create a Firestore document with initial progress state (Level 1, 0 XP, Day 1 unlocked, Streak 0, empty flashcard states)
3. WHEN a Student completes a Task, THE Academy_App SHALL save the updated progress to Firestore within 2 seconds of completion
4. WHEN a Student opens Academy_App on a new device, THE Academy_App SHALL load the latest progress from Firestore within 5 seconds and restore the session state including XP, Level, Streak, Day unlock status, and flashcard review states
5. IF Firestore is unreachable for more than 5 seconds during a save operation, THEN THE Academy_App SHALL cache up to 50 progress updates in localStorage and synchronize them when connectivity resumes using a per-field maximum value merge strategy (highest XP, highest Level, furthest Day unlocked, longest Streak, latest flashcard review dates)
6. THE Academy_App SHALL display a login screen with Russian-language UI before granting access to course content
7. IF Firestore is unreachable for more than 5 seconds during initial load, THEN THE Academy_App SHALL serve progress from localStorage cache and display a persistent visual offline indicator visible on all screens until connectivity is restored
8. IF a Student's authentication attempt fails, THEN THE Academy_App SHALL display an error message indicating the failure reason (invalid credentials, network error, or account not found) and remain on the login screen preserving any entered email address

### Requirement 3: Course Structure — 4-Week Journey

**User Story:** As a student, I want a clearly structured 20-day learning path, so that I can follow a logical progression from beginner to certified dispatcher.

#### Acceptance Criteria

1. THE Academy_App SHALL organize content into 4 Weeks, each containing 5 Days, for a total of 20 Days
2. THE Academy_App SHALL assign thematic focus to each Week: Week 1 — Industry Foundations (Modules 1–3), Week 2 — Operations (Modules 4–6), Week 3 — Business Skills (Modules 7–9), Week 4 — Advanced and Certification (Modules 10–12 plus Final_Exam)
3. WHEN a Student completes all Tasks in a Day with an average score of 70% or higher (calculated as the arithmetic mean of individual Task scores within that Day), THE Academy_App SHALL unlock the next sequential Day within 2 seconds
4. WHILE a Day has status "locked", THE Academy_App SHALL prevent navigation to that Day and display a lock icon overlay on that Day's Progress_Map node
5. WHEN a Student completes all 5 Days of a Week, THE Academy_App SHALL unlock the Mini_Exam for that Week
6. THE Academy_App SHALL display estimated completion time per Day (30–60 minutes) on the Progress_Map node
7. IF a Student attempts to navigate to a locked Day, THEN THE Academy_App SHALL redirect to the Progress_Map and display a toast message for 5 seconds indicating which prerequisite Day must be completed first
8. IF a Student completes all Tasks in a Day with an average score below 70%, THEN THE Academy_App SHALL keep the next Day locked and allow the Student to immediately retry any Task within the current Day to improve their score

### Requirement 4: Progress Map (Duolingo-style Visual Path)

**User Story:** As a student, I want to see a visual map of my journey through the course, so that I feel motivated by my progress and know what comes next.

#### Acceptance Criteria

1. THE Progress_Map SHALL display all 20 Day nodes on a scrollable vertical path, grouped by Week with visual separators, and SHALL auto-scroll to the Student's current active node on initial load
2. THE Progress_Map SHALL indicate each Day node's state using distinct visual styles: locked (grey, dimmed), available (glowing border pulse), in-progress (partial circular fill reflecting percentage of Tasks completed), completed (green checkmark with solid fill)
3. THE Progress_Map SHALL show the Student's current Level badge, total XP counter, and Streak counter (with fire emoji) in a fixed header bar that remains visible during scrolling
4. WHEN a Student taps a completed Day node, THE Progress_Map SHALL display a summary popup showing score percentage, XP earned, and time spent, dismissible by tapping outside the popup or a close button
5. WHEN a Student taps an available Day node, THE Academy_App SHALL navigate to that Day's lesson view
6. IF a Student taps a locked Day node, THEN THE Progress_Map SHALL display a brief indication that the previous Day must be completed first, without navigating away
7. THE Progress_Map SHALL include Mini_Exam nodes at the end of each Week section and a Final_Exam node at the end of Week 4, using the same state indicators as Day nodes (locked, available, completed)
8. WHEN a Day is completed, THE Progress_Map SHALL animate the node transition from in-progress to completed (fill animation completing within 800 milliseconds) and illuminate the path segment to the next node
9. WHILE the Progress_Map is loading Student progress data, THE Progress_Map SHALL display a skeleton placeholder for all nodes until data is fully rendered

### Requirement 5: XP, Levels, and Streaks Gamification System

**User Story:** As a student, I want to earn XP, level up, and maintain a daily streak, so that I am motivated to study consistently and track my growth.

#### Acceptance Criteria

1. WHEN a Student completes a Task for the first time with any score, THE Academy_App SHALL award base XP: 10 XP for standard tasks (quiz, fill-blank, matching), 20 XP for simulation tasks (email-sim, phone-dialog, crisis, calculator, map, document-review), 50 XP for passing a Mini_Exam, 100 XP for passing the Final_Exam
2. THE Academy_App SHALL award bonus XP: +5 XP for a perfect score (100%) on any Task on the first attempt, +10 XP for completing a full Day with 100% accuracy on all Tasks within that Day
3. THE Academy_App SHALL define 10 Levels based on cumulative XP thresholds: Level 1 "Наблюдатель" (0 XP), Level 2 "Стажёр" (100 XP), Level 3 "Новичок" (250 XP), Level 4 "Ученик" (500 XP), Level 5 "Помощник" (1000 XP), Level 6 "Диспетчер" (1500 XP), Level 7 "Специалист" (2000 XP), Level 8 "Эксперт" (2500 XP), Level 9 "Мастер" (3000 XP), Level 10 "Профи" (4000 XP)
4. WHEN a Student's cumulative XP crosses a Level threshold, THE Academy_App SHALL display a full-screen level-up modal with the new level number, title, and motivational message; the modal SHALL remain visible until the Student taps a dismiss button or outside the modal area
5. THE Academy_App SHALL increment the Streak counter by 1 for each calendar day (midnight-to-midnight in the Student's local timezone) during which the Student completes at least one Task
6. IF a Student does not complete any Task for a full calendar day (midnight-to-midnight in the Student's local timezone), THEN THE Academy_App SHALL reset the Streak counter to 0 upon the Student's next session start
7. THE Academy_App SHALL display the current Streak with a fire emoji (🔥) and day count in the Progress_Map header
8. WHEN a Student achieves a Streak milestone (3, 7, 14, 30 days), THE Academy_App SHALL display a milestone badge animation
9. IF a Student retries a previously completed Task, THEN THE Academy_App SHALL NOT award additional base XP or bonus XP for that Task

### Requirement 6: Diverse Interactive Task Types

**User Story:** As a student, I want varied types of exercises that simulate real dispatcher work, so that I practice practical skills in an engaging way beyond multiple-choice.

#### Acceptance Criteria

1. THE Academy_App SHALL support 11 Task types: multiple-choice quiz, flashcard review, email/inbox simulation, phone call dialog, calculator task, map-based routing, crisis scenario with timer, document review, drag-and-drop matching, fill-in-the-blank, and audio term identification
2. WHEN a Task is of type multiple-choice quiz, THE Academy_App SHALL present a question with 4 answer options, highlight correct answer in green or incorrect in red on selection, and display an explanation paragraph
3. WHEN a Task is of type flashcard review, THE Spaced_Repetition_Engine SHALL present the card front (English term), reveal the back on tap (Russian definition plus example sentence), and collect a self-rating (Again, Hard, Good, Easy) to schedule the next review
4. WHEN a Task is of type email simulation, THE Academy_App SHALL present an inbox UI with a broker email and provide 3–4 response options, displaying consequence feedback after selection
5. WHEN a Task is of type phone call dialog, THE Academy_App SHALL present a chat-bubble conversation interface with 3–5 turns where the Student selects dialog replies from 2–3 options at each turn; the dialog SHALL complete when all turns are exhausted or the Student selects a conversation-ending option
6. WHEN a Task is of type calculator, THE Academy_App SHALL present a numeric problem (rate-per-mile, margin calculation, fuel cost estimate) with a numeric input field and validate the Student's answer within ±2% tolerance of the correct value (for non-zero answers: |input - correct| / |correct| ≤ 0.02; for zero: input must equal 0)
7. WHEN a Task is of type map-based routing, THE Academy_App SHALL display a simplified US map with 3–4 route options showing origin, destination, and mileage, and require the Student to select the route with the lowest cost-per-mile based on given rate and distance data
8. WHEN a Task is of type crisis scenario, THE Crisis_Timer SHALL start a 60-second countdown; THE Academy_App SHALL present a problem description with 3–4 solution options; IF the Crisis_Timer reaches zero before the Student selects an option, THEN THE Academy_App SHALL mark the Task as failed and display the correct answer; IF the Student selects the correct option before time expires, THE Academy_App SHALL mark the Task as passed and display a success confirmation
9. WHEN a Task is of type document review, THE Academy_App SHALL display a Rate Con or BOL document with 3–5 intentional errors and require the Student to tap on all erroneous fields; each incorrect tap SHALL incur a 10% score penalty (minimum score 0%); the Task score SHALL equal 100% minus penalties minus (percentage of missed errors × 100 / total errors)
10. WHEN a Task is of type drag-and-drop matching, THE Academy_App SHALL present two columns with 4–6 pairs (terms and definitions) and require the Student to match all pairs by dragging items; THE Academy_App SHALL validate matches only after all pairs are placed and display which pairs are correct (green) and incorrect (red)
11. WHEN a Task is of type fill-in-the-blank, THE Academy_App SHALL display a sentence with one or more blanks and provide either a text input (validated case-insensitively with leading/trailing whitespace trimmed) or a word bank of 4–5 options for completion
12. WHEN a Task is of type audio term identification, THE Academy_App SHALL play an English dispatch term audio clip and present 4 written options for the Student to identify the correct term; the Student SHALL be able to replay the audio up to 3 times
13. IF an audio file fails to load for an audio term identification Task, THEN THE Academy_App SHALL display the English term as text instead and present the same 4 options
14. WHEN a Student answers any Task incorrectly, THE Academy_App SHALL display the correct answer with an explanation before allowing the Student to proceed to the next Task

### Requirement 7: Flashcard System with Spaced Repetition (SM-2)

**User Story:** As a student, I want flashcards that automatically repeat at optimal intervals based on how well I know them, so that I memorize 80 dispatch terms efficiently.

#### Acceptance Criteria

1. THE Academy_App SHALL contain all 80 flashcards from the existing trainer-data.js, organized by 9 categories (Термины, Переговоры, Документы, Проблемы, Технологии, Маршруты, Финансы, Брокеры, Безопасность)
2. THE Spaced_Repetition_Engine SHALL implement the SM-2 algorithm with per-card tracking: ease factor (minimum 1.3, default 2.5), interval in days (initial interval 1 day for first successful review, 6 days for second successful review, then calculated; maximum interval 365 days), repetition count, and next review date
3. WHEN a Student opens the flashcard review screen and cards are due for review, THE Spaced_Repetition_Engine SHALL present only cards whose next review date is on or before today, sorted by overdue time (most overdue first)
4. THE Academy_App SHALL display each flashcard with the English term on the front and Russian definition plus example sentence on the back
5. WHEN a Student rates a flashcard as "Again", THE Spaced_Repetition_Engine SHALL reset the card interval to 1 day, decrease the ease factor by 0.2 (minimum 1.3), and reset repetition count to 0
6. WHEN a Student rates a flashcard as "Hard", THE Spaced_Repetition_Engine SHALL multiply the current interval by 1.2 (rounded up to the nearest whole day), and decrease the ease factor by 0.15 (minimum 1.3)
7. WHEN a Student rates a flashcard as "Good", THE Spaced_Repetition_Engine SHALL multiply the current interval by the current ease factor (rounded up to the nearest whole day) with no change to ease factor
8. WHEN a Student rates a flashcard as "Easy", THE Spaced_Repetition_Engine SHALL multiply the current interval by the ease factor multiplied by 1.3 (rounded up to the nearest whole day), and increase the ease factor by 0.15
9. THE Academy_App SHALL show daily flashcard review statistics on the flashcard screen: cards reviewed today, cards remaining for today, and retention rate calculated as the percentage of reviews rated "Good" or "Easy" out of total reviews in the last 30 days
10. IF a Student opens the flashcard review screen and no cards are due for review, THEN THE Academy_App SHALL display a message indicating no cards are due and show the date of the next scheduled review

### Requirement 8: Weekly Mini-Exams

**User Story:** As a student, I want weekly exams that test cumulative knowledge from the completed week, so that I confirm mastery before advancing to the next week.

#### Acceptance Criteria

1. WHEN a Student completes all 5 Days of a Week, THE Academy_App SHALL unlock the corresponding Mini_Exam for that Week
2. THE Mini_Exam SHALL contain 25 questions drawn exclusively from the completed Week's topics, including at least 3 questions of each type (multiple-choice, fill-in-the-blank, calculator, matching) with the remaining questions distributed randomly among those types
3. THE Academy_App SHALL display a progress bar, a question counter in the format "N/25", and a countdown timer with a 45-minute time limit during the Mini_Exam
4. WHEN a Student scores 70% or higher on a Mini_Exam, THE Academy_App SHALL mark the exam as passed, award 50 XP, and unlock the next Week's Day 1 (or the Final_Exam if Week 4)
5. IF a Student scores below 70% on a Mini_Exam, THEN THE Academy_App SHALL allow unlimited retakes after a 30-minute cooldown period, regenerate the question set from the same Week's question pool, and display a per-topic breakdown of incorrect answers
6. IF the 45-minute timer expires before submission, THEN THE Academy_App SHALL auto-submit the Mini_Exam with only answered questions counted as correct
7. THE Academy_App SHALL display detailed results after Mini_Exam completion: correct and incorrect count per topic, total time spent, and a list of topics where the Student scored below 70% labeled as areas for review

### Requirement 9: Final Exam and Certificate Generation

**User Story:** As a student, I want a comprehensive final exam that certifies my dispatch knowledge, so that I can prove my competence with a certificate.

#### Acceptance Criteria

1. WHEN a Student passes all 4 Mini_Exams, THE Academy_App SHALL unlock the Final_Exam
2. THE Final_Exam SHALL contain 100 questions: 50 terminology questions and 50 situational questions, drawn from all 12 modules with a minimum of 4 questions per module
3. THE Academy_App SHALL enforce a 90-minute time limit for the Final_Exam with a visible countdown timer displayed in the header
4. IF the Final_Exam countdown timer reaches zero, THEN THE Academy_App SHALL automatically submit the exam with only answered questions counted as correct and unanswered questions counted as incorrect
5. WHEN a Student scores 80% or higher on the Final_Exam, THE Academy_App SHALL generate a Certificate as a downloadable PDF containing the Student's display name, completion date, score percentage, and a unique certificate ID
6. IF a Student scores below 80% on the Final_Exam, THEN THE Academy_App SHALL allow retaking after a 24-hour cooldown period and display a breakdown showing the number of correct and incorrect answers per module and a list of the modules where accuracy fell below 70%
7. WHEN a Student passes the Final_Exam, THE Academy_App SHALL award 100 XP and display a full-screen celebration animation with confetti lasting 3 seconds
8. THE Academy_App SHALL display a certificate preview on a dedicated Certificate screen accessible from the Progress_Map, with options to download the PDF and copy a shareable link to the certificate
9. IF a Student's browser session is interrupted during the Final_Exam (connection loss or navigation away), THEN THE Academy_App SHALL preserve the current answers and remaining time and allow the Student to resume the exam within the original time window

### Requirement 10: Content Migration from Existing Materials

**User Story:** As a course author, I want all existing educational content from the 12 module HTML pages, test questions, and flashcards integrated into the new platform as structured JSON, so that students access unified content without material loss.

#### Acceptance Criteria

1. THE Academy_App SHALL incorporate educational content from all 12 existing module pages (doc-module-1-complete.html through doc-module-12-complete.html) as structured JSON lesson data files in a `src/data/lessons/` directory, with each JSON file containing the module's section headings, text content, and references to associated audio files
2. THE Academy_App SHALL migrate all inline quizzes from each module (7 per module, 84 total) as multiple-choice Task items within the corresponding Day's lesson JSON, preserving for each quiz: the question text, all answer options (3 per question), and the correct answer indicator
3. THE Academy_App SHALL migrate the existing 50 terminology questions into the Mini_Exam pool and the existing 50 situational questions into the Final_Exam pool as structured exam JSON files, preserving for each question: the question text, all 4 answer options, and the correct answer index
4. THE Academy_App SHALL import all 80 flashcards from trainer-data.js into a structured `flashcards.json` file preserving the 6 source fields per card: card ID, category, difficulty level, English term, Russian definition, and example sentence
5. THE Academy_App SHALL present all migrated content in Russian with English dispatch industry terms displayed in their original English form without transliteration
6. WHEN content migration is complete, THE Academy_App SHALL validate migrated JSON content by confirming: 84 quiz items across 12 lesson files, 50 terminology questions in Mini_Exam pool, 50 situational questions in Final_Exam pool, and 80 flashcard entries — each with identical question text, terms, and definitions as the source HTML and JS files
7. IF a source content file (module HTML, testing.html, or trainer-data.js) cannot be parsed during migration, THEN THE Academy_App SHALL report an error indicating which file failed and how many items were not migrated

### Requirement 11: Gamification Animations and Feedback

**User Story:** As a student, I want immediate visual feedback and celebratory animations when I complete tasks, so that learning feels rewarding and engaging like a game.

#### Acceptance Criteria

1. WHEN a Student answers a Task correctly, THE Academy_App SHALL display a green checkmark animation with confetti particles lasting 1.5 seconds and play a success sound effect (duration ≤ 1 second); IF the Student has muted sounds in settings, THEN no sound SHALL play
2. WHEN a Student answers a Task incorrectly, THE Academy_App SHALL display the correct answer with red highlight, an explanation text, and a 300ms horizontal shake animation on the selected incorrect option
3. WHEN a Student completes all Tasks in a Day, THE Academy_App SHALL show a completion summary card with XP earned, accuracy percentage, time spent, and a "Continue" button that navigates back to the Progress_Map
4. WHEN a Student achieves a Streak milestone (3, 7, 14, 30 days), THE Academy_App SHALL display a badge animation lasting 2 seconds with the milestone number and a congratulatory message in Russian
5. THE Academy_App SHALL display a daily goal indicator on the Progress_Map header showing whether the Student has completed at least 1 Task today (empty circle = not done, filled green circle = done)
6. WHEN a Student levels up, THE Academy_App SHALL display a full-screen modal with the new level number, Russian title (e.g., "Стажёр", "Диспетчер", "Профи"), animated progress ring filling over 1 second, and a motivational message; the modal SHALL be dismissible by tapping a "Продолжить" button
7. THE Academy_App SHALL use Framer Motion for all animations to ensure smooth 60fps transitions on mobile devices

### Requirement 12: Responsive Design and Accessibility

**User Story:** As a student, I want to use the platform equally well on my phone, tablet, and desktop, so that I can study anywhere without UI issues.

#### Acceptance Criteria

1. THE Academy_App SHALL adapt layout across breakpoints: desktop (1024px and above), tablet (768px–1023px), and mobile (320px–767px), rendering content without overlap or truncation in both portrait and landscape orientations
2. THE Academy_App SHALL ensure all interactive elements (buttons, cards, drag targets, flashcard tap areas) have a minimum touch target of 44×44 pixels on mobile viewports
3. THE Academy_App SHALL support dark theme as the default, using light text colors (#fff or #e2e8f0 for primary text, no darker than #94a3b8 for secondary text) on dark backgrounds consistent with the dispatch4you.com parent site styling
4. THE Academy_App SHALL use minimum font size of 14px for body text and 12px for secondary labels
5. THE Academy_App SHALL ensure a color contrast ratio of at least 4.5:1 for all text content against its background
6. WHILE the viewport width is 1024px or above, THE Academy_App SHALL support keyboard navigation for all Task types (Tab to move focus between elements, Enter for selection, Escape for dismiss, Arrow keys for navigation within grouped controls) with a visible focus indicator of at least 2px outline that meets 3:1 contrast ratio against adjacent colors
7. THE Academy_App SHALL use semantic HTML elements and ARIA labels for screen reader compatibility on all interactive components
8. THE Academy_App SHALL prevent horizontal scrolling on all viewport sizes
9. WHEN a Task is of type drag-and-drop matching and the Student is using keyboard navigation or a screen reader, THE Academy_App SHALL provide an alternative selection-based interaction (e.g., select term then select matching definition) that achieves the same learning outcome without requiring pointer-based dragging

### Requirement 13: Performance, Code Splitting, and Localization

**User Story:** As a student with variable internet quality, I want the app to load quickly and work smoothly with all UI in Russian, so that I can study without frustration or language barriers.

#### Acceptance Criteria

1. THE Academy_App SHALL implement route-based code splitting so that the initial JavaScript bundle does not exceed 200KB gzipped
2. WHEN a Student navigates to a specific Day, THE Academy_App SHALL lazy-load that Day's lesson content JSON and media assets on demand rather than including them in the initial bundle
3. THE Academy_App SHALL display all user interface text (buttons, labels, navigation, messages, tooltips) in Russian as the primary and only UI language
4. THE Academy_App SHALL display dispatch industry terms (Rate Con, BOL, ELD, MC Number, RPM, HOS, etc.) in English within lesson content without transliteration
5. WHILE a Student has the current Day's content fully rendered on screen, THE Academy_App SHALL pre-fetch the next sequential Day's content JSON in the background at low priority so that it does not delay or degrade the current Day's rendering or interactivity
6. THE Academy_App SHALL cache lesson content via Service Worker so that previously viewed Days are available offline without re-download
7. WHILE Day data is being fetched, THE Academy_App SHALL display a loading skeleton (placeholder shapes matching the content layout) for content areas rather than a blank screen or spinner
8. IF Day content fetch fails or does not complete within 15 seconds, THEN THE Academy_App SHALL replace the loading skeleton with an error message indicating the content could not be loaded and a retry button that re-initiates the fetch
9. IF a Student navigates to a previously viewed Day while offline and the content is available in the Service Worker cache, THEN THE Academy_App SHALL serve the cached content without displaying an error
