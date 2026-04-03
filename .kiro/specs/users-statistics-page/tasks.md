# Implementation Plan: Страница статистики пользователей

## Overview

Создание административной страницы `pages/users-stats.html` с полной аналитикой по всем студентам платформы. Единый HTML-файл с inline CSS/JS по паттерну проекта. Firebase Firestore для данных, Chart.js для графиков, role-guard.js для контроля доступа. Клиентская фильтрация/сортировка, экспорт CSV, адаптивный дизайн.

## Tasks

- [x] 1. Создать базовую структуру страницы и подключить зависимости
  - [x] 1.1 Создать файл `pages/users-stats.html` с HTML-скелетом
    - Подключить meta viewport, шрифт Inter, Font Awesome (CDN), Chart.js (CDN)
    - Подключить `shared-nav.css`, `nav-loader.js`, `role-guard.js`
    - Добавить `<div id="nav-placeholder">` для навигации
    - Добавить hero-секцию с заголовком «Статистика пользователей» и кратким описанием
    - Добавить контейнеры-заглушки для всех секций: overview, chart, leaderboard, controls, user cards, modal
    - Добавить inline `<style>` с CSS-переменными тёмной темы (из admin.html) и базовыми стилями контейнеров
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6, 12.7, 12.8, 1.3_

  - [x] 1.2 Реализовать авторизацию и загрузку данных из Firestore
    - Добавить inline `<script type="module">` с импортами Firebase SDK и `xp-system.js` (LEVELS, getLevelByXP, getNextLevel)
    - Реализовать проверку авторизации через `onAuthStateChanged` + проверку роли superuser
    - Отобразить сообщение об отсутствии доступа для не-superuser ролей
    - Реализовать функцию `loadAllUsers()` — `getDocs(collection(db, 'users'))`
    - Показывать индикатор загрузки (скелетон) во время запроса
    - Обработать ошибку Firestore: сообщение + кнопка «Повторить»
    - Реализовать функцию `processUser(doc)` — извлечение полей и расчёт производных метрик (уровень, точность, прогресс по курсу/модулям/кейсам/карточкам)
    - Использовать optional chaining и fallback-значения для отсутствующих полей
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Checkpoint — Проверить базовую структуру
  - Убедиться что страница открывается, role-guard работает, данные загружаются из Firestore
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Реализовать Overview Panel и Activity Chart
  - [x] 3.1 Реализовать Overview Panel (6 карточек статистики)
    - Реализовать функцию `calcOverviewStats(users)` — totalUsers, activeUsers7d, activeUsers30d, avgXP, avgCourseProgress, avgStreak
    - Реализовать рендеринг 6 карточек в grid (4 колонки десктоп, 2 планшет, 1 мобильный)
    - Стилизовать карточки по паттерну `.sc` из admin.html: тёмный фон, цветная полоска, иконка, значение крупным шрифтом
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 11.2_

  - [ ]* 3.2 Write property test for overview stats calculation
    - **Property 2: Корректность расчёта overview-статистик**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

  - [x] 3.3 Реализовать Activity Chart (график активности)
    - Реализовать функцию `prepareActivityChartData(users, period)` — подсчёт активных пользователей по дням
    - Создать линейный Chart.js график в контейнере `.cc`
    - Добавить переключатель периода: 7 дней / 30 дней (кнопки-табы)
    - Настроить цвета (--primary), tooltip, заливку с прозрачностью
    - Обработать случай когда Chart.js не загрузился — текст «График недоступен»
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 3.4 Write property test for activity chart data
    - **Property 3: Корректность данных графика активности**
    - **Validates: Requirements 4.1**

- [ ] 4. Реализовать Leaderboard и User Cards
  - [x] 4.1 Реализовать Leaderboard (топ-10)
    - Реализовать функцию `getLeaderboard(users, criterion)` — сортировка и срез топ-10
    - Добавить переключатель критерия: по XP / по streak / по общему прогрессу
    - Рендерить таблицу: ранг (🥇🥈🥉 для топ-3), аватар, имя, уровень (role-badge), значение
    - Использовать CSS-классы role-1...role-10 для бейджей уровней
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 12.5_

  - [ ]* 4.2 Write property test for leaderboard sorting
    - **Property 4: Корректность сортировки лидерборда**
    - **Validates: Requirements 5.1, 5.3**

  - [x] 4.3 Реализовать User Cards Grid (список карточек пользователей)
    - Реализовать функцию `renderUserCard(user)` — генерация HTML карточки
    - Карточка: аватар (photoURL или инициалы), имя, email, дата регистрации
    - Уровень + XP с цветным role-badge
    - 4 прогресс-бара: курс (N/15), модули (N/12), кейсы (N/50), карточки (N/80)
    - Streak, дата последней активности, точность ответов (%)
    - Grid: 3 колонки десктоп, 2 планшет, 1 мобильный
    - Добавить обработчик клика для открытия модального окна профиля
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 11.3_

  - [ ]* 4.4 Write property test for user card data completeness
    - **Property 5: Полнота данных карточки пользователя**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9**

- [ ] 5. Checkpoint — Проверить отображение данных
  - Убедиться что Overview Panel, Activity Chart, Leaderboard и User Cards корректно рендерятся
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Реализовать поиск, фильтрацию и сортировку
  - [x] 6.1 Реализовать панель управления (Search/Filter/Sort Controls)
    - Добавить текстовое поле поиска с debounce 300ms
    - Добавить `<select>` фильтр по уровню (из LEVELS)
    - Добавить `<select>` фильтр по активности: все / активные 7д / активные 30д / неактивные
    - Добавить `<select>` сортировки: XP ↓ / XP ↑ / последняя активность / прогресс / дата регистрации / streak
    - Добавить счётчик результатов «Показано N из M пользователей»
    - _Requirements: 7.1, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 6.2 Реализовать логику фильтрации и сортировки
    - Реализовать функцию `filterUsers(users, searchQuery, levelFilter, activityFilter)` — клиентская фильтрация
    - Реализовать функцию `sortUsers(users, criterion)` — клиентская сортировка
    - Связать контролы с функциями: allUsers → фильтры → сортировка → filteredUsers → рендеринг
    - Обновлять счётчик результатов при каждом изменении фильтров
    - Фильтрация по имени/email в реальном времени (по мере ввода)
    - _Requirements: 7.2, 7.5, 8.6_

  - [ ]* 6.3 Write property test for text search
    - **Property 6: Корректность текстового поиска**
    - **Validates: Requirements 7.2**

  - [ ]* 6.4 Write property test for activity filter
    - **Property 7: Корректность фильтрации по активности**
    - **Validates: Requirements 7.4, 7.5**

  - [ ]* 6.5 Write property test for user sorting
    - **Property 8: Корректность сортировки пользователей**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

- [ ] 7. Реализовать модальное окно профиля пользователя
  - [x] 7.1 Реализовать User Profile Modal
    - Создать overlay с `backdrop-filter: blur(10px)`, закрытие по клику вне окна или кнопке ✕
    - Анимация появления: `transform: scale(0.95) → scale(1)`, `opacity: 0 → 1`
    - Аватар, имя, email, дата регистрации
    - Уровень, XP, прогресс до следующего уровня (Progress_Bar) через getNextLevel()
    - Детальный прогресс по курсу: список 15 уроков с ✅/⬜
    - Детальный прогресс по модулям: список 12 тестов с ✅/⬜
    - Кейсы (N из 50) и карточки (N из 80)
    - Streak (текущий и максимальный), точность (%), общее количество ответов
    - Дата последней активности
    - На мобильных (<768px): полноэкранный режим
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.10, 11.5_

  - [x] 7.2 Реализовать Mini Chart (динамика XP) в модальном окне
    - Реализовать функцию `prepareXPChartData(xpHistory)` — кумулятивный XP по времени
    - Создать линейный Chart.js мини-график
    - Обработать пустой xpHistory — текст «Нет данных» вместо графика
    - _Requirements: 9.9_

  - [ ]* 7.3 Write property test for XP chart data
    - **Property 12: Корректность подготовки данных XP-графика**
    - **Validates: Requirements 9.9**

  - [ ]* 7.4 Write property test for modal data completeness
    - **Property 9: Полнота данных модального окна профиля**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**

- [ ] 8. Checkpoint — Проверить интерактивность
  - Убедиться что поиск, фильтрация, сортировка и модальное окно работают корректно
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Реализовать CSV-экспорт и адаптивный дизайн
  - [x] 9.1 Реализовать CSV Exporter
    - Добавить кнопку «📥 Экспорт CSV» в панель управления
    - Реализовать функцию `exportCSV(filteredUsers)` — формирование CSV с BOM (\uFEFF)
    - Заголовки: Имя, Email, Уровень, XP, Курс (%), Модули (%), Кейсы (%), Карточки (%), Streak, Точность (%), Последняя активность, Дата регистрации
    - Скачивание через Blob + URL.createObjectURL + `<a download>`
    - Имя файла: `users-stats-YYYY-MM-DD.csv`
    - Кнопка disabled при пустом filteredUsers
    - Обработка ошибок через try/catch
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 9.2 Write property test for CSV export
    - **Property 10: Корректность CSV-экспорта (round-trip)**
    - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

  - [x] 9.3 Реализовать полный адаптивный дизайн
    - Добавить media queries для всех breakpoints: 1400px, 1024px, 768px, 480px, 360px
    - Overview Panel grid: 4 → 2 → 1 колонки
    - User Cards grid: 3 → 2 → 1 колонки
    - Activity Chart: уменьшение высоты на мобильных
    - User Profile Modal: полноэкранный на <768px
    - Мобильное гамбургер-меню для навигации на <768px
    - Touch-target минимум 44x44px для интерактивных элементов
    - Адаптивная типографика и padding по правилам responsive-design-rules
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 10. Реализовать property-тесты для метрик и доступа
  - [ ]* 10.1 Write property test for derived metrics calculation
    - **Property 1: Корректность расчёта производных метрик**
    - **Validates: Requirements 2.2, 2.5**

  - [ ]* 10.2 Write property test for non-superuser access blocking
    - **Property 11: Блокировка доступа для не-superuser ролей**
    - **Validates: Requirements 1.2**

- [ ] 11. Final checkpoint — Финальная проверка
  - Убедиться что все компоненты работают вместе: загрузка данных, overview, chart, leaderboard, карточки, поиск/фильтрация/сортировка, модальное окно, CSV-экспорт
  - Проверить адаптивный дизайн на ключевых breakpoints
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All code is JavaScript (inline in single HTML file) per project pattern
- Uses fast-check library for property-based testing
