# 🎯 Git Webhook Deploy (ПРОСТОЙ СПОСОБ!)

Это самый простой способ настроить Git деплой на Hostinger без SSH ключей!

---

## ⚡ Быстрая настройка (5 минут)

### 1️⃣ Подключись к Hostinger по SSH

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

Замени `u123456789` на свой username.

**Где взять данные:** Hostinger hPanel → Advanced → SSH Access

---

### 2️⃣ Клонируй репозиторий на сервер

```bash
cd ~/public_html
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

**Важно:** Точка в конце!

Если папка не пустая, сначала очисти:
```bash
cd ~/public_html
rm -rf * .*
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

---

### 3️⃣ Настрой Git

```bash
cd ~/public_html
git config pull.rebase false
git config user.email "your@email.com"
git config user.name "Your Name"
```

---

### 4️⃣ Загрузи webhook файл

Файл `deploy-webhook.php` уже создан в проекте.

**Отредактируй его:**
1. Открой `deploy-webhook.php`
2. Измени строку 15:
   ```php
   define('WEBHOOK_SECRET', 'придумай_сложный_пароль_123');
   ```
3. Измени строку 18:
   ```php
   define('REPO_PATH', '/home/u123456789/public_html');
   ```
   Замени `u123456789` на свой username.

**Загрузи на сервер:**
```bash
git add deploy-webhook.php
git commit -m "Add webhook"
git push
```

Затем на сервере:
```bash
cd ~/public_html
git pull
```

---

### 5️⃣ Настрой GitHub Webhook

Перейди: `github.com/Alex305cebo/dispatch4you-site/settings/hooks`

Нажми **"Add webhook"**

Заполни:
```
Payload URL: https://dispatch4you.com/deploy-webhook.php
Content type: application/json
Secret: тот_же_пароль_что_в_webhook_php
Events: Just the push event
Active: ✅
```

Нажми **"Add webhook"**

---

### 6️⃣ Протестируй!

```bash
git add .
git commit -m "Test webhook deploy"
git push
```

Проверь:
1. GitHub → Settings → Webhooks → Recent Deliveries (должна быть зеленая галочка)
2. Сайт: https://dispatch4you.com (обновится мгновенно!)

---

## 📊 Проверка логов

На сервере:
```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
cat ~/public_html/deploy.log
```

---

## 🔧 Устранение проблем

### Webhook возвращает 403
- Проверь, что Secret в GitHub совпадает с WEBHOOK_SECRET в PHP

### Git pull не работает
```bash
cd ~/public_html
git status
git pull origin main
```

### Permission denied
```bash
chmod 755 ~/public_html
chmod 644 ~/public_html/deploy-webhook.php
```

---

## ✅ Преимущества этого метода

- ✅ Не нужны SSH ключи в GitHub
- ✅ Мгновенный деплой (секунды, не минуты)
- ✅ Логи деплоя на сервере
- ✅ Простая настройка
- ✅ Работает на любом Hostinger плане

---

## 🎉 Готово!

Теперь каждый push автоматически обновляет сайт через Git!
