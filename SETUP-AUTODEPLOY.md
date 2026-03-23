# 🚀 НАСТРОЙКА АВТОДЕПЛОЯ НА HOSTINGER

## 📊 ПРОБЛЕМА

Автодеплой НЕ работает:
- Файлы коммитятся в GitHub ✅
- Файлы НЕ попадают на Hostinger ❌
- Сайт показывает старую версию ❌

## ✅ РЕШЕНИЕ

Настроить автодеплой через FTP на Hostinger.

---

## 🔧 ШАГ 1: Получить FTP данные от Hostinger

1. Зайди на https://hpanel.hostinger.com
2. Выбери свой сайт (dispatch4you.com)
3. В левом меню найди "FTP Accounts" или "Файлы" → "FTP"
4. Скопируй данные:
   ```
   FTP Server: ftp.dispatch4you.com (или другой)
   FTP Username: u123456789 (твой логин)
   FTP Password: твой_пароль
   ```

---

## 🔧 ШАГ 2: Добавить секреты в GitHub

1. Открой репозиторий на GitHub:
   ```
   https://github.com/Alex305cebo/Dispatch4you-Courses
   ```

2. Перейди в Settings (вверху справа)

3. В левом меню найди "Secrets and variables" → "Actions"

4. Нажми "New repository secret"

5. Добавь 3 секрета:

### Секрет 1: FTP_SERVER
```
Name: FTP_SERVER
Value: ftp.dispatch4you.com
```
(или тот сервер который дал Hostinger)

### Секрет 2: FTP_USERNAME
```
Name: FTP_USERNAME
Value: u123456789
```
(твой FTP логин от Hostinger)

### Секрет 3: FTP_PASSWORD
```
Name: FTP_PASSWORD
Value: твой_пароль
```
(твой FTP пароль от Hostinger)

---

## 🔧 ШАГ 3: Проверить workflow файл

Файл `.github/workflows/deploy-hostinger.yml` уже создан.

Он будет:
1. Запускаться при каждом push в main
2. Подключаться к Hostinger через FTP
3. Загружать все файлы в папку public_html
4. Исключать ненужные файлы (.git, node_modules, backup)

---

## 🔧 ШАГ 4: Закоммитить и проверить

После добавления секретов:

1. Закоммить workflow файл:
```bash
git add .github/workflows/deploy-hostinger.yml
git commit -m "Setup: Autodeploy to Hostinger via FTP"
git push origin main
```

2. Проверить GitHub Actions:
```
https://github.com/Alex305cebo/Dispatch4you-Courses/actions
```

3. Должен запуститься workflow "Deploy to Hostinger"

4. Если всё успешно - увидишь зелёную галочку ✅

5. Файлы автоматически загрузятся на Hostinger

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

### Проблема 1: Ошибка аутентификации
```
Error: Login authentication failed
```

**Решение:**
- Проверь FTP_USERNAME и FTP_PASSWORD
- Убедись что FTP аккаунт активен в Hostinger
- Попробуй подключиться через FileZilla с теми же данными

### Проблема 2: Неправильный путь
```
Error: Cannot change directory
```

**Решение:**
- Проверь что путь `server-dir: /public_html/` правильный
- В Hostinger может быть другой путь (например `/domains/dispatch4you.com/public_html/`)

### Проблема 3: Workflow не запускается
```
No workflows found
```

**Решение:**
- Проверь что файл `.github/workflows/deploy-hostinger.yml` закоммичен
- Проверь что секреты добавлены в GitHub

---

## 🎯 АЛЬТЕРНАТИВА: Ручная загрузка

Если автодеплой не настраивается, можно загрузить файлы вручную:

### Через File Manager Hostinger:
1. Зайди на https://hpanel.hostinger.com
2. Открой File Manager
3. Перейди в `public_html`
4. Загрузи файлы:
   - `shared-nav.css`
   - `nav-loader.js`
   - `test-no-cache.html`

### Через FTP (FileZilla):
1. Скачай FileZilla: https://filezilla-project.org
2. Подключись к серверу:
   ```
   Host: ftp.dispatch4you.com
   Username: u123456789
   Password: твой_пароль
   Port: 21
   ```
3. Перейди в `public_html`
4. Перетащи файлы из локальной папки

---

## 📊 СТАТУС

```
✅ Workflow файл создан: .github/workflows/deploy-hostinger.yml
⏳ Секреты в GitHub: Нужно добавить вручную
⏳ Автодеплой: Будет работать после добавления секретов
```

---

## 🎉 ПОСЛЕ НАСТРОЙКИ

После успешной настройки автодеплоя:

1. Любой коммит в main → автоматически загружается на Hostinger
2. Не нужно загружать файлы вручную
3. Изменения появляются на сайте через 1-2 минуты
4. Можно проверить статус в GitHub Actions

---

**Дата**: 2026-03-23  
**Автор**: Kiro AI Assistant  
**Статус**: Ожидает настройки секретов в GitHub
