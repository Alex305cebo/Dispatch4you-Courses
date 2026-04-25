# BUGFIX: Roadside Assist System — Coordinate Format Issues

## Проблема

Система Roadside Assist была полностью реализована, но сервисные машины не отображались на карте из-за несоответствия форматов координат.

## Причина

В проекте используется **GeoJSON стандарт** для хранения координат: `[longitude, latitude]` (сначала долгота, потом широта).

Однако в нескольких местах код ошибочно предполагал формат `[latitude, longitude]`, что приводило к:
- Неправильному расчёту расстояний
- Отображению маркеров в неправильных местах (или вообще за пределами карты)
- Неправильной отрисовке маршрутов

## Исправления

### 1. `GoogleMapView.tsx` — Рендеринг маркеров сервисных машин

**Было:**
```typescript
const position = { lat: vehicle.position[0], lng: vehicle.position[1] };
```

**Стало:**
```typescript
// vehicle.position хранится как [lng, lat] (GeoJSON стандарт)
const position = { lat: vehicle.position[1], lng: vehicle.position[0] };
```

### 2. `GoogleMapView.tsx` — Рендеринг маршрутов (polyline)

**Было:**
```typescript
const path = vehicle.route.map(([lat, lng]: [number, number]) => ({ lat, lng }));
```

**Стало:**
```typescript
// vehicle.route хранится как [[lng, lat], ...] (GeoJSON стандарт)
const path = vehicle.route.map(([lng, lat]: [number, number]) => ({ lat, lng }));
```

### 3. `serviceVehicleHelpers.ts` — findNearestCity

**Было:**
```typescript
const [lat, lng] = position;
const distance = calculateDistance(lat, lng, cityPos[0], cityPos[1]);
```

**Стало:**
```typescript
const [lng, lat] = position; // GeoJSON: [longitude, latitude]
const [cityLng, cityLat] = cityPos;
const distance = calculateDistance(lat, lng, cityLat, cityLng);
```

### 4. `serviceVehicleHelpers.ts` — buildSimpleRoute

**Было:**
```typescript
const lat = from[0] + (to[0] - from[0]) * t;
const lng = from[1] + (to[1] - from[1]) * t;
points.push([lat, lng]);
```

**Стало:**
```typescript
// GeoJSON format: [longitude, latitude]
const lng = from[0] + (to[0] - from[0]) * t;
const lat = from[1] + (to[1] - from[1]) * t;
points.push([lng, lat]);
```

### 5. `serviceVehicleHelpers.ts` — getPositionOnRoute

**Было:**
```typescript
const [lat1, lng1] = route[lowerIndex];
const [lat2, lng2] = route[upperIndex];
return [
  lat1 + (lat2 - lat1) * t,
  lng1 + (lng2 - lng1) * t,
];
```

**Стало:**
```typescript
// GeoJSON format: [longitude, latitude]
const [lng1, lat1] = route[lowerIndex];
const [lng2, lat2] = route[upperIndex];
return [
  lng1 + (lng2 - lng1) * t,
  lat1 + (lat2 - lat1) * t,
];
```

### 6. `gameStore.ts` — callRoadsideAssist

**Было:**
```typescript
const distance = calculateDistance(
  cityPosition[0], cityPosition[1],
  truck.position[0], truck.position[1]
);
```

**Стало:**
```typescript
// cityPosition и truck.position хранятся как [lng, lat] (GeoJSON)
// calculateDistance ожидает (lat1, lon1, lat2, lon2)
const distance = calculateDistance(
  cityPosition[1], cityPosition[0],
  truck.position[1], truck.position[0]
);
```

### 7. `ServiceChoiceModal.tsx` — Расчёт расстояния

**Было:**
```typescript
const distance = cityPosition ? calculateDistance(
  cityPosition[0], cityPosition[1],
  truckPosition[0], truckPosition[1]
) : 0;
```

**Стало:**
```typescript
// cityPosition и truckPosition хранятся как [lng, lat] (GeoJSON)
// calculateDistance ожидает (lat1, lon1, lat2, lon2)
const distance = cityPosition ? calculateDistance(
  cityPosition[1], cityPosition[0],
  truckPosition[1], truckPosition[0]
) : 0;
```

## Результат

После исправлений:
- ✅ Сервисные машины корректно отображаются на карте
- ✅ Маршруты рисуются правильно
- ✅ Расстояния рассчитываются точно
- ✅ ETA и стоимость корректны
- ✅ Машины движутся по правильным траекториям

## Стандарт координат в проекте

**ВАЖНО:** Во всём проекте используется **GeoJSON стандарт**:
- Координаты хранятся как `[longitude, latitude]`
- Это касается: `CITIES`, `truck.position`, `serviceVehicle.position`, `route` массивов
- При передаче в Google Maps API нужно конвертировать: `{ lat: position[1], lng: position[0] }`
- При вызове `calculateDistance(lat1, lon1, lat2, lon2)` нужно передавать в правильном порядке

## Дата исправления

24 апреля 2026

## Автор

Kiro AI Assistant
