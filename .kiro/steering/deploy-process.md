---
title: Стандартный процесс деплоя
inclusion: manual
tags: deploy, git, github, hostinger, production
---

# 🚀 СТАНДАРТНЫЙ ПРОЦЕСС ДЕПЛОЯ

Это основной способ деплоя проекта на production через GitHub Actions.

---

## 📋 КОГДА ИСПОЛЬЗОВАТЬ

Когда пользователь говорит:
- "Деплой"
- "Деплой на гит"
- "Задеплой изменения"
- "Загрузи на сервер"
- "Обнови сайт"

**ВСЕГДА используй этот процесс!**

---

## ✅ СТАНДАРТНЫЙ ПРОЦЕСС (5 ШАГОВ)

### Шаг 1: Обновить версию (если нужно)

Если это новая версия, обновить:

1. **package.json**:
```json
{
  "version": "X.X.X-beta"
}
```

2. **menu.tsx** (2 места):
```typescript
// Бейдж версии
<Text style={s.betaText}>BETA X.X</Text>

// Нижняя панель
{[['vX.X','версия'], ...
```

### Шаг 2: Собрать проект

```bash
cd DispatcherTraining/adventure
npm run build:web
```

**Проверить**:
- ✅ Сборка завершена без ошибок
- ✅ Папка `dist/` создана
- ✅ Файл `dist/index.html` существует

### Шаг 3: Добавить все изменения

```bash
cd DispatcherTraining
git add -A
```

### Шаг 4: Создать коммит

```bash
git commit -m "BETA vX.X.X: Краткое описание изменений"
```

**Формат сообщения**:
```
BETA vX.X.X: Основное изменение, второе изменение, третье изменение
```

**Примеры**:
- `BETA v3.3.0: Fix Continue button, improve save system, update version`
- `BETA v3.4.0: Add profile preview, fix mobile layout`
- `BETA v3.5.0: Improve performance, add new features`

### Шаг 5: Запушить в GitHub

```bash
git push origin main
```

**Результат**:
- ✅ Код загружен в GitHub
- ✅ GitHub Actions автоматически запустит деплой
- ✅ Через 5-10 минут изменения будут на сайте

---

## 🔄 ЧТО ПРОИСХОДИТ АВТОМАТИЧЕСКИ

GitHub Actions выполняет:

1. **Получение кода** из репозитория
2. **Сборка проекта** (`npm run build:web`)
3. **Загрузка на Hostinger** через FTP/SSH
4. **Распаковка файлов** в `public_html/adventure/dist/`
5. **Очистка кеша** Hostinger

**Время**: ~5-10 минут

---

## 📊 ПРОВЕРКА СТАТУСА ДЕПЛОЯ

### Вариант 1: GitHub Actions (РЕКОМЕНДУЕТСЯ)

```
URL: https://github.com/Alex305cebo/Dispatch4you-Courses/actions
```

**Статусы**:
- 🟡 **Жёлтый** = В процессе
- ✅ **Зелёный** = Успешно
- ❌ **Красный** = Ошибка

### Вариант 2: Проверить сайт

```
URL: https://dispatch4you.com/game
```

**Проверить**:
- Версия в меню обновилась
- Новые функции работают
- Консоль без ошибок (F12)

---

## 📝 СОЗДАНИЕ ДОКУМЕНТАЦИИ

После каждого деплоя создавать:

### 1. CHANGELOG
```
Файл: adventure/CHANGELOG_vX.X.md
Содержание: Полный список изменений
```

### 2. DEPLOY_STATUS
```
Файл: DEPLOY_STATUS_vX.X.md
Содержание: Статус деплоя, что проверить
```

### 3. Краткая сводка (опционально)
```
Файл: DEPLOY_vX.X_SUMMARY.md
Содержание: Быстрая инструкция
```

---

## 🎯 ЧЕКЛИСТ ПОСЛЕ ДЕПЛОЯ

```
БАЗОВАЯ ПРОВЕРКА:
[ ] Открыть: https://dispatch4you.com/game
[ ] Игра загружается без ошибок
[ ] Версия обновилась
[ ] Консоль без ошибок (F12)

ФУНКЦИОНАЛЬНОСТЬ:
[ ] Новые функции работают
[ ] Старые функции не сломались
[ ] Сохранения работают
[ ] Мобильная версия работает

ДОКУМЕНТАЦИЯ:
[ ] CHANGELOG создан
[ ] DEPLOY_STATUS создан
[ ] Команда уведомлена
```

---

## 🐛 ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК

### Проблема 1: Ошибка при сборке

```bash
# Проверить ошибки
npm run build:web

# Исправить ошибки в коде
# Повторить сборку
```

### Проблема 2: GitHub Actions упал

```
1. Открыть: https://github.com/.../actions
2. Кликнуть на failed workflow
3. Посмотреть логи
4. Исправить проблему
5. Запушить снова: git push origin main
```

### Проблема 3: Сайт не обновился

```
1. Подождать 10-15 минут
2. Очистить кеш браузера (Ctrl+Shift+Delete)
3. Открыть в режиме инкогнито
4. Проверить статус в GitHub Actions
```

### Проблема 4: Критическая ошибка на сайте

**Откат к предыдущей версии**:

```
1. Зайти в Hostinger File Manager
2. Перейти: public_html/adventure/
3. Удалить: dist/
4. Переименовать: dist.backup.YYYYMMDD → dist
5. Website → Clear Cache
6. Проверить: https://dispatch4you.com/game
```

---

## 💡 ВАЖНЫЕ ПРАВИЛА

### 1. Всегда собирать проект локально

```bash
npm run build:web
```

Проверить что сборка проходит БЕЗ ошибок перед пушем.

### 2. Всегда обновлять версию

При новом релизе обновить:
- `package.json`
- `menu.tsx` (2 места)

### 3. Всегда создавать CHANGELOG

Документировать все изменения в `CHANGELOG_vX.X.md`.

### 4. Всегда проверять после деплоя

Не считать деплой завершённым пока не проверено:
- ✅ Игра загружается
- ✅ Версия обновилась
- ✅ Новые функции работают
- ✅ Консоль без ошибок

### 5. Всегда иметь бэкап

GitHub Actions автоматически создаёт бэкап, но можно создать вручную:
```
dist → dist.backup.YYYYMMDD
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ

### Проверить статус git

```bash
git status
```

### Посмотреть последние коммиты

```bash
git log --oneline -5
```

### Отменить последний коммит (если не запушен)

```bash
git reset --soft HEAD~1
```

### Посмотреть изменения

```bash
git diff
```

### Создать новую ветку (для экспериментов)

```bash
git checkout -b feature/new-feature
```

---

## 🎯 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Пример 1: Простой деплой

```
Пользователь: "Деплой"

Действия:
1. cd DispatcherTraining/adventure
2. npm run build:web
3. cd ..
4. git add -A
5. git commit -m "Update: Latest changes"
6. git push origin main
7. Создать DEPLOY_STATUS.md
8. Сообщить пользователю о статусе
```

### Пример 2: Деплой новой версии

```
Пользователь: "Деплой версии 3.4"

Действия:
1. Обновить package.json → "3.4.0-beta"
2. Обновить menu.tsx → "BETA 3.4" и "v3.4"
3. cd DispatcherTraining/adventure
4. npm run build:web
5. cd ..
6. git add -A
7. git commit -m "BETA v3.4.0: New features and improvements"
8. git push origin main
9. Создать CHANGELOG_v3.4.md
10. Создать DEPLOY_STATUS_v3.4.md
11. Сообщить пользователю о статусе
```

### Пример 3: Быстрый фикс

```
Пользователь: "Исправил баг, деплой"

Действия:
1. cd DispatcherTraining/adventure
2. npm run build:web
3. cd ..
4. git add -A
5. git commit -m "Fix: Critical bug in Continue button"
6. git push origin main
7. Создать краткий DEPLOY_STATUS.md
8. Сообщить пользователю
```

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- **GitHub Repo**: https://github.com/Alex305cebo/Dispatch4you-Courses
- **GitHub Actions**: https://github.com/Alex305cebo/Dispatch4you-Courses/actions
- **Production Site**: https://dispatch4you.com/game
- **Hostinger Panel**: https://hpanel.hostinger.com

---

## ✅ ИТОГОВЫЙ ЧЕКЛИСТ

```
ПЕРЕД ДЕПЛОЕМ:
[ ] Код протестирован локально
[ ] Версия обновлена (если нужно)
[ ] npm run build:web выполнен успешно
[ ] Нет ошибок в консоли

ДЕПЛОЙ:
[ ] git add -A
[ ] git commit -m "..."
[ ] git push origin main
[ ] GitHub Actions запущен

ПОСЛЕ ДЕПЛОЯ:
[ ] Проверен статус в GitHub Actions
[ ] Сайт проверен: https://dispatch4you.com/game
[ ] Версия обновилась
[ ] Функции работают
[ ] CHANGELOG создан
[ ] Команда уведомлена
```

---

**Версия документа**: 1.0  
**Дата**: 2 мая 2026  
**Статус**: ✅ Активный процесс

🚀 **Это стандартный способ деплоя. Всегда используй его!**

