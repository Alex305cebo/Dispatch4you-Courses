# 🚀 Load Finder на Render.com - Быстрый старт

## 📋 За 5 минут

### 1. Зарегистрируйся на Render.com
👉 https://render.com → **"Get Started"** → Войди через GitHub

### 2. Создай Web Service
1. Dashboard → **"New +"** → **"Web Service"**
2. Выбери репозиторий: **dispatcher-courses**
3. Нажми **"Connect"**

### 3. Настрой сервис

**Name:** `load-finder`
**Root Directory:** `load-finder-app`
**Build Command:** `pip install -r requirements.txt`
**Start Command:** `gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 300 wsgi:app`
**Plan:** `Free`

### 4. Добавь переменные окружения

Нажми **"Advanced"** → **"Add Environment Variable"**

```
TRUCKERPATH_USERNAME = your-email@example.com
TRUCKERPATH_PASSWORD = your-password
```

### 5. Создай сервис

Нажми **"Create Web Service"** → Жди 5-10 минут

### 6. Готово!

Твой Load Finder доступен по адресу:
**https://load-finder.onrender.com**

---

## ⚠️ Важно

- Сервис засыпает после 15 минут неактивности
- Первый запрос после сна займет ~30-50 секунд
- 750 часов/месяц бесплатно

---

## 🐛 Если не работает

1. Проверь логи в Render Dashboard
2. Убедись что переменные окружения установлены
3. Проверь что код закоммичен в GitHub

---

## 📝 Полная инструкция

Смотри `RENDER_DEPLOY.md` для подробностей
