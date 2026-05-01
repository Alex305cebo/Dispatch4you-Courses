# 🐛 BUGFIX — Траки не останавливаются на погрузке/ремонте

## Проблема
Траки не дожидались окончания погрузки/разгрузки/ремонта и уезжали раньше времени, затем телепортировались обратно.

## Причина
В коде был блок который **автоматически переводил трак в `driving`** если у него был следующий груз, **НЕ проверяя** завершилась ли текущая операция (погрузка/разгрузка).

### Проблемный код (строка 2397):
```typescript
// Если трак на разгрузке/погрузке и у него уже есть следующий груз - автоматически начинаем движение
if ((truck.status === 'at_delivery' || truck.status === 'at_pickup') && truck.currentLoad) {
  if (truck.currentLoad.phase === 'to_pickup') {
    // ❌ СРАЗУ переводим в driving — НЕ ПРОВЕРЯЯ что операция завершена!
    return {
      ...truck,
      status: 'driving' as TruckStatus,
      destinationCity: truck.currentLoad.fromCity,
      progress: 0,
    };
  }
}
```

## Решение
Добавлена проверка что **операция завершена** перед тем как начать движение:

```typescript
// Если трак на разгрузке/погрузке и у него уже есть следующий груз - автоматически начинаем движение
// НО ТОЛЬКО ЕСЛИ ЗАВЕРШИЛ ТЕКУЩУЮ ОПЕРАЦИЮ (иначе уедет раньше времени!)
if ((truck.status === 'at_delivery' || truck.status === 'at_pickup') && truck.currentLoad) {
  if (truck.currentLoad.phase === 'to_pickup') {
    // ✅ ПРОВЕРЯЕМ что погрузка/разгрузка ЗАВЕРШЕНА
    const isAtPickup = truck.status === 'at_pickup';
    const isAtDelivery = truck.status === 'at_delivery';
    const pickupArrivalMinute = (truck as any).pickupArrivalMinute ?? newMinute;
    const deliveryArrivalMinute = (truck as any).deliveryArrivalMinute ?? newMinute;
    const loadDuration = (truck as any).loadDuration ?? 60;
    const unloadDuration = (truck as any).unloadDuration ?? 60;
    const pickupWaitTime = newMinute - pickupArrivalMinute;
    const deliveryWaitTime = newMinute - deliveryArrivalMinute;
    
    // ✅ Если ещё грузится/разгружается — НЕ ДВИГАЕМСЯ
    if ((isAtPickup && pickupWaitTime < loadDuration) || (isAtDelivery && deliveryWaitTime < unloadDuration)) {
      return truck; // Ждём завершения операции
    }
    
    // ✅ Операция завершена — можно ехать к следующему грузу
    return {
      ...truck,
      status: 'driving' as TruckStatus,
      destinationCity: truck.currentLoad.fromCity,
      progress: 0,
    };
  }
}
```

## Дополнительно
Убрана дублирующая проверка `breakdown` (строка 2536) — она была избыточной, т.к. первая проверка (строка 2038) уже возвращает трак через `return`.

## Результат
- ✅ Траки **ждут** завершения погрузки (45-90 мин)
- ✅ Траки **ждут** завершения разгрузки (30-120 мин)
- ✅ Траки **ждут** завершения ремонта (outOfOrderUntil)
- ✅ Нет телепортации
- ✅ Нет преждевременного отъезда

## Файлы изменены
- `store/gameStore.ts` — функция `tickClock()`, строка ~2397
