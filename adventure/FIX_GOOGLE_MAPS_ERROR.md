# Исправление ошибки Google Maps

## Ошибка

```
InvalidValueError: initGoogleMap is not a function
```

## Причина

Эта ошибка **не связана с изменениями в системе выбора трака**. Она возникает когда:

1. Страница перезагружается
2. Старый скрипт Google Maps остаётся в DOM
3. Google Maps пытается вызвать callback `initGoogleMap` который уже не существует

## Решение

### Вариант 1: Полная перезагрузка страницы

```
1. Нажми Ctrl+Shift+R (Windows/Linux) или Cmd+Shift+R (Mac)
2. Это полностью очистит кэш и перезагрузит страницу
```

### Вариант 2: Очистка через DevTools

```
1. Открой DevTools (F12)
2. Нажми правой кнопкой на кнопку "Обновить"
3. Выбери "Очистить кэш и жёсткая перезагрузка"
```

### Вариант 3: Перезапуск Metro bundler

```bash
# 1. Останови Metro bundler (Ctrl+C)

# 2. Перезапусти с очисткой кэша
cd adventure
npm start -- --reset-cache

# 3. Открой страницу заново
```

## Проверка

После перезагрузки:

1. Страница должна загрузиться без ошибок
2. Карта должна отображаться
3. Траки должны быть видны на карте

## Если ошибка повторяется

### Проверь консоль на другие ошибки

Открой DevTools (F12) → Console и проверь:

- Есть ли ошибки импорта компонентов?
- Есть ли ошибки в `NegotiationChat.tsx`?
- Есть ли ошибки в `game.tsx`?

### Проверь что файлы не повреждены

```bash
cd adventure

# Проверь что NegotiationChat.tsx существует
ls -la components/NegotiationChat.tsx

# Проверь что он правильно экспортирован
grep "export default" components/NegotiationChat.tsx
# Должно вывести: export default function NegotiationChat...

# Проверь что game.tsx импортирует его
grep "NegotiationChat" app/game.tsx
# Должно вывести: import NegotiationChat from '../components/NegotiationChat';
```

## Почему это происходит?

Google Maps API загружается через `<script>` тег с callback:

```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=...&callback=initGoogleMap`;
```

Когда страница перезагружается:
1. React размонтирует компонент
2. Callback `window.initGoogleMap` удаляется
3. Но скрипт Google Maps уже загружен в DOM
4. При следующей загрузке Google Maps пытается вызвать старый callback
5. Получает ошибку "is not a function"

## Решение в коде (для разработчиков)

Эта проблема уже решена в `GoogleMapView.tsx`:

```typescript
// Проверяем, не загружается ли уже скрипт
const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
if (existingScript) {
  console.log('⏳ Google Maps уже загружается...');
  // Ждём загрузки существующего скрипта
  return;
}
```

Но иногда это не помогает если страница перезагружается слишком быстро.

## Итог

**Эта ошибка не связана с системой выбора трака.**

Просто перезагрузи страницу с полной очисткой кэша (Ctrl+Shift+R) и всё заработает.

## Проверка системы выбора трака

После успешной загрузки страницы:

1. Открой Load Board
2. Выбери груз → "📞 Позвонить брокеру"
3. Проведи переговоры до успеха

**Ожидаемый результат:**
- ✅ Показывается карточка выбранного трака
- ✅ НЕ показывается отдельное окно "Назначить водителя"
- ✅ Есть кнопка "Изменить"
- ✅ Есть кнопка "✅ Подтвердить"

Если всё это работает — значит система выбора трака работает правильно! 🎉
