# Implementation Plan: Перенос раздела статистики грузов

## Overview

Данный план описывает пошаговую реализацию переноса раздела статистики грузов с главной страницы (index.html) на новую отдельную страницу (cargo-stats.html). Раздел включает интерактивный график топ-10 штатов, карточки со статистикой и полный набор CSS-анимаций. После переноса на главной странице будет добавлена кнопка в первом секторе, ведущая на новую страницу статистики.

## Tasks

- [x] 1. Создать новую страницу cargo-stats.html
  - Создать файл cargo-stats.html на основе структуры существующих страниц
  - Подключить необходимые CSS-файлы (shared-nav.css и другие общие стили)
  - Подключить необходимые JavaScript-файлы
  - Настроить базовую структуру страницы с header и footer
  - _Requirements: 2.1, 9.3_

- [x] 2. Извлечь и перенести HTML-разметку раздела статистики
  - [x] 2.1 Скопировать полный HTML-блок "load-stats-section" из index.html
    - Извлечь весь раздел со всеми вложенными элементами
    - Сохранить все HTML-атрибуты (classes, IDs, data-атрибуты, inline styles)
    - Сохранить весь текстовый контент на русском языке
    - Сохранить точный порядок всех дочерних элементов
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.2 Вставить раздел в cargo-stats.html
    - Разместить раздел в основной контентной области страницы
    - Обеспечить правильное позиционирование в структуре страницы
    - _Requirements: 2.5_
  
  - [ ]* 2.3 Написать property test для сохранения DOM-структуры
    - **Property 1: DOM Structure Preservation**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 3. Извлечь и перенести CSS-стили
  - [x] 3.1 Извлечь все CSS-правила для раздела статистики из index.html
    - Скопировать стили для класса "load-stats-section"
    - Скопировать стили для "stats-hero" и всех дочерних элементов
    - Скопировать стили для "stats-container" и "stat-card"
    - Скопировать стили для "chart-container" и всех chart-related классов
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.2 Перенести keyframe-анимации
    - Скопировать @keyframes slideUp
    - Скопировать @keyframes fillVertical
    - Скопировать @keyframes gradientShift
    - Скопировать @keyframes shimmer
    - Сохранить все параметры анимаций (duration, timing-function, iteration-count)
    - _Requirements: 3.5_
  
  - [x] 3.3 Перенести media queries для адаптивности
    - Скопировать media query для 768px (2-column grid)
    - Скопировать media query для 640px (короткие названия штатов)
    - Скопировать media query для 480px (ширина столбцов 30px, single column)
    - Скопировать media query для 360px (ширина столбцов 20px)
    - Скопировать media query для 280px (ширина столбцов 15px)
    - _Requirements: 3.6_
  
  - [x] 3.4 Добавить CSS в cargo-stats.html
    - Вставить все стили в <style> блок или отдельный CSS-файл
    - Сохранить все gradient definitions, transitions и transform properties
    - _Requirements: 3.7_
  
  - [ ]* 3.5 Написать property test для сохранения CSS-свойств
    - **Property 4: CSS Properties Preservation**
    - **Validates: Requirements 3.7**
  
  - [ ]* 3.6 Написать property test для отсутствия конфликтов стилей
    - **Property 5: No Style Conflicts**
    - **Validates: Requirements 3.8**

- [x] 4. Checkpoint - Проверить базовую структуру
  - Убедиться, что cargo-stats.html открывается без ошибок
  - Проверить, что раздел статистики отображается
  - Убедиться, что нет console errors
  - Спросить пользователя, если возникли вопросы

- [x] 5. Проверить и настроить интерактивность
  - [x] 5.1 Проверить hover-эффекты на stat cards
    - Убедиться, что применяется transform: translateY(-4px)
    - Проверить изменение box-shadow при hover
    - _Requirements: 4.1_
  
  - [x] 5.2 Проверить hover-эффекты на chart bars
    - Убедиться, что применяется transform: scaleX(1.1)
    - Проверить увеличение box-shadow при hover
    - _Requirements: 4.2_
  
  - [x] 5.3 Проверить hover-эффекты на state flags
    - Убедиться, что применяется transform: scale(1.3) rotate(10deg)
    - _Requirements: 4.3_
  
  - [ ]* 5.4 Написать property test для интерактивных hover-эффектов
    - **Property 2: Interactive Hover Effects**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [x] 5.5 Проверить анимации при загрузке страницы
    - Убедиться, что gradient animations работают непрерывно
    - Убедиться, что shimmer animation работает непрерывно
    - Убедиться, что slideUp animation применяется с staggered delays (0.1s-1.0s)
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [ ]* 5.6 Написать property test для непрерывных анимаций
    - **Property 3: Continuous Animations**
    - **Validates: Requirements 4.4, 4.5, 4.6**

- [x] 6. Проверить адаптивность и мобильную версию
  - [x] 6.1 Проверить breakpoint 768px
    - Убедиться, что stats-container отображается в 2-column grid
    - _Requirements: 5.1_
  
  - [x] 6.2 Проверить breakpoint 640px
    - Убедиться, что названия штатов отображаются в короткой форме (data-short)
    - _Requirements: 5.2_
  
  - [x] 6.3 Проверить breakpoint 480px
    - Убедиться, что ширина chart bar = 30px
    - Убедиться, что stats-container отображается в single column
    - _Requirements: 5.3, 5.4_
  
  - [x] 6.4 Проверить breakpoint 360px
    - Убедиться, что ширина chart bar = 20px
    - _Requirements: 5.5_
  
  - [ ]* 6.5 Написать property test для responsive behavior
    - **Property 12: Responsive Behavior**
    - **Validates: Requirements 7.4**
  
  - [ ]* 6.6 Написать property test для touch interactions
    - **Property 6: Touch Interactions**
    - **Validates: Requirements 5.6**
  
  - [ ]* 6.7 Написать property test для readable font sizes
    - **Property 7: Readable Font Sizes**
    - **Validates: Requirements 5.7**

- [x] 7. Checkpoint - Проверить функциональность
  - Протестировать все hover-эффекты
  - Протестировать все breakpoints
  - Убедиться, что анимации работают плавно
  - Спросить пользователя, если возникли вопросы

- [x] 8. Проверить сохранение данных и контента
  - [x] 8.1 Проверить заголовки и подзаголовки
    - Убедиться, что заголовок "📊 Статистика грузов по США в реальном времени" сохранен
    - Убедиться, что подзаголовок "Актуальные данные о доступных грузах и ценах на топливо" сохранен
    - _Requirements: 6.1, 6.2_
  
  - [x] 8.2 Проверить данные всех 10 штатов
    - Проверить California (🌴, CA): 3,247
    - Проверить Texas (⭐, TX): 2,891
    - Проверить Florida (🌊, FL): 2,156
    - Проверить Illinois (🏙️, IL): 1,923
    - Проверить Georgia (🍑, GA): 1,687
    - Проверить Pennsylvania (🌲, PA): 1,534
    - Проверить New York (🗽, NY): 1,421
    - Проверить Ohio (🌾, OH): 1,298
    - Проверить North Carolina (🌲, NC): 1,147
    - Проверить Arizona (🏔️, AZ): 987
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 8.3 Написать property test для сохранения данных штатов
    - **Property 8: State Data Preservation**
    - **Validates: Requirements 6.4**
  
  - [x] 8.4 Проверить данные карточек статистики
    - Проверить карточку "🚛 15,847 - Активных грузов (↑ 12% за неделю)"
    - Проверить карточку "🏢 50+ - Брокеров (TQL, C.H. Robinson, Arrive...)"
    - Проверить карточку "⚡ 5,247 - Новых за час (↑ Обновляется каждую секунду)"
    - Проверить карточку "🗺️ 50 - Штатов США (Полное покрытие)"
    - _Requirements: 6.5_
  
  - [ ]* 8.5 Написать property test для сохранения trend indicators
    - **Property 9: Trend Indicators Preservation**
    - **Validates: Requirements 6.6**

- [x] 9. Добавить кнопку на главной странице
  - [x] 9.1 Найти первый сектор на index.html
    - Определить, где именно разместить кнопку в первом секторе
    - _Requirements: 9.1_
  
  - [x] 9.2 Создать кнопку со ссылкой на cargo-stats.html
    - Добавить HTML-разметку кнопки
    - Добавить текст кнопки (например, "📊 Статистика грузов" или "Смотреть статистику")
    - Настроить href="cargo-stats.html"
    - _Requirements: 9.1_
  
  - [x] 9.3 Стилизовать кнопку
    - Применить стили, соответствующие дизайну сайта
    - Добавить hover-эффекты
    - Обеспечить адаптивность кнопки на мобильных устройствах
    - _Requirements: 9.1_

- [-] 10. Удалить раздел статистики с главной страницы
  - [x] 10.1 Создать backup index.html
    - Сохранить копию index.html перед удалением
    - _Requirements: 8.5_
  
  - [ ] 10.2 Удалить HTML-блок "load-stats-section" из index.html
    - Удалить весь раздел со всеми вложенными элементами
    - _Requirements: 8.1_
  
  - [ ] 10.3 Удалить неиспользуемые CSS-стили из index.html
    - Удалить стили, специфичные для Stats_Section
    - Оставить стили, используемые другими секциями
    - _Requirements: 8.2_
  
  - [ ] 10.4 Проверить, что index.html работает корректно
    - Убедиться, что удаление не сломало другую функциональность
    - Убедиться, что layout остался корректным
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 10.5 Написать property test для сохранения функциональности index.html
    - **Property 15: Index Page Functionality**
    - **Validates: Requirements 8.3**
  
  - [ ]* 10.6 Написать property test для сохранения layout index.html
    - **Property 16: Index Page Layout**
    - **Validates: Requirements 8.4**

- [ ] 11. Checkpoint - Проверить интеграцию
  - Убедиться, что кнопка на главной странице работает
  - Убедиться, что переход на cargo-stats.html происходит корректно
  - Убедиться, что главная страница работает без раздела статистики
  - Спросить пользователя, если возникли вопросы

- [ ] 12. Финальное тестирование и проверка качества
  - [ ] 12.1 Провести visual regression testing
    - Сравнить отображение раздела на cargo-stats.html с оригиналом на index.html
    - Проверить pixel-perfect соответствие
    - _Requirements: 7.1, 7.7_
  
  - [ ]* 12.2 Написать property test для визуального соответствия
    - **Property 10: Visual Rendering Consistency**
    - **Validates: Requirements 7.1, 7.7**
  
  - [ ]* 12.3 Написать property test для animation triggers
    - **Property 11: Animation Triggers**
    - **Validates: Requirements 7.2**
  
  - [ ]* 12.4 Написать property test для отсутствия console errors
    - **Property 13: No Console Errors**
    - **Validates: Requirements 7.5**
  
  - [ ] 12.5 Провести performance testing
    - Измерить Page Load Time (должен быть < 2s)
    - Измерить First Contentful Paint (должен быть < 1s)
    - Измерить Time to Interactive (должен быть < 3s)
    - Измерить Animation Frame Rate (должен быть ≥ 60fps)
    - _Requirements: 7.6_
  
  - [ ]* 12.6 Написать property test для performance preservation
    - **Property 14: Performance Preservation**
    - **Validates: Requirements 7.6**
  
  - [ ] 12.7 Провести кроссбраузерное тестирование
    - Проверить в Chrome 90+
    - Проверить в Firefox 88+
    - Проверить в Safari 14+
    - Проверить в Edge 90+
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 12.8 Написать property test для кроссбраузерных анимаций
    - **Property 18: Cross-Browser Animations**
    - **Validates: Requirements 10.6, 10.7**
  
  - [ ]* 12.9 Написать property test для consistent spacing
    - **Property 17: Consistent Spacing**
    - **Validates: Requirements 9.4**

- [ ] 13. Final checkpoint - Убедиться, что все работает
  - Проверить все функциональные требования
  - Убедиться, что все тесты проходят
  - Проверить работу во всех поддерживаемых браузерах
  - Спросить пользователя о финальном одобрении

## Notes

- Задачи, отмеченные `*`, являются опциональными и могут быть пропущены для более быстрой реализации MVP
- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property tests проверяют универсальные свойства корректности
- Unit tests проверяют конкретные примеры и edge cases
- Новая страница называется cargo-stats.html (отдельная страница, не pricing.html)
- На главной странице будет добавлена кнопка в первом секторе, ведущая на cargo-stats.html
