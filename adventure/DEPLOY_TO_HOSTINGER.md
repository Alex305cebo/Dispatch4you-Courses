# Деплой Dispatch4Adventure на Hostinger

## Что загружать

Папка: `adventure/dist/`

Содержимое:
```
dist/
├── index.html
├── favicon.ico
├── .htaccess          ← обязательно!
├── metadata.json
├── assets/
└── _expo/
    └── static/
        ├── css/
        └── js/
```

---

## Вариант A — отдельный субдомен (рекомендуется)

**Цель:** `game.dispatch4you.com`

### 1. Создай субдомен
hPanel → **Domains → Subdomains**
- Subdomain: `game`
- Domain: `dispatch4you.com`
- Document root: `/public_html/game`
- Нажми **Create**

### 2. Загрузи файлы
hPanel → **Files → File Manager** → открой `/public_html/game/`

Загрузи ВСЁ содержимое папки `dist/` (включая `.htaccess`)

### 3. Проверь
Открой `https://game.dispatch4you.com` — должна загрузиться игра.

---

## Вариант B — подпапка `/game`

**Цель:** `dispatch4you.com/game`

### 1. Загрузи файлы
hPanel → **Files → File Manager** → `/public_html/game/`

Загрузи содержимое `dist/`

### 2. Исправь пути в index.html
Открой `/public_html/game/index.html` и замени все `/_expo/` на `/game/_expo/`:

```html
<!-- было -->
href="/_expo/static/css/global-xxx.css"
src="/_expo/static/js/web/index-xxx.js"

<!-- стало -->
href="/game/_expo/static/css/global-xxx.css"
src="/game/_expo/static/js/web/index-xxx.js"
```

### 3. Исправь .htaccess
Замени последнюю строку RewriteRule:
```apache
RewriteRule ^ /game/index.html [L]
```

---

## Пересборка после изменений

```bash
# В папке adventure/
npm run build:web
```

Затем снова загрузи содержимое `dist/` на сервер.

---

## Проверка после деплоя

- [ ] Главная страница открывается
- [ ] Кнопка "Начать смену" работает
- [ ] Карта загружается
- [ ] Load Board показывает грузы
- [ ] Поиск по городу работает
