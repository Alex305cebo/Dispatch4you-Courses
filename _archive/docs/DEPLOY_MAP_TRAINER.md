# 🚀 Деплой Map Trainer — Быстрая инструкция

## Что нужно загрузить на сервер

Из папки `map-trainer/dist/` загрузите на сервер в `/map-trainer/`:

### Файлы для загрузки:
```
map-trainer/dist/index.html          → /map-trainer/index.html
map-trainer/dist/favicon.svg         → /map-trainer/favicon.svg
map-trainer/dist/icons.svg           → /map-trainer/icons.svg
map-trainer/dist/assets/             → /map-trainer/assets/
```

## Через FTP/SFTP

1. Подключитесь к серверу
2. Перейдите в папку `/map-trainer/`
3. Загрузите:
   - `index.html` (перезапишите старый)
   - Папку `assets/` целиком (перезапишите старую)
   - `favicon.svg` и `icons.svg`

## Через Git (если используете)

```bash
cd DispatcherTraining
git add map-trainer/dist/
git add map-trainer/src/hooks/useAuth.js
git add map-trainer/index.html
git commit -m "Fix: Map Trainer auth with localStorage fallback"
git push origin main
```

Затем на сервере:
```bash
cd /path/to/site
git pull origin main
```

## Проверка после деплоя

1. Откройте `https://dispatch4you.com/map-trainer/`
2. Если вы уже залогинены на сайте — должны сразу попасть в игру
3. Если нет — войдите через Google
4. Откройте консоль (F12) — должны видеть логи `[useAuth]`

## Важно!

После деплоя может потребоваться очистить кеш браузера:
- **Chrome/Edge:** Ctrl+Shift+Delete → Очистить кеш
- **Safari:** Cmd+Option+E
- **Mobile:** Настройки → Safari/Chrome → Очистить данные

Или добавьте версию к URL: `https://dispatch4you.com/map-trainer/?v=2`

## Файлы которые изменились

- ✅ `map-trainer/src/hooks/useAuth.js` — исправлена логика авторизации
- ✅ `map-trainer/index.html` — убраны хардкод пути к assets
- ✅ `map-trainer/dist/` — пересобранные файлы

## Готово! 🎉

После деплоя авторизация должна работать на всех устройствах, включая мобильные.
