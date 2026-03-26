# 🚀 Настройка автоматического деплоя GitHub → Hostinger

## 📋 Что нужно сделать

### 1️⃣ Настроить GitHub Secrets

Перейди в свой репозиторий на GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

Добавь следующие секреты:

| Имя секрета | Значение | Описание |
|-------------|----------|----------|
| `FTP_SERVER` | `ftp.dispatch4you.com` | FTP сервер Hostinger |
| `FTP_USERNAME` | `u123456789` | Твой FTP логин |
| `FTP_PASSWORD` | `твой_пароль` | Твой FTP пароль |
| `SSH_PRIVATE_KEY` | `-----BEGIN...` | SSH ключ (опционально) |

### 2️⃣ Как получить FTP данные из Hostinger

1. Войди в **hPanel** (Hostinger панель управления)
2. Перейди в **Files → FTP Accounts**
3. Найди свой аккаунт или создай новый
4. Скопируй:
   - **Server/Hostname** → `FTP_SERVER`
   - **Username** → `FTP_USERNAME`
   - **Password** → `FTP_PASSWORD`

### 3️⃣ Проверка настройки

После добавления секретов:

1. Сделай любое изменение в коде
2. Закоммить и запушить:
   ```bash
   git add .
   git commit -m "Test deploy"
   git push
   ```
3. Перейди в **Actions** на GitHub
4. Увидишь запущенный workflow "🚀 Deploy to Hostinger"

### 4️⃣ Ручной деплой

Если нужно задеплоить вручную:

1. Перейди в **Actions** → **Deploy to Hostinger**
2. Нажми **Run workflow**
3. Выбери метод деплоя:
   - `ftp` - быстрый FTP деплой (рекомендуется)
   - `ssh` - через SSH/rsync (нужен SSH ключ)
   - `both` - оба метода

---

## 🎯 Что деплоится

**Включено:**
- Все HTML файлы
- CSS, JS файлы
- Аудио файлы (audio/)
- Изображения
- includes/, pages/, quiz/
- .htaccess

**Исключено:**
- Markdown файлы (*.md)
- Скрипты (*.py, *.ps1, *.bat, *.sh)
- Тестовые файлы (test-*.html)
- node_modules, .git, .kiro
- Бэкапы (backup_*)
- Вспомогательные проекты (audio-learning-platform, dispatcher-cards-app и т.д.)

---

## 🔧 Устранение проблем

### Деплой не запускается
- Проверь, что все секреты добавлены правильно
- Убедись, что имена секретов написаны ЗАГЛАВНЫМИ буквами
- Проверь, что в секретах нет лишних пробелов

### FTP ошибка "Connection refused"
- Проверь FTP_SERVER (должен быть без `ftp://` или `https://`)
- Убедись, что Hostinger не блокирует FTP доступ
- Попробуй ручной деплой через FileZilla для проверки

### SSH не работает
- SSH на Hostinger доступен только на премиум планах
- Нужно сгенерировать SSH ключ и добавить в Hostinger
- Используй FTP метод - он проще и надежнее

---

## 📊 Мониторинг деплоя

После каждого push в main:
1. Открой **Actions** на GitHub
2. Увидишь статус деплоя в реальном времени
3. Зеленая галочка ✅ = успешно
4. Красный крестик ❌ = ошибка (смотри логи)

---

## 🎉 Готово!

Теперь каждый push в `main` автоматически деплоит сайт на Hostinger!

**Время деплоя:** ~2-5 минут
**Сайт:** https://dispatch4you.com
