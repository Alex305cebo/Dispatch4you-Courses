# ⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ - Деплой не работает

## 🔴 Проблема
GitHub Actions падает на шаге "Deploy to Hostinger via SSH"

## ✅ РЕШЕНИЕ 1: Проверьте логи (1 минута)

1. На странице GitHub Actions кликните на красный шаг: **"Deploy to Hostinger via SSH"**
2. Посмотрите текст ошибки

**Скорее всего одна из этих ошибок:**

---

## ❌ Ошибка A: "fatal: not a git repository"

### Что это значит:
На сервере Hostinger нет Git репозитория

### Решение (5 минут):

**Вариант 1: Через Hostinger SSH (рекомендуется)**

1. Откройте Hostinger hPanel: https://hpanel.hostinger.com/
2. Advanced → SSH Access
3. Скопируйте команду подключения (например: `ssh u123456@dispatch4you.com -p 65002`)
4. Откройте PowerShell на компьютере
5. Выполните команды:

```bash
# Подключитесь к серверу
ssh u123456@dispatch4you.com -p 65002

# Введите пароль (из Hostinger)

# Перейдите в папку сайта
cd domains/dispatch4you.com/public_html

# Инициализируйте Git
git init
git remote add origin https://github.com/Alex305cebo/Dispatch4you-Courses.git
git fetch origin
git reset --hard origin/main

# Проверьте файлы
ls -la

# Выйдите
exit
```

**Готово!** Теперь сделайте новый push:
```bash
git add .
git commit -m "Test deploy after git init"
git push origin main
```

---

**Вариант 2: Через Hostinger File Manager (если SSH не работает)**

Если SSH не работает, используйте ручную загрузку:
1. Откройте Hostinger File Manager
2. Загрузите файлы вручную (см. MANUAL_UPLOAD_GUIDE.md)

---

## ❌ Ошибка B: "Permission denied (publickey)"

### Что это значит:
SSH ключ неправильный или устарел

### Решение (5 минут):

1. Откройте Hostinger hPanel
2. Advanced → SSH Access
3. Создайте новый SSH ключ или скопируйте существующий
4. Откройте GitHub: https://github.com/Alex305cebo/Dispatch4you-Courses/settings/secrets/actions
5. Обновите секреты:
   - Нажмите на `SSH_PRIVATE_KEY`
   - Update secret
   - Вставьте новый ключ
   - Save

6. Повторите для остальных секретов если нужно:
   - `SSH_HOST`
   - `SSH_USERNAME`
   - `SSH_PORT`

---

## ❌ Ошибка C: "No such file or directory"

### Что это значит:
Неправильный путь к папке

### Решение (3 минуты):

1. Подключитесь по SSH (см. выше)
2. Найдите правильный путь:
```bash
pwd
ls -la
cd domains
ls -la
```

3. Обновите файл `.github/workflows/deploy-hostinger.yml`:
```yaml
script: |
  cd ~/domains/dispatch4you.com/public_html  # Замените на правильный путь
  git pull origin main
```

4. Сделайте commit и push

---

## 🚀 РЕШЕНИЕ 2: Используйте ручную загрузку (пока не починим автодеплой)

Если нет времени разбираться с SSH:

1. Откройте Hostinger hPanel
2. Files → File Manager
3. Загрузите файлы вручную:
   - robots.txt
   - sitemap.xml
   - og-image.png
   - index.html (заменить)
   - about.html (заменить)

**Инструкция:** MANUAL_UPLOAD_GUIDE.md

**Время:** 10-15 минут

---

## 📊 Проверка после исправления

После любого решения проверьте:

1. **GitHub Actions:**
   - https://github.com/Alex305cebo/Dispatch4you-Courses/actions
   - Должна быть зелёная галочка ✅

2. **Файлы на сайте:**
   - https://dispatch4you.com/robots.txt ✅
   - https://dispatch4you.com/sitemap.xml ✅
   - https://dispatch4you.com/og-image.png ✅

---

## 💡 Рекомендация

**Сейчас (срочно):**
Загрузите файлы вручную через File Manager (10 минут)

**Потом (когда будет время):**
Исправьте SSH деплой чтобы работал автоматически

---

## 🎯 Что делать ПРЯМО СЕЙЧАС

### Вариант A: Есть 5 минут - исправить SSH
1. Подключитесь по SSH
2. Выполните `git init` и `git pull`
3. Сделайте новый push
4. Проверьте что деплой работает

### Вариант B: Нет времени - ручная загрузка
1. Откройте File Manager
2. Загрузите 5 файлов
3. Проверьте что они работают
4. Продолжайте с SEO (регистрация в Google)

---

## 📞 Нужна помощь?

**Hostinger Support (24/7):**
- Live Chat в hPanel
- Скажите: "Помогите настроить Git и SSH для автодеплоя с GitHub"

---

**Выберите вариант и действуйте! Файлы нужно загрузить на сервер любым способом.**
