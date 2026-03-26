# 🛡️ БЕЗОПАСНАЯ настройка Git деплоя

## ✅ Этот метод НЕ удалит твой сайт!

Git репозиторий будет в отдельной папке `~/git-repo`
Файлы копируются в `~/public_html` автоматически

---

## 📋 Пошаговая инструкция

### Шаг 1: Подключись к Hostinger

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

Замени `u123456789` на свой username.

**Где взять данные:** Hostinger hPanel → Advanced → SSH Access

---

### Шаг 2: Создай отдельную папку для Git

```bash
# Создай папку для Git репозитория
mkdir ~/git-repo
cd ~/git-repo

# Клонируй репозиторий
git clone https://github.com/Alex305cebo/dispatch4you-site.git .

# Настрой Git
git config pull.rebase false
git config user.email "your@email.com"
git config user.name "Your Name"
```

**Важно:** Точка в конце `.` означает клонировать в текущую папку!

---

### Шаг 3: Проверь, что всё работает

```bash
# Проверь содержимое
ls -la ~/git-repo

# Должны быть файлы: index.html, pages/, includes/ и т.д.
```

---

### Шаг 4: Отредактируй deploy-webhook.php

Файл уже в репозитории по адресу `~/git-repo/deploy-webhook.php`

**Открой его и измени 2 строки:**

**Строка 16 - придумай секретный пароль:**
```php
define('WEBHOOK_SECRET', 'my_super_secret_password_12345');
```

**Строка 19-20 - укажи свой username:**
```php
define('GIT_REPO_PATH', '/home/u123456789/git-repo');
define('PUBLIC_HTML_PATH', '/home/u123456789/public_html');
```

Замени `u123456789` на свой username!

---

### Шаг 5: Скопируй webhook в public_html

```bash
cp ~/git-repo/deploy-webhook.php ~/public_html/
chmod 644 ~/public_html/deploy-webhook.php
```

---

### Шаг 6: Первый тест (вручную)

Проверь, что webhook работает:

```bash
cd ~/git-repo
git pull origin main

# Скопируй файлы вручную (первый раз)
rsync -av --delete \
  --exclude=".git" \
  --exclude="node_modules" \
  --exclude=".kiro" \
  --exclude="backup_*" \
  --exclude="*.md" \
  --exclude="*.py" \
  --exclude="*.ps1" \
  --exclude="*.bat" \
  --exclude="deploy-webhook.php" \
  ~/git-repo/ ~/public_html/
```

Проверь сайт: https://dispatch4you.com

---

### Шаг 7: Настрой GitHub Webhook

Открой: `https://github.com/Alex305cebo/dispatch4you-site/settings/hooks`

Нажми **"Add webhook"**

Заполни:
```
Payload URL: https://dispatch4you.com/deploy-webhook.php
Content type: application/json
Secret: тот_же_пароль_из_строки_16_php_файла
```

**Which events:**
- ✅ Just the push event

**Active:**
- ✅ Включено

Нажми **"Add webhook"**

---

### Шаг 8: Финальный тест!

На своем компьютере:

```bash
./quick-deploy.ps1 -message "Test webhook deploy"
```

**Проверь:**
1. GitHub → Settings → Webhooks → Recent Deliveries (зеленая галочка ✅)
2. Сайт: https://dispatch4you.com
3. Лог на сервере: `cat ~/public_html/deploy.log`

---

## 🎯 Как это работает

```
GitHub (push) 
    ↓
Webhook вызывает deploy-webhook.php
    ↓
Git pull в ~/git-repo
    ↓
Rsync копирует файлы в ~/public_html
    ↓
Сайт обновлен! ✅
```

---

## 🛡️ Безопасность

- ✅ Сайт в `~/public_html` не трогается напрямую
- ✅ Git работает в отдельной папке `~/git-repo`
- ✅ Если что-то сломается - сайт останется работать
- ✅ Можно откатить изменения в Git

---

## 🔧 Откат изменений (если нужно)

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
cd ~/git-repo
git reset --hard HEAD~1
# Затем вручную скопируй файлы обратно
```

---

## 🎉 Готово!

Теперь можешь безопасно деплоить через Git!

**Нужна помощь с настройкой?** Спрашивай!
