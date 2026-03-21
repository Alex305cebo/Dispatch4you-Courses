# 🔧 Изменение репозитория в Hostinger

## Текущая проблема:

Hostinger использует: `https://github.com/Alex305cebo/dispatch4you-site.git`  
Нужно изменить на: `https://github.com/Alex305cebo/Dispatch4you-Courses.git`

---

## 📋 Пошаговая инструкция:

### Шаг 1: Удалить старый репозиторий

1. Открыть Hostinger панель: https://hpanel.hostinger.com
2. Перейти в раздел **Git**
3. Найти репозиторий `dispatch4you-site.git`
4. Нажать кнопку **удаления** (корзина) справа
5. Подтвердить удаление

### Шаг 2: Добавить новый репозиторий

1. Нажать кнопку **"Create"** (вверху справа)
2. Заполнить форму:

```
Repository URL: https://github.com/Alex305cebo/Dispatch4you-Courses.git
Branch: main
Install Path: / (корень сайта)
```

3. Нажать **"Add repository"**

### Шаг 3: Настроить Auto Deployment

1. Найти новый репозиторий в списке
2. Включить **"Auto Deployment"**
3. Теперь при каждом push будет автоматический деплой

### Шаг 4: Первый деплой

1. Нажать кнопку **"Deploy"**
2. Подождать 2-3 минуты
3. Проверить статус: **"View latest build output"**

---

## ✅ После настройки:

### Деплой будет работать так:

```bash
# 1. Делаешь изменения
git add .
git commit -m "Update"

# 2. Пушишь в GitHub
git push origin main

# 3. Hostinger автоматически деплоит (если включен Auto Deployment)
# Или нажимаешь "Deploy" вручную в панели
```

### Проверка:

1. GitHub Actions: https://github.com/Alex305cebo/Dispatch4you-Courses/actions
2. Hostinger панель: Git → Manage Repositories
3. Сайт: https://dispatch4you.com

---

## 🎯 Преимущества нового репозитория:

- ✅ Все изменения в одном месте
- ✅ GitHub Actions работает отлично
- ✅ Не нужно пушить в два репозитория
- ✅ Проще управлять версиями

---

## 📝 Важно!

После изменения репозитория старый `dispatch4you-site.git` можно:
- Оставить как архив
- Или удалить (если не нужен)

Все новые изменения делать только в `Dispatch4you-Courses`!

---

**Создано:** 2026-03-20, 23:40  
**Статус:** Ожидается изменение в Hostinger панели
