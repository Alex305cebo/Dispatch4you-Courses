# 🚀 Git Деплой настроен!

## ✅ Что готово

1. ✅ GitHub Actions workflow для SSH деплоя
2. ✅ PHP webhook для автоматического git pull
3. ✅ Quick-deploy скрипт
4. ✅ Полная документация

---

## 🎯 НАЧНИ ОТСЮДА

👉 **Открой:** `START-HERE-GIT-DEPLOY.md`

Там выбери метод (Webhook или SSH) и следуй инструкции.

---

## 📚 Все инструкции

| Файл | Описание |
|------|----------|
| `START-HERE-GIT-DEPLOY.md` | 🎯 Начни здесь! Выбор метода |
| `GIT-WEBHOOK-SETUP.md` | ⭐ Webhook метод (рекомендуется) |
| `GIT-DEPLOY-SETUP.md` | 🔐 SSH Actions метод |
| `QUICK-GIT-SETUP.md` | ⚡ Сравнение методов |

---

## 🔥 Быстрый старт (Webhook)

### 1. SSH на Hostinger
```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

### 2. Клонируй репо
```bash
cd ~/public_html
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

### 3. Настрой webhook
- Отредактируй `deploy-webhook.php` (секрет + путь)
- GitHub → Settings → Webhooks → Add webhook
- URL: `https://dispatch4you.com/deploy-webhook.php`

### 4. Готово!
```bash
./quick-deploy.ps1
```

---

## 🎉 Результат

Каждый push в main → сайт обновляется автоматически через Git!

**Время деплоя:** 1-5 секунд (webhook) или 2-5 минут (SSH Actions)
