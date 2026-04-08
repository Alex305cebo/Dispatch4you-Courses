# 🚀 Настройка автоматического деплоя

## Что это даёт?
После каждого `git push` файлы автоматически загружаются на ваш хостинг через FTP.

---

## 📋 Инструкция по настройке

### Шаг 1: Получите FTP данные от хостинга

Вам нужны 3 параметра:
1. **FTP Server** (адрес сервера) - например: `ftp.dispatch4you.com` или `dispatch4you.com`
2. **FTP Username** (имя пользователя) - например: `dispatch4you@dispatch4you.com`
3. **FTP Password** (пароль) - ваш FTP пароль

**Где найти:**
- В cPanel → "FTP Accounts" → "Configure FTP Client"
- Или в письме от хостинга при регистрации

---

### Шаг 2: Добавьте секреты в GitHub

1. Откройте ваш репозиторий: https://github.com/Alex305cebo/Dispatch4you-Courses
2. Перейдите в **Settings** (Настройки)
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**
5. Добавьте 3 секрета:

#### Секрет 1: FTP_SERVER
- Name: `FTP_SERVER`
- Secret: `ваш_ftp_сервер` (например: `ftp.dispatch4you.com`)
- Нажмите **Add secret**

#### Секрет 2: FTP_USERNAME
- Name: `FTP_USERNAME`
- Secret: `ваш_ftp_логин` (например: `dispatch4you@dispatch4you.com`)
- Нажмите **Add secret**

#### Секрет 3: FTP_PASSWORD
- Name: `FTP_PASSWORD`
- Secret: `ваш_ftp_пароль`
- Нажмите **Add secret**

---

### Шаг 3: Проверьте путь к папке на сервере

В файле `.github/workflows/deploy.yml` указан путь: `/public_html/`

Если у вас другая папка (например `/www/` или `/httpdocs/`), измените строку:
```yaml
server-dir: /public_html/
```

---

### Шаг 4: Задеплойте изменения

```bash
git add .
git commit -m "Setup auto-deploy via GitHub Actions"
git push
```

После этого:
1. Перейдите на GitHub в раздел **Actions**
2. Вы увидите запущенный процесс деплоя
3. Дождитесь зелёной галочки ✅
4. Файлы автоматически загрузятся на хостинг!

---

## ✅ Готово!

Теперь при каждом `git push` файлы будут автоматически обновляться на сайте!

---

## 🔧 Устранение проблем

### Ошибка: "Failed to connect to FTP"
- Проверьте правильность FTP_SERVER (без `ftp://` в начале)
- Убедитесь, что FTP доступ разрешён в настройках хостинга

### Ошибка: "Authentication failed"
- Проверьте FTP_USERNAME и FTP_PASSWORD
- Попробуйте подключиться через FileZilla с этими данными

### Ошибка: "Directory not found"
- Измените `server-dir` на правильный путь к папке сайта

---

## 📞 Нужна помощь?

Если что-то не работает, пришлите скриншот ошибки из GitHub Actions.
