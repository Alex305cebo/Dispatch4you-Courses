# 🚀 Load Finder - Деплой на Render.com (БЕСПЛАТНО)

## ✅ Преимущества Render.com

- 🆓 **Бесплатно навсегда**
- 🔄 **Автоматический деплой** из GitHub
- 🌐 **Бесплатный домен** (your-app.onrender.com)
- 🐍 **Поддержка Python + Selenium**
- 📊 **Логи и мониторинг**

## ⚠️ Ограничения бесплатного тарифа

- 💤 **Засыпает после 15 минут** неактивности
- ⏰ **Просыпается ~30-50 секунд** при первом запросе
- 💾 **512 MB RAM** (может быть мало для Chrome)
- ⏱️ **750 часов/месяц** бесплатно

---

## 📋 Пошаговая инструкция

### Шаг 1: Регистрация на Render.com

1. Открой https://render.com
2. Нажми **"Get Started"**
3. Зарегистрируйся через **GitHub** (рекомендуется)
4. Подтверди email

---

### Шаг 2: Подготовка репозитория

Убедись что все файлы закоммичены в GitHub:

```bash
cd C:\Courses
git add load-finder-app/
git commit -m "Add Render.com configuration"
git push
```

---

### Шаг 3: Создание Web Service на Render

1. **Войди в Render Dashboard:** https://dashboard.render.com
2. Нажми **"New +"** → **"Web Service"**
3. Выбери **"Build and deploy from a Git repository"**
4. Нажми **"Next"**

---

### Шаг 4: Подключение GitHub репозитория

1. Выбери свой репозиторий: **dispatcher-courses**
2. Нажми **"Connect"**

---

### Шаг 5: Настройка сервиса

Заполни поля:

**Name:** `load-finder` (или любое другое имя)

**Region:** `Oregon (US West)` (ближайший к США)

**Branch:** `main`

**Root Directory:** `load-finder-app`

**Runtime:** `Python 3`

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 300 wsgi:app
```

**Plan:** `Free` (выбери бесплатный)

---

### Шаг 6: Добавление переменных окружения

Нажми **"Advanced"** → **"Add Environment Variable"**

Добавь:

**Key:** `TRUCKERPATH_USERNAME`
**Value:** `your-email@example.com` (твой логин TruckerPath)

**Key:** `TRUCKERPATH_PASSWORD`
**Value:** `your-password` (твой пароль TruckerPath)

---

### Шаг 7: Создание сервиса

1. Нажми **"Create Web Service"**
2. Дождись завершения деплоя (5-10 минут)
3. Статус должен стать **"Live"**

---

### Шаг 8: Получение URL

После успешного деплоя ты получишь URL:

```
https://load-finder.onrender.com
```

Открой его в браузере!

---

## 🔧 Настройка credentials через переменные окружения

Нужно обновить `app_full_collector.py` чтобы читать credentials из переменных окружения:

### Вариант 1: Автоматическое чтение

Добавь в начало `app_full_collector.py`:

```python
import os

# Загружаем credentials
try:
    # Пробуем из переменных окружения (для Render)
    username = os.environ.get('TRUCKERPATH_USERNAME')
    password = os.environ.get('TRUCKERPATH_PASSWORD')
    
    if username and password:
        credentials = {
            'truckerpath': {
                'username': username,
                'password': password
            }
        }
    else:
        # Если нет переменных, читаем из файла (для локального использования)
        with open("credentials.json", "r") as f:
            creds = json.load(f)
            credentials = creds.get("truckerpath", {})
except:
    # Fallback на файл
    with open("credentials.json", "r") as f:
        creds = json.load(f)
        credentials = creds.get("truckerpath", {})
```

---

## 🐛 Решение проблем

### Проблема: Сервис не запускается

**Проверь логи:**
1. Открой Dashboard → твой сервис
2. Перейди в **"Logs"**
3. Смотри ошибки

**Частые ошибки:**
- `ModuleNotFoundError` → проверь `requirements.txt`
- `Port already in use` → Render автоматически назначает порт через `$PORT`
- `Chrome not found` → добавь установку Chrome в build command

---

### Проблема: Chrome не работает

Render.com может не поддерживать Chrome на бесплатном тарифе.

**Решение 1: Headless режим**

В `app_full_collector.py` добавь:
```python
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-gpu')
```

**Решение 2: Использовать Railway.app**

Railway лучше поддерживает Chrome/Selenium.

---

### Проблема: Недостаточно памяти (512 MB)

Chrome требует много RAM. На бесплатном тарифе может не хватить.

**Решения:**
1. Уменьши количество workers: `--workers 1`
2. Используй headless режим
3. Перейди на Railway.app (больше RAM)
4. Используй платный тариф Render ($7/месяц)

---

### Проблема: Сервис засыпает

Это нормально для бесплатного тарифа.

**Решения:**
1. Первый запрос будет долгим (~30-50 сек)
2. Используй UptimeRobot для пинга каждые 5 минут (держит сервис активным)
3. Перейди на платный тариф

---

## 🔄 Автоматическое обновление

При каждом `git push` Render автоматически:
1. Скачивает новый код
2. Устанавливает зависимости
3. Перезапускает сервис

---

## 📊 Мониторинг

**Логи:**
Dashboard → твой сервис → **"Logs"**

**Метрики:**
Dashboard → твой сервис → **"Metrics"**

**События:**
Dashboard → твой сервис → **"Events"**

---

## 💰 Стоимость

**Бесплатный тариф:**
- ✅ 750 часов/месяц
- ✅ 512 MB RAM
- ✅ Автоматический деплой
- ⚠️ Засыпает после 15 минут

**Платный тариф ($7/месяц):**
- ✅ Не засыпает
- ✅ 512 MB RAM (можно больше)
- ✅ Приоритетная поддержка

---

## 🎯 Итоговый чеклист

- [ ] Зарегистрировался на Render.com
- [ ] Подключил GitHub репозиторий
- [ ] Создал Web Service
- [ ] Настроил переменные окружения
- [ ] Дождался успешного деплоя
- [ ] Открыл URL и проверил работу
- [ ] Протестировал поиск грузов

---

## 🆘 Нужна помощь?

Если что-то не работает:
1. Проверь логи в Render Dashboard
2. Убедись что все файлы закоммичены в GitHub
3. Проверь переменные окружения
4. Попробуй headless режим для Chrome

---

## 🚀 Готово!

Теперь Load Finder доступен по адресу:
**https://your-app-name.onrender.com**

Можешь поделиться этой ссылкой с пользователями! 🎉
