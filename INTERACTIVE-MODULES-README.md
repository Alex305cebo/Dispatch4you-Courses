# Interactive Modules - Документация

## 📋 Обзор

Система интерактивных модулей для курсов диспетчера включает два основных компонента:
1. **Case Study Block** - Блоки с реальными кейсами из практики
2. **Quick Check Block** - Интерактивные мини-квизы с проверкой знаний

## 🎯 Архитектура

Каждый модуль разделен на микро-этапы:
- **Audio/Text Block** - Основная информация
- **Real-World Case** - Реальная ситуация из жизни диспетчера
- **Quick Check** - Интерактивный вопрос с вариантами ответов

## 📦 Установка

### 1. Подключите файлы в ваш HTML:

```html
<head>
  <!-- Стили -->
  <link rel="stylesheet" href="interactive-modules.css">
</head>

<body data-module-id="module-1">
  <!-- Ваш контент -->
  
  <!-- JavaScript в конце body -->
  <script src="interactive-modules.js"></script>
</body>
```

### 2. Добавьте атрибут `data-module-id` к body:

```html
<body data-module-id="module-1">
```

## 🎨 Использование компонентов

### Case Study Block (Блок кейса)

```html
<div class="case-study-block">
  <div class="case-study-header">
    <span class="case-study-icon">💼</span>
    <h3 class="case-study-title">Real-World Case: Название кейса</h3>
  </div>
  <div class="case-study-content">
    <p>
      <strong>Ситуация:</strong> Описание реальной ситуации...
    </p>
    <p>
      Дополнительные детали и контекст...
    </p>
    <div class="case-study-highlight">
      💡 Вопрос: Ключевой вопрос для размышления
    </div>
  </div>
</div>
```

**Параметры:**
- `.case-study-icon` - Эмодзи иконка (💼, 🚛, 📊, 💰, etc.)
- `.case-study-title` - Заголовок кейса
- `.case-study-content` - Основной текст
- `.case-study-highlight` - Выделенный блок с вопросом

### Quick Check Block (Интерактивный квиз)

```html
<div class="quick-check-block locked" 
     id="quiz-1" 
     data-quiz-id="quiz-1-1" 
     data-correct-answer="b">
  
  <div class="quick-check-header">
    <span class="quick-check-icon">✅</span>
    <h3 class="quick-check-title">Quick Check</h3>
  </div>
  
  <div class="quick-check-question">
    Текст вопроса?
  </div>
  
  <div class="quick-check-options">
    <div class="quick-check-option">
      <input type="radio" name="quiz-1" id="quiz-1-a" value="a">
      <label for="quiz-1-a">Вариант ответа A</label>
    </div>
    
    <div class="quick-check-option">
      <input type="radio" name="quiz-1" id="quiz-1-b" value="b">
      <label for="quiz-1-b">Вариант ответа B (правильный)</label>
    </div>
    
    <div class="quick-check-option">
      <input type="radio" name="quiz-1" id="quiz-1-c" value="c">
      <label for="quiz-1-c">Вариант ответа C</label>
    </div>
  </div>
  
  <div class="quick-check-feedback">
    <strong>Correct! ✓</strong>
    Объяснение правильного ответа...
  </div>
</div>
```

**Обязательные атрибуты:**
- `id` - Уникальный ID квиза
- `data-quiz-id` - ID для сохранения прогресса (формат: `quiz-{module}-{number}`)
- `data-correct-answer` - Правильный ответ (a, b, c, etc.)
- `class="locked"` - Изначально заблокирован (опционально)

**Важно:**
- Все radio buttons должны иметь одинаковый `name`
- Значение `value` должно совпадать с `data-correct-answer`
- Текст в `.quick-check-feedback` показывается после ответа

### Audio Completion Trigger (Кнопка завершения аудио)

```html
<button class="audio-completion-trigger" 
        data-unlocks="quiz-1" 
        data-section="section-1">
  🎧 I've finished listening
</button>
```

**Атрибуты:**
- `data-unlocks` - ID квиза, который нужно разблокировать
- `data-section` - ID текущей секции (опционально)

## 🎬 Логика работы

### 1. Блокировка квиза
Квиз изначально заблокирован (`class="locked"`) и появляется только после:
- Нажатия кнопки "I've finished listening"
- ИЛИ автоматически после окончания аудио (если есть `<audio>` элемент)

### 2. Проверка ответа
При выборе ответа:
- ✅ **Правильный ответ**: Опция становится зеленой, показывается feedback
- ❌ **Неправильный ответ**: Опция становится красной, правильный ответ подсвечивается зеленым
- Все опции блокируются после ответа

### 3. Сохранение прогресса
Прогресс автоматически сохраняется в `localStorage`:
```javascript
{
  "module-1": {
    "quiz-1-1": {
      "completed": true,
      "correct": true,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 4. Восстановление прогресса
При повторном открытии страницы:
- Пройденные квизы автоматически заполняются
- Правильные ответы отмечены
- Опции заблокированы

## 🎨 Кастомизация

### Изменение цветов

В `interactive-modules.css` можно изменить цветовую схему:

```css
/* Case Study - фиолетовый градиент */
.case-study-block {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
  border: 2px solid rgba(139, 92, 246, 0.3);
}

/* Правильный ответ - зеленый */
.quick-check-option.correct {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.5);
}

/* Неправильный ответ - красный */
.quick-check-option.wrong {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
}
```

### Изменение иконок

Используйте любые эмодзи:
- 💼 Кейсы
- 🚛 Грузоперевозки
- 📊 Статистика
- 💰 Финансы
- 🎯 Цели
- ⚠️ Предупреждения
- ✅ Проверка

## 📱 Мобильная адаптация

Компоненты полностью адаптивны:
- **Tablet (768px)**: Уменьшенные отступы, оптимизированные размеры
- **Mobile (480px)**: Крупные кнопки (28px radio buttons), увеличенные touch targets
- Все тексты масштабируются для читаемости

## 🔧 API

### JavaScript методы

```javascript
// Инициализация (автоматически при загрузке)
window.InteractiveModules.init();

// Загрузка сохраненного прогресса
window.InteractiveModules.loadProgress();
```

### События

Можно добавить кастомные обработчики:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // После ответа на квиз
  document.querySelectorAll('.quick-check-option').forEach(option => {
    option.addEventListener('click', function() {
      console.log('Quiz answered!');
    });
  });
});
```

## 📝 Примеры использования

### Пример 1: Простой модуль

```html
<!-- Теория -->
<div class="content-section">
  <h2>Основы Load Board</h2>
  <p>Текст с объяснением...</p>
  <button class="audio-completion-trigger" data-unlocks="quiz-1">
    🎧 I've finished listening
  </button>
</div>

<!-- Кейс -->
<div class="case-study-block">
  <div class="case-study-header">
    <span class="case-study-icon">💼</span>
    <h3 class="case-study-title">Real-World Case</h3>
  </div>
  <div class="case-study-content">
    <p>Реальная ситуация...</p>
  </div>
</div>

<!-- Квиз -->
<div class="quick-check-block locked" id="quiz-1" data-quiz-id="quiz-1-1" data-correct-answer="a">
  <!-- ... опции ... -->
</div>
```

### Пример 2: Множественные квизы

```html
<!-- Секция 1 -->
<div class="content-section" id="section-1">
  <h2>Тема 1</h2>
  <button class="audio-completion-trigger" data-unlocks="quiz-1">
    🎧 I've finished listening
  </button>
</div>

<div class="quick-check-block locked" id="quiz-1" data-quiz-id="quiz-1-1" data-correct-answer="b">
  <!-- ... -->
</div>

<!-- Секция 2 -->
<div class="content-section" id="section-2">
  <h2>Тема 2</h2>
  <button class="audio-completion-trigger" data-unlocks="quiz-2">
    🎧 I've finished listening
  </button>
</div>

<div class="quick-check-block locked" id="quiz-2" data-quiz-id="quiz-1-2" data-correct-answer="c">
  <!-- ... -->
</div>
```

## 🐛 Troubleshooting

### Квиз не разблокируется
- Проверьте, что `data-unlocks` совпадает с `id` квиза
- Убедитесь, что JavaScript файл подключен

### Ответ не сохраняется
- Проверьте наличие `data-quiz-id` и `data-module-id`
- Убедитесь, что localStorage не заблокирован

### Стили не применяются
- Проверьте порядок подключения CSS файлов
- Убедитесь, что нет конфликтов с другими стилями

## 📄 Лицензия

Эти компоненты созданы для курсов диспетчера и могут быть свободно использованы в образовательных целях.
