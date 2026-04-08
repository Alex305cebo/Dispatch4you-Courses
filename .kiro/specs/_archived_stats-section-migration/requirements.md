# Requirements Document

## Introduction

Данная спецификация описывает требования к переносу раздела статистики грузов по США в реальном времени с главной страницы (index.html) на страницу тарифов (pricing.html). Раздел должен быть перенесен полностью со всеми стилями, анимациями, функциональностью и настройками, сохраняя идентичное поведение.

## Glossary

- **Stats_Section**: Раздел со статистикой грузов, включающий заголовок, подзаголовок, график топ-10 штатов и карточки с общей статистикой
- **Chart_Container**: Контейнер с интерактивным графиком топ-10 штатов по количеству грузов
- **Stat_Cards**: Набор из 4 карточек с общей статистикой (активные грузы, брокеры, новые грузы, штаты)
- **CSS_Styles**: Все стили CSS, относящиеся к разделу статистики
- **Animations**: Анимации появления элементов, градиентов и интерактивных эффектов
- **Pricing_Page**: Страница тарифов (pricing.html)
- **Index_Page**: Главная страница (index.html)

## Requirements

### Requirement 1: Идентификация и извлечение раздела статистики

**User Story:** Как разработчик, я хочу точно идентифицировать все компоненты раздела статистики на главной странице, чтобы перенести их без потерь.

#### Acceptance Criteria

1. THE System SHALL identify the complete HTML section with class "load-stats-section" from Index_Page
2. THE System SHALL identify all CSS styles related to Stats_Section including media queries
3. THE System SHALL identify all JavaScript code that affects Stats_Section behavior
4. THE System SHALL verify that Chart_Container includes all 10 state bars with their data
5. THE System SHALL verify that Stat_Cards include all 4 cards with icons, numbers, labels and trends

### Requirement 2: Перенос HTML-разметки

**User Story:** Как разработчик, я хочу перенести HTML-разметку раздела статистики на страницу тарифов, чтобы сохранить структуру и содержимое.

#### Acceptance Criteria

1. THE System SHALL copy the complete "load-stats-section" HTML block from Index_Page to Pricing_Page
2. THE System SHALL preserve all HTML attributes including classes, IDs, data attributes and inline styles
3. THE System SHALL preserve all text content in Russian language
4. THE System SHALL preserve the exact order of all child elements
5. THE System SHALL place Stats_Section after the FAQ section and before the footer on Pricing_Page

### Requirement 3: Перенос CSS-стилей

**User Story:** Как разработчик, я хочу перенести все CSS-стили раздела статистики, чтобы сохранить визуальное оформление и анимации.

#### Acceptance Criteria

1. THE System SHALL copy all CSS rules for class "load-stats-section" from Index_Page to Pricing_Page
2. THE System SHALL copy all CSS rules for class "stats-hero" and its child elements
3. THE System SHALL copy all CSS rules for class "stats-container" and "stat-card"
4. THE System SHALL copy all CSS rules for class "chart-container" and all chart-related classes
5. THE System SHALL copy all keyframe animations including "slideUp", "fillVertical", "gradientShift" and "shimmer"
6. THE System SHALL copy all media queries for responsive behavior at breakpoints 768px, 640px, 480px, 360px and 280px
7. THE System SHALL preserve all gradient definitions, transitions and transform properties
8. THE System SHALL verify that no CSS rules conflict with existing Pricing_Page styles

### Requirement 4: Сохранение интерактивности

**User Story:** Как пользователь, я хочу, чтобы все интерактивные эффекты работали на странице тарифов так же, как на главной странице.

#### Acceptance Criteria

1. WHEN a user hovers over a stat card, THE System SHALL apply transform translateY(-4px) effect
2. WHEN a user hovers over a chart bar, THE System SHALL apply scaleX(1.1) transform
3. WHEN a user hovers over a state flag, THE System SHALL apply scale(1.3) and rotate(10deg) transform
4. THE System SHALL display gradient animations on chart bars continuously
5. THE System SHALL display shimmer animation on chart bars continuously
6. THE System SHALL apply slideUp animation to chart bars on page load with staggered delays

### Requirement 5: Адаптивность и мобильная версия

**User Story:** Как пользователь мобильного устройства, я хочу, чтобы раздел статистики корректно отображался на всех размерах экранов.

#### Acceptance Criteria

1. WHEN viewport width is less than or equal to 768px, THE System SHALL display stats-container in 2-column grid
2. WHEN viewport width is less than or equal to 640px, THE System SHALL display state names in short format using data-short attribute
3. WHEN viewport width is less than or equal to 480px, THE System SHALL reduce chart bar width to 30px
4. WHEN viewport width is less than or equal to 480px, THE System SHALL display stats-container in single column
5. WHEN viewport width is less than or equal to 360px, THE System SHALL reduce chart bar width to 20px
6. THE System SHALL preserve all touch interactions on mobile devices
7. THE System SHALL maintain readable font sizes on all screen sizes

### Requirement 6: Сохранение данных и контента

**User Story:** Как пользователь, я хочу видеть актуальные данные статистики грузов на странице тарифов.

#### Acceptance Criteria

1. THE System SHALL preserve the section title "📊 Статистика грузов по США в реальном времени"
2. THE System SHALL preserve the subtitle "Актуальные данные о доступных грузах и ценах на топливо"
3. THE System SHALL preserve all 10 state entries with their exact values: California (3,247), Texas (2,891), Florida (2,156), Illinois (1,923), Georgia (1,687), Pennsylvania (1,534), New York (1,421), Ohio (1,298), North Carolina (1,147), Arizona (987)
4. THE System SHALL preserve all state flags (emojis) and names
5. THE System SHALL preserve stat card values: 15,847 active loads, 50+ brokers, 5,247 new loads per hour, 50 states
6. THE System SHALL preserve all trend indicators and labels

### Requirement 7: Проверка корректности переноса

**User Story:** Как разработчик, я хочу убедиться, что перенос выполнен корректно и раздел работает идентично оригиналу.

#### Acceptance Criteria

1. THE System SHALL verify that Stats_Section renders identically on Pricing_Page compared to Index_Page
2. THE System SHALL verify that all animations trigger correctly on page load
3. THE System SHALL verify that all hover effects work on desktop
4. THE System SHALL verify that responsive breakpoints work correctly
5. THE System SHALL verify that no console errors appear related to Stats_Section
6. THE System SHALL verify that page load performance is not degraded
7. WHEN comparing visual appearance, THE System SHALL confirm pixel-perfect match between original and transferred section

### Requirement 8: Удаление раздела с главной страницы

**User Story:** Как разработчик, я хочу удалить раздел статистики с главной страницы после успешного переноса, чтобы избежать дублирования контента.

#### Acceptance Criteria

1. WHEN Stats_Section is successfully transferred and verified on Pricing_Page, THE System SHALL remove the "load-stats-section" HTML block from Index_Page
2. THE System SHALL remove all CSS rules specific to Stats_Section from Index_Page that are not used by other sections
3. THE System SHALL verify that removal does not break any other functionality on Index_Page
4. THE System SHALL verify that Index_Page layout remains correct after removal
5. THE System SHALL create a backup of Index_Page before removal

### Requirement 9: Интеграция с навигацией

**User Story:** Как пользователь, я хочу легко найти раздел статистики на странице тарифов.

#### Acceptance Criteria

1. THE System SHALL ensure Stats_Section is visible without scrolling issues on Pricing_Page
2. THE System SHALL ensure proper spacing between Stats_Section and adjacent sections
3. WHEN a user navigates to Pricing_Page, THE System SHALL display Stats_Section in the correct position
4. THE System SHALL maintain consistent padding and margins with other sections on Pricing_Page

### Requirement 10: Кроссбраузерная совместимость

**User Story:** Как пользователь, я хочу, чтобы раздел статистики корректно работал во всех современных браузерах.

#### Acceptance Criteria

1. THE System SHALL render Stats_Section correctly in Chrome version 90+
2. THE System SHALL render Stats_Section correctly in Firefox version 88+
3. THE System SHALL render Stats_Section correctly in Safari version 14+
4. THE System SHALL render Stats_Section correctly in Edge version 90+
5. THE System SHALL apply appropriate vendor prefixes for CSS properties where needed
6. THE System SHALL ensure gradient animations work in all supported browsers
7. THE System SHALL ensure backdrop-filter effects work or have appropriate fallbacks
