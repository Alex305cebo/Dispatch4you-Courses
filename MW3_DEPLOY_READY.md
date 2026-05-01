# ✅ MW3 GM2 — Готово к деплою!

## 📦 Deployment Package

**Локация:** `C:\MW3 GM2\deploy`

**Содержимое:**
- ✅ index.html (11.32 KB)
- ✅ index.js (13.24 KB)
- ✅ engine.js (13.33 KB)
- ✅ renderer.js (6.19 KB)
- ✅ types.js (0.32 KB)
- ✅ levels.js (16.29 KB)
- ✅ .htaccess (1.52 KB)
- ✅ README.md (4.75 KB)

**Общий размер:** ~67 KB

---

## 🚀 Быстрый деплой (5 минут)

### Вариант 1: GitHub Pages (Рекомендуется)

#### Шаг 1: Инициализация Git
```bash
cd "C:\MW3 GM2"
git init
git add deploy/*
git commit -m "Initial commit: MW3 GM2 Strategy Game"
```

#### Шаг 2: Создай репозиторий на GitHub
1. Открой https://github.com/new
2. Repository name: `mw3-gm2-strategy`
3. Public
4. Create repository

#### Шаг 3: Push на GitHub
```bash
git remote add origin https://github.com/ТВО_ИМЯ/mw3-gm2-strategy.git
git branch -M main
git push -u origin main
```

#### Шаг 4: Включи GitHub Pages
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → `/deploy`
4. Save

**Готово!** Игра будет доступна через 2-3 минуты:
```
https://ТВО_ИМЯ.github.io/mw3-gm2-strategy/
```

---

### Вариант 2: Hostinger (Свой домен)

#### Через File Manager:
1. Войди в Hostinger → File Manager
2. Открой `public_html`
3. Создай папку `mw3-gm2`
4. Загрузи все файлы из `C:\MW3 GM2\deploy`

**Готово!** Игра доступна:
```
https://твой-домен.com/mw3-gm2/
```

#### Через FTP (FileZilla):
1. Host: `ftp.твой-домен.com`
2. Username: твой FTP username
3. Password: твой FTP password
4. Загрузи файлы из `C:\MW3 GM2\deploy` в `public_html/mw3-gm2/`

---

## 📋 Что дальше?

### Обновление игры:
```bash
cd "C:\MW3 GM2"
npm run build
# Скопируй новые .js файлы в deploy/
git add deploy/*
git commit -m "Update game"
git push
```

### Тестирование локально:
```bash
cd "C:\MW3 GM2"
npm run serve
# Открой http://localhost:3002
```

---

## 🎮 Особенности игры

- **8 уровней кампании** (Easy → Insane)
- **6 типов зданий** (Village, Barracks, Tower, Forge, Mine, Fortress)
- **3 способности** (Morale, Speed, Shield)
- **Полная мобильная поддержка** (touch controls)
- **Hotkeys:** U (upgrade), Q (ability), 1-4 (convert/percentage)
- **AI противник** с настраиваемой сложностью

---

## 📝 Технические детали

- **Размер:** ~67 KB (очень легкий!)
- **Технологии:** TypeScript, Canvas API, ES Modules
- **Браузеры:** Chrome, Firefox, Safari, Edge (последние версии)
- **Мобильные:** iOS Safari, Chrome Android
- **Требования:** JavaScript enabled

---

## 🔗 Полезные ссылки

- [Полная инструкция по деплою](DEPLOYMENT_GUIDE.md)
- [Быстрый старт](QUICK_DEPLOY.md)
- [Механика игры](MUSHROOM_WARS_MECHANICS.md)

---

**Дата:** 30.04.2026  
**Версия:** 2.3.1  
**Статус:** 🟢 Ready to Deploy
