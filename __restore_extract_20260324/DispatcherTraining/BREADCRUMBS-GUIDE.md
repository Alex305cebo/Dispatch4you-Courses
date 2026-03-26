# 🍞 Breadcrumbs (Хлебные крошки) - Руководство

## 📋 Обзор

Breadcrumbs — это навигационный элемент, который показывает путь от главной страницы до текущей. Помогает пользователям понимать структуру сайта и быстро перемещаться между уровнями.

**Пример:** 🏠 Главная › 📁 Страницы › 📚 Модуль 1 › Введение

---

## ✨ Возможности

- 🎯 **Автоматическое создание** на основе URL
- 🎨 **Красивый дизайн** с иконками и анимациями
- 📱 **Полная адаптивность** для всех устройств
- 🔗 **Кликабельные ссылки** для быстрой навигации
- 🎭 **Подсветка текущей страницы**
- ✨ **Плавные анимации** появления
- ♿ **Accessibility** (ARIA labels, focus states)

---

## 🚀 Быстрый старт

### Автоматическая загрузка

Breadcrumbs загружаются автоматически через `nav-loader.js`. Ничего делать не нужно!

```html
<!-- Просто подключи nav-loader.js -->
<div id="nav-placeholder"></div>
<script src="nav-loader.js"></script>

<!-- Breadcrumbs появятся автоматически -->
```

### Результат

```
┌─────────────────────────────────────────┐
│  Navbar (навигация)                     │
├─────────────────────────────────────────┤
│  🏠 Главная › 📁 Страницы › 📚 Модуль 1 │ ← Breadcrumbs
├─────────────────────────────────────────┤
│  Контент страницы                       │
└─────────────────────────────────────────┘
```

---

## 📍 Как это работает

### 1. Определение пути

```javascript
// URL: /pages/doc-module-1-complete.html

Разбивается на части:
['pages', 'doc-module-1-complete.html']

Преобразуется в:
🏠 Главная → 📁 Страницы → 📚 Модуль 1: Введение
```

### 2. Названия страниц

Breadcrumbs автоматически определяет названия из встроенной карты:

```javascript
const PAGE_NAMES = {
    'index.html': 'Главная',
    'courses.html': 'Курсы',
    'documentation.html': 'База знаний',
    'doc-module-1-complete.html': 'Модуль 1: Введение',
    // ... и т.д.
};
```

### 3. Иконки

Каждая страница имеет свою иконку:

```javascript
const PAGE_ICONS = {
    'index.html': '🏠',
    'courses.html': '📚',
    'documentation.html': '📖',
    'simulator.html': '🎯',
    // ... и т.д.
};
```

---

## 🎨 Примеры путей

### Главная страница
```
URL: /index.html
Breadcrumbs: Не показываются (мы уже на главной)
```

### Страница курсов
```
URL: /courses.html
Breadcrumbs: 🏠 Главная › 📚 Курсы
```

### Модуль обучения
```
URL: /pages/doc-module-1-complete.html
Breadcrumbs: 🏠 Главная › 📁 Страницы › 📚 Модуль 1: Введение
```

### База знаний
```
URL: /pages/documentation.html
Breadcrumbs: 🏠 Главная › 📁 Страницы › 📖 База знаний
```

### Симулятор
```
URL: /pages/simulator.html
Breadcrumbs: 🏠 Главная › 📁 Страницы › 🎯 Симулятор
```

---

## 🔧 Настройка

### Добавить свою страницу

```javascript
// В любом месте после загрузки breadcrumbs
window.Breadcrumbs.addPageName(
    'my-page.html',      // Имя файла
    'Моя страница',      // Название для отображения
    '🎨'                 // Иконка (опционально)
);
```

### Пример для нескольких страниц

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем свои страницы
    window.Breadcrumbs.addPageName('profile.html', 'Профиль', '👤');
    window.Breadcrumbs.addPageName('settings.html', 'Настройки', '⚙️');
    window.Breadcrumbs.addPageName('help.html', 'Помощь', '❓');
    
    // Пересоздаем breadcrumbs
    window.Breadcrumbs.insert();
});
```

---

## 🎭 Режимы отображения

### Обычный режим (по умолчанию)

```html
<!-- Стандартный вид -->
<nav class="breadcrumbs">
    <!-- ... -->
</nav>
```

### Компактный режим

```javascript
// Уменьшенные отступы для страниц с большим контентом
document.querySelector('.breadcrumbs').classList.add('compact');
```

### Прозрачный режим

```javascript
// Прозрачный фон для страниц с темным фоном
document.querySelector('.breadcrumbs').classList.add('transparent');
```

### Скрыть breadcrumbs

```html
<!-- Добавь класс к body -->
<body class="no-breadcrumbs">
    <!-- Breadcrumbs не будут показаны -->
</body>
```

---

## 📱 Адаптивность

### Desktop (> 1024px)
- Полные названия с иконками
- Все элементы видны
- Hover эффекты активны

### Tablet (768px - 1024px)
- Уменьшенные отступы
- Компактные элементы
- Все названия видны

### Mobile (480px - 768px)
- Еще более компактный вид
- Уменьшенные шрифты
- Все названия видны

### Small Mobile (< 480px)
- **Только иконки** (текст скрыт)
- Текст показывается только для текущей страницы
- Минимальные отступы

**Пример на маленьком экране:**
```
🏠 › 📁 › 📚 Модуль 1: Введение
     ↑    ↑         ↑
  иконки  текст только здесь
```

---

## ⚙️ JavaScript API

### Создать breadcrumbs программно

```javascript
const breadcrumbs = window.Breadcrumbs.create();
console.log(breadcrumbs);
// [
//   { name: 'Главная', icon: '🏠', url: 'index.html', isHome: true },
//   { name: 'Страницы', icon: '📁', url: 'pages/', isLast: false },
//   { name: 'Модуль 1', icon: '📚', url: null, isLast: true }
// ]
```

### Отрендерить в HTML

```javascript
const html = window.Breadcrumbs.render(breadcrumbs);
console.log(html);
// '<nav class="breadcrumbs">...</nav>'
```

### Вставить в DOM

```javascript
window.Breadcrumbs.insert();
// Breadcrumbs появятся на странице
```

### Добавить название страницы

```javascript
window.Breadcrumbs.addPageName('file.html', 'Название', '🎯');
```

---

## 🎨 Стилизация

### CSS переменные

```css
/* Основные цвета */
--breadcrumb-bg: rgba(15, 23, 42, 0.8);
--breadcrumb-border: rgba(255, 255, 255, 0.08);
--breadcrumb-text: #94a3b8;
--breadcrumb-text-hover: #e0e7ff;
--breadcrumb-active-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
--breadcrumb-active-text: #f1f5f9;
```

### Кастомные стили

```css
/* Изменить цвет фона */
.breadcrumbs {
    background: rgba(30, 41, 59, 0.9);
}

/* Изменить цвет ссылок */
.breadcrumb-link {
    color: #a5b4fc;
}

/* Изменить разделитель */
.breadcrumb-separator {
    content: '→';  /* или '/', '|', '•' */
}
```

---

## ✨ Анимации

### Появление breadcrumbs

```css
/* Плавное появление сверху */
.breadcrumbs {
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.breadcrumbs.visible {
    opacity: 1;
    transform: translateY(0);
}
```

### Появление элементов по очереди

```css
/* Каждый элемент появляется с задержкой */
.breadcrumb-item:nth-child(1) { animation-delay: 0.05s; }
.breadcrumb-item:nth-child(2) { animation-delay: 0.1s; }
.breadcrumb-item:nth-child(3) { animation-delay: 0.15s; }
```

---

## ♿ Accessibility

### ARIA labels

```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs-list">
        <!-- ... -->
    </ol>
</nav>
```

### Focus states

```css
/* Видимый фокус для клавиатурной навигации */
.breadcrumb-link:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
}
```

### Семантическая разметка

```html
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Главная</a></li>
        <li><a href="/pages/">Страницы</a></li>
        <li aria-current="page">Модуль 1</li>
    </ol>
</nav>
```

---

## 🔍 Отладка

### Проверить breadcrumbs в консоли

```javascript
// Получить текущие breadcrumbs
const crumbs = window.Breadcrumbs.create();
console.log('Breadcrumbs:', crumbs);

// Проверить, загружен ли скрипт
console.log('Breadcrumbs loaded:', typeof window.Breadcrumbs !== 'undefined');

// Проверить, видны ли breadcrumbs
const breadcrumbsEl = document.querySelector('.breadcrumbs');
console.log('Breadcrumbs visible:', breadcrumbsEl !== null);
```

---

## 🐛 Решение проблем

### Breadcrumbs не появляются

1. Проверь, что `nav-loader.js` загружен
2. Проверь консоль на ошибки
3. Убедись, что ты не на главной странице
4. Проверь, нет ли класса `.no-breadcrumbs` на body

### Неправильное название страницы

```javascript
// Добавь правильное название
window.Breadcrumbs.addPageName('your-page.html', 'Правильное название', '🎯');
window.Breadcrumbs.insert(); // Пересоздай breadcrumbs
```

### Breadcrumbs перекрывают контент

```css
/* Увеличь padding-top у body */
body {
    padding-top: 140px; /* navbar (60px) + breadcrumbs (50px) + отступ (30px) */
}
```

---

## 📊 Производительность

- **Размер файлов:**
  - `breadcrumbs.js`: ~3KB (gzip: ~1KB)
  - `breadcrumbs.css`: ~5KB (gzip: ~1.5KB)

- **Время загрузки:** < 50ms
- **Время рендеринга:** < 10ms
- **Влияние на FCP:** Минимальное

---

## 🎯 Best Practices

1. **Не показывай breadcrumbs на главной странице** (уже реализовано)
2. **Используй понятные названия** для страниц
3. **Добавляй иконки** для лучшей визуализации
4. **Тестируй на мобильных** устройствах
5. **Проверяй accessibility** с клавиатурой

---

## 📚 Примеры использования

### Добавить breadcrumbs для админ-панели

```javascript
window.Breadcrumbs.addPageName('admin.html', 'Админ-панель', '⚙️');
window.Breadcrumbs.addPageName('admin-users.html', 'Пользователи', '👥');
window.Breadcrumbs.addPageName('admin-settings.html', 'Настройки', '🔧');
```

### Создать breadcrumbs для блога

```javascript
window.Breadcrumbs.addPageName('blog.html', 'Блог', '📝');
window.Breadcrumbs.addPageName('blog-post-1.html', 'Первая статья', '📄');
window.Breadcrumbs.addPageName('blog-category.html', 'Категория', '📁');
```

---

## 🔮 Будущие улучшения

- [ ] Поддержка динамических путей (SPA)
- [ ] Кастомные разделители
- [ ] Темы оформления
- [ ] Интеграция с роутером
- [ ] Сохранение истории навигации

---

## 📞 Поддержка

Если возникли вопросы или проблемы:

1. Проверь эту документацию
2. Открой `breadcrumbs-demo.html` для примеров
3. Посмотри консоль браузера на ошибки

---

**Версия:** 1.0  
**Дата:** 2026-03-19  
**Статус:** ✅ Production Ready
