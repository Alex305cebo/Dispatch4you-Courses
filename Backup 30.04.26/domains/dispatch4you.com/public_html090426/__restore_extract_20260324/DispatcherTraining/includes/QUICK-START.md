# 🚀 Быстрый старт - Эталонная навигация

## Что это?

Единая навигация для всех страниц сайта. Изменяете в одном месте - обновляется везде!

## 📁 Файлы

```
includes/
├── navigation.html          ← HTML навигации
├── navigation-styles.css    ← CSS стили
├── load-navigation.js       ← Автозагрузка (опционально)
├── README.md               ← Полная документация
├── EXAMPLE.html            ← Пример использования
└── QUICK-START.md          ← Этот файл
```

## ⚡ Быстрое подключение (3 шага)

### Шаг 1: Подключите CSS в `<head>`

```html
<link rel="stylesheet" href="../includes/navigation-styles.css">
```

### Шаг 2: Добавьте placeholder в начало `<body>`

```html
<div id="navigation-placeholder"></div>
```

### Шаг 3: Загрузите навигацию перед `</body>`

```html
<script>
    fetch('../includes/navigation.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation-placeholder').innerHTML = data;
        });
</script>
```

### Шаг 4: Добавьте отступ для body

```css
body {
    padding-top: 60px;
}
```

## ✅ Готово!

Навигация появится на вашей странице.

## 🔧 Как изменить навигацию?

1. Откройте `includes/navigation.html`
2. Внесите изменения
3. Сохраните
4. Обновите страницы в браузере

Изменения применятся на ВСЕХ страницах автоматически! 🎉

## 📝 Пример полной страницы

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Моя страница</title>
    <link rel="stylesheet" href="../includes/navigation-styles.css">
    <style>
        body {
            padding-top: 60px;
            background: #0a0e1a;
            color: #fff;
        }
    </style>
</head>
<body>
    <div id="navigation-placeholder"></div>
    
    <div class="content">
        <h1>Привет, мир!</h1>
    </div>

    <script>
        fetch('../includes/navigation.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navigation-placeholder').innerHTML = data;
            });
    </script>
</body>
</html>
```

## 🎯 Текущий статус

- ✅ `pages/simulator.html` - использует эталонную навигацию
- 📋 Остальные страницы - см. `PAGES-TO-UPDATE.md`

## ❓ Проблемы?

1. **Навигация не загружается?**
   - Проверьте путь к `navigation.html`
   - Откройте консоль браузера (F12)

2. **Стили не применяются?**
   - Проверьте путь к `navigation-styles.css`
   - Убедитесь, что нет конфликтов с другими стилями

3. **Ссылки не работают?**
   - Проверьте относительные пути в `navigation.html`
   - Скорректируйте под структуру вашей папки

## 📚 Дополнительно

- Полная документация: `README.md`
- Пример страницы: `EXAMPLE.html`
- Список страниц для обновления: `PAGES-TO-UPDATE.md`

---

**Версия:** 1.0  
**Дата:** 2026-02-28
