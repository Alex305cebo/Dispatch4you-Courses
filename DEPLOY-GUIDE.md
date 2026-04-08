# 🚀 Полная инструкция: Новый репозиторий + Автодеплой на Hostinger

## 📋 Что получится в итоге

- Новый GitHub репозиторий
- Автоматический деплой при каждом `git push`
- Сайт обновляется через 1-3 минуты после push
- Безопасное SSH соединение

---

## 🎯 Быстрый старт

### Вариант 1: Автоматический (рекомендуется)

```powershell
.\setup-new-repo-deploy.ps1
```

Скрипт проведет через все шаги интерактивно.

### Вариант 2: Ручная настройка

Следуйте инструкции ниже ⬇️

---

## 📝 ПОШАГОВАЯ ИНСТРУКЦИЯ

### ШАГ 1: Создание репозитория на GitHub

1. Откройте: https://github.com/new
2. Заполните:
   - **Repository name:** `my-new-site` (ваше имя)
   - **Description:** Описание сайта (опционально)
   - **Public** или **Private** (на ваш выбор)
3. ❌ **НЕ добавляйте** README, .gitignore, license
4. Нажмите **"Create repository"**

---

### ШАГ 2: Инициализация Git локально

```powershell
# Если Git еще не инициализирован
git init
git branch -M main
git remote add origin https://github.com/Alex305cebo/my-new-site.git

# Если нужно переключить на новый репозиторий
git remote remove origin
git remote add origin https://github.com/Alex305cebo/my-new-site.git
```

---

### ШАГ 3: Создание GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: 🚀 Deploy to Hostinger

on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - '**.txt'
      - '**.py'
      - '**.ps1'
  workflow_dispatch:

jobs:
  deploy:
    name: 📦 Deploy to Hostinger
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
      
    - name: 🔐 Setup SSH Key
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -p ${{ secrets.SSH_PORT }} -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts 2>/dev/null || true
      
    - name: 🚀 Deploy via SSH Git Pull
      run: |
        ssh -o StrictHostKeyChecking=no -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} << 'ENDSSH'
          echo "📂 Переход в директорию..."
          cd /home/${{ secrets.SSH_USERNAME }}/public_html || exit 1
          
          echo "🔄 Обновление репозитория..."
          git fetch origin main
          git reset --hard origin/main
          
          echo "✅ Деплой завершен!"
          git log -1 --oneline
        ENDSSH
        
    - name: ✅ Deploy Complete
      run: |
        echo "✅ Деплой завершен!"
        echo "🌐 Сайт обновлен"
```

---

### ШАГ 4: Генерация SSH ключа

```powershell
# Создание SSH ключа для деплоя
ssh-keygen -t rsa -b 4096 -f ~/.ssh/hostinger_deploy -N '""' -C "deploy-key"
```

Это создаст два файла:
- `~/.ssh/hostinger_deploy` - приватный ключ (для GitHub)
- `~/.ssh/hostinger_deploy.pub` - публичный ключ (для Hostinger)

---

### ШАГ 5: Добавление публичного ключа на Hostinger

```powershell
# Показать публичный ключ
cat ~/.ssh/hostinger_deploy.pub
```

**На сервере Hostinger:**

```bash
# Подключитесь через SSH
ssh -p 65002 u123456789@srv123.hostinger.com

# Добавьте ключ
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Вставьте содержимое hostinger_deploy.pub
# Сохраните: Ctrl+O, Enter, Ctrl+X

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
exit
```

---

### ШАГ 6: Клонирование репозитория на Hostinger

```bash
# Подключитесь к Hostinger
ssh -p 65002 u123456789@srv123.hostinger.com

# Перейдите в public_html
cd ~/public_html

# ВНИМАНИЕ: Следующая команда удалит все файлы!
# Сделайте бэкап если нужно!
rm -rf * .??*

# Клонируйте репозиторий
git clone https://github.com/Alex305cebo/my-new-site.git .

# Настройте Git
git config --global --add safe.directory /home/u123456789/public_html

exit
```

---

### ШАГ 7: Настройка GitHub Secrets

1. Откройте: `https://github.com/Alex305cebo/my-new-site/settings/secrets/actions`
2. Нажмите **"New repository secret"**
3. Добавьте 4 секрета:

#### Секрет #1: SSH_HOST
```
Name: SSH_HOST
Value: srv123.hostinger.com
```

#### Секрет #2: SSH_PORT
```
Name: SSH_PORT
Value: 65002
```

#### Секрет #3: SSH_USERNAME
```
Name: SSH_USERNAME
Value: u123456789
```

#### Секрет #4: SSH_PRIVATE_KEY
```
Name: SSH_PRIVATE_KEY
Value: [содержимое файла ~/.ssh/hostinger_deploy]
```

Для получения приватного ключа:
```powershell
cat ~/.ssh/hostinger_deploy
```

Скопируйте **ВСЁ** включая строки:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

### ШАГ 8: Тестовый деплой

```powershell
# Создайте тестовый файл
echo "Test deploy" > test.txt

# Коммит и push
git add test.txt
git commit -m "Test: Auto-deploy"
git push
```

**Проверка:**
1. GitHub Actions: `https://github.com/Alex305cebo/my-new-site/actions`
2. Сайт: `https://yourdomain.com/test.txt`

Если файл появился на сайте - всё работает! ✅

---

## 🎯 Использование

### Быстрый деплой одной командой

```powershell
.\quick-deploy.ps1

# Или с сообщением
.\quick-deploy.ps1 -message "Добавил новый модуль"
```

### Обычный деплой

```powershell
git add .
git commit -m "Ваше сообщение"
git push
```

Сайт обновится автоматически через 1-3 минуты.

---

## 🔧 Устранение проблем

### Проблема: "Permission denied (publickey)"

**Решение:**
```bash
# На сервере Hostinger проверьте права
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Проверьте содержимое
cat ~/.ssh/authorized_keys
```

### Проблема: "fatal: not a git repository"

**Решение:**
```bash
# На сервере Hostinger
cd ~/public_html
git init
git remote add origin https://github.com/Alex305cebo/my-new-site.git
git fetch
git reset --hard origin/main
```

### Проблема: GitHub Actions не запускается

**Решение:**
1. Проверьте, что все 4 секрета добавлены
2. Проверьте, что файл `.github/workflows/deploy.yml` есть в репозитории
3. Проверьте логи: `https://github.com/Alex305cebo/my-new-site/actions`

---

## 📚 Полезные команды

```powershell
# Проверить статус Git
git status

# Проверить remote
git remote -v

# Проверить последние коммиты
git log --oneline -5

# Тестовое SSH подключение
ssh -p 65002 u123456789@srv123.hostinger.com "cd ~/public_html && pwd && git status"
```

---

## ✅ Чеклист настройки

- [ ] Репозиторий создан на GitHub
- [ ] Git инициализирован локально
- [ ] GitHub Actions файл создан
- [ ] SSH ключ сгенерирован
- [ ] Публичный ключ добавлен на Hostinger
- [ ] Репозиторий клонирован в public_html
- [ ] 4 секрета добавлены в GitHub
- [ ] Тестовый деплой выполнен успешно
- [ ] Файл появился на сайте

---

## 🎉 Готово!

Теперь при каждом `git push` ваш сайт будет автоматически обновляться!

**Быстрый деплой:** `.\quick-deploy.ps1`

