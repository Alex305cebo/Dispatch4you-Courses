# 🎓 Advanced Tutorial System — Полная документация

Продвинутая архитектура системы обучения с State Machine, Event Bus, Task Tracker и Highlight System.

---

## 📐 Архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                    TUTORIAL CONTROLLER                       │
│  (Главный контроллер, координирует все компоненты)          │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌──────────┐
│  STATE  │◄────►│  EVENT   │
│ MACHINE │      │   BUS    │
└────┬────┘      └────┬─────┘
     │                │
     │                │
     ▼                ▼
┌─────────┐      ┌──────────┐
│ MENTOR  │      │   TASK   │
│ SCRIPTS │      │ TRACKER  │
└─────────┘      └──────────┘
     │                │
     └────────┬───────┘
              │
              ▼
     ┌────────────────┐
     │   UI LAYER     │
     │ • DialogBubble │
     │ • Highlights   │
     │ • TaskTracker  │
     └────────────────┘
```

---

## 🔧 Компоненты системы

### 1. **State Machine** (`tutorialStateMachine.ts`)

Управляет состояниями обучения и валидирует переходы.

**Основные состояния:**
```typescript
enum TutorialState {
  NOT_STARTED,
  STEP_1_WELCOME,
  STEP_2_EXPLAIN_GOAL,
  STEP_3_SHOW_LOAD_BOARD,
  STEP_4_SELECT_LOAD,
  STEP_5_DOC_REVIEW_RATE_CON,
  STEP_6_EXPLAIN_RATE_CON_FIELDS,
  STEP_7_RATE_CON_FINALIZE,
  STEP_8_SELECT_TRUCK,
  STEP_9_ASSIGN_LOAD,
  STEP_10_EXPLAIN_TIME_CONTROL,
  STEP_11_EXPLAIN_HOS,
  STEP_12_MONITOR_TRUCK,
  STEP_13_EXPLAIN_BALANCE,
  STEP_14_FINAL_WORDS,
  COMPLETED,
  SKIPPED,
}
```

**Действия:**
```typescript
enum TutorialAction {
  START,
  NEXT,
  SKIP,
  COMPLETE,
  LOAD_BOARD_OPENED,
  LOAD_SELECTED,
  RATE_CON_OPENED,
  RATE_CON_FIELD_CLICKED,
  TRUCK_SELECTED,
  LOAD_ASSIGNED,
  // ...
}
```

**API:**
```typescript
const stateMachine = getTutorialStateMachine();

// Проверить возможность перехода
stateMachine.canTransition(TutorialAction.NEXT); // true/false

// Выполнить переход
stateMachine.transition(TutorialAction.LOAD_BOARD_OPENED);

// Подписаться на изменения
stateMachine.subscribe(TutorialState.STEP_3_SHOW_LOAD_BOARD, (state) => {
  console.log('Reached Load Board step!');
});

// Получить прогресс
stateMachine.getProgress(); // 0-100
```

---

### 2. **Event Bus** (`eventBus.ts`)

Централизованная система событий для коммуникации между компонентами.

**События:**
```typescript
enum TutorialEvent {
  HIGHLIGHT_ELEMENT,
  UNHIGHLIGHT_ELEMENT,
  CLEAR_HIGHLIGHTS,
  SHOW_DIALOG,
  HIDE_DIALOG,
  TASK_ADDED,
  TASK_COMPLETED,
  STATE_CHANGED,
  PLAYER_ACTION,
  // ...
}
```

**API:**
```typescript
const eventBus = getEventBus();

// Подписаться на событие
eventBus.on(TutorialEvent.LOAD_BOARD_OPENED, (payload) => {
  console.log('Load Board opened!', payload);
});

// Отправить событие
eventBus.emit(TutorialEvent.LOAD_BOARD_OPENED, { timestamp: Date.now() });

// Хелперы
tutorialEvents.highlightElement('[data-onboarding="load-board"]', 'Нажми сюда');
tutorialEvents.addTask('task-1', 'Открыть Load Board');
tutorialEvents.completeTask('task-1');
```

---

### 3. **Mentorship Scripts** (`mentorshipScripts.ts`)

Конфигурация диалогов ментора с привязкой к состояниям.

**Структура диалога:**
```typescript
interface MentorDialog {
  id: string;
  state: TutorialState;
  speakerName: string;
  avatar: string;
  dialogLines: string[];
  requiredAction: TutorialAction;
  highlightElements?: string[];
  taskId?: string;
  taskTitle?: string;
  metadata?: {
    canSkip?: boolean;
    blockUI?: boolean;
  };
}
```

**Пример:**
```typescript
{
  id: 'show_load_board',
  state: TutorialState.STEP_3_SHOW_LOAD_BOARD,
  speakerName: 'Диспетчер Майк',
  avatar: '📋',
  dialogLines: [
    'Начнём с Load Board — доски грузов.',
    'Нажми на кнопку "Load Board" внизу экрана.'
  ],
  requiredAction: TutorialAction.LOAD_BOARD_OPENED,
  highlightElements: ['[data-onboarding="load-board"]'],
  taskId: 'open_load_board',
  taskTitle: 'Открыть Load Board',
}
```

---

### 4. **Task Tracker** (`taskTracker.ts`)

Управление задачами диспетчера (рабочий лист).

**API:**
```typescript
const taskTracker = getTaskTracker();

// Добавить задачу
taskTracker.addTask('task-1', 'Открыть Load Board', 'Нажмите на кнопку');

// Обновить прогресс
taskTracker.updateTask('task-1', { progress: 50 });

// Завершить задачу
taskTracker.completeTask('task-1');

// Получить текущую задачу
const current = taskTracker.getCurrentTask();

// Получить статистику
const stats = taskTracker.getStatistics();
// { total: 5, completed: 2, active: 1, pending: 2, completionRate: 40 }

// Подписаться на изменения
taskTracker.subscribe((tasks) => {
  console.log('Tasks updated:', tasks);
});
```

---

### 5. **Highlight System** (`HighlightSystem.tsx`)

Event-driven система подсветки элементов UI.

**Использование:**
```typescript
// Подсветить элемент
tutorialEvents.highlightElement(
  '[data-onboarding="load-board"]',
  'Нажми на эту кнопку',
  'top'
);

// Убрать подсветку
tutorialEvents.unhighlightElement('[data-onboarding="load-board"]');

// Очистить все подсветки
tutorialEvents.clearAllHighlights();
```

**Эффекты:**
- Пульсирующая рамка (cyan)
- Свечение
- Автоматическая прокрутка к элементу
- Tooltip с подсказкой

---

### 6. **Task Tracker UI** (`TaskTrackerUI.tsx`)

Визуальное отображение рабочего листа диспетчера.

**Функции:**
- Список всех задач
- Прогресс-бар
- Статус задач (pending, active, completed, failed)
- Компактный/развёрнутый режим
- Позиционирование (top-left, top-right, bottom-left, bottom-right)

---

### 7. **Tutorial Controller** (`TutorialController.tsx`)

Главный контроллер, объединяющий все компоненты.

**Использование:**
```tsx
import { TutorialController } from './components/TutorialController';

function App() {
  const [isNewGame, setIsNewGame] = useState(true);

  return (
    <TutorialController
      isNewGame={isNewGame}
      onComplete={() => console.log('Tutorial completed!')}
      onSkip={() => console.log('Tutorial skipped!')}
    >
      <YourGameComponent />
    </TutorialController>
  );
}
```

---

## 🚀 Быстрый старт

### Шаг 1: Оберните приложение

```tsx
import { TutorialController } from './components/TutorialController';

<TutorialController isNewGame={true}>
  <GamePage />
</TutorialController>
```

### Шаг 2: Добавьте data-атрибуты

```tsx
<button data-onboarding="load-board">
  📋 Load Board
</button>

<div data-onboarding="truck-card">
  Truck #1
</div>

<div data-section="SHIPPER">
  Shipper Info
</div>
```

### Шаг 3: Триггерите события

```tsx
import { getEventBus, TutorialEvent } from './utils/eventBus';

const handleLoadBoardClick = () => {
  getEventBus().emit(TutorialEvent.LOAD_BOARD_OPENED);
  // Ваша логика...
};

const handleLoadSelect = (loadId: string) => {
  getEventBus().emit(TutorialEvent.LOAD_SELECTED, { loadId });
  // Ваша логика...
};
```

---

## 🎯 Примеры интеграции

### Пример 1: Открытие Load Board

```tsx
const LoadBoardButton = () => {
  const eventBus = getEventBus();

  const handleClick = () => {
    // Триггерим событие для обучения
    eventBus.emit(TutorialEvent.LOAD_BOARD_OPENED);
    
    // Открываем Load Board
    setShowLoadBoard(true);
  };

  return (
    <button
      data-onboarding="load-board"
      onClick={handleClick}
    >
      📋 Load Board
    </button>
  );
};
```

### Пример 2: Выбор груза

```tsx
const LoadCard = ({ load }) => {
  const eventBus = getEventBus();

  const handleSelect = () => {
    // Триггерим событие
    eventBus.emit(TutorialEvent.LOAD_SELECTED, { loadId: load.id });
    
    // Выбираем груз
    selectLoad(load);
  };

  return (
    <div
      data-onboarding="load-card"
      onClick={handleSelect}
    >
      <h3>{load.origin} → {load.destination}</h3>
      <p>${load.rate}</p>
    </div>
  );
};
```

### Пример 3: Интерактивный документ

```tsx
const RateConDocument = () => {
  const eventBus = getEventBus();

  useEffect(() => {
    // Триггерим событие при открытии
    eventBus.emit(TutorialEvent.DOCUMENT_OPENED, { type: 'rate-con' });
  }, []);

  const handleFieldClick = (fieldName: string) => {
    // Триггерим событие при клике на поле
    eventBus.emit(TutorialEvent.DOCUMENT_FIELD_CLICKED, { field: fieldName });
  };

  return (
    <div data-onboarding="rate-con-document">
      <div
        data-section="SHIPPER"
        onClick={() => handleFieldClick('SHIPPER')}
      >
        Shipper: ABC Company
      </div>
      <div
        data-section="CONSIGNEE"
        onClick={() => handleFieldClick('CONSIGNEE')}
      >
        Consignee: XYZ Corp
      </div>
    </div>
  );
};
```

---

## 🔄 Flow диаграмма

```
START
  │
  ▼
WELCOME (manual_next)
  │
  ▼
EXPLAIN_GOAL (manual_next)
  │
  ▼
SHOW_LOAD_BOARD (wait for LOAD_BOARD_OPENED)
  │
  ▼
SELECT_LOAD (wait for LOAD_SELECTED)
  │
  ▼
DOC_REVIEW_RATE_CON (wait for RATE_CON_OPENED)
  │
  ▼
EXPLAIN_RATE_CON_FIELDS (wait for RATE_CON_FIELD_CLICKED)
  │
  ▼
RATE_CON_FINALIZE (wait for RATE_CON_CONFIRMED)
  │
  ▼
SELECT_TRUCK (wait for TRUCK_SELECTED)
  │
  ▼
ASSIGN_LOAD (wait for LOAD_ASSIGNED)
  │
  ▼
EXPLAIN_TIME_CONTROL (manual_next)
  │
  ▼
EXPLAIN_HOS (manual_next)
  │
  ▼
MONITOR_TRUCK (manual_next)
  │
  ▼
EXPLAIN_BALANCE (manual_next)
  │
  ▼
FINAL_WORDS (COMPLETE)
  │
  ▼
COMPLETED
```

---

## 🎨 Кастомизация

### Добавление нового шага

1. Добавьте состояние в `TutorialState`
2. Добавьте действие в `TutorialAction`
3. Добавьте переход в `stateTransitions`
4. Добавьте диалог в `mentorshipScripts`

### Изменение диалогов

Отредактируйте `mentorshipScripts.ts`:

```typescript
{
  id: 'my_custom_step',
  state: TutorialState.MY_CUSTOM_STEP,
  speakerName: 'Диспетчер Майк',
  avatar: '🎯',
  dialogLines: [
    'Первая строка диалога',
    'Вторая строка диалога',
  ],
  requiredAction: TutorialAction.MY_CUSTOM_ACTION,
  highlightElements: ['[data-onboarding="my-element"]'],
  taskId: 'my-task',
  taskTitle: 'Моя задача',
}
```

---

## 🐛 Отладка

### Включить логи

```typescript
// State Machine
getTutorialStateMachine().debug();

// Event Bus
getEventBus().debug();

// Task Tracker
getTaskTracker().debug();
```

### Консольные команды

```javascript
// Получить текущее состояние
window.__tutorialGetState();

// Триггернуть действие
window.__tutorialTriggerAction('NEXT');

// Сбросить обучение
localStorage.removeItem('tutorial-completed');
localStorage.removeItem('tutorial-state');
location.reload();
```

---

## ✅ Чеклист интеграции

- [ ] Обернуть приложение в `<TutorialController>`
- [ ] Добавить `data-onboarding` атрибуты
- [ ] Триггерить события через Event Bus
- [ ] Настроить `isNewGame` логику
- [ ] Протестировать все переходы
- [ ] Добавить аналитику (опционально)
- [ ] Добавить озвучку (опционально)

---

## 🚀 Готово к использованию!

Система полностью готова и протестирована. Следуйте документации и примерам выше.

**Удачи в разработке! 🎉**
