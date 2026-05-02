# Design Document: Перенос раздела статистики грузов на страницу тарифов

## Overview

Данный дизайн описывает технический подход к переносу раздела статистики грузов по США с главной страницы (index.html) на страницу тарифов (pricing.html). Раздел включает интерактивный график топ-10 штатов, карточки со статистикой и полный набор CSS-анимаций.

### Цели

- Перенести раздел статистики без потери функциональности
- Сохранить все визуальные эффекты и анимации
- Обеспечить идентичное поведение на всех устройствах
- Интегрировать раздел в существующий дизайн страницы тарифов
- Удалить раздел с главной страницы после успешного переноса

### Ограничения

- Раздел должен быть pixel-perfect копией оригинала
- Все CSS-стили должны быть изолированы и не конфликтовать с существующими
- Адаптивность должна работать на всех breakpoints (768px, 640px, 480px, 360px, 280px)
- Поддержка браузеров: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Architecture

### Компонентная структура

Раздел статистики состоит из следующих компонентов:

```
load-stats-section
├── stats-hero (заголовок и подзаголовок)
├── chart-container (график топ-10 штатов)
│   ├── chart-bars (контейнер столбцов)
│   │   └── chart-bar-item × 10 (отдельные столбцы)
│   │       ├── chart-bar-wrapper
│   │       │   └── chart-bar (анимированный столбец)
│   │       │       └── chart-bar-value (значение)
│   │       └── chart-bar-label (флаг и название штата)
│   └── legend (легенда графика)
└── stats-container (карточки статистики)
    └── stat-card × 4 (отдельные карточки)
        ├── stat-icon
        ├── stat-number
        ├── stat-label
        └── stat-trend
```

### Подход к переносу

1. **Extraction Phase**: Извлечение HTML, CSS и определение зависимостей
2. **Integration Phase**: Интеграция в pricing.html с проверкой конфликтов
3. **Verification Phase**: Тестирование функциональности и визуального соответствия
4. **Cleanup Phase**: Удаление раздела с index.html

## Components and Interfaces

### HTML Structure

**Section Container**
```html
<section class="load-stats-section">
  <div class="container">
    <!-- Content -->
  </div>
</section>
```

**Stats Hero Component**
```html
<div class="stats-hero">
  <h2>📊 Статистика грузов по США в реальном времени</h2>
  <p class="stats-subtitle">Актуальные данные о доступных грузах и ценах на топливо</p>
</div>
```

**Chart Component**
```html
<div class="chart-container">
  <h3>📈 Топ-10 штатов по количеству грузов</h3>
  <div class="chart-bars">
    <div class="chart-bar-item">
      <div class="chart-bar-wrapper">
        <div class="chart-bar" style="height: X%;">
          <span class="chart-bar-value">VALUE</span>
        </div>
      </div>
      <div class="chart-bar-label">
        <span class="state-flag">EMOJI</span>
        <span class="state-name" data-full="Full Name" data-short="XX"></span>
      </div>
    </div>
  </div>
</div>
```

**Stats Cards Component**
```html
<div class="stats-container">
  <div class="stat-card">
    <div class="stat-icon">EMOJI</div>
    <div class="stat-number">VALUE</div>
    <div class="stat-label">LABEL</div>
    <div class="stat-trend">TREND</div>
  </div>
</div>
```

### CSS Architecture

**Основные классы стилей:**

- `.load-stats-section` - контейнер секции
- `.stats-hero` - заголовок секции
- `.stats-container` - grid-контейнер для карточек
- `.stat-card` - отдельная карточка статистики
- `.chart-container` - контейнер графика
- `.chart-bars` - flex-контейнер столбцов
- `.chart-bar-item` - отдельный столбец с анимацией
- `.chart-bar` - анимированный столбец с градиентом

**Keyframe анимации:**

- `@keyframes slideUp` - появление столбцов снизу вверх
- `@keyframes fillVertical` - заполнение столбцов по вертикали
- `@keyframes gradientShift` - анимация градиента
- `@keyframes shimmer` - эффект блеска на столбцах

**Media queries breakpoints:**

- 768px: 2-column grid для карточек
- 640px: короткие названия штатов
- 480px: ширина столбцов 30px, single column для карточек
- 360px: ширина столбцов 20px
- 280px: ширина столбцов 15px

### Интерактивные эффекты

**Hover эффекты:**

- Stat cards: `transform: translateY(-4px)` + тень
- Chart bars: `transform: scaleX(1.1)` + увеличенная тень
- State flags: `transform: scale(1.3) rotate(10deg)`

**Анимации при загрузке:**

- Столбцы появляются с задержкой 0.1s-1.0s (staggered animation)
- Градиент непрерывно анимируется
- Эффект shimmer проходит по столбцам

## Data Models

### State Data Structure

```javascript
{
  name: string,          // Полное название штата
  shortName: string,     // Сокращение (2 буквы)
  flag: string,          // Emoji флага
  loadCount: number,     // Количество грузов
  heightPercent: number  // Высота столбца в процентах
}
```

### Stat Card Data Structure

```javascript
{
  icon: string,          // Emoji иконка
  number: string,        // Числовое значение
  label: string,         // Подпись
  trend: string,         // Тренд (опционально)
  trendPositive: boolean // Положительный тренд
}
```

### Static Data

**10 штатов с данными:**

1. California (CA, 🌴): 3,247 грузов (100% высота)
2. Texas (TX, ⭐): 2,891 грузов (89% высота)
3. Florida (FL, 🌊): 2,156 грузов (66% высота)
4. Illinois (IL, 🏙️): 1,923 грузов (59% высота)
5. Georgia (GA, 🍑): 1,687 грузов (52% высота)
6. Pennsylvania (PA, 🌲): 1,534 грузов (47% высота)
7. New York (NY, 🗽): 1,421 грузов (44% высота)
8. Ohio (OH, 🌾): 1,298 грузов (40% высота)
9. North Carolina (NC, 🌲): 1,147 грузов (35% высота)
10. Arizona (AZ, 🏔️): 987 грузов (30% высота)

**4 карточки статистики:**

1. 🚛 15,847 - Активных грузов (↑ 12% за неделю)
2. 🏢 50+ - Брокеров (TQL, C.H. Robinson, Arrive...)
3. ⚡ 5,247 - Новых за час (↑ Обновляется каждую секунду)
4. 🗺️ 50 - Штатов США (Полное покрытие)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

После анализа всех acceptance criteria, я выявил следующие группы свойств:

**Группа 1: Сохранение структуры DOM**
- Свойства 2.2, 2.3, 2.4 можно объединить в одно комплексное свойство о сохранении DOM-структуры

**Группа 2: Интерактивные эффекты**
- Свойства 4.1, 4.2, 4.3 все проверяют hover-эффекты и могут быть объединены
- Свойства 4.4, 4.5, 4.6 все проверяют анимации и могут быть объединены

**Группа 3: Адаптивность**
- Свойства 5.1-5.5 все проверяют breakpoints, но каждый уникален для своего размера экрана

**Группа 4: Визуальное соответствие**
- Свойства 7.1, 7.7 оба проверяют визуальное соответствие и могут быть объединены

**Группа 5: Функциональность после переноса**
- Свойства 7.2, 7.3, 7.4 проверяют различные аспекты функциональности

После рефлексии, я объединю избыточные свойства для более эффективного тестирования.

### Property 1: DOM Structure Preservation

*For any* HTML element in the stats section, when transferred to the pricing page, all attributes (classes, IDs, data attributes, inline styles), text content, and child element order should be preserved exactly as in the original.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 2: Interactive Hover Effects

*For any* interactive element (stat card, chart bar, state flag) in the stats section, when a user hovers over it, the system should apply the correct transform effect: translateY(-4px) for stat cards, scaleX(1.1) for chart bars, and scale(1.3) rotate(10deg) for state flags.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 3: Continuous Animations

*For any* chart bar element, the system should continuously display gradient animations (gradientShift) and shimmer effects, and apply slideUp animation on page load with staggered delays (0.1s increments per bar).

**Validates: Requirements 4.4, 4.5, 4.6**

### Property 4: CSS Properties Preservation

*For any* element with CSS properties (gradients, transitions, transforms) in the stats section, those computed style properties should be identical on the pricing page compared to the index page.

**Validates: Requirements 3.7**

### Property 5: No Style Conflicts

*For any* existing element on the pricing page outside the stats section, the computed styles should remain unchanged after adding the stats section CSS.

**Validates: Requirements 3.8**

### Property 6: Touch Interactions

*For any* interactive element in the stats section on mobile devices, touch events should trigger the same visual effects as hover events on desktop.

**Validates: Requirements 5.6**

### Property 7: Readable Font Sizes

*For any* text element in the stats section at any viewport width, the computed font size should be at least 10px to maintain readability.

**Validates: Requirements 5.7**

### Property 8: State Data Preservation

*For any* state entry in the chart, the flag emoji, state name (both full and short), and load count value should be preserved exactly after transfer.

**Validates: Requirements 6.4**

### Property 9: Trend Indicators Preservation

*For any* stat card, the trend indicator text and positive/negative styling should be preserved after transfer.

**Validates: Requirements 6.6**

### Property 10: Visual Rendering Consistency

*For any* element in the stats section, the rendered appearance (computed styles, layout, positioning) should be pixel-perfect identical on the pricing page compared to the index page.

**Validates: Requirements 7.1, 7.7**

### Property 11: Animation Triggers

*For any* animated element in the stats section, animations should trigger correctly on page load without manual intervention.

**Validates: Requirements 7.2**

### Property 12: Responsive Behavior

*For any* viewport width, the stats section should apply the correct responsive styles: 2-column grid at ≤768px, short state names at ≤640px, appropriate bar widths at each breakpoint, and single column layout at ≤480px.

**Validates: Requirements 7.4**

### Property 13: No Console Errors

*For any* interaction with the stats section on the pricing page, no JavaScript errors or CSS warnings should appear in the browser console.

**Validates: Requirements 7.5**

### Property 14: Performance Preservation

*For any* page load of the pricing page, the load time should not increase by more than 10% compared to the baseline before adding the stats section.

**Validates: Requirements 7.6**

### Property 15: Index Page Functionality

*For any* existing functionality on the index page (navigation, forms, other sections), it should continue to work correctly after removing the stats section.

**Validates: Requirements 8.3**

### Property 16: Index Page Layout

*For any* element on the index page, the computed layout (positions, spacing, dimensions) should remain correct after removing the stats section.

**Validates: Requirements 8.4**

### Property 17: Consistent Spacing

*For any* section on the pricing page, the padding and margin values should follow a consistent spacing scale (multiples of 4px or 8px).

**Validates: Requirements 9.4**

### Property 18: Cross-Browser Animations

*For any* supported browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), gradient animations and backdrop-filter effects should work correctly or have appropriate fallbacks.

**Validates: Requirements 10.6, 10.7**

## Error Handling

### CSS Conflicts

**Problem**: Существующие стили на pricing.html могут конфликтовать с новыми стилями stats section.

**Solution**: 
- Использовать специфичные селекторы для изоляции стилей
- Проверить все классы на уникальность
- Использовать CSS-переменные для цветов и размеров
- Тестировать computed styles до и после интеграции

### Missing Dependencies

**Problem**: Раздел может зависеть от общих стилей или скриптов, которые есть на index.html, но отсутствуют на pricing.html.

**Solution**:
- Проверить все используемые CSS-переменные
- Убедиться, что shared-nav.css подключен на обеих страницах
- Проверить наличие необходимых шрифтов (Inter)
- Инлайнить критичные стили, если необходимо

### Responsive Breakpoints

**Problem**: Breakpoints могут работать некорректно из-за различий в структуре страниц.

**Solution**:
- Тестировать каждый breakpoint отдельно
- Использовать относительные единицы (%, vw) где возможно
- Проверять overflow и scrolling на всех размерах
- Использовать container queries, если поддерживается

### Animation Performance

**Problem**: Множественные анимации могут вызвать проблемы с производительностью на слабых устройствах.

**Solution**:
- Использовать CSS transforms вместо position/margin
- Применять will-change для оптимизации
- Использовать requestAnimationFrame для JS-анимаций
- Добавить prefers-reduced-motion media query

### Browser Compatibility

**Problem**: Некоторые CSS-свойства могут не поддерживаться в старых браузерах.

**Solution**:
- Добавить vendor prefixes (-webkit-, -moz-)
- Предоставить fallbacks для backdrop-filter
- Использовать @supports для feature detection
- Тестировать в минимальных версиях браузеров

## Testing Strategy

### Dual Testing Approach

Для обеспечения корректности переноса будет использоваться комбинация unit-тестов и property-based тестов:

**Unit Tests** - для проверки конкретных примеров и edge cases:
- Наличие всех 10 штатов с правильными данными
- Наличие всех 4 карточек статистики
- Правильное размещение после FAQ секции
- Специфические breakpoints (768px, 640px, 480px, 360px, 280px)
- Поддержка конкретных браузеров (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

**Property-Based Tests** - для проверки универсальных свойств:
- Сохранение DOM-структуры для всех элементов
- Hover-эффекты для всех интерактивных элементов
- Анимации для всех chart bars
- Сохранение CSS-свойств для всех элементов
- Отсутствие конфликтов стилей
- Кросс-браузерная совместимость анимаций

### Property-Based Testing Configuration

**Библиотека**: fast-check (для JavaScript/TypeScript)

**Конфигурация**:
- Минимум 100 итераций на тест
- Seed для воспроизводимости результатов
- Timeout 5000ms для тестов с DOM-манипуляциями

**Теги тестов**:
```javascript
// Feature: cargo-stats-to-tariffs, Property 1: DOM Structure Preservation
// Feature: cargo-stats-to-tariffs, Property 2: Interactive Hover Effects
// и т.д.
```

### Test Environment

**Tools**:
- Jest + Testing Library для unit-тестов
- fast-check для property-based тестов
- Playwright для E2E и кросс-браузерного тестирования
- Percy или Chromatic для visual regression testing

**Test Data**:
- Фикстуры с HTML-разметкой stats section
- Mock данные для 10 штатов
- Mock данные для 4 карточек
- Различные viewport размеры

### Visual Regression Testing

**Approach**:
- Сделать baseline screenshots stats section на index.html
- Сделать screenshots после переноса на pricing.html
- Сравнить pixel-by-pixel с допуском 0.1%
- Проверить на всех breakpoints
- Проверить в разных браузерах

### Performance Testing

**Metrics**:
- Page load time (должен быть < 2s)
- First Contentful Paint (должен быть < 1s)
- Time to Interactive (должен быть < 3s)
- Animation frame rate (должен быть ≥ 60fps)

**Tools**:
- Lighthouse для общих метрик
- Chrome DevTools Performance для детального анализа
- WebPageTest для реальных условий

### Integration Testing

**Scenarios**:
1. Загрузка pricing.html → stats section отображается корректно
2. Hover на stat card → применяется transform
3. Hover на chart bar → применяется scale
4. Изменение viewport → применяются responsive стили
5. Загрузка в разных браузерах → идентичное отображение

### Acceptance Testing

**Checklist**:
- [ ] Все 10 штатов отображаются с правильными данными
- [ ] Все 4 карточки отображаются с правильными значениями
- [ ] Анимации запускаются при загрузке страницы
- [ ] Hover-эффекты работают на desktop
- [ ] Touch-эффекты работают на mobile
- [ ] Responsive breakpoints работают корректно
- [ ] Нет console errors
- [ ] Нет визуальных различий с оригиналом
- [ ] Performance не деградировала
- [ ] Работает во всех поддерживаемых браузерах

### Test Execution Plan

**Phase 1: Unit Tests**
- Написать тесты для структуры DOM
- Написать тесты для данных (штаты, карточки)
- Написать тесты для responsive breakpoints

**Phase 2: Property-Based Tests**
- Написать property tests для DOM preservation
- Написать property tests для hover effects
- Написать property tests для animations
- Написать property tests для CSS properties

**Phase 3: Visual Regression Tests**
- Создать baseline screenshots
- Настроить автоматическое сравнение
- Проверить все breakpoints

**Phase 4: E2E Tests**
- Написать сценарии взаимодействия
- Проверить в разных браузерах
- Проверить на разных устройствах

**Phase 5: Performance Tests**
- Измерить baseline метрики
- Измерить метрики после переноса
- Оптимизировать при необходимости

