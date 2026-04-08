# ⚡ Быстрая настройка Git деплоя

## 🎯 Выбери метод

### Метод 1: Webhook (РЕКОМЕНДУЕТСЯ) ⭐

**Плюсы:** Просто, быстро, без SSH ключей
**Время:** 5 минут

**Шаги:**
1. SSH на Hostinger → клонируй репо
2. Отредактируй `deploy-webhook.php` (секрет + путь)
3. Настрой GitHub Webhook
4. Готово!

📚 **Инструкция:** `GIT-WEBHOOK-SETUP.md`

---

### Метод 2: SSH Actions

**Плюсы:** Через GitHub Actions, без PHP
**Минусы:** Нужны SSH ключи

**Шаги:**
1. SSH на Hostinger → клонируй репо
2. Создай SSH ключ
3. Добавь ключ в GitHub Secrets
4. Готово!

📚 **Инструкция:** `GIT-DEPLOY-SETUP.md`

---

## 🚀 Команды для начала

### На Hostinger (SSH):
```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
cd ~/public_html
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

### На компьютере:
```bash
./quick-deploy.ps1
```

---

## 📍 Нужные данные

**Hostinger SSH:**
- Host: `ftp.dispatch4you.com`
- Port: `65002` (или `22`)
- Username: `u123456789` (твой)
- Password: из Hostinger hPanel

**GitHub Repo:**
- `https://github.com/Alex305cebo/dispatch4you-site`

---

## ❓ Что выбрать?

**Webhook** - если хочешь быстро и просто
**SSH Actions** - если нужен полный контроль через GitHub

Рекомендую начать с **Webhook**!
