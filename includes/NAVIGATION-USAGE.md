# Единое меню для всех страниц

## Описание
Файл `includes/navigation.html` содержит эталонное меню, которое используется на всех страницах сайта.

## Как подключить на странице

### 1. Подключите CSS стили
```html
<link rel="stylesheet" href="../includes/navigation-styles.css">
```

### 2. Подключите меню через JavaScript
```html
<div id="navigation-placeholder"></div>
<script src="../includes/load-navigation.js"></script>
```

## Важно!
- ✅ Меню редактируется ТОЛЬКО в файле `includes/navigation.html`
- ✅ Изменения автоматически применяются на всех страницах
- ✅ Кнопка закрытия "✕" уже добавлена в мобильное меню
- ✅ Все скрипты включены в navigation.html

## Структура файлов
- `includes/navigation.html` - HTML код меню (ЭТАЛОН)
- `includes/navigation-styles.css` - CSS стили меню
- `includes/load-navigation.js` - Скрипт загрузки меню

## Пример использования
См. файл `includes/EXAMPLE.html`
