---
inclusion: auto
fileMatchPattern: "*.html"
description: "Правила и стандарты адаптивного дизайна для всех HTML страниц проекта"
---

# Правила адаптивного дизайна

## ОБЯЗАТЕЛЬНО для всех новых страниц и компонентов

### 1. Meta Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 2. Breakpoints (точки останова)
Используй следующие breakpoints для всех страниц:

```css
/* Desktop First подход */

/* Large Desktop */
@media (max-width: 1400px) {
  /* Большие экраны */
}

/* Desktop */
@media (max-width: 1024px) {
  /* Планшеты в landscape */
  - Уменьшить padding контейнеров
  - Адаптировать grid (3 колонки → 2 колонки)
}

/* Tablet */
@media (max-width: 768px) {
  /* Планшеты и большие телефоны */
  - Скрыть desktop навигацию
  - Показать мобильное меню
  - Grid: 2 колонки → 1 колонка
  - Уменьшить размеры шрифтов (h1: 48px, h2: 36px)
  - Кнопки на всю ширину или flex-direction: column
  - Padding: 20px
}

/* Mobile */
@media (max-width: 480px) {
  /* Смартфоны */
  - Все grid в 1 колонку
  - Шрифты еще меньше (h1: 36px, h2: 28px)
  - Padding: 16px
  - Кнопки 100% ширины
  - Уменьшить иконки и изображения
}

/* Small Mobile */
@media (max-width: 360px) {
  /* Маленькие смартфоны */
  - Минимальные размеры (h1: 30px, h2: 24px)
  - Padding: 12px
  - Компактные элементы
}
```

### 3. Обязательные адаптации

#### Навигация
- Desktop: горизонтальное меню
- Mobile (< 768px): гамбургер меню с overlay

```css
.mobile-menu-toggle {
  display: none;
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-toggle { display: flex; }
}
```

#### Контейнеры
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

@media (max-width: 768px) {
  .container { padding: 0 20px; }
}

@media (max-width: 480px) {
  .container { padding: 0 16px; }
}

@media (max-width: 360px) {
  .container { padding: 0 12px; }
}
```

#### Grid системы
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
```

#### Типографика
```css
h1 { font-size: 72px; }
h2 { font-size: 48px; }
h3 { font-size: 32px; }
p { font-size: 18px; }

@media (max-width: 768px) {
  h1 { font-size: 48px; }
  h2 { font-size: 36px; }
  h3 { font-size: 24px; }
  p { font-size: 16px; }
}

@media (max-width: 480px) {
  h1 { font-size: 36px; }
  h2 { font-size: 28px; }
  h3 { font-size: 20px; }
  p { font-size: 15px; }
}

@media (max-width: 360px) {
  h1 { font-size: 30px; }
  h2 { font-size: 24px; }
  h3 { font-size: 18px; }
  p { font-size: 14px; }
}
```

#### Кнопки
```css
.btn {
  padding: 14px 28px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .btn {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .btn {
    width: 100%;
    padding: 16px 32px;
    font-size: 16px;
  }
}
```

### 4. Мобильное меню (обязательный шаблон)

```html
<!-- HTML -->
<button class="mobile-menu-toggle" id="mobileMenuToggle">
  <span></span>
  <span></span>
  <span></span>
</button>

<div class="mobile-menu" id="mobileMenu">
  <div class="mobile-nav-links">
    <!-- Ссылки -->
  </div>
</div>
```

```css
/* CSS */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: calc(100vh - 70px);
  background: rgba(7, 11, 20, 0.98);
  backdrop-filter: blur(20px);
  padding: 30px 20px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.mobile-menu.active {
  transform: translateX(0);
}

@media (max-width: 768px) {
  .mobile-menu-toggle { display: flex; }
}
```

```javascript
// JavaScript
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close on link click
  const links = mobileMenu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}
```

### 5. Тестирование

Проверяй на следующих разрешениях:
- 1920px (Desktop)
- 1440px (Laptop)
- 1024px (Tablet Landscape)
- 768px (Tablet Portrait)
- 480px (Mobile Large)
- 375px (Mobile Medium - iPhone)
- 360px (Mobile Small - Android)
- 320px (Mobile Extra Small)

### 6. Общие правила

1. **Overflow**: всегда `overflow-x: hidden` на body
2. **Box-sizing**: всегда `box-sizing: border-box`
3. **Flex/Grid**: используй для layout вместо float
4. **Touch targets**: минимум 44x44px для кнопок на мобильных
5. **Line-height**: минимум 1.5 для читаемости
6. **Contrast**: минимум 4.5:1 для текста
7. **Images**: всегда responsive с `max-width: 100%; height: auto;`
8. **Viewport units**: осторожно с vh на мобильных (проблемы с адресной строкой)

### 7. Чеклист перед коммитом

- [ ] Viewport meta tag добавлен
- [ ] Все 5 breakpoints реализованы (1400, 1024, 768, 480, 360)
- [ ] Мобильное меню работает
- [ ] Grid адаптируется (3→2→1 колонки)
- [ ] Шрифты масштабируются
- [ ] Кнопки адаптивны
- [ ] Padding/margins адаптивны
- [ ] Нет горизонтального скролла
- [ ] Протестировано на всех разрешениях
- [ ] Touch targets достаточно большие

## Примеры из проекта

Смотри `courses.html` как reference для полной адаптивности.
