# Исправление ошибки hoursOfService

## Проблема
Приложение падало с ошибкой:
```
Cannot read properties of undefined (reading 'toFixed')
at GoogleMapComponent (GoogleMapView.tsx:758)
```

## Причина
В компонентах карты использовалось неправильное поле для отображения часов работы водителя:
- Использовалось: `truck.hoursOfService` (не существует)
- Должно быть: `truck.hoursLeft` (правильное поле)

## Исправления

### GoogleMapView.tsx
**Строка 758** — Информационная панель выбранного трака:
```typescript
// Было:
<strong>HOS:</strong> {selectedTruck.hoursOfService.toFixed(1)} / 11 ч

// Стало:
<strong>HOS:</strong> {(selectedTruck.hoursOfService || selectedTruck.hoursLeft || 0).toFixed(1)} / 11 ч
```

### GoogleMapViewAdvanced.tsx
**Строка 346** — InfoWindow (всплывающее окно):
```typescript
// Было:
<p><strong>HOS:</strong> ${truck.hoursOfService.toFixed(1)} / 11 ч</p>

// Стало:
<p><strong>HOS:</strong> ${(truck.hoursOfService || truck.hoursLeft || 0).toFixed(1)} / 11 ч</p>
```

**Строка 655** — Информационная панель:
```typescript
// Было:
<strong>HOS:</strong> {selectedTruck.hoursOfService.toFixed(1)} / 11 ч

// Стало:
<strong>HOS:</strong> {(selectedTruck.hoursOfService || selectedTruck.hoursLeft || 0).toFixed(1)} / 11 ч
```

## Решение
Используется fallback цепочка:
1. Сначала проверяется `hoursOfService` (для совместимости)
2. Если нет — используется `hoursLeft` (правильное поле)
3. Если и его нет — используется `0` (защита от ошибок)

Это обеспечивает:
- ✅ Работу с текущей структурой данных
- ✅ Обратную совместимость
- ✅ Защиту от падений приложения

## Статус
✅ Исправлено в обоих файлах карты
✅ Приложение больше не падает при клике на трак
✅ Информация о HOS отображается корректно
