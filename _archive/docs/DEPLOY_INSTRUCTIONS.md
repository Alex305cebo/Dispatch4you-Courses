# 🚀 ДЕПЛОЙ НА HOSTINGER — Финальная инструкция

## ✅ Что исправлено

- ❌ **OSRM CORS блокировка** → ✅ Google Maps Directions API
- ❌ **Траки не двигались** → ✅ Используют `getPositionOnRoute()`
- ❌ **Маршруты не загружались** → ✅ Google Maps строит маршруты

---

## 📦 ШАГ 1: Подготовка файлов

**Папка для загрузки:** `C:\DispatcherTraining\adventure\dist\`

**Содержимое:**
```
dist/
├── index.html          ✅ Пути исправлены на /game/
├── .htaccess           ✅ Создан
├── favicon.ico         ✅
├── metadata.json       ✅
├── _expo/              ✅ CSS и JS
│   └── static/
│       ├── css/
│       └── js/
└── assets/             ✅ Картинки траков
    └── TruckPic/
```

---

## 🌐 ШАГ 2: Загрузка на Hostinger

### Способ 1: File Manager (проще)

1. **Открой hPanel** → Files → **File Manager**
2. **Перейди в папку** `/public_html/game/`
3. **Удали старые файлы** (Select All → Delete)
4. **Загрузи новые файлы:**
   - Нажми **Upload Files**
   - Выбери ВСЁ из `C:\DispatcherTraining\adventure\dist\`
   - Жди загрузки (может занять 2-3 минуты)

5. **Проверь что загрузилось:**
   ```
   /public_html/game/
   ├── index.html
   ├── .htaccess
   ├── favicon.ico
   ├── metadata.json
   ├── _expo/
   └── assets/
   ```

### Способ 2: FTP (быстрее)

1. **Открой FileZilla** (или WinSCP)
2. **Подключись:**
   - Host: `ftp.dispatch4you.com`
   - Username: `u123456789` (твой логин)
   - Password: `***` (твой пароль)
   - Port: `21`

3. **Перейди в** `/public_html/game/`
4. **Удали старые файлы** (правая кнопка → Delete)
5. **Загрузи новые:**
   - Слева: `C:\DispatcherTraining\adventure\dist\`
   - Справа: `/public_html/game/`
   - Перетащи всё из левой панели в правую

---

## ✅ ШАГ 3: Проверка

### 1. Открой сайт
`https://dispatch4you.com/game`

### 2. Проверь консоль (F12)
**Должно быть:**
- ✅ `✅ Route loaded via Google Maps: X points`
- ✅ `🛣️ Moving on route: progress=X, points=Y`
- ✅ `🚛 Truck X: status=loaded, dest=Nashville`

**НЕ должно быть:**
- ❌ `Access to fetch at 'https://router.project-osrm.org'... blocked by CORS`
- ❌ `Failed to load resource: net::ERR_FAILED`

### 3. Проверь траки
- ✅ Траки видны на карте
- ✅ Траки **ЕДУТ** по дорогам (не стоят!)
- ✅ Машина ремонта едет по дорогам
- ✅ Время идёт (верхний левый угол)

---

## 🐛 Если что-то не работает

### Проблема: Траки не двигаются
**Решение:**
1. Открой консоль (F12)
2. Проверь логи — должно быть `🛣️ Moving on route`
3. Если нет — очисти кеш (Ctrl+Shift+R)

### Проблема: Ошибка 404
**Решение:**
1. Проверь что `.htaccess` загружен в `/public_html/game/.htaccess`
2. Проверь содержимое:
```apache
RewriteEngine On
RewriteBase /game/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /game/index.html [L]
```

### Проблема: Белый экран
**Решение:**
1. Проверь что пути в `index.html` начинаются с `/game/`
2. Проверь что папка `_expo/` загружена

### Проблема: Google Maps не загружается
**Решение:**
1. Проверь что API ключ работает
2. Проверь что домен `dispatch4you.com` добавлен в Google Cloud Console

---

## 📝 Что изменилось в коде

### Файл: `store/gameStore.ts`

**Было (OSRM с CORS):**
```typescript
const osrmUrl = `https://router.project-osrm.org/route/...`;
const proxyUrl = `${proxy}${encodeURIComponent(osrmUrl)}`;
const res = await fetch(proxyUrl);
```

**Стало (Google Maps без CORS):**
```typescript
const directionsService = new google.maps.DirectionsService();
directionsService.route({
  origin: new google.maps.LatLng(fromLat, fromLng),
  destination: new google.maps.LatLng(toLat, toLng),
  travelMode: google.maps.TravelMode.DRIVING,
}, (result, status) => {
  // Конвертируем в формат [lng, lat]
  const path = result.routes[0].overview_path.map(p => [p.lng(), p.lat()]);
  resolve(path);
});
```

**Было (сложная интерполяция):**
```typescript
const pointIndex = Math.floor(newProgress * (totalPoints - 1));
const nextIndex = Math.min(pointIndex + 1, totalPoints - 1);
const segmentProgress = (newProgress * (totalPoints - 1)) - pointIndex;
const p1 = truck.routePath[pointIndex];
const p2 = truck.routePath[nextIndex];
const lng = p1[0] + (p2[0] - p1[0]) * segmentProgress;
const lat = p1[1] + (p2[1] - p1[1]) * segmentProgress;
```

**Стало (как машина ремонта):**
```typescript
const newPosition = getPositionOnRoute(truck.routePath, newProgress);
```

---

## 🎉 Готово!

После загрузки траки будут ехать по дорогам через Google Maps! 🚛🗺️

**Проверь:** `https://dispatch4you.com/game`
