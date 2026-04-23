# 🚀 БЫСТРЫЙ СТАРТ — Google Maps для Dispatch Office

## 📋 Что нужно сделать

### 1️⃣ Получить API ключ Google Maps (5 минут)

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Library**
4. Найдите и включите:
   - ✅ **Maps JavaScript API**
   - ✅ **Directions API** (для расширенной версии)
   - ✅ **Geocoding API** (опционально)
5. Перейдите в **APIs & Services** → **Credentials**
6. Нажмите **Create Credentials** → **API Key**
7. Скопируйте ключ (выглядит как `AIzaSyC...`)

### 2️⃣ Добавить ключ в проект

Откройте файл который хотите использовать:

**Базовая версия:**
```
adventure/components/GoogleMapView.tsx
```

**Расширенная версия (с Directions API):**
```
adventure/components/GoogleMapViewAdvanced.tsx
```

Найдите строку:
```typescript
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";
```

Замените на ваш ключ:
```typescript
const GOOGLE_MAPS_API_KEY = "AIzaSyC...ваш_ключ";
```

### 3️⃣ Заменить старую карту

Откройте файл где используется карта (например `app/game.tsx`):

**Было:**
```typescript
import MapView from '../components/MapView';
```

**Базовая версия:**
```typescript
import MapView from '../components/GoogleMapView';
```

**Расширенная версия:**
```typescript
import MapView from '../components/GoogleMapViewAdvanced';
```

### 4️⃣ Запустить проект

```bash
cd adventure
npm start
```

Откройте браузер и проверьте карту!

---

## 🎯 Какую версию выбрать?

### GoogleMapView.tsx — Базовая версия

✅ **Используйте если:**
- Нужна простая карта с маркерами
- Хотите минимальное потребление API
- Достаточно прямых линий между городами

📦 **Что включено:**
- Маркеры траков с цветовой кодировкой
- Прямые линии маршрутов
- Клик на трак → информация
- Следование за траком
- Легенда статусов
- Тёмная тема

### GoogleMapViewAdvanced.tsx — Расширенная версия

✅ **Используйте если:**
- Нужны реальные маршруты по дорогам
- Хотите показывать пробки
- Нужна спутниковая карта
- Важна точность маршрутов

📦 **Что включено:**
- Всё из базовой версии +
- **Directions API** — реальные маршруты по дорогам
- **Traffic Layer** — пробки в реальном времени
- Переключение карта/спутник
- Иконки траков с направлением движения
- Расчёт расстояния и времени в пути

---

## 💰 Стоимость

### Бесплатный лимит Google Maps

Google даёт **$200 кредитов каждый месяц** бесплатно:

| API | Бесплатно в месяц | Стоимость после |
|-----|-------------------|-----------------|
| Maps JavaScript API | 28,000 загрузок | $7 за 1000 |
| Directions API | 40,000 запросов | $5 за 1000 |
| Traffic Layer | Бесплатно | Бесплатно |

### Для Dispatch Office

При **100 игроков в день**:
- Загрузка карты: 100 × 30 = **3,000 загрузок/месяц** ✅ БЕСПЛАТНО
- Маршруты (Advanced): ~1,000 запросов/месяц ✅ БЕСПЛАТНО

**Вывод:** Для учебного проекта Google Maps **полностью бесплатен**.

---

## 🔒 Безопасность API ключа

### ⚠️ ВАЖНО: Ограничьте ключ!

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Перейдите в **APIs & Services** → **Credentials**
3. Нажмите на ваш API ключ
4. В разделе **Application restrictions** выберите:
   - **HTTP referrers (web sites)**
5. Добавьте ваши домены:
   ```
   localhost:8081/*
   yourdomain.com/*
   *.yourdomain.com/*
   ```
6. В разделе **API restrictions** выберите:
   - **Restrict key**
   - Выберите только нужные API:
     - Maps JavaScript API
     - Directions API
     - Geocoding API

### 🚫 НЕ ДЕЛАЙТЕ:

- ❌ Не коммитьте ключ в публичный GitHub
- ❌ Не используйте один ключ для всех проектов
- ❌ Не оставляйте ключ без ограничений

### ✅ ДЕЛАЙТЕ:

- ✅ Используйте переменные окружения (`.env`)
- ✅ Ограничьте ключ по доменам
- ✅ Ограничьте ключ по API
- ✅ Мониторьте использование в Google Cloud Console

---

## 🐛 Troubleshooting

### Карта не загружается

**Проблема:** Белый экран или "Загрузка Google Maps..."

**Решение:**
1. Проверьте API ключ в файле
2. Откройте консоль браузера (F12)
3. Проверьте ошибки:
   - `InvalidKeyMapError` → неверный ключ
   - `RefererNotAllowedMapError` → добавьте домен в ограничения
   - `ApiNotActivatedMapError` → включите API в Google Cloud Console

### Маршруты не рисуются (Advanced версия)

**Проблема:** Маркеры есть, но линий маршрутов нет

**Решение:**
1. Проверьте что **Directions API** включён в Google Cloud Console
2. Откройте консоль браузера и проверьте ошибки
3. Проверьте что у трака есть `destination` или `nextPickup`
4. Проверьте что города есть в `CITIES` константе

### Пробки не показываются

**Проблема:** Кнопка "Пробки ВКЛ" не работает

**Решение:**
1. Traffic Layer работает только в некоторых регионах
2. Проверьте zoom — пробки видны только при zoom > 10
3. Проверьте что вы в США (Traffic Layer лучше работает в крупных городах)

### Маркеры не обновляются

**Проблема:** Траки не двигаются на карте

**Решение:**
1. Проверьте что `trucks` в `gameStore` обновляются
2. Откройте консоль и проверьте логи `console.log`
3. Проверьте формат координат: `[lng, lat]` в store → `{lat, lng}` в Google Maps

---

## 📊 Мониторинг использования

### Как проверить сколько API вызовов вы используете

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Перейдите в **APIs & Services** → **Dashboard**
3. Выберите **Maps JavaScript API** или **Directions API**
4. Смотрите график использования

### Настройка алертов

1. Перейдите в **Billing** → **Budgets & alerts**
2. Создайте бюджет (например $10/месяц)
3. Настройте email уведомления при 50%, 90%, 100%

---

## 🎨 Кастомизация

### Изменить цвета маркеров

В файле `GoogleMapView.tsx` или `GoogleMapViewAdvanced.tsx`:

```typescript
const STATUS_COLOR: Record<string, string> = {
  idle:        '#94a3b8', // ← измените цвет
  driving:     '#818cf8',
  loaded:      '#4ade80',
  // ...
};
```

### Изменить стиль карты

В функции `getDarkMapStyles()` измените цвета:

```typescript
{ elementType: "geometry", stylers: [{ color: "#1a1f2e" }] }, // ← фон карты
{ elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, // ← текст
```

Или используйте готовые стили с [Snazzy Maps](https://snazzymaps.com/)

### Изменить иконку трака

В `GoogleMapViewAdvanced.tsx` функция `createTruckIcon()`:

```typescript
function createTruckIcon(color: string, rotation: number = 0): any {
  return {
    path: 'M 0,-2 L 1.5,2 L 0,1.5 L -1.5,2 Z', // ← SVG path
    fillColor: color,
    scale: 4, // ← размер
    // ...
  };
}
```

Или используйте картинку:

```typescript
return {
  url: '/path/to/truck-icon.png',
  scaledSize: new google.maps.Size(32, 32),
  rotation: rotation,
};
```

---

## 🚀 Следующие шаги

После базовой настройки можно добавить:

1. ✅ **Анимация движения** — плавное перемещение маркеров
2. ✅ **Кластеризация** — группировка маркеров при zoom out
3. ✅ **Heatmap** — тепловая карта активности траков
4. ✅ **Геозоны** — выделение штатов с высокими ставками
5. ✅ **Маршруты с остановками** — показ truck stops на маршруте
6. ✅ **Погода** — интеграция с Weather API

Примеры кода для этих фич есть в `GOOGLE_MAPS_INTEGRATION.md`

---

## 📞 Поддержка

**Проблемы с Google Maps API:**
- [Документация Google Maps](https://developers.google.com/maps/documentation)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-maps)

**Проблемы с интеграцией:**
- Проверьте консоль браузера (F12)
- Проверьте логи в терминале
- Откройте issue в репозитории

---

**Автор:** Kiro AI  
**Дата:** 2026-04-22  
**Версия:** 1.0.0

🎉 **Готово! Теперь у вас самая крутая карта для Dispatch Office!**
