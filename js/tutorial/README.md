# 🎓 Narrative-Driven Tutorial System

Модульная система нарративного обучения для DispatcherTraining.

## 📁 Архитектура

```
js/tutorial/
├── TutorialStateMachine.js    # State Machine — контроль прогресса
├── MentorshipData.js           # Data Layer — диалоги и задачи
├── TutorialUIController.js     # UI Controller — визуализация
├── TutorialManager.js          # Главный оркестратор
├── integration.js              # Интеграция с игрой
└── README.md                   # Документация
```

## 🏗️ Принципы дизайна

### 1. Модульность
Каждый модуль изолирован и отвечает за одну задачу:
- **StateMachine** — только логика переходов
- **Data Layer** — только данные
- **UI Controller** — только визуализация
- **Manager** — координация всех модулей

### 2. Масштабируемость
Добавление нового шага обучения:
```javascript
// В MentorshipData.js
{
  id: 'STEP_NEW',
  title: 'Новый шаг',
  mentorDialog: 'Текст наставника...',
  task: 'Задача для игрока',
  ui: { highlight: '#element', position: 'bottom' },
  validation: { type: 'button_click', target: '#btn' },
  nextSteps: ['STEP_NEXT']
}
```

### 3. Интеграция с существующим UI
Система работает с вашей 2-колоночной вёрсткой документов:
```html
<div class="rc-field" 
     data-section="Rate" 
     data-tooltip="Ставка за перевозку">
  <!-- Содержимое поля -->
</div>
```

## 🚀 Быстрый старт

### Базовая интеграция

```javascript
// В главном файле игры (например game2.html)
import { initializeAll } from './js/tutorial/integration.js';

// Инициализация при загрузке страницы
initializeAll();
```

### Ручной контроль

```javascript
import { TutorialManager } from './js/tutorial/TutorialManager.js';

const tutorial = new TutorialManager();

// Запуск обучения
tutorial.start();

// Остановка
tutorial.stop();

// Сброс прогресса
tutorial.reset();

// Пропустить обучение
tutorial.skip();

// Получить прогресс
const progress = tutorial.getProgress();
console.log(progress);
// {
//   currentStep: 'STEP_3_INBOX_CHECK',
//   totalSteps: 11,
//   completedSteps: 2,
//   context: { ... }
// }
```

## 📝 Структура шага обучения

```javascript
{
  // Уникальный идентификатор
  id: 'STEP_4_RATE_CON_REVIEW',
  
  // Заголовок шага
  title: 'Проверка Rate Confirmation',
  
  // Диалог наставника (поддерживает многострочный текст)
  mentorDialog: `
    Rate Confirmation — это твой контракт с брокером.
    Проверь все ключевые поля.
  `,
  
  // Задача для игрока
  task: 'Проверь все поля в Rate Confirmation',
  
  // UI конфигурация
  ui: {
    highlight: '#doc-ratecon',        // Селектор элемента для подсветки
    position: 'left',                 // Позиция tooltip: top/bottom/left/right
    pulse: true,                      // Пульсирующая анимация
    arrow: true,                      // Показать стрелку
    tooltip: 'Кликай на поля'         // Текст подсказки
  },
  
  // Условия завершения шага
  validation: {
    type: 'custom',                   // Тип валидации
    check: (context) => {             // Функция проверки
      return context.checkedFields.size >= 5;
    }
  },
  
  // Возможные следующие шаги
  nextSteps: ['STEP_5_RATE_CON_ACCEPT']
}
```

## 🎯 Типы валидации

### 1. Button Click
Ожидание клика по кнопке:
```javascript
validation: {
  type: 'button_click',
  target: '#accept-load-btn'
}
```

### 2. Element Click
Ожидание клика по элементу:
```javascript
validation: {
  type: 'element_click',
  target: '.email-item[data-subject*="Rate Confirmation"]'
}
```

### 3. Custom
Кастомная логика проверки:
```javascript
validation: {
  type: 'custom',
  check: (context) => {
    return context.clickedTrucks.size >= 3;
  }
}
```

### 4. Time Based
Автоматический переход через время:
```javascript
validation: {
  type: 'time_based',
  duration: 5000  // 5 секунд
}
```

### 5. Choice
Выбор правильного варианта:
```javascript
validation: {
  type: 'choice',
  correctChoice: 'call_warehouse'
},
ui: {
  options: [
    { id: 'call_warehouse', text: 'Позвонить на склад' },
    { id: 'call_broker', text: 'Звонить брокеру' }
  ]
}
```

## 🎨 UI Компоненты

### Диалог наставника
Автоматически показывается при входе в шаг:
- Аватар и имя наставника
- Заголовок шага
- Текст диалога
- Задача для игрока
- Кнопки действий

### Подсветка элементов
```javascript
uiController.highlightElement('#element', {
  position: 'top',      // Позиция tooltip
  pulse: true,          // Пульсация
  arrow: true,          // Стрелка
  message: 'Подсказка'  // Текст
});
```

### Tooltip
Контекстные подсказки для элементов:
```javascript
uiController.showTooltip(element, 'Текст подсказки', 'top');
```

## 🔧 Интеграция с игровой логикой

### Регистрация игровых событий

```javascript
// В вашем игровом коде
document.querySelector('#accept-load-btn').addEventListener('click', () => {
  // Ваша логика принятия груза
  acceptLoad(loadData);
  
  // Обновляем контекст обучения
  if (window.tutorialManager && window.tutorialManager.isActive) {
    window.tutorialManager.context.loadAccepted = true;
    window.tutorialManager.context.assignedTruck = 'truck_3';
  }
});
```

### Проверка активности обучения

```javascript
function handleGameAction() {
  // Проверяем активно ли обучение
  if (window.tutorialManager && window.tutorialManager.isActive) {
    // Логика для обучения
    console.log('Tutorial mode active');
  } else {
    // Обычная игровая логика
    console.log('Normal game mode');
  }
}
```

## 📊 State Machine API

### Регистрация состояния
```javascript
stateMachine.registerState('STEP_NAME', {
  onEnter: (context) => { /* Вход в состояние */ },
  onExit: (context) => { /* Выход из состояния */ },
  canTransitionTo: (target, context) => { /* Проверка перехода */ },
  allowedTransitions: ['STEP_NEXT'],
  metadata: { /* Дополнительные данные */ }
});
```

### Переход между состояниями
```javascript
stateMachine.transitionTo('STEP_NEXT', context);
```

### Подписка на изменения
```javascript
stateMachine.subscribe((event) => {
  console.log('State changed:', event.from, '→', event.to);
});
```

### Сохранение/загрузка
```javascript
// Сохранить в localStorage
stateMachine.saveToStorage('tutorial_progress');

// Загрузить из localStorage
stateMachine.loadFromStorage('tutorial_progress');
```

## 🎮 Примеры использования

### Пример 1: Добавление нового шага

```javascript
// В MentorshipData.js
export const TUTORIAL_STEPS = [
  // ... существующие шаги
  {
    id: 'STEP_12_DETENTION_CLAIM',
    title: 'Оформление Detention',
    mentorDialog: `
      Водитель простоял на разгрузке 3 часа.
      Это detention — нужно требовать компенсацию от брокера.
    `,
    task: 'Заполни форму Detention Claim',
    ui: {
      highlight: '#detention-form',
      position: 'right'
    },
    validation: {
      type: 'custom',
      check: (context) => context.detentionFormFilled
    },
    nextSteps: ['STEP_13_SEND_CLAIM']
  }
];
```

### Пример 2: Интеграция с документами

```html
<!-- В вашем HTML -->
<div class="rc-field" 
     data-section="Detention Hours" 
     data-tooltip="Количество часов простоя.<br><br>Detention начинается через 2 часа после прибытия.">
  <strong>Detention:</strong> 3 hours @ $50/hr = $150
</div>
```

```javascript
// Автоматически работает через integration.js
integrateWithDocuments();
```

### Пример 3: Кастомная валидация

```javascript
{
  id: 'STEP_COMPLEX_TASK',
  validation: {
    type: 'custom',
    check: (context) => {
      // Проверяем несколько условий
      const hasCheckedRate = context.checkedFields.has('rate');
      const hasCheckedDates = context.checkedFields.has('pickup_date') && 
                              context.checkedFields.has('delivery_date');
      const hasAssignedTruck = context.assignedTruck !== null;
      
      return hasCheckedRate && hasCheckedDates && hasAssignedTruck;
    }
  }
}
```

## 🐛 Отладка

### Dev Controls
В dev режиме (localhost) автоматически создаются кнопки управления:
- ▶️ Начать обучение
- ⏸️ Остановить
- 🔄 Сбросить

### Console API
```javascript
// Доступ к менеджеру через консоль
window.tutorialManager

// Текущее состояние
window.tutorialManager.getCurrentState()

// История переходов
window.tutorialManager.stateMachine.getHistory()

// Контекст
window.tutorialManager.context

// Прогресс
window.tutorialManager.getProgress()
```

### Логирование
Все модули логируют свои действия в консоль:
```
[StateMachine] Registered state: STEP_1_WELCOME
[TutorialUI] UI elements initialized.
[TutorialManager] Initialized.
[Integration] Tutorial system initialized.
```

## 📦 Зависимости

Система полностью автономна и не требует внешних библиотек.

Требования:
- ES6 Modules (import/export)
- localStorage API
- Modern browser (Chrome 60+, Firefox 60+, Safari 12+)

## 🔒 Безопасность

- Все данные обучения хранятся локально (localStorage)
- Нет отправки данных на сервер
- Изолированные модули без доступа к глобальной области

## 🚧 Roadmap

- [ ] Поддержка мультиязычности
- [ ] Аналитика прогресса обучения
- [ ] Адаптивные подсказки на основе ошибок игрока
- [ ] Система достижений за прохождение обучения
- [ ] Экспорт/импорт прогресса

## 📄 Лицензия

Часть проекта DispatcherTraining.

---

**Автор:** Kiro AI  
**Дата:** 2026-05-02  
**Версия:** 1.0.0
