# 🎓 Narrative-Driven Onboarding System

Полная система обучения для новых игроков Dispatch Office с повествовательными диалогами от ментора.

## 📁 Структура файлов

```
adventure/
├── data/
│   └── onboardingData.ts          # Конфигурация шагов обучения
├── hooks/
│   └── useOnboarding.ts           # Хук управления состоянием
├── components/
│   ├── DialogBubble.tsx           # UI компонент диалога (Glassmorphism)
│   └── OnboardingWrapper.tsx      # Обёртка для интеграции
└── examples/
    └── GamePageWithOnboarding.example.tsx  # Пример использования
```

---

## 🚀 Быстрый старт

### 1. Оберните главный компонент игры

```tsx
import { OnboardingWrapper } from './components/OnboardingWrapper';

export default function GamePage() {
  const [isNewGame, setIsNewGame] = useState(true);

  return (
    <OnboardingWrapper isNewGame={isNewGame}>
      {/* Ваш игровой интерфейс */}
    </OnboardingWrapper>
  );
}
```

### 2. Добавьте data-атрибуты к элементам

```tsx
<button data-onboarding="load-board" onClick={handleLoadBoard}>
  📋 Load Board
</button>

<div data-onboarding="truck-card" onClick={handleTruckClick}>
  Truck #1
</div>
```

### 3. Триггерите действия при кликах

```tsx
import { triggerOnboardingAction } from './components/OnboardingWrapper';

const handleLoadBoardClick = () => {
  triggerOnboardingAction('click_load_board');
  // Ваша логика...
};
```

---

## 📋 Доступные действия (Actions)

| Action | Описание | Когда триггерить |
|--------|----------|------------------|
| `manual_next` | Ручной переход по кнопке "Далее" | Автоматически |
| `click_load_board` | Клик на Load Board | При открытии доски грузов |
| `select_load` | Выбор груза | При клике на карточку груза |
| `click_truck` | Клик на трак | При выборе трака |
| `assign_load` | Назначение груза | При подтверждении назначения |
| `click_play` | Начало игры | При запуске игры |
| `open_chat` | Открытие чата | При открытии чата |
| `check_hos` | Проверка HOS | При открытии HOS |

---

## 🎨 Кастомизация шагов

### Добавление нового шага

Откройте `data/onboardingData.ts` и добавьте новый объект в массив `onboardingSteps`:

```typescript
{
  id: 'my_custom_step',
  speakerName: 'Диспетчер Майк',
  avatar: '🎯',
  text: 'Ваш текст диалога здесь...',
  requiredAction: 'manual_next', // или другое действие
  highlightElement: '[data-onboarding="my-element"]',
  position: 'center', // top | bottom | left | right | center
  delay: 500, // задержка перед показом (мс)
}
```

### Изменение аватара

Используйте Fluent Emoji или URL изображения:

```typescript
avatar: '👨‍💼', // Emoji
// или
avatar: 'https://example.com/avatar.png', // URL
```

### Позиционирование диалога

```typescript
position: 'center',  // По центру экрана
position: 'top',     // Сверху
position: 'bottom',  // Снизу
position: 'left',    // Слева
position: 'right',   // Справа
```

---

## 🎯 Подсветка элементов

Система автоматически подсвечивает элементы с помощью CSS-анимации.

### Как это работает:

1. Укажите `highlightElement` в шаге:
```typescript
highlightElement: '[data-onboarding="load-board"]'
```

2. Добавьте атрибут к элементу:
```tsx
<button data-onboarding="load-board">Load Board</button>
```

3. Элемент автоматически получит:
   - Пульсирующую рамку (cyan)
   - Повышенный z-index
   - Свечение

---

## 🔒 Блокировка функций во время обучения

### Автоматическая блокировка

Настройте в `OnboardingWrapper.tsx`:

```typescript
const blockedFeatures: Record<string, string[]> = {
  'welcome': ['load_board', 'chat', 'settings'],
  'show_load_board': ['chat', 'settings'],
};
```

### Проверка блокировки в коде

```typescript
import { isFeatureBlockedByOnboarding } from './components/OnboardingWrapper';

const handleChatOpen = () => {
  if (isFeatureBlockedByOnboarding('chat')) {
    console.log('Chat заблокирован во время обучения');
    return;
  }
  // Открыть чат
};
```

---

## 🎮 API хука useOnboarding

```typescript
const {
  currentStep,           // Текущий шаг (OnboardingStep | null)
  isOnboardingActive,    // Активно ли обучение (boolean)
  isOnboardingComplete,  // Завершено ли обучение (boolean)
  currentStepIndex,      // Индекс текущего шага (number)
  totalSteps,            // Всего шагов (number)
  progress,              // Прогресс 0-100 (number)
  triggerAction,         // Триггер действия (function)
  skipOnboarding,        // Пропустить обучение (function)
  restartOnboarding,     // Перезапустить обучение (function)
  goToNextStep,          // Следующий шаг (function)
  goToPreviousStep,      // Предыдущий шаг (function)
} = useOnboarding(isNewGame);
```

---

## 💾 Сохранение прогресса

Система автоматически сохраняет состояние в `localStorage`:

- **Ключ**: `dispatch-onboarding-completed`
- **Значение**: `'true'` (после завершения)

### Сброс обучения

```typescript
localStorage.removeItem('dispatch-onboarding-completed');
// или
restartOnboarding();
```

---

## 🎨 Стилизация (Glassmorphism)

Компонент `DialogBubble` использует:

- `backdrop-filter: blur(20px)` — размытие фона
- `background: rgba(255, 255, 255, 0.1)` — полупрозрачный фон
- `border: 1px solid rgba(255, 255, 255, 0.2)` — светлая рамка
- `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37)` — глубокая тень

### Кастомизация стилей

Измените стили в `DialogBubble.tsx`:

```tsx
style={{
  background: 'rgba(255, 255, 255, 0.15)', // Более яркий фон
  backdropFilter: 'blur(30px)',            // Сильнее размытие
  border: '2px solid rgba(255, 255, 255, 0.3)', // Толще рамка
}}
```

---

## 🔊 Добавление озвучки (будущее)

Структура уже готова для добавления аудио:

```typescript
{
  id: 'welcome',
  speakerName: 'Диспетчер Майк',
  avatar: '👨‍💼',
  text: 'Привет! Я Майк...',
  audioUrl: '/audio/onboarding/welcome.mp3', // Добавьте URL
  requiredAction: 'manual_next',
}
```

Затем в `DialogBubble.tsx` добавьте:

```tsx
useEffect(() => {
  if (step.audioUrl) {
    const audio = new Audio(step.audioUrl);
    audio.play();
  }
}, [step]);
```

---

## 📊 Аналитика

Хук автоматически логирует события:

```typescript
console.log('✅ Action completed: click_load_board');
console.log('✅ Onboarding completed!');
console.log('⏭️ Onboarding skipped');
console.log('🔄 Onboarding restarted');
```

Добавьте свою аналитику:

```typescript
// В useOnboarding.ts
const goToNextStep = useCallback(() => {
  // Ваша аналитика
  analytics.track('onboarding_step_completed', {
    step: currentStep?.id,
    index: currentStepIndex,
  });
  
  // ...остальной код
}, [currentStepIndex]);
```

---

## 🐛 Отладка

### Включить логи

```typescript
// В useOnboarding.ts
console.log('Current step:', currentStep);
console.log('Is active:', isOnboardingActive);
console.log('Progress:', progress);
```

### Сбросить состояние

```javascript
// В консоли браузера
localStorage.removeItem('dispatch-onboarding-completed');
location.reload();
```

### Пропустить шаг вручную

```javascript
// В консоли браузера
window.__onboardingTrigger('manual_next');
```

---

## ✅ Чеклист интеграции

- [ ] Обернуть главный компонент в `<OnboardingWrapper>`
- [ ] Добавить `data-onboarding` атрибуты к элементам
- [ ] Вызывать `triggerOnboardingAction()` при действиях
- [ ] Настроить `isNewGame` логику
- [ ] Протестировать все шаги
- [ ] Настроить блокировку функций (опционально)
- [ ] Добавить аналитику (опционально)
- [ ] Добавить озвучку (опционально)

---

## 🎯 Примеры использования

### Пример 1: Простая интеграция

```tsx
import { OnboardingWrapper, triggerOnboardingAction } from './components/OnboardingWrapper';

function Game() {
  return (
    <OnboardingWrapper isNewGame={true}>
      <button 
        data-onboarding="load-board"
        onClick={() => triggerOnboardingAction('click_load_board')}
      >
        Load Board
      </button>
    </OnboardingWrapper>
  );
}
```

### Пример 2: С блокировкой функций

```tsx
import { isFeatureBlockedByOnboarding } from './components/OnboardingWrapper';

function ChatButton() {
  const handleClick = () => {
    if (isFeatureBlockedByOnboarding('chat')) {
      alert('Чат будет доступен после обучения');
      return;
    }
    openChat();
  };

  return <button onClick={handleClick}>💬 Chat</button>;
}
```

### Пример 3: Кастомный контроль

```tsx
import { useOnboarding } from './hooks/useOnboarding';

function CustomOnboarding() {
  const { currentStep, skipOnboarding, goToNextStep } = useOnboarding(true);

  return (
    <div>
      <p>{currentStep?.text}</p>
      <button onClick={goToNextStep}>Next</button>
      <button onClick={skipOnboarding}>Skip</button>
    </div>
  );
}
```

---

## 🚀 Готово к использованию!

Система полностью готова к интеграции. Следуйте чеклисту выше и примерам из `GamePageWithOnboarding.example.tsx`.

**Удачи в разработке! 🎉**
