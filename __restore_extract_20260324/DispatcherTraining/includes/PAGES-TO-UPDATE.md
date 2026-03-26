# Список страниц для обновления навигации

## ✅ Страницы с эталонной навигацией

- [x] `pages/simulator.html` - обновлено, использует встроенные стили и HTML

## 📋 Страницы, которые нужно обновить

### Корневые страницы
- [ ] `index.html` - главная страница (уже имеет навигацию, нужно проверить совместимость)
- [ ] `about.html` - о нас
- [ ] `blog.html` - блог
- [ ] `career.html` - карьера
- [ ] `certification.html` - сертификация
- [ ] `contacts.html` - контакты
- [ ] `course.html` - курс
- [ ] `courses.html` - курсы
- [ ] `login.html` - вход
- [ ] `register.html` - регистрация
- [ ] `dashboard.html` - личный кабинет

### Страницы в папке pages/
- [ ] `pages/dispatcher-cards.html` - карточки диспетчера
- [ ] `pages/load4u.html` - поиск грузов
- [ ] `pages/loadboard.html` - доска грузов
- [ ] `pages/simulator.html` - симулятор
- [ ] `pages/modules.html` - модули обучения
- [ ] `pages/calls.html` - примеры звонков
- [ ] `pages/cases.html` - практические кейсы
- [ ] `pages/documentation.html` - документация

### Страницы Android
- [ ] `android-preview.html` - превью Android

## Инструкция по обновлению

Для каждой страницы:

1. **Добавить в `<head>`:**
```html
<link rel="stylesheet" href="../includes/navigation-styles.css">
<!-- или для корневых страниц: -->
<link rel="stylesheet" href="includes/navigation-styles.css">
```

2. **Добавить в `<body>` (в самом начале):**
```html
<div id="navigation-placeholder"></div>
```

3. **Добавить отступ для body:**
```css
body {
    padding-top: 60px; /* Для фиксированной шапки */
}
```

4. **Добавить скрипт загрузки (перед закрывающим `</body>`):**
```html
<script>
    fetch('../includes/navigation.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation-placeholder').innerHTML = data;
        });
</script>
```

5. **Удалить старую навигацию** (если есть)

## Приоритет обновления

### Высокий приоритет (основные страницы):
1. `index.html` - главная
2. `courses.html` - курсы
3. `pages/dispatcher-cards.html` - популярный инструмент
4. `pages/load4u.html` - популярный инструмент

### Средний приоритет:
5. `about.html`
6. `contacts.html`
7. `pages/documentation.html`
8. `pages/modules.html`

### Низкий приоритет:
9. Остальные страницы

## Проверка после обновления

После обновления каждой страницы проверить:
- ✅ Навигация отображается корректно
- ✅ Все ссылки работают
- ✅ Мобильное меню открывается и закрывается
- ✅ Выпадающие списки работают
- ✅ Нет конфликтов стилей
- ✅ Контент не перекрывается шапкой

## Примечания

- Для страниц в корне используйте путь `includes/navigation.html`
- Для страниц в папках используйте путь `../includes/navigation.html`
- Если страница имеет свои специфичные стили навигации, их нужно будет адаптировать

---

**Последнее обновление:** 2026-02-28
