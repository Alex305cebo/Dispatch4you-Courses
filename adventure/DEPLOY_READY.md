# 🚀 ДЕПЛОЙ ГОТОВ — Траки едут по дорогам!

## ✅ Что исправлено

1. **OSRM CORS блокировка** → заменён на Google Maps Directions API
2. **Траки не двигались** → используют `getPositionOnRoute()` как машина ремонта
3. **Маршруты не загружались** → Google Maps строит маршруты по дорогам

## 📦 Что загружать на Hostinger

**Папка:** `C:\DispatcherTraining\adventure\dist\`

**Куда загружать:** `/public_html/game/` на Hostinger

---

## 🔧 Инструкция по деплою

### Вариант 1: Через File Manager (рекомендуется)

1. **Открой hPanel** → Files → File Manager
2. **Перейди в** `/public_html/game/`
3. **Удали старые файлы** (кроме `.htaccess` если есть)
4. **Загрузи всё из** `C:\DispatcherTraining\adventure\dist\`:
   - `index.html`
   - `favicon.ico`
   - `metadata.json`
   - Папка `_expo/`
   - Папка `assets/`

5. **Проверь .htaccess** — должен быть в `/public_html/game/.htaccess`:
```apache
RewriteEngine On
RewriteBase /game/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /game/index.html [L]
```

### Вариант 2: Через FTP

1. **Подключись к FTP** (FileZilla / WinSCP)
   - Host: `ftp.dispatch4you.com`
   - Username: твой логин
   - Password: твой пароль

2. **Перейди в** `/public_html/game/`
3. **Загрузи всё из** `dist/`

---

## ✅ Проверка после деплоя

Открой: `https://dispatch4you.com/game`

**Должно работать:**
- ✅ Главная страница загружается
- ✅ Кнопка "Начать смену" работает
- ✅ Карта Google Maps отображается
- ✅ **Траки едут по дорогам** 🚛
- ✅ Машина ремонта едет по дорогам 🚗
- ✅ Load Board показывает грузы

**НЕ должно быть:**
- ❌ Ошибок OSRM CORS в консоли
- ❌ Траков стоящих на месте
- ❌ Ошибок 404

---

## 🐛 Если что-то не работает

### Траки не двигаются
1. Открой консоль (F12)
2. Проверь логи: должно быть `🛣️ Moving on route: progress=X, points=Y`
3. Если нет — проверь что Google Maps API ключ работает

### Ошибка 404
1. Проверь что `.htaccess` загружен
2. Проверь что пути в `index.html` начинаются с `/game/`

### Карта не загружается
1. Проверь Google Maps API ключ в `.env`
2. Проверь что домен `dispatch4you.com` добавлен в Google Cloud Console

---

## 📝 Изменённые файлы

1. `store/gameStore.ts` — функция `fetchRoute()` использует Google Maps
2. `store/gameStore.ts` — траки используют `getPositionOnRoute()`

---

## 🎉 Готово!

Траки теперь едут по дорогам через Google Maps Directions API!
