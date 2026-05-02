# 🚀 Tutorial System — Руководство по интеграции

## Что было создано

Модульная система нарративного обучения для DispatcherTraining с чистой архитектурой и полной изоляцией компонентов.

### 📦 Структура файлов

```
DispatcherTraining/
├── js/tutorial/
│   ├── TutorialStateMachine.js      # State Machine (FSM)
│   ├── MentorshipData.js            # Данные обучения
│   ├── TutorialUIController.js      # UI контроллер
│   ├── TutorialManager.js           # Главный оркестратор
│   ├── integration.js               # Интеграция с игрой
│   └── README.md                    # Документация
├── tutorial-demo.html               # Демо-страница
└── TUTORIAL_INTEGRATION_GUIDE.md    # Это руководство
```

---

## 🎯 Шаг 1: Базовая интеграция

### Вариант A: Автоматическая интеграция (рекомендуется)

Добавь в главный файл игры (например `game2.html` или `game-core.js`):

```html
<!-- В конце <body>, перед закрывающим тегом -->
<script type="module">
  import { initializeAll } from './js/tutorial/integration.js';
  
  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', () => {
    const tutorialManager = initializeAll();
    console.log('Tutorial system ready:', tutorialManager);
  });
</script>
```

**Что это делает:**
- Автоматически запускает обучение для новых пользователей
- Интегрируется с документами (`.rc-field`)
- Добавляет обработчики для игровых кнопок
- Создаёт dev-контролы на localhost

### Вариант B: Ручная интеграция

Если нужен полный контроль:

```javascript
import { TutorialManager } from './js/tutorial/TutorialManager.js';

const tutorial = new TutorialManager();

// Запуск обучения вручную
function startTutorial() {
  tutorial.start();
}

// Проверка завершения
if (!tutorial.isCompleted()) {
  // Показать кнопку "Пройти обучение"
  showTutorialButton();
}
```

---

## 🎯 Шаг 2: Интеграция с существующими элементами

### 2.1 Документы (Rate Con, BOL, POD)

Твои документы уже используют правильную структуру! Просто убедись что все поля имеют:

```html
<div class="rc-field" 
     data-section="Название поля"
     data-tooltip="Подсказка для игрока">
  <!-- Содержимое поля -->
</div>
```

**Пример из твоего `docs.html`:**
```html
<div class="rc-field"
     data-section="Rate"
     data-tooltip="Ставка за перевозку.<br><br>Проверь что она соответствует договорённости."
     style="...">
  <strong>RATE:</strong> $2,800.00
</div>
```

✅ **Это уже готово к работе!** Система автоматически подхватит эти поля.

### 2.2 Игровые кнопки

Добавь ID к кнопкам которые используются в обучении:

```html
<!-- Кнопка начала смены -->
<button id="start-shift-btn">Начать смену</button>

<!-- Кнопка принятия груза -->
<button id="accept-load-btn">Принять груз</button>

<!-- Кнопка отправки dispatch -->
<button id="send-dispatch-btn">Отправить dispatch</button>

<!-- Кнопка отправки POD -->
<button id="send-pod-btn">Отправить POD</button>

<!-- Кнопка начала игры -->
<button id="start-game-btn">Начать игру</button>
```

### 2.3 Траки на карте

Добавь класс и data-атрибут к маркерам траков:

```html
<div class="truck-marker" data-truck="truck_1">
  <!-- Содержимое маркера -->
</div>
```

Или в JavaScript:
```javascript
const marker = document.createElement('div');
marker.className = 'truck-marker';
marker.dataset.truck = `truck_${truckId}`;
```

### 2.4 Письма в inbox

```html
<div class="email-item" data-subject="Rate Confirmation - Load #12345">
  <div class="email-subject">Rate Confirmation - Load #12345</div>
  <div class="email-preview">New load from ABC Logistics...</div>
</div>
```

---

## 🎯 Шаг 3: Связь с игровой логикой

### 3.1 Обновление контекста обучения

Когда игрок выполняет действия, обновляй контекст:

```javascript
// Пример: игрок принял груз
function acceptLoad(loadData, truckId) {
  // Твоя игровая логика
  assignLoadToTruck(loadData, truckId);
  
  // Обновляем контекст обучения
  if (window.tutorialManager && window.tutorialManager.isActive) {
    window.tutorialManager.context.loadAccepted = true;
    window.tutorialManager.context.assignedTruck = truckId;
  }
}
```

### 3.2 Проверка активности обучения

```javascript
function handleGameAction() {
  // Проверяем режим
  if (window.tutorialManager && window.tutorialManager.isActive) {
    // Логика для обучения (упрощённая, без случайных событий)
    console.log('Tutorial mode: simplified logic');
  } else {
    // Обычная игровая логика
    console.log('Normal game mode: full complexity');
  }
}
```

### 3.3 Отключение случайных событий в обучении

```javascript
function generateRandomEvent() {
  // Не генерируем случайные события во время обучения
  if (window.tutorialManager && window.tutorialManager.isActive) {
    return null;
  }
  
  // Обычная логика генерации событий
  return getRandomEvent();
}
```

---

## 🎯 Шаг 4: Настройка шагов обучения

### 4.1 Редактирование существующих шагов

Открой `js/tutorial/MentorshipData.js` и измени массив `TUTORIAL_STEPS`:

```javascript
{
  id: 'STEP_4_RATE_CON_REVIEW',
  title: 'Проверка Rate Confirmation',
  mentorDialog: `
    Твой текст наставника здесь.
    Можно использовать многострочный текст.
  `,
  task: 'Задача для игрока',
  ui: {
    highlight: '#doc-ratecon',  // Селектор элемента
    position: 'left',            // top/bottom/left/right
    pulse: true,                 // Пульсация
    arrow: true                  // Стрелка
  },
  validation: {
    type: 'custom',
    check: (context) => context.checkedFields.size >= 5
  },
  nextSteps: ['STEP_5_RATE_CON_ACCEPT']
}
```

### 4.2 Добавление нового шага

Просто добавь новый объект в массив:

```javascript
export const TUTORIAL_STEPS = [
  // ... существующие шаги
  
  {
    id: 'STEP_12_NEW_FEATURE',
    title: 'Новая фича',
    mentorDialog: 'Объяснение новой фичи...',
    task: 'Попробуй новую фичу',
    ui: {
      highlight: '#new-feature-btn',
      position: 'bottom'
    },
    validation: {
      type: 'button_click',
      target: '#new-feature-btn'
    },
    nextSteps: ['STEP_13_NEXT']
  }
];
```

### 4.3 Типы валидации

**Button Click:**
```javascript
validation: {
  type: 'button_click',
  target: '#my-button'
}
```

**Custom Logic:**
```javascript
validation: {
  type: 'custom',
  check: (context) => {
    return context.someCondition === true;
  }
}
```

**Time Based:**
```javascript
validation: {
  type: 'time_based',
  duration: 5000  // 5 секунд
}
```

**Choice:**
```javascript
validation: {
  type: 'choice',
  correctChoice: 'option_a'
},
ui: {
  options: [
    { id: 'option_a', text: 'Правильный вариант' },
    { id: 'option_b', text: 'Неправильный вариант' }
  ]
}
```

---

## 🎯 Шаг 5: Тестирование

### 5.1 Демо-страница

Открой `tutorial-demo.html` в браузере:

```bash
# Если используешь локальный сервер
python -m http.server 8000

# Открой в браузере
http://localhost:8000/tutorial-demo.html
```

### 5.2 Dev Controls

На localhost автоматически появятся кнопки управления:
- ▶️ Начать обучение
- ⏸️ Остановить
- 🔄 Сбросить

### 5.3 Console API

Открой консоль браузера (F12):

```javascript
// Доступ к менеджеру
window.tutorialManager

// Текущее состояние
window.tutorialManager.stateMachine.getCurrentState()

// Прогресс
window.tutorialManager.getProgress()

// История переходов
window.tutorialManager.stateMachine.getHistory()

// Контекст
window.tutorialManager.context

// Запуск/остановка
window.tutorialManager.start()
window.tutorialManager.stop()
window.tutorialManager.reset()
```

---

## 🎯 Шаг 6: Продакшн

### 6.1 Отключение dev-контролов

Dev-контролы автоматически скрываются на продакшне (не localhost).

### 6.2 Условия запуска

Обучение запускается автоматически если:
- ✅ Пользователь авторизован
- ✅ Это первый запуск игры
- ✅ Нет сохранённого прогресса игры
- ✅ Обучение не было пройдено ранее

### 6.3 Сброс для тестирования

```javascript
// В консоли браузера
localStorage.removeItem('tutorial_completed');
localStorage.removeItem('tutorial_progress');
localStorage.removeItem('game_launched_before');
location.reload();
```

---

## 📊 Архитектура системы

```
┌─────────────────────────────────────────────────────────┐
│                   TutorialManager                        │
│                  (Главный оркестратор)                   │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
             ▼              ▼              ▼
    ┌────────────┐  ┌──────────────┐  ┌──────────────┐
    │   State    │  │      UI      │  │     Data     │
    │  Machine   │  │  Controller  │  │    Layer     │
    └────────────┘  └──────────────┘  └──────────────┘
         │                 │                  │
         │                 │                  │
         ▼                 ▼                  ▼
    Контроль          Визуализация       Диалоги
    прогресса         и анимации         и задачи
```

### Принципы:

1. **Модульность** — каждый модуль изолирован
2. **Масштабируемость** — легко добавлять новые шаги
3. **Интеграция** — не ломает существующий код
4. **Чистота** — нет спагетти-кода

---

## 🐛 Troubleshooting

### Проблема: Обучение не запускается

**Решение:**
```javascript
// Проверь условия в консоли
console.log('User:', localStorage.getItem('user'));
console.log('Completed:', localStorage.getItem('tutorial_completed'));
console.log('Launched:', localStorage.getItem('game_launched_before'));

// Принудительный запуск
window.tutorialManager.start(true);
```

### Проблема: Элемент не подсвечивается

**Решение:**
```javascript
// Проверь что селектор правильный
document.querySelector('#your-element');  // Должен вернуть элемент

// Проверь что элемент видим
element.offsetParent !== null;  // Должно быть true
```

### Проблема: Шаг не переключается

**Решение:**
```javascript
// Проверь валидацию в консоли
const step = TUTORIAL_STEPS.find(s => s.id === 'STEP_ID');
console.log('Validation:', step.validation);

// Проверь контекст
console.log('Context:', window.tutorialManager.context);
```

---

## 📚 Дополнительные ресурсы

- **README.md** — полная документация API
- **tutorial-demo.html** — рабочая демонстрация
- **MentorshipData.js** — примеры всех типов шагов

---

## ✅ Чеклист интеграции

- [ ] Добавил `import { initializeAll }` в главный файл игры
- [ ] Добавил ID к игровым кнопкам
- [ ] Добавил `class="rc-field"` к полям документов
- [ ] Добавил `class="truck-marker"` к тракам на карте
- [ ] Протестировал на demo-странице
- [ ] Проверил в консоли что `window.tutorialManager` доступен
- [ ] Прошёл обучение от начала до конца
- [ ] Проверил что обучение не ломает обычную игру

---

**Готово!** 🎉

Система полностью готова к использованию. Если нужна помощь — все модули хорошо задокументированы и логируют свои действия в консоль.

---

**Автор:** Kiro AI  
**Дата:** 2026-05-02  
**Версия:** 1.0.0
