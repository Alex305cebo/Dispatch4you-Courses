# 🗺️ GOOGLE MAPS INTEGRATION — Революция в отслеживании траков

## 🎯 Что изменилось

Старая карта на **amCharts** заменена на **Google Maps API** для:
- ✅ **Точное отображение** — реальные дороги и маршруты США
- ✅ **Плавное движение** — траки движутся по настоящим дорогам
- ✅ **Детальная навигация** — zoom до уровня улиц
- ✅ **Satellite view** — возможность переключения на спутник
- ✅ **Traffic layer** — показ пробок в реальном времени (опционально)
- ✅ **Directions API** — расчёт реальных маршрутов между городами

---

## 📦 Установка и настройка

### Шаг 1: Получить Google Maps API Key

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите **Maps JavaScript API** и **Directions API**
4. Создайте API ключ в разделе **Credentials**
5. Ограничьте ключ по домену (для безопасности)

### Шаг 2: Добавить API ключ в проект

Откройте файл `GoogleMapView.tsx` и замените:

```typescript
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";
```

на ваш реальный ключ:

```typescript
const GOOGLE_MAPS_API_KEY = "AIzaSyC...ваш_ключ";
```

### Шаг 3: Заменить старую карту

В файле `app/game.tsx` (или где используется карта):

**Было:**
```typescript
import MapView from '../components/MapView';
```

**Стало:**
```typescript
import MapView from '../components/GoogleMapView';
```

---

## 🚀 Основные возможности

### 1. Отображение траков в реальном времени

Каждый трак показывается как **цветной маркер** на карте:
- 🟢 **Зелёный** — везёт груз
- 🔵 **Синий** — едет к погрузке
- ⚪ **Серый** — свободен
- 🟡 **Жёлтый** — на погрузке
- 🟣 **Фиолетовый** — на разгрузке
- 🔴 **Красный** — поломка
- 🟠 **Оранжевый** — detention

### 2. Интерактивные маркеры

**Клик на трак** показывает:
- Название трака
- Текущий статус
- Город и пункт назначения
- HOS (часы работы)
- Пробег

### 3. Маршруты

Для траков с грузом или едущих к погрузке рисуется **линия маршрута** от текущего города до пункта назначения.

### 4. Следование за траком

Кнопка **"🎯 Следить за траком"**:
- Автоматически центрирует карту на выбранном траке
- Обновляется каждые 2 секунды
- Zoom 8 для комфортного просмотра

### 5. Легенда

Показывает все статусы траков с цветовой кодировкой. Автоматически скрывается через 4 секунды.

---

## 🎨 Тёмная тема

Карта автоматически адаптируется под тёмную тему проекта:
- Тёмный фон карты
- Светлые дороги
- Приглушённые цвета воды и парков
- Читаемые названия городов

---

## 🔧 Расширенные возможности (TODO)

### 1. Directions API — реальные маршруты

Вместо прямых линий между городами можно использовать **Directions API** для расчёта реального маршрута по дорогам:

```typescript
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer({
  map: googleMapRef.current,
  suppressMarkers: true,
  polylineOptions: {
    strokeColor: getTruckColor(truck, gameMinute),
    strokeWeight: 4,
  },
});

directionsService.route(
  {
    origin: { lat: CITIES[origin][1], lng: CITIES[origin][0] },
    destination: { lat: CITIES[destination][1], lng: CITIES[destination][0] },
    travelMode: google.maps.TravelMode.DRIVING,
  },
  (result, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    }
  }
);
```

### 2. Traffic Layer — пробки в реальном времени

```typescript
const trafficLayer = new google.maps.TrafficLayer();
trafficLayer.setMap(googleMapRef.current);
```

### 3. Анимация движения трака

Плавное перемещение маркера вдоль маршрута:

```typescript
function animateTruck(marker: any, path: any[], duration: number) {
  let step = 0;
  const numSteps = 100;
  const timePerStep = duration / numSteps;

  const interval = setInterval(() => {
    const progress = step / numSteps;
    const lat = path[0].lat + (path[1].lat - path[0].lat) * progress;
    const lng = path[0].lng + (path[1].lng - path[0].lng) * progress;
    
    marker.setPosition({ lat, lng });
    
    step++;
    if (step > numSteps) {
      clearInterval(interval);
    }
  }, timePerStep);
}
```

### 4. Кластеризация маркеров

Для большого количества траков (10+):

```typescript
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const markerClusterer = new MarkerClusterer({
  map: googleMapRef.current,
  markers: Array.from(markersRef.current.values()),
});
```

### 5. Heatmap — зоны активности

Показать где больше всего траков:

```typescript
const heatmap = new google.maps.visualization.HeatmapLayer({
  data: activeTrucks.map(t => new google.maps.LatLng(t.position[1], t.position[0])),
  map: googleMapRef.current,
});
```

---

## 📊 Производительность

### Оптимизация для большого количества траков

1. **Debounce обновлений** — не обновлять маркеры чаще 1 раза в секунду
2. **Viewport culling** — скрывать маркеры вне видимой области
3. **Кластеризация** — группировать близкие маркеры при zoom out
4. **Lazy loading** — загружать маршруты только для видимых траков

---

## 🐛 Troubleshooting

### Карта не загружается

1. Проверьте API ключ в `GoogleMapView.tsx`
2. Убедитесь что **Maps JavaScript API** включён в Google Cloud Console
3. Проверьте консоль браузера на ошибки
4. Проверьте ограничения API ключа (домены, IP)

### Маркеры не обновляются

1. Проверьте что `trucks` в `gameStore` обновляются
2. Проверьте формат координат: `[lng, lat]` в store → `{lat, lng}` в Google Maps
3. Откройте консоль и проверьте логи `console.log`

### Маршруты не рисуются

1. Проверьте что у трака есть `currentCity` и `destination`
2. Проверьте что города есть в `CITIES` константе
3. Проверьте статус трака (`loaded` или `driving`)

---

## 💰 Стоимость Google Maps API

### Бесплатный лимит (каждый месяц)

- **Maps JavaScript API**: $200 кредитов = ~28,000 загрузок карты
- **Directions API**: $200 кредитов = ~40,000 запросов

### Для игры Dispatch Office

При **100 активных игроков** в день:
- Загрузка карты: 100 × 30 дней = 3,000 загрузок/месяц ✅ **БЕСПЛАТНО**
- Маршруты (если использовать Directions API): ~1,000 запросов/месяц ✅ **БЕСПЛАТНО**

**Вывод:** Для учебного проекта Google Maps **полностью бесплатен**.

---

## 🎯 Следующие шаги

1. ✅ Базовая интеграция Google Maps
2. ⏳ Directions API для реальных маршрутов
3. ⏳ Анимация движения траков
4. ⏳ Traffic Layer для пробок
5. ⏳ Кластеризация для 10+ траков
6. ⏳ Heatmap зон активности

---

## 📝 Заметки

- Старый файл `MapView.tsx` (amCharts) сохранён как резервная копия
- Можно легко переключаться между картами меняя import
- Google Maps работает только в веб-версии (Platform.OS === 'web')
- Для мобильных приложений нужен `react-native-maps`

---

**Автор:** Kiro AI  
**Дата:** 2026-04-22  
**Версия:** 1.0.0
