# 📚 Tutorial System — Примеры кода

Практические примеры использования системы обучения.

---

## 🚀 Быстрый старт

### Пример 1: Базовая интеграция

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Моя игра</title>
</head>
<body>
  <!-- Ваш игровой контент -->
  
  <!-- Подключение системы обучения -->
  <script type="module">
    import { initializeAll } from './js/tutorial/integration.js';
    
    // Автоматическая инициализация
    const tutorial = initializeAll();
    
    console.log('Tutorial ready:', tutorial);
  </script>
</body>
</html>
```

---

## 📝 Добавление нового шага

### Пример 2: Простой шаг с кнопкой

```javascript
// В MentorshipData.js
{
  id: 'STEP_NEW_FEATURE',
  title: 'Новая фича',
  mentorDialog: `
    Мы добавили новую фичу — калькулятор прибыли.
    Он автоматически считает твой доход за смену.
  `,
  task: 'Открой калькулятор прибыли',
  ui: {
    highlight: '#profit-calculator-btn',
    position: 'bottom',
    arrow: true
  },
  validation: {
    type: 'button_click',
    target: '#profit-calculator-btn'
  },
  nextSteps: ['STEP_NEXT']
}
```

### Пример 3: Шаг с кастомной валидацией

```javascript
{
  id: 'STEP_FILL_FORM',
  title: 'Заполнение формы',
  mentorDialog: `
    Заполни форму detention claim.
    Укажи количество часов простоя и ставку.
  `,
  task: 'Заполни все поля формы',
  ui: {
    highlight: '#detention-form',
    position: 'right'
  },
  validation: {
    type: 'custom',
    check: (context) => {
      // Проверяем что все поля заполнены
      return context.detentionHours > 0 && 
             context.detentionRate > 0 &&
             context.detentionReason !== '';
    }
  },
  nextSteps: ['STEP_SUBMIT_CLAIM']
}
```

### Пример 4: Шаг с выбором варианта

```javascript
{
  id: 'STEP_DECISION',
  title: 'Принятие решения',
  mentorDialog: `
    Водитель опаздывает на 2 часа из-за пробки.
    Что ты сделаешь?
  `,
  task: 'Выбери правильное действие',
  ui: {
    options: [
      { 
        id: 'notify_broker', 
        text: '📞 Уведомить брокера о задержке' 
      },
      { 
        id: 'wait', 
        text: '⏳ Ничего не делать, подождать' 
      },
      { 
        id: 'cancel', 
        text: '❌ Отменить груз' 
      }
    ]
  },
  validation: {
    type: 'choice',
    correctChoice: 'notify_broker'
  },
  nextSteps: ['STEP_BROKER_NOTIFIED']
}
```

### Пример 5: Шаг с автоматическим переходом

```javascript
{
  id: 'STEP_LOADING',
  title: 'Загрузка данных',
  mentorDialog: `
    Загружаем данные о грузах...
    Это займёт несколько секунд.
  `,
  task: 'Подожди пока данные загрузятся',
  ui: {
    highlight: null,  // Нет подсветки
    position: 'center'
  },
  validation: {
    type: 'time_based',
    duration: 3000  // 3 секунды
  },
  nextSteps: ['STEP_DATA_LOADED']
}
```

---

## 🎮 Интеграция с игровой логикой

### Пример 6: Обновление контекста при действии игрока

```javascript
// В вашем игровом коде
function acceptLoad(loadData, truckId) {
  // Ваша игровая логика
  const load = {
    id: loadData.id,
    rate: loadData.rate,
    pickup: loadData.pickup,
    delivery: loadData.delivery
  };
  
  assignLoadToTruck(load, truckId);
  
  // Обновляем контекст обучения
  if (window.tutorialManager && window.tutorialManager.isActive) {
    window.tutorialManager.context.loadAccepted = true;
    window.tutorialManager.context.assignedTruck = truckId;
    window.tutorialManager.context.loadData = load;
    
    console.log('[Game] Tutorial context updated:', window.tutorialManager.context);
  }
  
  // Показываем уведомление
  showNotification('Груз принят!');
}
```

### Пример 7: Проверка режима обучения

```javascript
function generateRandomEvent() {
  // Не генерируем случайные события во время обучения
  if (window.tutorialManager && window.tutorialManager.isActive) {
    console.log('[Game] Tutorial mode: skipping random events');
    return null;
  }
  
  // Обычная логика генерации событий
  const events = ['breakdown', 'detention', 'weather', 'inspection'];
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  
  return {
    type: randomEvent,
    severity: Math.random() > 0.5 ? 'high' : 'low',
    timestamp: Date.now()
  };
}
```

### Пример 8: Упрощённая логика для обучения

```javascript
function calculateDeliveryTime(distance, truckSpeed) {
  // В режиме обучения используем упрощённый расчёт
  if (window.tutorialManager && window.tutorialManager.isActive) {
    // Простая формула без учёта HOS, погоды и т.д.
    const hours = distance / truckSpeed;
    return Date.now() + hours * 3600 * 1000;
  }
  
  // Обычная сложная логика
  const hoursOfService = calculateHOS(truckId);
  const weatherDelay = getWeatherDelay(route);
  const trafficDelay = getTrafficDelay(route);
  
  const totalTime = (distance / truckSpeed) + hoursOfService + weatherDelay + trafficDelay;
  return Date.now() + totalTime * 3600 * 1000;
}
```

---

## 🎨 Кастомизация UI

### Пример 9: Изменение стиля диалога наставника

```javascript
// После инициализации
const tutorial = initializeAll();

// Кастомизация стилей
const mentorDialog = document.getElementById('mentor-dialog');
if (mentorDialog) {
  mentorDialog.style.background = 'linear-gradient(135deg, #1e293b, #334155)';
  mentorDialog.style.borderColor = '#f97316';
}
```

### Пример 10: Добавление кастомной анимации

```javascript
// В TutorialUIController
highlightElement(selector, options) {
  // ... существующий код
  
  // Добавляем кастомную анимацию
  if (options.customAnimation) {
    highlight.style.animation = options.customAnimation;
  }
}

// Использование
uiController.highlightElement('#element', {
  position: 'top',
  customAnimation: 'bounce 1s infinite'
});
```

---

## 🔧 Расширение функциональности

### Пример 11: Добавление нового типа валидации

```javascript
// В TutorialManager._validateStepCompletion()
_validateStepCompletion(step, context) {
  if (!step.validation) return true;

  switch (step.validation.type) {
    // ... существующие типы
    
    // Новый тип: проверка заполнения формы
    case 'form_filled':
      const form = document.querySelector(step.validation.formSelector);
      if (!form) return false;
      
      const inputs = form.querySelectorAll('input[required]');
      return Array.from(inputs).every(input => input.value.trim() !== '');
    
    // Новый тип: проверка скролла до элемента
    case 'scrolled_to':
      const element = document.querySelector(step.validation.target);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    default:
      return true;
  }
}
```

### Пример 12: Добавление аналитики

```javascript
// В TutorialManager._onStepEnter()
_onStepEnter(step, context) {
  console.log(`[TutorialManager] Entering step: ${step.id}`);
  
  // Отправляем событие в аналитику
  if (typeof gtag !== 'undefined') {
    gtag('event', 'tutorial_step', {
      step_id: step.id,
      step_title: step.title,
      user_id: context.userId || 'anonymous'
    });
  }
  
  // ... остальной код
}
```

---

## 🎯 Специальные сценарии

### Пример 13: Условный запуск обучения

```javascript
// В integration.js
function checkTutorialConditions() {
  // Базовые проверки
  if (localStorage.getItem('tutorial_completed') === 'true') {
    return false;
  }
  
  // Дополнительные условия
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Запускаем только для определённых ролей
  if (user && user.role === 'admin') {
    console.log('[Integration] Admin user, skipping tutorial');
    return false;
  }
  
  // Запускаем только если пользователь новый (зарегистрирован менее 24 часов назад)
  if (user && user.registeredAt) {
    const hoursSinceRegistration = (Date.now() - user.registeredAt) / (1000 * 60 * 60);
    if (hoursSinceRegistration > 24) {
      console.log('[Integration] User registered more than 24h ago, skipping tutorial');
      return false;
    }
  }
  
  return true;
}
```

### Пример 14: Пропуск шагов на основе прогресса игрока

```javascript
// В TutorialManager.start()
start(forceRestart = false) {
  if (this.isActive) return;
  
  // Проверяем прогресс игрока
  const gameProgress = JSON.parse(localStorage.getItem('game_progress') || '{}');
  
  // Если игрок уже прошёл первые 3 шага в игре — пропускаем их в обучении
  if (gameProgress.completedLoads > 0) {
    console.log('[TutorialManager] Player has experience, skipping intro steps');
    this.stateMachine.transitionTo('STEP_4_RATE_CON_REVIEW', this.context);
  } else {
    // Начинаем с первого шага
    this.stateMachine.transitionTo('STEP_1_WELCOME', this.context);
  }
  
  this.isActive = true;
}
```

### Пример 15: Повторное обучение для новых фич

```javascript
// Создаём отдельное обучение для новой фичи
function startFeatureTutorial(featureName) {
  const featureTutorials = {
    'detention_claims': [
      {
        id: 'FEATURE_DETENTION_1',
        title: 'Новая фича: Detention Claims',
        mentorDialog: 'Мы добавили автоматическое оформление detention claims...',
        // ... остальная конфигурация
      }
    ],
    'route_optimizer': [
      {
        id: 'FEATURE_OPTIMIZER_1',
        title: 'Новая фича: Оптимизатор маршрутов',
        mentorDialog: 'Теперь система автоматически предлагает оптимальные маршруты...',
        // ... остальная конфигурация
      }
    ]
  };
  
  const steps = featureTutorials[featureName];
  if (!steps) {
    console.warn(`[FeatureTutorial] Unknown feature: ${featureName}`);
    return;
  }
  
  // Создаём временный tutorial manager для фичи
  const featureTutorial = new TutorialManager();
  
  // Регистрируем шаги фичи
  steps.forEach(step => {
    featureTutorial.stateMachine.registerState(step.id, {
      onEnter: (context) => featureTutorial._onStepEnter(step, context),
      onExit: (context) => featureTutorial._onStepExit(step, context),
      allowedTransitions: step.nextSteps,
      metadata: step
    });
  });
  
  // Запускаем
  featureTutorial.start();
}

// Использование
startFeatureTutorial('detention_claims');
```

---

## 🐛 Отладка и тестирование

### Пример 16: Логирование всех событий

```javascript
// Подписываемся на все события State Machine
window.tutorialManager.stateMachine.subscribe((event) => {
  console.group(`[StateMachine Event] ${event.type}`);
  console.log('From:', event.from);
  console.log('To:', event.to);
  console.log('Context:', event.context);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
});

// Подписываемся на UI события
window.tutorialManager.uiController.on('mentor_action', (data) => {
  console.log('[UI Event] Mentor action:', data);
});
```

### Пример 17: Автоматическое прохождение обучения (для тестирования)

```javascript
// Функция для автоматического прохождения всех шагов
async function autoCompleteTutorial() {
  const tutorial = window.tutorialManager;
  if (!tutorial) {
    console.error('Tutorial not initialized');
    return;
  }
  
  console.log('[AutoComplete] Starting...');
  
  while (tutorial.isActive) {
    const currentState = tutorial.stateMachine.getCurrentState();
    console.log('[AutoComplete] Current step:', currentState);
    
    // Имитируем действия игрока
    const step = TUTORIAL_STEPS.find(s => s.id === currentState);
    if (!step) break;
    
    // Ждём 2 секунды
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Выполняем действие в зависимости от типа валидации
    switch (step.validation.type) {
      case 'button_click':
        const btn = document.querySelector(step.validation.target);
        if (btn) btn.click();
        break;
        
      case 'custom':
        // Обновляем контекст чтобы пройти валидацию
        if (step.id === 'STEP_2_MORNING_BRIEFING') {
          tutorial.context.clickedTrucks = new Set(['truck_1', 'truck_2', 'truck_3']);
        }
        tutorial._nextStep();
        break;
        
      default:
        tutorial._nextStep();
    }
    
    // Ждём переход
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('[AutoComplete] Finished!');
}

// Запуск
autoCompleteTutorial();
```

### Пример 18: Тестирование конкретного шага

```javascript
// Функция для перехода к конкретному шагу
function jumpToStep(stepId) {
  const tutorial = window.tutorialManager;
  if (!tutorial) {
    console.error('Tutorial not initialized');
    return;
  }
  
  // Проверяем что шаг существует
  if (!tutorial.stateMachine.states.has(stepId)) {
    console.error(`Step "${stepId}" does not exist`);
    return;
  }
  
  // Принудительный переход
  tutorial.stateMachine.currentState = null;  // Сбрасываем текущее состояние
  tutorial.stateMachine.transitionTo(stepId, tutorial.context);
  
  console.log(`[Debug] Jumped to step: ${stepId}`);
}

// Использование
jumpToStep('STEP_4_RATE_CON_REVIEW');
```

---

## 📊 Мониторинг и аналитика

### Пример 19: Сбор статистики прохождения

```javascript
// Расширяем TutorialManager для сбора статистики
class TutorialManagerWithAnalytics extends TutorialManager {
  constructor() {
    super();
    this.analytics = {
      startTime: null,
      stepTimes: {},
      errors: [],
      skipped: false
    };
  }
  
  start(forceRestart = false) {
    this.analytics.startTime = Date.now();
    super.start(forceRestart);
  }
  
  _onStepEnter(step, context) {
    this.analytics.stepTimes[step.id] = {
      enterTime: Date.now(),
      exitTime: null
    };
    super._onStepEnter(step, context);
  }
  
  _onStepExit(step, context) {
    if (this.analytics.stepTimes[step.id]) {
      this.analytics.stepTimes[step.id].exitTime = Date.now();
    }
    super._onStepExit(step, context);
  }
  
  skip() {
    this.analytics.skipped = true;
    this.sendAnalytics();
    super.skip();
  }
  
  stop() {
    if (!this.analytics.skipped) {
      this.sendAnalytics();
    }
    super.stop();
  }
  
  sendAnalytics() {
    const totalTime = Date.now() - this.analytics.startTime;
    const completedSteps = Object.keys(this.analytics.stepTimes).length;
    
    const analyticsData = {
      totalTime,
      completedSteps,
      skipped: this.analytics.skipped,
      stepTimes: this.analytics.stepTimes,
      errors: this.analytics.errors
    };
    
    console.log('[Analytics] Tutorial completed:', analyticsData);
    
    // Отправка на сервер
    fetch('/api/analytics/tutorial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    });
  }
}
```

---

**Эти примеры покрывают большинство сценариев использования системы обучения.**

Для более сложных кейсов — читай полную документацию в **README.md** и **ARCHITECTURE.md**.

---

**Автор:** Kiro AI  
**Дата:** 2026-05-02
