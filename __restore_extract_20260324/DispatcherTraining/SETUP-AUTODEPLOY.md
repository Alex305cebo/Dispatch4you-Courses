# 🚀 НАСТРОЙКА АВТОДЕПЛОЯ НА HOSTINGER ЧЕРЕЗ GIT

## 📊 ПРОБЛЕМА

Автодеплой НЕ работает:
- Файлы коммитятся в GitHub ✅
- Файлы НЕ попадают на Hostinger ❌
- Сайт показывает старую версию ❌

## ✅ РЕШЕНИЕ

Настроить автодеплой через SSH + Git на Hostinger.

---

## 🔧 ШАГ 1: Получить SSH данные от Hostinger

1. Зайди на https://hpanel.hostinger.com
2. Выбери свой сайт (dispatch4you.com)
3. В левом меню найди "Advanced" → "SSH Access"
4. Скопируй данные:
   ```
   SSH Host: srv123.hostinger.com (или другой)
   SSH Username: u123456789 (твой логин)
   SSH Password: твой_пароль
   SSH Port: 65002 (обычно 65002 или 22)
   ```

---

## 🔧 ШАГ 2: Настроить Git на сервере Hostinger

### 2.1 Подключись к серверу через SSH

Открой терминал (или PuTTY на Windows) и выполни:

```bash
ssh -p 65002 u123456789@srv123.hostinger.com
```

Введи пароль когда попросит.

### 2.2 Перейди в папку сайта

```bash
cd ~/public_html
```

### 2.3 Инициализируй Git (если ещё не сделано)

```bash
git init
```

### 2.4 Добавь remote репозиторий

```bash
git remote add origin https://github.com/Alex305cebo/Dispatch4you-Courses.git
```

### 2.5 Сделай первый pull

```bash
git pull origin main
```

Если попросит, введи:
- Username: Alex305cebo
- Password: твой GitHub Personal Access Token

### 2.6 Настрой Git credentials (чтобы не вводить каждый раз)

```bash
git config credential.helper store
```

---

## 🔧 ШАГ 3: Создать GitHub Personal Access Token

Если у тебя ещё нет токена:

1. Открой GitHub: https://github.com/settings/tokens
2. Нажми "Generate new token" → "Generate new token (classic)"
3. Дай имя: "Hostinger Deploy"
4. Выбери срок: "No expiration"
5. Выбери права: `repo` (полный доступ к репозиториям)
6. Нажми "Generate token"
7. **СКОПИРУЙ ТОКЕН** (он больше не покажется!)

---

## 🔧 ШАГ 4: Добавить секреты в GitHub

1. Открой репозиторий на GitHub:
   ```
   https://github.com/Alex305cebo/Dispatch4you-Courses/settings/secrets/actions
   ```

2. Нажми "New repository secret"

3. Добавь 4 секрета:

### Секрет 1: SSH_HOST
```
Name: SSH_HOST
Value: srv123.hostinger.com
```
(твой SSH сервер от Hostinger)

### Секрет 2: SSH_USERNAME
```
Name: SSH_USERNAME
Value: u123456789
```
(твой SSH логин от Hostinger)

### Секрет 3: SSH_PASSWORD
```
Name: SSH_PASSWORD
Value: твой_пароль
```
(твой SSH пароль от Hostinger)

### Секрет 4: SSH_PORT
```
Name: SSH_PORT
Value: 65002
```
(обычно 65002, проверь в Hostinger)

---

## 🔧 ШАГ 5: Проверить workflow файл

Файл `.github/workflows/deploy-hostinger.yml` уже создан.

Он будет:
1. Запускаться при каждом push в main
2. Подключаться к Hostinger через SSH
3. Выполнять `git pull origin main` в папке public_html
4. Обновлять все файлы на сервере

---

## 🔧 ШАГ 6: Закоммитить и проверить

```bash
git add .github/workflows/deploy-hostinger.yml
git commit -m "Setup: Autodeploy via SSH + Git"
git push origin main
```

Проверь GitHub Actions:
```
https://github.com/Alex305cebo/Dispatch4you-Courses/actions
```

Должен запуститься workflow "Deploy to Hostinger via SSH"

---

## 🔍 ПРОВЕРКА ПОСЛЕ НАСТРОЙКИ

### 1. Проверь GitHub Actions
```
https://github.com/Alex305cebo/Dispatch4you-Courses/actions
```

Должен быть зелёный статус ✅

### 2. Проверь файл на сервере
```
https://dispatch4you.com/test-no-cache.html
```

Должна открыться страница (не 404)

### 3. Проверь CSS
```
https://dispatch4you.com/shared-nav.css?v=5.0.1774296668
```

Первая строка должна быть:
```css
/* NAVBAR — shared-nav.css v5.0 UNIFIED DESIGN */
```

### 4. Проверь кнопки
Открой любую страницу:
```
https://dispatch4you.com/pages/glossary.html
```

Кнопки должны быть компактными (7px 14px)

---

## ⚠️ ЕСЛИ АВТОДЕПЛОЙ НЕ РАБОТАЕТ

### Проблема 1: Git не настроен на сервере
```
Error: git: command not found
```

**Решение:**
Подключись к серверу и выполни:
```bash
cd ~/public_html
git init
git remote add origin https://github.com/Alex305cebo/Dispatch4you-Courses.git
git pull origin main
```

### Проблема 2: Ошибка аутентификации SSH
```
Error: Permission denied
```

**Решение:**
- Проверь SSH_USERNAME и SSH_PASSWORD
- Проверь SSH_PORT (обычно 65002)
- Попробуй подключиться вручную через терминал

### Проблема 3: Git credentials не сохранены
```
Error: Authentication failed
```

**Решение:**
Подключись к серверу и выполни:
```bash
cd ~/public_html
git config credential.helper store
git pull origin main
```
Введи GitHub username и Personal Access Token

### Проблема 4: Конфликты в Git
```
Error: Your local changes would be overwritten
```

**Решение:**
Подключись к серверу и выполни:
```bash
cd ~/public_html
git reset --hard origin/main
git pull origin main
```

---

## 🎯 БЫСТРАЯ НАСТРОЙКА (Команды по порядку)

### На сервере Hostinger (через SSH):

```bash
# 1. Подключись к серверу
ssh -p 65002 u123456789@srv123.hostinger.com

# 2. Перейди в папку сайта
cd ~/public_html

# 3. Инициализируй Git
git init

# 4. Добавь remote
git remote add origin https://github.com/Alex305cebo/Dispatch4you-Courses.git

# 5. Настрой credentials
git config credential.helper store

# 6. Сделай первый pull
git pull origin main
# Введи: username = Alex305cebo, password = твой_GitHub_token

# 7. Проверь что файлы загрузились
ls -la
```

### В GitHub (добавь секреты):

```
SSH_HOST = srv123.hostinger.com
SSH_USERNAME = u123456789
SSH_PASSWORD = твой_пароль
SSH_PORT = 65002
```

### В локальном репозитории:

```bash
git add .github/workflows/deploy-hostinger.yml
git commit -m "Setup: Autodeploy via SSH"
git push origin main
```

---

## 📊 СТАТУС

```
✅ Workflow файл создан: .github/workflows/deploy-hostinger.yml
⏳ Git на сервере: Нужно настроить вручную
⏳ Секреты в GitHub: Нужно добавить вручную
⏳ Автодеплой: Будет работать после настройки
```

---

## 🎉 ПОСЛЕ НАСТРОЙКИ

После успешной настройки автодеплоя:

1. Любой коммит в main → автоматически `git pull` на Hostinger
2. Не нужно загружать файлы вручную
3. Изменения появляются на сайте через 30-60 секунд
4. Можно проверить статус в GitHub Actions

---

## 📞 ПОМОЩЬ

Если что-то не получается:
1. Проверь что SSH доступ включён в Hostinger
2. Проверь что Git установлен на сервере (`git --version`)
3. Проверь что репозиторий правильно настроен (`git remote -v`)
4. Проверь логи GitHub Actions для деталей ошибки

---

**Дата**: 2026-03-23  
**Автор**: Kiro AI Assistant  
**Метод**: SSH + Git (без FTP)  
**Статус**: Ожидает настройки на сервере
