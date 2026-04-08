# Инструкция по деплою на Hostinger через Git

## Шаг 1: Настройка Git репозитория на Hostinger

1. Войдите в **hPanel** Hostinger
2. Перейдите в раздел **Git** (в разделе Advanced)
3. Нажмите **Create Repository**
4. Заполните форму:
   - **Repository Name**: dispatch4you
   - **Branch to deploy**: main
   - **Repository Path**: `/home/u123456789/domains/dispatch4you.com/public_html`
   - Отметьте **Auto Deploy** (автоматическое обновление при push)

5. Скопируйте **Git Remote URL** (будет выглядеть примерно так):
   ```
   ssh://u123456789@123.456.789.0:65002/home/u123456789/repositories/dispatch4you
   ```

## Шаг 2: Инициализация локального Git репозитория

Выполните команды в корне проекта:

```bash
# Инициализация Git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit - dispatch4you.com"

# Добавление remote (замените URL на ваш из Hostinger)
git remote add hostinger ssh://u123456789@123.456.789.0:65002/home/u123456789/repositories/dispatch4you

# Отправка на Hostinger
git push -u hostinger main
```

## Шаг 3: Настройка SSH ключа (если требуется)

Если Hostinger запрашивает SSH ключ:

```bash
# Генерация SSH ключа
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Копирование публичного ключа
cat ~/.ssh/id_rsa.pub
```

Затем добавьте ключ в hPanel → SSH Keys

## Шаг 4: Обновление сайта (после настройки)

Теперь для обновления сайта просто используйте:

```bash
git add .
git commit -m "Описание изменений"
git push hostinger main
```

Hostinger автоматически обновит файлы на сервере!

## Важные файлы

- `.gitignore` - файлы, которые не попадут в Git
- `.htaccess` - конфигурация Apache (если нужна)
- `config.js` - конфигурация приложения

## Проверка деплоя

После push проверьте:
1. В hPanel → Git → Repository Status должен показать последний коммит
2. Откройте https://dispatch4you.com/ и проверьте изменения

## Откат изменений (если что-то пошло не так)

```bash
# Откат к предыдущему коммиту
git revert HEAD
git push hostinger main
```
