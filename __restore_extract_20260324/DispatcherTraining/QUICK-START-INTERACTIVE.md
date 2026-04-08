# 🚀 Quick Start - Интерактивные модули

## Быстрая интеграция в существующие модули

### Шаг 1: Подключите файлы

Добавьте в `<head>` вашего модуля:
```html
<link rel="stylesheet" href="../interactive-modules.css">
```

Добавьте перед закрывающим `</body>`:
```html
<script src="../interactive-modules.js"></script>
```

### Шаг 2: Добавьте атрибут к body

```html
<body data-module-id="module-1">
```

### Шаг 3: Используйте компоненты

#### 💼 Case Study (Кейс)

```html
<div class="case-study-block">
  <div class="case-study-header">
    <span class="case-study-icon">💼</span>
    <h3 class="case-study-title">Real-World Case: Название</h3>
  </div>
  <div class="case-study-content">
    <p><strong>Ситуация:</strong> Описание...</p>
    <div class="case-study-highlight">
      💡 Вопрос: Что делать?
    </div>
  </div>
</div>
```

#### ✅ Quick Check (Квиз)

```html
<!-- Кнопка разблокировки -->
<button class="audio-completion-trigger" data-unlocks="quiz-1">
  🎧 I've finished listening
</button>

<!-- Квиз (изначально заблокирован) -->
<div class="quick-check-block locked" 
     id="quiz-1" 
     data-quiz-id="quiz-1-1" 
     data-correct-answer="b">
  
  <div class="quick-check-header">
    <span class="quick-check-icon">✅</span>
    <h3 class="quick-check-title">Quick Check</h3>
  </div>
  
  <div class="quick-check-question">
    Ваш вопрос?
  </div>
  
  <div class="quick-check-options">
    <div class="quick-check-option">
      <input type="radio" name="quiz-1" id="q1-a" value="a">
      <label for="q1-a">Вариант A</label>
    </div>
    
    <div class="quick-check-option">
      <input type="radio" name="quiz-1" id="q1-b" value="b">
      <label for="q1-b">Вариант B (правильный)</label>
    </div>
    
    <div class="quick-check-option">
      <input type="radio" name="quiz-1" id="q1-c" value="c">
      <label for="q1-c">Вариант C</label>
    </div>
  </div>
  
  <div class="quick-check-feedback">
    <strong>Correct! ✓</strong>
    Объяснение правильного ответа.
  </div>
</div>
```

## 📋 Чек-лист для каждого квиза

- [ ] Уникальный `id` (quiz-1, quiz-2, etc.)
- [ ] Уникальный `data-quiz-id` (quiz-1-1, quiz-1-2, etc.)
- [ ] Правильный `data-correct-answer` (a, b, или c)
- [ ] Класс `locked` для начальной блокировки
- [ ] Одинаковый `name` для всех radio buttons
- [ ] Уникальные `id` для каждого radio button
- [ ] Текст feedback с объяснением

## 🎯 Структура модуля

Рекомендуемая последовательность:

```
1. Теория (content-section)
   └─ Audio completion trigger
   
2. Case Study (case-study-block)
   └─ Реальная ситуация
   
3. Quick Check (quick-check-block)
   └─ Проверка понимания
   
4. Следующая теория...
```

## 💡 Советы

1. **Один квиз на секцию** - не перегружайте студента
2. **Реалистичные кейсы** - используйте реальные цифры и ситуации
3. **Краткие объяснения** - feedback должен быть понятным и коротким
4. **Логическая последовательность** - от простого к сложному

## 🎨 Кастомизация иконок

Используйте подходящие эмодзи:
- 💼 Бизнес-кейсы
- 🚛 Грузоперевозки
- 📊 Аналитика
- 💰 Финансы
- 🎯 Цели
- ⚠️ Важные моменты

## 📱 Мобильная версия

Все компоненты автоматически адаптируются под мобильные устройства:
- Крупные кнопки (28px на телефонах)
- Оптимизированные отступы
- Удобные touch targets

## ✅ Готово!

Теперь ваш модуль интерактивный! Студенты смогут:
- Изучать реальные кейсы
- Проверять свои знания
- Видеть прогресс обучения
- Получать мгновенную обратную связь
