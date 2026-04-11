---
inclusion: auto
description: Структура проекта Курсы Диспетчера — важные правила и соглашения по файлам и страницам
---

# Проект: Курсы Диспетчера — Важная структура

## КРИТИЧЕСКИ ВАЖНО — не путать:

### 📚 База знаний (pages/documentation.html) = ГЛАВНЫЙ КУРС ОБУЧЕНИЯ (15 страниц)
- Это основной учебный материал
- С него начинают все новые студенты
- Называть: "курс", "база знаний", "15 страниц курса"

**15 страниц курса:**
1. `intro.html` - Введение
2. `glossary.html` - Глоссарий
3. `role.html` - Роль диспетчера
4. `equipment.html` - Оборудование
5. `routes.html` - Маршруты
6. `loadboards.html` - Load Boards
7. `negotiation.html` - Переговоры
8. `brokers.html` - Брокеры
9. `docs.html` - Документы
10. `regulations.html` - Законы
11. `technology.html` - TMS
12. `communication.html` - Коммуникация
13. `problems.html` - Проблемы
14. `finances.html` - Финансы
15. `career.html` - Карьера

### 📝 12 Модулей (pages/modules-index.html) = ТЕСТЫ ЗНАНИЙ
- Это не курс, это проверка знаний после изучения базы
- Называть: "тесты", "проверка знаний", "12 модулей тестов"

**12 модулей тестов:**
1. `doc-module-1-complete.html` - Индустрия
2. `doc-module-2-complete.html` - Термины
3. `doc-module-3-complete.html` - Диспетчер
4. `doc-module-4-complete.html` - Load Boards
5. `doc-module-5-complete.html` - Маршруты
6. `doc-module-6-complete.html` - Оборудование
7. `doc-module-7-complete.html` - Переговоры
8. `doc-module-8-complete.html` - Брокеры
9. `doc-module-9-complete.html` - CSA Scores
10. `doc-module-10-complete.html` - Грузы
11. `doc-module-11-complete.html` - Проблемы
12. `doc-module-12-complete.html` - Карьера

## НИКОГДА не называть 12 модулей "курсом обучения" или "основным курсом"

## Правильная терминология:
- ✅ "15 страниц курса" или "база знаний"
- ✅ "12 модулей тестов" или "проверка знаний"
- ❌ НЕ "15 модулей" (модулей только 12!)
- ❌ НЕ "курс из 12 модулей" (курс — это 15 страниц!)

## ПРАВИЛО: Никакого деплоя без команды

- НИКОГДА не предлагать деплой на GitHub Pages или любой другой хостинг
- НИКОГДА не делать `git push` или любой деплой самостоятельно
- Вместо деплоя — всегда запускать локальный сервер: `python -m http.server 8080` в папке `c:\DispatcherTraining`
- Деплоить ТОЛЬКО когда пользователь явно скажет "деплой" или "задеплой"

## ⛔ КРИТИЧЕСКАЯ ОШИБКА — ДЕПЛОЙ (запомнить навсегда!)

**Сайт dispatch4you.com хостится на Hostinger через SSH.**
**Деплой работает через GitHub Action: `.github/workflows/deploy-hostinger.yml`**

### Правильный деплой:
1. `git add -A`
2. `git commit -m "..."`
3. `git push origin main`
4. GitHub Action автоматически делает SSH deploy на Hostinger

### ⛔ НИКОГДА не делать:
- `git checkout master` — это сломает ветки
- `git merge master` — это создаст конфликты
- `git push origin main:master` — это неправильная ветка
- Любые манипуляции с веткой `master`

### Только одна ветка для деплоя: `main`
### Workflow файл: `.github/workflows/deploy-hostinger.yml`
### Если workflow отключён (.disabled) — НЕ включать без разрешения пользователя!
