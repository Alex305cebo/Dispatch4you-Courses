# ✅ Чеклист адаптивности для каждой новой страницы

## Обязательно добавлять при создании любого нового контента!

### 1. Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 2. Базовые стили
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
}
```

### 3. Breakpoints (все 5!)
```css
@media (max-width: 1400px) { /* Large Desktop */ }
@media (max-width: 1024px) { /* Tablet Landscape */ }
@media (max-width: 768px)  { /* Tablet/Mobile */ }
@media (max-width: 480px)  { /* Mobile */ }
@media (max-width: 360px)  { /* Small Mobile */ }
```

### 4. Адаптивные элементы

#### Контейнеры
- Desktop: `padding: 0 40px`
- Tablet: `padding: 0 20px`
- Mobile: `padding: 0 16px`
- Small: `padding: 0 12px`

#### Grid
- Desktop: `grid-template-columns: repeat(3, 1fr)`
- Tablet: `grid-template-columns: repeat(2, 1fr)`
- Mobile: `grid-template-columns: 1fr`

#### Типографика
- h1: 72px → 48px → 36px → 30px
- h2: 48px → 36px → 28px → 24px
- h3: 32px → 24px → 20px → 18px
- p: 18px → 16px → 15px → 14px

#### Навигация
- Desktop: горизонтальное меню
- Mobile (< 768px): гамбургер меню

### 5. Мобильное меню (копируй из courses.html)
- HTML: кнопка toggle + mobile-menu div
- CSS: стили для анимации
- JS: обработчики событий

### 6. Тестирование
Проверь на разрешениях:
- ✅ 1920px
- ✅ 1440px
- ✅ 1024px
- ✅ 768px
- ✅ 480px
- ✅ 375px (iPhone)
- ✅ 360px (Android)

### 7. Финальная проверка
- [ ] Нет горизонтального скролла
- [ ] Все тексты читаемы
- [ ] Кнопки кликабельны (минимум 44x44px)
- [ ] Изображения не выходят за границы
- [ ] Меню работает на мобильных
- [ ] Все элементы видны и доступны

---

**ВАЖНО**: Всегда делай адаптивность сразу при создании нового контента, не откладывай на потом!

**Reference**: Смотри `courses.html` как пример полной адаптивности.
