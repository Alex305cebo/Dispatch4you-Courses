# 🎓 Курсы Диспетчера - Платформа обучения

Профессиональная платформа для обучения диспетчеров грузоперевозок с интерактивными курсами, симулятором и системой тестирования.

## 🌟 Возможности

### Для студентов:
- ✅ 12 структурированных модулей обучения
- ✅ Интерактивный симулятор диспетчера
- ✅ Система тестирования знаний
- ✅ Практические кейсы из реальной работы
- ✅ Тренировка телефонных переговоров
- ✅ Load Board тренажёр
- ✅ Сертификат по окончании

### Технические возможности:
- 🔐 Система авторизации (JWT)
- 🔵 Вход через Google OAuth
- 🛡️ Защита контента от копирования
- 📱 Адаптивный дизайн
- 🌓 Тёмная/светлая тема
- 💾 SQLite база данных

## 🚀 Быстрый старт

### Локальная разработка:

```bash
# 1. Установите зависимости
npm install

# 2. Создайте .env файл
cp .env.example .env

# 3. Запустите сервер
npm start

# 4. Откройте браузер
http://localhost:3000
```

### Деплой на Hostinger:

Смотрите файл `QUICK_DEPLOY_GUIDE.md` для быстрого деплоя или `HOSTINGER_DEPLOYMENT.md` для подробной инструкции.

## 📁 Структура проекта

```
dispatcher-courses/
├── pages/                  # Страницы курсов
│   ├── modules.html       # Список модулей
│   ├── simulator.html     # Симулятор
│   ├── testing.html       # Тестирование
│   ├── calls.html         # Тренировка звонков
│   ├── loadboard.html     # Load Board
│   └── ...
├── components/            # UI компоненты
├── audio/                 # Аудио файлы
├── server.js             # Backend сервер
├── auth.js               # Авторизация (frontend)
├── config.js             # Конфигурация
├── index.html            # Главная страница
├── register.html         # Регистрация
├── login.html            # Вход
├── dashboard.html        # Личный кабинет
├── courses.html          # Список курсов
├── course.html           # Страница курса
└── package.json          # Зависимости
```

## 🔧 Технологии

### Frontend:
- HTML5, CSS3, JavaScript (Vanilla)
- Адаптивный дизайн
- Google Sign-In SDK
- LocalStorage для токенов

### Backend:
- Node.js + Express
- SQLite3 (база данных)
- JWT (авторизация)
- bcryptjs (хеширование паролей)
- CORS

## 📚 Документация

- `HOSTINGER_DEPLOYMENT.md` - Полная инструкция по деплою
- `QUICK_DEPLOY_GUIDE.md` - Быстрый гайд по деплою
- `GOOGLE_OAUTH_SETUP.md` - Настройка Google OAuth
- `COURSE_ACCESS_INFO.md` - Система защиты доступа
- `CONTENT_PROTECTION_INFO.md` - Защита контента
- `DASHBOARD_INFO.md` - Информация о личном кабинете

## 🔐 Безопасность

- JWT токены для авторизации
- Хеширование паролей (bcrypt)
- Защита от копирования контента
- Блокировка скриншотов
- Отключение DevTools
- HTTPS (в production)

## 🌐 API Endpoints

### Авторизация:
- `POST /api/register` - Регистрация
- `POST /api/login` - Вход
- `POST /api/auth/google` - Вход через Google
- `GET /api/verify` - Проверка токена

## 🔄 Обновление проекта

### Локально:
```bash
git pull origin main
npm install
npm start
```

### На сервере:
```bash
cd ~/public_html/dispatcher-courses
git pull origin main
npm install --production
pm2 restart dispatcher-courses
```

## 🐛 Troubleshooting

### Проблема: Сервер не запускается
```bash
# Проверьте логи
pm2 logs dispatcher-courses

# Проверьте порт
netstat -tulpn | grep 3000
```

### Проблема: База данных не работает
```bash
# Проверьте права
ls -la users.db
chmod 644 users.db
```

### Проблема: Google OAuth не работает
1. Проверьте Client ID в config.js
2. Проверьте Authorized origins в Google Console
3. Убедитесь, что используется HTTPS

## 📊 База данных

### Структура таблицы users:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  google_id TEXT UNIQUE,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'local',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Поддержка

Если возникли вопросы:
1. Проверьте документацию в папке проекта
2. Посмотрите логи: `pm2 logs dispatcher-courses`
3. Обратитесь в поддержку Hostinger (для вопросов хостинга)

## 📝 Лицензия

Все права защищены © 2024 Курсы Диспетчера

## 🎉 Успехов в обучении!

Платформа создана для профессиональной подготовки диспетчеров грузоперевозок.
