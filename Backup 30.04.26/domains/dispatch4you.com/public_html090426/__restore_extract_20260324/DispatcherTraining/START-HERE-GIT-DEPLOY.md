# 🚀 НАЧНИ ЗДЕСЬ: Git Деплой

## ⚡ Что выбрать?

### 🎯 Webhook (РЕКОМЕНДУЮ!) - 5 минут

**Самый простой способ!**

1. SSH на Hostinger
2. `git clone` репозиторий
3. Отредактируй `deploy-webhook.php`
4. Настрой GitHub Webhook
5. Готово!

👉 **Инструкция:** `GIT-WEBHOOK-SETUP.md`

---

### 🔐 SSH Actions - 10 минут

**Через GitHub Actions**

1. SSH на Hostinger
2. `git clone` репозиторий
3. Создай SSH ключ
4. Добавь в GitHub Secrets
5. Готово!

👉 **Инструкция:** `GIT-DEPLOY-SETUP.md`

---

## 📋 Быстрый старт (Webhook)

### 1. Подключись к Hostinger

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

### 2. Клонируй репо

```bash
cd ~/public_html
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
git config pull.rebase false
```

### 3. Отредактируй webhook

Открой `deploy-webhook.php`, измени:

```php
// Строка 15
define('WEBHOOK_SECRET', 'придумай_сложный_пароль');

// Строка 18
define('REPO_PATH', '/home/u123456789/public_html');
```

### 4. Настрой GitHub Webhook

`GitHub → Settings → Webhooks → Add webhook`

```
URL: https://dispatch4you.com/deploy-webhook.php
Secret: тот_же_пароль_из_php
Events: push
```

### 5. Тест!

```bash
git add .
git commit -m "Test"
git push
```

Проверь: `GitHub → Settings → Webhooks → Recent Deliveries`

---

## 🎉 Готово!

Теперь каждый push мгновенно обновляет сайт!

**Нужна помощь?** Читай полные инструкции:
- `GIT-WEBHOOK-SETUP.md` - webhook метод
- `GIT-DEPLOY-SETUP.md` - SSH метод
- `QUICK-GIT-SETUP.md` - сравнение методов
