# Подключение Hostinger к проекту

## ✅ Что уже сделано:
- ✓ Проект подключен к GitHub: https://github.com/Alex305cebo/dispatch4you-site
- ✓ Создан скрипт `deploy-full.ps1` для деплоя на GitHub и Hostinger

## 📋 Что нужно сделать для Hostinger:

### Шаг 1: Настройка Git на Hostinger

1. Зайдите в **hPanel Hostinger**: https://hpanel.hostinger.com/
2. Выберите ваш домен (dispatch4you.com)
3. Найдите раздел **Git** (в меню Advanced)
4. Нажмите **Create Repository**
5. Заполните форму:
   ```
   Repository Name: dispatch4you
   Branch to deploy: main
   Deploy Path: /domains/dispatch4you.com/public_html
   ✓ Enable Auto Deploy
   ```
6. **Скопируйте Git URL** (будет примерно так):
   ```
   ssh://u123456789@IP:PORT/home/u123456789/repositories/dispatch4you
   ```

### Шаг 2: Подключение Hostinger к локальному проекту

Выполните в PowerShell (замените URL на ваш из Шага 1):

```powershell
git remote add hostinger ssh://u123456789@IP:PORT/home/u123456789/repositories/dispatch4you
git push -u hostinger main
```

При первом подключении может потребоваться ввести пароль от Hostinger.

### Шаг 3: Проверка подключения

```powershell
git remote -v
```

Должны увидеть:
```
origin     https://github.com/Alex305cebo/dispatch4you-site.git (fetch)
origin     https://github.com/Alex305cebo/dispatch4you-site.git (push)
hostinger  ssh://u123456789@... (fetch)
hostinger  ssh://u123456789@... (push)
```

## 🚀 Использование после настройки

### Быстрый деплой (на GitHub и Hostinger):
```powershell
.\deploy-full.ps1
```

### Только на GitHub:
```powershell
git add .
git commit -m "Описание изменений"
git push origin main
```

### Только на Hostinger:
```powershell
.\deploy.ps1
```

## 📚 Дополнительная информация

- Полная инструкция: `DEPLOY-HOSTINGER.md`
- Шпаргалка: `ШПАРГАЛКА-ДЕПЛОЙ.txt`

## ❓ Проблемы?

- **Permission denied** → Добавьте SSH ключ в hPanel → SSH Keys
- **Repository not found** → Проверьте правильность Git URL
- **Сайт не обновляется** → Проверьте Auto Deploy в hPanel
