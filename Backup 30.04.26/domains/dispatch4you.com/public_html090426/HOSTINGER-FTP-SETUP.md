# Как получить FTP данные от Hostinger

## Шаг 1: Войдите в панель Hostinger

1. Перейдите на https://hpanel.hostinger.com/
2. Войдите в свой аккаунт

## Шаг 2: Найдите FTP данные

### Вариант A: Через File Manager

1. В панели управления найдите раздел **"Files"** или **"Файлы"**
2. Нажмите **"FTP Accounts"** или **"FTP аккаунты"**
3. Вы увидите список FTP аккаунтов

### Вариант B: Через Website Settings

1. Выберите ваш сайт (dispatch4you.com)
2. Перейдите в **"Advanced"** → **"FTP Accounts"**

## Шаг 3: Запишите данные

Вам нужны 3 параметра:

### 1. FTP_SERVER (Hostname)
Обычно выглядит как:
- `ftp.dispatch4you.com` или
- `ftp.yourdomain.com` или
- `123.456.789.012` (IP адрес)

### 2. FTP_USERNAME
Обычно выглядит как:
- `u123456789` или
- `username@dispatch4you.com`

### 3. FTP_PASSWORD
- Если забыли пароль, можно создать новый FTP аккаунт или сбросить пароль

## Шаг 4: Добавьте секреты в GitHub

1. Откройте: https://github.com/Alex305cebo/dispatch4you-site/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. Добавьте 3 секрета:

**Секрет 1:**
- Name: `FTP_SERVER`
- Secret: [ваш FTP hostname]

**Секрет 2:**
- Name: `FTP_USERNAME`
- Secret: [ваш FTP username]

**Секрет 3:**
- Name: `FTP_PASSWORD`
- Secret: [ваш FTP password]

## Шаг 5: Проверьте путь к папке

По умолчанию файлы загружаются в `/public_html/`

Если ваш сайт в другой папке, измените в `.github/workflows/deploy.yml`:
```yaml
server-dir: /public_html/subdomain/  # для поддомена
```

## Шаг 6: Включите автодеплой

После добавления секретов, раскомментируйте в `.github/workflows/deploy.yml`:

```yaml
on:
  workflow_dispatch:
  push:              # Раскомментируйте эти 3 строки
    branches:        #
      - main         #
```

## Шаг 7: Тестирование

### Ручной запуск (для теста):
1. Перейдите: https://github.com/Alex305cebo/dispatch4you-site/actions
2. Выберите "Deploy to Hostinger"
3. Нажмите "Run workflow"
4. Проверьте логи

### Автоматический деплой:
После включения автодеплоя, каждый `git push` будет автоматически загружать файлы на Hostinger.

## Устранение проблем

### Ошибка: "Connection refused"
- Проверьте FTP_SERVER (hostname)
- Убедитесь, что FTP доступ включен в Hostinger

### Ошибка: "Authentication failed"
- Проверьте FTP_USERNAME и FTP_PASSWORD
- Попробуйте создать новый FTP аккаунт

### Ошибка: "Permission denied"
- Проверьте права доступа к папке
- Убедитесь, что путь `server-dir` правильный

### Файлы не обновляются на сайте
- Очистите кеш браузера (Ctrl+F5)
- Проверьте, что файлы загрузились в правильную папку
- Проверьте логи в GitHub Actions

## Альтернатива: SFTP (более безопасно)

Если у вас есть SSH доступ, можно использовать SFTP вместо FTP:

1. Измените в `deploy.yml`:
```yaml
- name: Deploy to Hostinger via SFTP
  uses: wlixcc/SFTP-Deploy-Action@v1.2.4
  with:
    server: ${{ secrets.SFTP_SERVER }}
    username: ${{ secrets.SFTP_USERNAME }}
    password: ${{ secrets.SFTP_PASSWORD }}
    port: 22
    local_path: './*'
    remote_path: '/public_html/'
```

2. Добавьте SFTP секреты в GitHub

## Нужна помощь?

Если возникли проблемы:
1. Проверьте логи в GitHub Actions
2. Свяжитесь с поддержкой Hostinger для получения FTP данных
3. Проверьте файл DEPLOY-SETUP.md для дополнительной информации
