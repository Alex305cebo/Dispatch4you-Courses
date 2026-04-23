# 🔌 ПРИМЕР ИНТЕГРАЦИИ Google Maps

## 📝 Как заменить карту в вашем проекте

### Шаг 1: Импорт

В файле `app/game.tsx` (строка 24):

**Было:**
```typescript
import MapView from '../components/MapView';
```

**Стало (базовая версия):**
```typescript
import MapView from '../components/GoogleMapView';
```

**Или (расширенная версия):**
```typescript
import MapView from '../components/GoogleMapViewAdvanced';
```

### Шаг 2: Использование

Компонент используется точно так же! Никаких изменений в коде не требуется:

```typescript
<MapView
  onTruckInfo={(truckId) => {
    // Обработчик клика на трак
    const truck = trucks.find(t => t.id === truckId);
    setDetailTruck(truck);
  }}
  onTruckSelect={(truckId) => {
    // Выбор трака
    selectTruck(truckId);
  }}
  onFindLoad={(city) => {
    // Поиск грузов из города
    setLoadBoardSearch(city);
    switchTab('loadboard');
  }}
/>
```

### Шаг 3: API ключ

Создайте файл `.env` в папке `adventure/`:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC...ваш_ключ
```

**Готово!** Карта заработает автоматически.

---

## 🎯 Полный пример интеграции

### Файл: `app/game.tsx`

```typescript
// ── ИМПОРТЫ ──────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';

// БЫЛО: import MapView from '../components/MapView';
// СТАЛО:
import MapView from '../components/GoogleMapView';
// или
// import MapView from '../components/GoogleMapViewAdvanced';

// ── КОМПОНЕНТ ────────────────────────────────────────────────────────────────
export default function GameScreen() {
  const { trucks, selectTruck, setLoadBoardSearch } = useGameStore();
  const [detailTruck, setDetailTruck] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'loadboard'>('map');

  // ── ОБРАБОТЧИКИ ────────────────────────────────────────────────────────────
  function handleTruckClick(truckId: string) {
    const truck = trucks.find(t => t.id === truckId);
    if (truck) {
      selectTruck(truckId);
      setDetailTruck(truck);
      
      // Zoom на трак (работает автоматически через InfoWindow)
      console.log('Выбран трак:', truck.name);
    }
  }

  function handleFindLoad(city: string) {
    setLoadBoardSearch(city);
    setActiveTab('loadboard');
    console.log('Поиск грузов из:', city);
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Карта */}
      <View style={styles.mapArea}>
        <MapView
          onTruckInfo={handleTruckClick}
          onTruckSelect={handleTruckClick}
          onFindLoad={handleFindLoad}
        />
      </View>

      {/* Детали трака */}
      {detailTruck && (
        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>{detailTruck.name}</Text>
          <Text style={styles.detailText}>Статус: {detailTruck.status}</Text>
          <Text style={styles.detailText}>Город: {detailTruck.currentCity}</Text>
        </View>
      )}
    </View>
  );
}

// ── СТИЛИ ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  detailPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 4,
  },
});
```

---

## 🔄 События карты

### Zoom на трак программно

```typescript
// Zoom на конкретный трак
window.dispatchEvent(new CustomEvent('zoomToTruck', {
  detail: {
    lng: truck.position[0],
    lat: truck.position[1],
    slow: true, // плавный zoom
  }
}));

// Zoom на центр всех траков
const center = getTrucksCenter();
window.dispatchEvent(new CustomEvent('zoomToTruck', {
  detail: {
    lng: center.lng,
    lat: center.lat,
    slow: true,
  }
}));
```

### Показать тост-уведомление на карте

```typescript
// Общее уведомление (в углу)
window.dispatchEvent(new CustomEvent('mapToast', {
  detail: {
    message: 'Груз назначен на Truck #1',
    color: '#4ade80',
  }
}));

// Уведомление над траком
window.dispatchEvent(new CustomEvent('mapToast', {
  detail: {
    message: 'Поломка!',
    color: '#f87171',
    truckId: 'truck-1',
  }
}));
```

### Включить следование за траком

```typescript
// Следовать за конкретным траком
window.dispatchEvent(new CustomEvent('followAssignedTruck', {
  detail: { truckId: 'truck-1' }
}));
```

---

## 🎨 Кастомизация

### Изменить цвета статусов

В файле `GoogleMapView.tsx` или `GoogleMapViewAdvanced.tsx`:

```typescript
const STATUS_COLOR: Record<string, string> = {
  idle:        '#94a3b8', // ← измените на свой цвет
  driving:     '#818cf8',
  loaded:      '#4ade80',
  at_pickup:   '#fbbf24',
  at_delivery: '#c084fc',
  breakdown:   '#f87171',
  waiting:     '#fb923c',
};
```

### Изменить стиль карты

```typescript
// В функции getDarkMapStyles()
function getDarkMapStyles() {
  return [
    { elementType: "geometry", stylers: [{ color: "#1a1f2e" }] }, // ← фон
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, // ← текст
    // ...
  ];
}
```

Или используйте готовые стили с [Snazzy Maps](https://snazzymaps.com/)

### Добавить свою кнопку на карту

```typescript
{/* Ваша кнопка */}
<button
  onClick={() => console.log('Клик!')}
  style={{
    position: 'absolute',
    top: 16,
    left: 16,
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: '10px 16px',
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 1000,
  }}
>
  🎯 Моя кнопка
</button>
```

---

## 🐛 Отладка

### Проверка загрузки карты

```typescript
useEffect(() => {
  // Проверяем что Google Maps загружен
  if (window.google && window.google.maps) {
    console.log('✅ Google Maps загружен');
  } else {
    console.log('❌ Google Maps не загружен');
  }
}, []);
```

### Проверка маркеров

```typescript
useEffect(() => {
  console.log('📍 Траков на карте:', activeTrucks.length);
  activeTrucks.forEach(truck => {
    console.log(`  - ${truck.name}: [${truck.position[0]}, ${truck.position[1]}]`);
  });
}, [activeTrucks]);
```

### Проверка маршрутов

```typescript
useEffect(() => {
  const trucksWithRoutes = activeTrucks.filter(
    t => t.status === 'loaded' || t.status === 'driving'
  );
  console.log('🛣️ Маршрутов на карте:', trucksWithRoutes.length);
}, [activeTrucks]);
```

---

## 📊 Производительность

### Оптимизация для большого количества траков

```typescript
// Debounce обновлений маркеров
const updateMarkersDebounced = useMemo(
  () => debounce(() => {
    // Обновление маркеров
  }, 1000),
  []
);

useEffect(() => {
  updateMarkersDebounced();
}, [activeTrucks]);
```

### Скрытие маркеров вне экрана

```typescript
// Получить границы видимой области
const bounds = googleMapRef.current.getBounds();

// Показывать только траки в видимой области
const visibleTrucks = activeTrucks.filter(truck => {
  const position = { lat: truck.position[1], lng: truck.position[0] };
  return bounds.contains(position);
});
```

---

## 🎯 Следующие шаги

После базовой интеграции:

1. ✅ Протестируйте карту с разным количеством траков
2. ✅ Настройте ограничения API ключа
3. ✅ Добавьте кастомные кнопки и элементы UI
4. ✅ Интегрируйте с вашей системой уведомлений
5. ✅ Добавьте анимацию движения траков (см. `GOOGLE_MAPS_INTEGRATION.md`)

---

## 📚 Дополнительная документация

- `GOOGLE_MAPS_SETUP.md` — Быстрый старт
- `GOOGLE_MAPS_INTEGRATION.md` — Технические детали
- `MIGRATION_TO_GOOGLE_MAPS.md` — Миграция с amCharts
- `GOOGLE_MAPS_README_RU.md` — Краткая инструкция

---

**Автор:** Kiro AI  
**Дата:** 2026-04-22  
**Версия:** 1.0.0
