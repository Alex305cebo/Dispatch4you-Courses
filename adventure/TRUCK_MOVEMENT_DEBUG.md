# Отладка движения траков

## Проблема
Траки не двигаются по карте, несмотря на статус `driving` или `loaded`.

## Добавлено логирование

### В файле `store/gameStore.ts`:

1. **Логирование движущихся траков** (строка ~2507):
```typescript
if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity) {
  logger.log(`🚛 Moving truck ${truck.id}: ${truck.status}, progress: ${truck.progress}, dest: ${truck.destinationCity}`);
  // ... код движения
}
```

2. **Логирование траков которые НЕ движутся** (строка ~2819):
```typescript
else if (truck.status === 'driving' || truck.status === 'loaded') {
  logger.warn(`⚠️ Truck ${truck.id} NOT moving: status=${truck.status}, destinationCity=${truck.destinationCity}`);
}
```

## Как проверить

1. Откройте игру: **http://localhost:8081**
2. Откройте DevTools (F12) → вкладка Console
3. Назначьте груз на трак
4. Смотрите логи в консоли:
   - ✅ `🚛 Moving truck ...` — трак движется нормально
   - ⚠️ `⚠️ Truck ... NOT moving` — трак НЕ движется (баг)
   - ⚠️ `⚠️ SAFETY NET` — трак в статусе driving/loaded без destinationCity

## Возможные причины

1. **Нет `destinationCity`** — трак в статусе driving/loaded но не знает куда ехать
2. **Город не найден в CITIES** — destinationCity указан но координаты отсутствуют
3. **OSRM API не отвечает** — маршрут не загружается (должен работать fallback)
4. **Прогресс не обновляется** — `progressPerTick` = 0 или очень маленький

## Следующие шаги

После проверки логов в консоли:
- Если видите `NOT moving` — проверьте почему нет destinationCity
- Если видите `Moving` но трак всё равно стоит — проверьте расчёт progressPerTick
- Если нет логов вообще — проверьте что tickClock() вызывается

## Тестирование

```javascript
// В консоли браузера:
// Проверить состояние траков
window.gameStore = require('./store/gameStore').useGameStore.getState();
console.log(gameStore.trucks.map(t => ({
  id: t.id,
  status: t.status,
  dest: t.destinationCity,
  progress: t.progress,
  position: t.position
})));
```
