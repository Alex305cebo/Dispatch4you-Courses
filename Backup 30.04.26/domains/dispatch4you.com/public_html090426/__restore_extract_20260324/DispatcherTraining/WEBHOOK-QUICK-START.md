# ⚡ Webhook - Быстрый старт

## 🎯 Команды для копирования

### 1. SSH на Hostinger
```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

### 2. Создай Git папку
```bash
mkdir ~/git-repo
cd ~/git-repo
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
git config pull.rebase false
```

### 3. Отредактируй webhook
```bash
nano ~/git-repo/deploy-webhook.php
```

Измени:
- Строка 16: `WEBHOOK_SECRET` - придумай пароль
- Строка 19-20: замени `u123456789` на свой username

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4. Скопируй webhook в public_html
```bash
cp ~/git-repo/deploy-webhook.php ~/public_html/
chmod 644 ~/public_html/deploy-webhook.php
```

### 5. Первая синхронизация (вручную)
```bash
rsync -av --delete \
  --exclude=".git" \
  --exclude="*.md" \
  --exclude="*.py" \
  --exclude="*.ps1" \
  --exclude="deploy-webhook.php" \
  ~/git-repo/ ~/public_html/
```

### 6. GitHub Webhook
```
URL: https://dispatch4you.com/deploy-webhook.php
Secret: твой_пароль_из_строки_16
Events: push
```

### 7. Тест!
```bash
./quick-deploy.ps1 -message "Test"
```

## ✅ Готово!

Полная инструкция: `SAFE-GIT-DEPLOY-SETUP.md`
