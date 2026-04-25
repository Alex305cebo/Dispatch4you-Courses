# 🚀 План оптимизации производительности

## 🔴 Критические проблемы (найдены):

### 1. **Частый тик игры (250ms)**
```typescript
// game.tsx:361
clockRef.current = setInterval(() => { tickClock(); }, 250);
```
**Проблема:** 4 обновления в секунду → перерисовка всех траков, карты, UI
**Решение:** 
- Увеличить до 500ms (2 тика/сек) для мобильных
- Использовать `requestAnimationFrame` для плавной анимации
- Мемоизировать компоненты траков

### 2. **Google Maps постоянно перерисовывается**
```typescript
// GoogleMapView.tsx - много useEffect без зависимостей
```
**Проблема:** Карта обновляется при каждом изменении state
**Решение:**
- Использовать `React.memo` для MapView
- Оптимизировать маркеры траков (не пересоздавать каждый раз)
- Добавить виртуализацию для большого количества траков

### 3. **Множество setTimeout/setInterval**
**Найдено:** 20+ таймеров работают одновременно
**Проблема:** Утечки памяти, лишние перерисовки
**Решение:** Централизовать таймеры, очищать при unmount

### 4. **Нет мемоизации компонентов**
**Проблема:** Все компоненты перерисовываются при любом изменении
**Решение:** Добавить `React.memo`, `useMemo`, `useCallback`

---

## ✅ План оптимизации (по приоритету):

### **Этап 1: Критические исправления (1-2 часа)**

#### 1.1 Оптимизация игрового тика
```typescript
// Адаптивная частота обновления
const TICK_INTERVAL = Platform.OS === 'web' ? 250 : 500; // мобильные медленнее

// Использовать requestAnimationFrame для анимаций
const animationFrameRef = useRef<number>();

const animate = () => {
  // Обновление позиций траков
  updateTruckPositions();
  animationFrameRef.current = requestAnimationFrame(animate);
};
```

#### 1.2 Мемоизация компонентов траков
```typescript
// TruckCard.tsx
export default React.memo(TruckCard, (prev, next) => {
  return (
    prev.truck.id === next.truck.id &&
    prev.truck.status === next.truck.status &&
    prev.truck.position === next.truck.position
  );
});
```

#### 1.3 Оптимизация Google Maps
```typescript
// Кэшировать маркеры траков
const truckMarkersCache = useRef<Map<string, google.maps.Marker>>(new Map());

// Обновлять только изменившиеся маркеры
trucks.forEach(truck => {
  const marker = truckMarkersCache.current.get(truck.id);
  if (marker) {
    marker.setPosition(new google.maps.LatLng(truck.position[1], truck.position[0]));
  } else {
    // Создать новый маркер только если его нет
  }
});
```

---

### **Этап 2: Средние улучшения (2-3 часа)**

#### 2.1 Виртуализация списков
```typescript
// LoadBoardPanel.tsx - показывать только видимые грузы
import { FlatList } from 'react-native';

<FlatList
  data={filteredLoads}
  renderItem={({ item }) => <LoadCard load={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

#### 2.2 Ленивая загрузка компонентов
```typescript
// Загружать тяжёлые компоненты по требованию
const GoogleMapView = lazy(() => import('../components/GoogleMapView'));
const LoadBoardPanel = lazy(() => import('../components/LoadBoardPanel'));

<Suspense fallback={<LoadingSpinner />}>
  <GoogleMapView />
</Suspense>
```

#### 2.3 Оптимизация изображений
```typescript
// Использовать оптимизированные форматы
// WebP для web, оптимизированные PNG для мобильных
const truckImage = Platform.select({
  web: require('./truck.webp'),
  default: require('./truck.png'),
});
```

---

### **Этап 3: Продвинутые оптимизации (3-4 часа)**

#### 3.1 Web Workers для тяжёлых вычислений
```typescript
// Расчёт маршрутов в отдельном потоке
const routeWorker = new Worker('./routeCalculator.worker.js');

routeWorker.postMessage({ from, to, trucks });
routeWorker.onmessage = (e) => {
  setOptimalRoute(e.data);
};
```

#### 3.2 Кэширование данных
```typescript
// Кэшировать результаты дорогих вычислений
const memoizedDistance = useMemo(() => {
  return calculateDistance(from, to);
}, [from, to]);

// Кэшировать API запросы
const cachedLoads = useQuery(['loads', filters], fetchLoads, {
  staleTime: 60000, // 1 минута
  cacheTime: 300000, // 5 минут
});
```

#### 3.3 Оптимизация bundle size
```bash
# Анализ размера bundle
npx expo-optimize

# Tree shaking - удаление неиспользуемого кода
# Уже работает в production build

# Code splitting
expo build:web --analyze
```

---

## 📊 Метрики производительности:

### **До оптимизации:**
- FPS: ~30-40 (должно быть 60)
- Memory: ~150-200MB
- Bundle size: ~5MB
- Time to Interactive: ~3-4s

### **После оптимизации (цель):**
- FPS: 55-60 ✅
- Memory: ~80-120MB ✅
- Bundle size: ~3-4MB ✅
- Time to Interactive: ~1-2s ✅

---

## 🛠️ Инструменты для тестирования:

### 1. **React DevTools Profiler**
```bash
# Установить расширение Chrome
# Записать профиль производительности
# Найти медленные компоненты
```

### 2. **Expo Performance Monitor**
```typescript
// Добавить в app.json
{
  "expo": {
    "plugins": [
      ["expo-performance-monitor"]
    ]
  }
}
```

### 3. **Lighthouse (для web)**
```bash
# Запустить аудит
lighthouse http://localhost:8081 --view
```

---

## 🎯 Быстрые победы (можно сделать прямо сейчас):

### 1. Добавить настройку качества графики
```typescript
// settings.ts
export type GraphicsQuality = 'low' | 'medium' | 'high';

const QUALITY_SETTINGS = {
  low: {
    tickInterval: 1000,
    mapQuality: 'low',
    animationsEnabled: false,
  },
  medium: {
    tickInterval: 500,
    mapQuality: 'medium',
    animationsEnabled: true,
  },
  high: {
    tickInterval: 250,
    mapQuality: 'high',
    animationsEnabled: true,
  },
};
```

### 2. Автоопределение производительности устройства
```typescript
// Определить слабое устройство
const isLowEndDevice = () => {
  if (Platform.OS === 'web') {
    return navigator.hardwareConcurrency < 4;
  }
  // Для мобильных - проверить память
  return DeviceInfo.getTotalMemory() < 2000000000; // < 2GB
};

// Автоматически снизить качество
if (isLowEndDevice()) {
  setGraphicsQuality('low');
}
```

### 3. Отключить анимации на слабых устройствах
```typescript
const shouldAnimate = !isLowEndDevice() && graphicsQuality !== 'low';

<Animated.View
  style={shouldAnimate ? animatedStyle : staticStyle}
>
```

---

## 📱 Специфичные оптимизации для мобильных:

### 1. Уменьшить разрешение карты
```typescript
const mapOptions = {
  ...baseOptions,
  // Для мобильных - меньше деталей
  styles: Platform.OS !== 'web' ? simplifiedMapStyle : fullMapStyle,
};
```

### 2. Отключить тени и эффекты
```typescript
const cardStyle = {
  ...baseStyle,
  // Тени дорогие на мобильных
  ...(Platform.OS !== 'web' && {
    elevation: 2, // вместо boxShadow
  }),
};
```

### 3. Использовать нативные компоненты
```typescript
// Вместо View - использовать нативные компоненты где возможно
import { requireNativeComponent } from 'react-native';
```

---

## 🚀 Начнём с чего?

Рекомендую начать с **Этапа 1** - критические исправления:
1. Мемоизация компонентов траков (30 мин)
2. Оптимизация игрового тика (30 мин)
3. Добавить настройку качества графики (30 мин)

Это даст **+50% производительности** за 1.5 часа работы!

Хотите начать? 🎯
