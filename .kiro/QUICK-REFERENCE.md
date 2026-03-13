# ⚡ БЫСТРАЯ ШПАРГАЛКА

## 🔴 ГЛАВНОЕ ПРАВИЛО
**ВСЕГДА ОБНОВЛЯЙ:** `pages/modules-index.html`

---

## 📁 СТРУКТУРА МОДУЛЯ

```
Модуль = 7 секторов
Каждый сектор = Контент + Case Study + Квиз
```

---

## 🎨 ЦВЕТА

```css
--primary: #667eea;        /* Синий */
--secondary: #764ba2;      /* Фиолетовый */
--accent: #f093fb;         /* Розовый */
--success: #10b981;        /* Зеленый */
--audio: #ff6b6b → #4ecdc4 /* Градиент */
```

---

## 🎧 АУДИО ЭЛЕМЕНТЫ

```html
<!-- Кнопка -->
<button class="audio-btn" onclick="toggleAudio(this, 'audioX')">
    <span class="play-icon">▶</span>
    <span class="pause-icon">⏸</span>
</button>

<!-- Прогресс-кольцо (desktop) -->
<svg class="progress-ring">
    <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
    <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
</svg>

<!-- Прогресс-полоса (mobile) -->
<div class="mobile-progress-bar">
    <div class="mobile-progress-fill"></div>
</div>
```

---

## 💼 CASE STUDY

```html
<div class="case-study-block">
    <div class="case-study-header">
        <span class="case-study-icon">💼</span>
        <h3>Реальный кейс: [Название]</h3>
    </div>
    <div class="case-study-content">
        <p><strong>Ситуация:</strong> [Описание]</p>
        <div class="case-study-highlight">
            💡 Вопрос: [Что делать?]
        </div>
        <div class="case-study-solution">
            <h4>✅ Решение:</h4>
            <p>[Действия]</p>
        </div>
    </div>
</div>
```

---

## ✅ КВИЗ

```html
<div class="quick-check-block locked" id="quiz-X" data-correct-answer="b">
    <div class="quick-check-header">
        <span class="quick-check-icon">✅</span>
        <h3>Быстрая проверка</h3>
    </div>
    <div class="quick-check-content">
        <p class="quiz-question"><strong>Вопрос:</strong> [Текст]</p>
        <div class="quiz-options">
            <div class="quiz-option" data-answer="a">
                <span class="option-letter">A</span>
                <span class="option-text">[Вариант A]</span>
            </div>
            <!-- B, C аналогично -->
        </div>
        <div class="quiz-feedback">
            <strong>Правильно! ✓</strong> [Объяснение]
        </div>
    </div>
</div>
```

---

## 🔄 WORKFLOW

1. Создать файл `doc-module-X-complete.html`
2. Скопировать структуру из модуля 1
3. Заполнить 7 секторов
4. Добавить 7 case study
5. Добавить 7 квизов
6. 🔴 **Обновить modules-index.html**
7. Протестировать
8. Создать отчет SESSION-*.md

---

## 📱 АДАПТИВНОСТЬ

```css
/* Desktop: кольцо прогресса */
@media (min-width: 769px) {
    .progress-ring { display: block; }
    .mobile-progress-bar { display: none; }
}

/* Mobile: полоса прогресса */
@media (max-width: 768px) {
    .progress-ring { display: none !important; }
    .mobile-progress-bar { display: block; }
}
```

---

## 🎯 ЧЕКЛИСТ

- [ ] 7 секторов ✓
- [ ] 7 аудио-кнопок ✓
- [ ] 7 case study ✓
- [ ] 7 квизов ✓
- [ ] 🔴 modules-index.html обновлен ✓
- [ ] Навигация работает ✓
- [ ] Адаптивность проверена ✓
- [ ] Отчет создан ✓

---

## 📚 РЕФЕРЕНСЫ

- **Структура:** `pages/doc-module-1-complete.html`
- **План:** `MODULE-1-REBUILD-PLAN.md`
- **Правила:** `.kiro/IMPORTANT-RULES.md`

---

## 🚨 НЕ ЗАБЫТЬ!

1. 🔴 Обновить modules-index.html
2. Уникальные ID для квизов
3. Правильный data-correct-answer
4. Мобильная адаптация
5. Создать отчет

---

**Полная версия:** `.kiro/IMPORTANT-RULES.md`
