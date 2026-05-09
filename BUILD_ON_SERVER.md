# 🏗️ Сборка Map Trainer на сервере

## После git pull на сервере

Изменения уже запушены в GitHub. Теперь нужно:

### 1. На сервере выполните git pull

```bash
cd /path/to/dispatch4you.com
git pull origin main
```

### 2. Пересоберите map-trainer

```bash
cd map-trainer
npm install  # если нужно обновить зависимости
npm run build
```

### 3. Проверьте что файлы созданы

```bash
ls -la dist/
# Должны быть:
# - index.html
# - assets/index-DNzdbdhN.js
# - assets/index-DdPfSiZb.css
# - favicon.svg
# - icons.svg
```

### 4. Готово!

Откройте `https://dispatch4you.com/map-trainer/` и проверьте:
- Если вы уже залогинены — должны сразу попасть в игру
- В консоли (F12) должны видеть логи `[useAuth]`

## Если нет Node.js на сервере

Соберите локально и загрузите через FTP:

```bash
# Локально
cd map-trainer
npm run build

# Затем загрузите содержимое dist/ на сервер в /map-trainer/
```

## Проверка

После деплоя:
1. Очистите кеш браузера (Ctrl+Shift+Delete)
2. Откройте `https://dispatch4you.com/map-trainer/`
3. Проверьте консоль — должны видеть логи авторизации
4. Если залогинены — сразу попадёте в игру

## Что изменилось

✅ `map-trainer/src/hooks/useAuth.js` — улучшена логика авторизации
✅ `map-trainer/index.html` — исправлены пути к assets
✅ `auth-check.js` — добавлена задержка и fallback на localStorage
✅ `login.html` — улучшена обработка Google OAuth

Все изменения уже в main ветке!
