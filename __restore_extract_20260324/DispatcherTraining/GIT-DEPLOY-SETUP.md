# 🚀 Настройка Git деплоя на Hostinger

## 📋 Что нужно сделать

### Шаг 1: Подключись к Hostinger по SSH

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

Замени `u123456789` на свой username из Hostinger.

**Где взять данные:**
- Hostinger hPanel → Advanced → SSH Access
- Порт обычно: `65002` или `22`

---

### Шаг 2: Клонируй репозиторий на сервер

После подключения по SSH выполни:

```bash
cd ~/public_html
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

**Важно:** Точка в конце `.` означает клонировать в текущую папку!

Если папка не пустая:
```bash
cd ~/public_html
rm -rf * .*  # Удали всё (осторожно!)
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

---

### Шаг 3: Настрой Git на сервере

```bash
cd ~/public_html
git config pull.rebase false
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
```

---

### Шаг 4: Создай SSH ключ для GitHub Actions

На своем компьютере:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/hostinger_deploy
```

Нажми Enter 3 раза (без пароля).

Это создаст 2 файла:
- `~/.ssh/hostinger_deploy` - приватный ключ
- `~/.ssh/hostinger_deploy.pub` - публичный ключ

---

### Шаг 5: Добавь публичный ключ на Hostinger

Скопируй содержимое публичного ключа:

```bash
cat ~/.ssh/hostinger_deploy.pub
```

Подключись к Hostinger по SSH и добавь ключ:

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
mkdir -p ~/.ssh
echo "твой_публичный_ключ" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
exit
```

---

### Шаг 6: Добавь приватный ключ в GitHub Secrets

Скопируй приватный ключ:

```bash
cat ~/.ssh/hostinger_deploy
```

Перейди: `GitHub → Settings → Secrets → Actions → New secret`

Добавь 4 секрета:

| Имя | Значение | Пример |
|-----|----------|--------|
| `SSH_HOST` | FTP хост | `ftp.dispatch4you.com` |
| `SSH_PORT` | SSH порт | `65002` или `22` |
| `SSH_USERNAME` | SSH логин | `u123456789` |
| `SSH_PRIVATE_KEY` | Приватный ключ | `-----BEGIN OPENSSH...` |

---

### Шаг 7: Протестируй деплой

```bash
git add .
git commit -m "Test Git deploy"
git push
```

Открой: `GitHub → Actions`

Должен запуститься workflow "🚀 Deploy via Git SSH"

---

## 🎯 Как это работает

1. Ты пушишь код в GitHub
2. GitHub Actions подключается к Hostinger по SSH
3. На сервере выполняется `git pull origin main`
4. Сайт обновляется автоматически!

---

## 🔧 Устранение проблем

### SSH не подключается

Проверь порт SSH в Hostinger:
```bash
# Попробуй порт 65002
ssh -p 65002 u123456789@ftp.dispatch4you.com

# Или порт 22
ssh -p 22 u123456789@ftp.dispatch4you.com
```

### Git pull не работает

На сервере проверь:
```bash
cd ~/public_html
git status
git remote -v
```

Если нужно, переклонируй:
```bash
cd ~
rm -rf public_html/*
cd public_html
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
```

### Permission denied

Проверь права на authorized_keys:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## 📚 Альтернатива: Git Webhook

Если SSH сложно настроить, можно использовать webhook:

1. Создай файл `webhook.php` на сервере
2. Настрой GitHub webhook
3. При push GitHub вызовет webhook → сервер сделает git pull

Нужна помощь с webhook?

---

## ✅ Готово!

После настройки каждый push автоматически обновит сайт через Git!
