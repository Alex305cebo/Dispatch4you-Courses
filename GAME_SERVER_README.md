# 🚛 DISPATCH OFFICE GAME — Live Server

## Быстрый старт

### Запуск игрового сервера

```bash
# Разработка (с автоперезагрузкой)
npm run game:dev

# Продакшн
npm run game
```

Игра будет доступна по адресу: **http://localhost:3001**

## Порты

- **3000** — основной сайт с курсами (если запущен server.js)
- **3001** — игровой сервер (game-server.js)

## Структура

```
DispatcherTraining/
├── game-server.js          # Express сервер для игры
├── game/                   # Папка с игрой
│   ├── index.html         # Главная страница игры
│   ├── assets/            # Ресурсы игры
│   └── ...
├── js/                    # JavaScript модули
├── css/                   # Стили
└── audio/                 # Аудио файлы
```

## API Endpoints

### Game API
- `GET /` — главная страница игры
- `POST /api/save-game` — сохранение игровой сессии
- `GET /api/load-game/:sessionId` — загрузка сессии
- `GET /health` — проверка статуса сервера

### Static Files
- `/game/*` — файлы игры
- `/js/*` — JavaScript
- `/css/*` — стили
- `/audio/*` — аудио
- `/assets/*` — ресурсы

## Особенности

✅ CORS включён для разработки  
✅ Автоматическое логирование сохранений  
✅ Health check endpoint  
✅ Graceful shutdown  
✅ 404 обработка  

## Разработка

Сервер использует:
- **Express** — веб-фреймворк
- **CORS** — кросс-доменные запросы
- **nodemon** — автоперезагрузка (в dev режиме)

## Деплой

Для деплоя на продакшн:

1. Установить переменную окружения `PORT`
2. Запустить `npm run game`
3. Настроить reverse proxy (nginx/apache)

## Troubleshooting

**Порт занят?**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Не находит файлы?**
Проверьте пути в `game-server.js` — все пути относительно корня проекта.

---

**Версия:** 1.0.0  
**Дата:** 2026-04-30  
**Игра:** Dispatch Office v2.2.0
