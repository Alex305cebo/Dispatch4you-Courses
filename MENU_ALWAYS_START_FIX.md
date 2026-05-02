# ✅ Исправление: Игра всегда начинается с меню

## Проблема

Игра не всегда начиналась с главного меню. При прямом открытии `/game` система пыталась загрузить сохранение и если оно было найдено, игрок попадал сразу в игру, минуя меню.

## Решение

### 1. Изменена логика в `adventure/app/game.tsx`

**Было:**
```typescript
useEffect(() => {
  const enteredViaMenu = sessionStorage.getItem('enteredViaMenu');
  if (!enteredViaMenu) {
    // Пробовали загрузить сохранение
    if (phase === 'menu') {
      loadGame().then(loaded => {
        if (loaded) {
          // Если сохранение найдено — оставались в игре
          sessionStorage.setItem('enteredViaMenu', '1');
        } else {
          // Если нет — на меню
          setTimeout(() => router.replace('/'), 50);
        }
      });
    }
    return;
  }
  // ...
}, []);
```

**Стало:**
```typescript
useEffect(() => {
  // ВСЕГДА перенаправляем на меню при прямом открытии /game
  const enteredViaMenu = sessionStorage.getItem('enteredViaMenu');
  if (!enteredViaMenu) {
    // Не пришли через меню — перенаправляем на меню
    setTimeout(() => router.replace('/'), 50);
    return;
  }
  // При рефреше — восстанавливаем сохранение
  if (phase === 'menu') {
    loadGame().then(loaded => {
      if (!loaded) {
        setTimeout(() => router.replace('/'), 100);
      }
    });
  }
}, []);
```

### 2. Исправлен путь к видео в `adventure/app/menu.tsx`

**Было:**
```typescript
src="./Truck_loop.mp4"
```

**Стало:**
```typescript
src="/game/Truck_loop.mp4"
```

**Также улучшен fallback механизм:**
```typescript
el.addEventListener('error', () => {
  if (el.src.includes('/game/Truck_loop.mp4')) {
    el.src = '/game/assets/Truck_loop.mp4';
  } else if (el.src.includes('/game/assets/Truck_loop.mp4')) {
    el.src = './Truck_loop.mp4';
  } else if (el.src.includes('./Truck_loop.mp4')) {
    el.src = './assets/Truck_loop.mp4';
  }
}, { once: false });
```

## Результат

✅ **Игра всегда начинается с главного меню**  
✅ **Видео-фон отображается корректно**  
✅ **Fallback механизм для разных путей к видео**  
✅ **Сохранения работают как и раньше** (загружаются через кнопку "Продолжить")

## Как это работает

1. Пользователь открывает `/game` напрямую
2. Система проверяет `sessionStorage.getItem('enteredViaMenu')`
3. Если флага нет — перенаправляет на `/` (главное меню)
4. Пользователь видит меню с кнопками:
   - **"Продолжить"** (если есть сохранение)
   - **"Начать игру"** (новая игра)
   - **"Сохранения"** (облачные сохранения)
   - И другие опции
5. При клике на "Продолжить" или "Начать игру":
   - Устанавливается флаг `sessionStorage.setItem('enteredViaMenu', '1')`
   - Происходит переход на `/game`
   - Игра загружается

## Видео-фон

Видео файл `Truck_loop.mp4` находится в:
- `/game/Truck_loop.mp4` (основной путь)
- `/game/assets/Truck_loop.mp4` (fallback 1)
- `./Truck_loop.mp4` (fallback 2)
- `./assets/Truck_loop.mp4` (fallback 3)

Система автоматически пробует все пути если один не загружается.

---

**Дата:** 2026-05-02  
**Автор:** Kiro AI  
**Статус:** ✅ Готово
