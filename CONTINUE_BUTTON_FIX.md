# ✅ Исправление кнопки Continue в главном меню

**Дата**: 2 мая 2026  
**Статус**: Завершено ✅

---

## 🎯 Проблема

Кнопка **Continue** ("Продолжить") не появлялась в главном меню, даже когда были сохранения в слотах.

### Причина:
Функция `checkSaveAndUser()` проверяла только старое сохранение `dispatcher-game-save`, но не проверяла новые слоты:
- `dispatcher-save-slot-1`
- `dispatcher-save-slot-2`
- `dispatcher-save-slot-3`

---

## ✅ Решение

### 1. Улучшена функция `checkSaveAndUser()`

**Было**:
```typescript
async function checkSaveAndUser() {
  try {
    const raw = localStorage.getItem('dispatcher-game-save');
    if (raw) { 
      const s = JSON.parse(raw); 
      if (s?.version >= 6 && s?.phase === 'playing') setHasSave(true); 
    }
  } catch {}
  // ...
}
```

**Стало**:
```typescript
async function checkSaveAndUser() {
  try {
    // Проверяем старое сохранение
    const raw = localStorage.getItem('dispatcher-game-save');
    if (raw) { 
      const s = JSON.parse(raw); 
      if (s?.version >= 6 && s?.phase === 'playing') {
        setHasSave(true);
      }
    }
    
    // Проверяем слоты (1, 2, 3)
    if (!hasSave) {
      for (let i = 1; i <= 3; i++) {
        const slotRaw = localStorage.getItem(`dispatcher-save-slot-${i}`);
        if (slotRaw) {
          const slotData = JSON.parse(slotRaw);
          if (slotData?.version >= 6 && slotData?.phase === 'playing') {
            setHasSave(true);
            break;
          }
        }
      }
    }
  } catch {}
  // ...
}
```

### 2. Улучшена функция `handleContinue()`

**Было**:
```typescript
async function handleContinue() {
  setLoading(true);
  try {
    const ok = await loadGame();
    if (ok) {
      sessionStorage.setItem('enteredViaMenu', '1');
      setTimeout(() => router.replace('/game'), 50);
    } else alert('Не удалось загрузить');
  }
  finally { setLoading(false); }
}
```

**Стало**:
```typescript
async function handleContinue() {
  setLoading(true);
  try {
    // Ищем последнее сохранение (самое свежее по timestamp)
    let latestSave = null;
    let latestSlot = null;
    let latestTimestamp = 0;
    
    // Проверяем старое сохранение
    try {
      const raw = localStorage.getItem('dispatcher-game-save');
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.version >= 6 && s?.phase === 'playing' && s?.lastSaved) {
          latestSave = s;
          latestTimestamp = s.lastSaved;
        }
      }
    } catch {}
    
    // Проверяем слоты
    for (let i = 1; i <= 3; i++) {
      try {
        const slotRaw = localStorage.getItem(`dispatcher-save-slot-${i}`);
        if (slotRaw) {
          const slotData = JSON.parse(slotRaw);
          if (slotData?.version >= 6 && slotData?.phase === 'playing' && slotData?.lastSaved) {
            if (slotData.lastSaved > latestTimestamp) {
              latestSave = slotData;
              latestSlot = i;
              latestTimestamp = slotData.lastSaved;
            }
          }
        }
      } catch {}
    }
    
    // Загружаем найденное сохранение
    if (latestSave) {
      const ok = await loadGame(latestSlot);
      if (ok) {
        sessionStorage.setItem('enteredViaMenu', '1');
        setTimeout(() => router.replace('/game'), 50);
      } else {
        alert('Не удалось загрузить сохранение');
      }
    } else {
      alert('Сохранение не найдено');
    }
  }
  finally { setLoading(false); }
}
```

---

## 🎮 Как это работает

### Логика появления кнопки Continue:

1. **При загрузке меню** вызывается `checkSaveAndUser()`
2. Функция проверяет:
   - Старое сохранение `dispatcher-game-save`
   - Все 3 слота: `dispatcher-save-slot-1/2/3`
3. Если найдено хотя бы одно валидное сохранение → `setHasSave(true)`
4. Кнопка **Continue** появляется первой в списке (зелёная, с иконкой ▶)

### Логика загрузки при нажатии Continue:

1. **Поиск последнего сохранения**:
   - Проверяются все сохранения (старое + 3 слота)
   - Сравниваются по полю `lastSaved` (timestamp)
   - Выбирается самое свежее

2. **Загрузка**:
   - Вызывается `loadGame(slotId)` с ID найденного слота
   - Если слот не указан (старое сохранение) → `loadGame()` без параметра
   - Функция `loadGame` в `gameStore.ts` уже поддерживает слоты

3. **Переход в игру**:
   - Устанавливается флаг `enteredViaMenu` в sessionStorage
   - Переход на `/game` через `router.replace()`

---

## 📋 Изменённые файлы

- `DispatcherTraining/adventure/app/menu.tsx`
  - Функция `checkSaveAndUser()` — добавлена проверка слотов
  - Функция `handleContinue()` — добавлен поиск последнего сохранения

---

## ✅ Результат

Теперь кнопка **Continue** корректно:
- ✅ Появляется когда есть сохранение в любом слоте
- ✅ Загружает самое последнее сохранение (по timestamp)
- ✅ Работает со старыми сохранениями и новыми слотами
- ✅ Показывает статус загрузки ("⏳ ...")
- ✅ Выделена зелёным цветом и находится первой в списке

---

## 🧪 Тестирование

### Сценарий 1: Нет сохранений
- Кнопка Continue НЕ показывается ✅
- Показывается только "Начать игру" ✅

### Сценарий 2: Есть сохранение в слоте 1
- Кнопка Continue показывается ✅
- При нажатии загружается слот 1 ✅

### Сценарий 3: Есть сохранения в нескольких слотах
- Кнопка Continue показывается ✅
- При нажатии загружается самое свежее ✅

### Сценарий 4: Есть старое сохранение + слоты
- Кнопка Continue показывается ✅
- При нажатии загружается самое свежее (по timestamp) ✅

---

**Статус**: ✅ Готово к использованию
