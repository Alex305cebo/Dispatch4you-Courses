# ⚡ Lazy Loading - Быстрый старт

## 🎯 Что это?

Блоки на странице появляются по мере прокрутки → **страница грузится в 3-5 раз быстрее!**

---

## 🚀 Установка за 30 секунд

### Вариант 1: Автоматически (рекомендуется)

```powershell
.\integrate-lazy-loading.ps1
```

**Готово!** Скрипт добавит lazy loading во все модули.

### Вариант 2: Вручную

Добавь в конец HTML (перед `</body>`):

```html
<script src="../lazy-load-sections.js"></script>
</body>
```

---

## ✅ Проверка работы

1. Открой модуль в браузере
2. F12 → Console
3. Должно быть: `✅ Lazy loading initialized`
4. Прокрути страницу → блоки появляются плавно

---

## 🎨 Что анимируется?

Автоматически:
- ✅ Секторы (`.sector`)
- ✅ Case studies (`.case-study`)
- ✅ Квизы (`.quiz-container`)
- ✅ Карточки модулей (`.module-card`)
- ✅ Прогресс (`.progress-section`)
- ✅ Навигация (`.navigation-buttons`)

---

## ⚙️ Настройка (опционально)

В `lazy-load-sections.js` измени:

```javascript
window.lazyLoader = new LazyLoadSections({
    rootMargin: '100px',  // Расстояние до загрузки
    threshold: 0.1,       // Процент видимости
});
```

---

## 📱 Адаптивность

- Desktop: ✅ Автоматически
- Mobile: ✅ Автоматически
- Reduced motion: ✅ Поддерживается

---

## 🐛 Проблемы?

**Не работает?**
- Проверь путь: `../lazy-load-sections.js`
- Проверь консоль (F12)

**Медленно?**
- Уменьши `rootMargin` до `50px`

**Слишком быстро?**
- Увеличь `rootMargin` до `200px`

---

## 📖 Подробная документация

→ `LAZY-LOAD-INTEGRATION.md`

---

**Всё! Теперь страницы грузятся мгновенно! ⚡**
