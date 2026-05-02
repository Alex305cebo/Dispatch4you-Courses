# TRUCK MOVEMENT FIX — Диагностика

## Проблема
Траки не двигаются на карте в текущей версии.

## Найденные различия

### БЭКАП (работает):
```typescript
tickClock: async () => {
  const newMinute = gameMinute + 1;  // Простое +1
  // Таймер: setInterval(tickClock, 1000) — каждую секунду
}
```

### ТЕКУЩАЯ ВЕРСИЯ (не работает):
```typescript
tickClock: () => {
  const TICK_MINUTES = 0.25 * (timeSpeed ?? 1);  // Дробные минуты
  const newMinute = Math.round((gameMinute + TICK_MINUTES) * 100) / 100;
  // Таймер: setInterval(tickClock, perfSettings.tickInterval) — 250ms (4 раза/сек)
}
```

## Возможные причины

1. **timeSpeed = 0** — время не идёт
2. **Дробные минуты** — траки не успевают обновиться
3. **Сложная логика HOS/weather** — траки застревают в ожидании
4. **Отсутствие routePath** — траки не знают куда ехать

## Решение

Нужно проверить в консоли браузера:
1. Вызывается ли `tickClock()`?
2. Какое значение `timeSpeed`?
3. Обновляется ли `gameMinute`?
4. Есть ли у траков `destinationCity` и `routePath`?

## Команды для проверки в консоли

```javascript
// Проверить состояние игры
useGameStore.getState().timeSpeed
useGameStore.getState().gameMinute
useGameStore.getState().trucks.map(t => ({
  id: t.id,
  status: t.status,
  dest: t.destinationCity,
  progress: t.progress,
  hasRoute: !!t.routePath
}))
```
