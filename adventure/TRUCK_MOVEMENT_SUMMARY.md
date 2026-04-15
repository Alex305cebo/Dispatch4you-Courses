# Система движения траков

## Как работает

### 1. Загрузка маршрутов (startShift)
При старте игры для каждого трака который в пути загружается реальный маршрут из OSRM API:
- Запрос: `https://router.project-osrm.org/route/v1/driving/{from_lng},{from_lat};{to_lng},{to_lat}?overview=full&geometries=geojson`
- Ответ: массив координат точек по дорогам Interstate
- Сохраняется в `truck.routePath`

### 2. Движение по маршруту (tickClock)
Каждую игровую минуту (1 реальная секунда):
- Скорость: 60 миль/час = 1 миля/минута
- Прогресс: `newProgress = progress + (1 / totalMiles)`
- Позиция рассчитывается по `routePath`:
  ```typescript
  const pointIndex = Math.floor(newProgress * (totalPoints - 1));
  const nextIndex = Math.min(pointIndex + 1, totalPoints - 1);
  const segmentProgress = (newProgress * (totalPoints - 1)) - pointIndex;
  
  const p1 = routePath[pointIndex];
  const p2 = routePath[nextIndex];
  const lng = p1[0] + (p2[0] - p1[0]) * segmentProgress;
  const lat = p1[1] + (p2[1] - p1[1]) * segmentProgress;
  ```

### 3. Отображение на карте (MapView)
- Маркер обновляется через `marker.setLngLat(truck.position)`
- Проверка изменения позиции перед обновлением для оптимизации
- В режиме "Трак" карта следует за выбранным траком через `map.easeTo()`

## Важно

✅ Траки двигаются СТРОГО по маршруту OSRM (реальные дороги Interstate)
✅ Если `routePath` нет — трак стоит и ждёт загрузки маршрута
✅ Позиция интерполируется между точками маршрута для плавности
✅ Маршрут загружается один раз и кешируется

## Проблемы которые были исправлены

❌ Траки двигались по прямой линии → ✅ Теперь по OSRM маршруту
❌ Маркеры лагали при зуме → ✅ Добавлена проверка изменения позиции
❌ Карта следила за всеми траками → ✅ Теперь только за выбранным
