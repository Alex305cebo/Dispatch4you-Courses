# Исправление путей к изображениям траков

## Проблема
Изображения траков не отображались на сайте из-за несоответствия путей:
- В коде использовались пути: `TruckPic`, `Truck%20Pic` (с пробелом)
- На хостинге папка называется: `Truck_Pic` (с подчёркиванием)

## Решение

### 1. Переименована папка
```
adventure/assets/Truck Pic → adventure/assets/Truck_Pic
```

### 2. Исправлены пути в компонентах

Обновлены функции `getTruckImageUri` в следующих файлах:

- ✅ `components/TruckShopModal.tsx`
- ✅ `components/RepairGarageModal.tsx`
- ✅ `components/TruckPanel.tsx`
- ✅ `components/GarageModal.tsx`

### Было:
```typescript
const basePath = isGame ? '/game/assets/TruckPic' : '/assets/TruckPic';
// или
const basePath = isGame ? '/game/assets/Truck%20Pic' : '/assets/Truck%20Pic';
```

### Стало:
```typescript
const basePath = isGame ? '/game/assets/Truck_Pic' : '/assets/Truck_Pic';
```

## Результат
✅ Все изображения траков теперь корректно загружаются
✅ Пути унифицированы во всех компонентах
✅ Совместимость с хостингом обеспечена

## Для деплоя
При следующем деплое убедитесь что:
1. Папка `assets/Truck_Pic` загружена на хостинг
2. Все файлы `.webp` присутствуют (1.webp, 2.webp, ..., 11.webp)
