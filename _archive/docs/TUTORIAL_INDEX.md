# 📚 Tutorial System — Навигация по документации

Полный индекс всей документации системы обучения.

---

## 🚀 Быстрый старт

Если ты впервые знакомишься с системой, начни отсюда:

1. **[TUTORIAL_SYSTEM_SUMMARY.md](TUTORIAL_SYSTEM_SUMMARY.md)** — Краткое описание (5 минут)
2. **[TUTORIAL_VISUAL_GUIDE.md](TUTORIAL_VISUAL_GUIDE.md)** — Визуальное руководство (10 минут)
3. **[tutorial-demo.html](tutorial-demo.html)** — Рабочая демонстрация (открой в браузере)

---

## 📖 Основная документация

### Для разработчиков

| Файл | Описание | Когда читать |
|------|----------|--------------|
| **[TUTORIAL_INTEGRATION_GUIDE.md](TUTORIAL_INTEGRATION_GUIDE.md)** | Пошаговое руководство по интеграции | Перед интеграцией в игру |
| **[js/tutorial/README.md](js/tutorial/README.md)** | Полная документация API | Для глубокого понимания |
| **[js/tutorial/ARCHITECTURE.md](js/tutorial/ARCHITECTURE.md)** | Архитектурная документация | Для понимания дизайна |
| **[js/tutorial/EXAMPLES.md](js/tutorial/EXAMPLES.md)** | 19 примеров кода | Для практического применения |

### Для менеджеров проекта

| Файл | Описание | Когда читать |
|------|----------|--------------|
| **[TUTORIAL_SYSTEM_COMPLETE.md](TUTORIAL_SYSTEM_COMPLETE.md)** | Полное описание системы | Для общего понимания |
| **[js/tutorial/CHANGELOG.md](js/tutorial/CHANGELOG.md)** | История изменений | Для отслеживания версий |

---

## 🎯 Навигация по задачам

### Я хочу...

#### ...понять что это такое
→ Читай **[TUTORIAL_SYSTEM_SUMMARY.md](TUTORIAL_SYSTEM_SUMMARY.md)**

#### ...увидеть как это работает
→ Открой **[tutorial-demo.html](tutorial-demo.html)** в браузере

#### ...интегрировать в свою игру
→ Следуй **[TUTORIAL_INTEGRATION_GUIDE.md](TUTORIAL_INTEGRATION_GUIDE.md)**

#### ...добавить новый шаг обучения
→ Читай раздел "Добавление нового шага" в **[js/tutorial/README.md](js/tutorial/README.md#структура-шага-обучения)**

#### ...изменить диалоги наставника
→ Редактируй **[js/tutorial/MentorshipData.js](js/tutorial/MentorshipData.js)**

#### ...понять архитектуру
→ Читай **[js/tutorial/ARCHITECTURE.md](js/tutorial/ARCHITECTURE.md)**

#### ...посмотреть примеры кода
→ Читай **[js/tutorial/EXAMPLES.md](js/tutorial/EXAMPLES.md)**

#### ...отладить проблему
→ Читай раздел "Troubleshooting" в **[TUTORIAL_INTEGRATION_GUIDE.md](TUTORIAL_INTEGRATION_GUIDE.md#-troubleshooting)**

#### ...расширить функциональность
→ Читай раздел "Расширение" в **[js/tutorial/EXAMPLES.md](js/tutorial/EXAMPLES.md#-расширение-функциональности)**

---

## 📁 Структура файлов

```
DispatcherTraining/
│
├── 📘 TUTORIAL_INDEX.md                  # Этот файл — навигация
├── 📄 TUTORIAL_SYSTEM_SUMMARY.md         # Краткое описание
├── ✅ TUTORIAL_SYSTEM_COMPLETE.md        # Полное описание
├── 📖 TUTORIAL_INTEGRATION_GUIDE.md      # Руководство по интеграции
├── 🎨 TUTORIAL_VISUAL_GUIDE.md           # Визуальное руководство
├── 🎮 tutorial-demo.html                 # Демо-страница
│
└── js/tutorial/
    ├── 📚 README.md                      # Документация API
    ├── 🏗️ ARCHITECTURE.md                # Архитектура
    ├── 💡 EXAMPLES.md                    # Примеры кода
    ├── 📋 CHANGELOG.md                   # История изменений
    │
    ├── ⚙️ TutorialStateMachine.js        # State Machine
    ├── 📝 MentorshipData.js              # Данные обучения
    ├── 🎨 TutorialUIController.js        # UI контроллер
    ├── 🎯 TutorialManager.js             # Главный оркестратор
    └── 🔌 integration.js                 # Интеграция с игрой
```

---

## 🎓 Учебный путь

### Уровень 1: Новичок (30 минут)

1. Прочитай **[TUTORIAL_SYSTEM_SUMMARY.md](TUTORIAL_SYSTEM_SUMMARY.md)** (5 мин)
2. Посмотри **[TUTORIAL_VISUAL_GUIDE.md](TUTORIAL_VISUAL_GUIDE.md)** (10 мин)
3. Открой **[tutorial-demo.html](tutorial-demo.html)** и протестируй (15 мин)

**Результат:** Понимаешь что это и как работает.

### Уровень 2: Интегратор (1 час)

1. Прочитай **[TUTORIAL_INTEGRATION_GUIDE.md](TUTORIAL_INTEGRATION_GUIDE.md)** (20 мин)
2. Следуй чеклисту интеграции (30 мин)
3. Протестируй в своей игре (10 мин)

**Результат:** Система интегрирована и работает.

### Уровень 3: Разработчик (2 часа)

1. Прочитай **[js/tutorial/README.md](js/tutorial/README.md)** (30 мин)
2. Изучи **[js/tutorial/ARCHITECTURE.md](js/tutorial/ARCHITECTURE.md)** (30 мин)
3. Посмотри примеры в **[js/tutorial/EXAMPLES.md](js/tutorial/EXAMPLES.md)** (30 мин)
4. Добавь свой кастомный шаг (30 мин)

**Результат:** Можешь расширять и настраивать систему.

### Уровень 4: Эксперт (4 часа)

1. Изучи весь исходный код модулей (2 часа)
2. Прочитай все примеры и попробуй их (1 час)
3. Создай свою кастомную валидацию (30 мин)
4. Добавь аналитику (30 мин)

**Результат:** Полное понимание системы, можешь вносить любые изменения.

---

## 🔍 Поиск по темам

### State Machine
- **[js/tutorial/TutorialStateMachine.js](js/tutorial/TutorialStateMachine.js)** — исходный код
- **[js/tutorial/README.md#state-machine-api](js/tutorial/README.md#-state-machine-api)** — API документация
- **[js/tutorial/ARCHITECTURE.md#state-machine-fsm](js/tutorial/ARCHITECTURE.md#state-machine-fsm)** — архитектура

### UI Controller
- **[js/tutorial/TutorialUIController.js](js/tutorial/TutorialUIController.js)** — исходный код
- **[js/tutorial/README.md#ui-компоненты](js/tutorial/README.md#-ui-компоненты)** — компоненты
- **[js/tutorial/EXAMPLES.md#кастомизация-ui](js/tutorial/EXAMPLES.md#-кастомизация-ui)** — примеры

### Data Layer
- **[js/tutorial/MentorshipData.js](js/tutorial/MentorshipData.js)** — исходный код
- **[js/tutorial/README.md#структура-шага-обучения](js/tutorial/README.md#-структура-шага-обучения)** — структура
- **[js/tutorial/EXAMPLES.md#добавление-нового-шага](js/tutorial/EXAMPLES.md#-добавление-нового-шага)** — примеры

### Integration
- **[js/tutorial/integration.js](js/tutorial/integration.js)** — исходный код
- **[TUTORIAL_INTEGRATION_GUIDE.md](TUTORIAL_INTEGRATION_GUIDE.md)** — руководство
- **[js/tutorial/EXAMPLES.md#интеграция-с-игровой-логикой](js/tutorial/EXAMPLES.md#-интеграция-с-игровой-логикой)** — примеры

### Validation
- **[js/tutorial/README.md#типы-валидации](js/tutorial/README.md#-типы-валидации)** — все типы
- **[js/tutorial/EXAMPLES.md#пример-3-шаг-с-кастомной-валидацией](js/tutorial/EXAMPLES.md#пример-3-шаг-с-кастомной-валидацией)** — примеры
- **[js/tutorial/EXAMPLES.md#пример-11-добавление-нового-типа-валидации](js/tutorial/EXAMPLES.md#пример-11-добавление-нового-типа-валидации)** — расширение

---

## 🐛 Решение проблем

### Проблема: Обучение не запускается
→ **[TUTORIAL_INTEGRATION_GUIDE.md#проблема-обучение-не-запускается](TUTORIAL_INTEGRATION_GUIDE.md#проблема-обучение-не-запускается)**

### Проблема: Элемент не подсвечивается
→ **[TUTORIAL_INTEGRATION_GUIDE.md#проблема-элемент-не-подсвечивается](TUTORIAL_INTEGRATION_GUIDE.md#проблема-элемент-не-подсвечивается)**

### Проблема: Шаг не переключается
→ **[TUTORIAL_INTEGRATION_GUIDE.md#проблема-шаг-не-переключается](TUTORIAL_INTEGRATION_GUIDE.md#проблема-шаг-не-переключается)**

### Другие проблемы
→ **[TUTORIAL_INTEGRATION_GUIDE.md#-troubleshooting](TUTORIAL_INTEGRATION_GUIDE.md#-troubleshooting)**

---

## 📊 Статистика документации

| Категория | Файлов | Строк | Описание |
|-----------|--------|-------|----------|
| **Код** | 5 | ~1,650 | Основные модули |
| **Документация** | 7 | ~2,400 | Руководства и описания |
| **Демо** | 1 | ~300 | Рабочая демонстрация |
| **Итого** | 13 | ~4,350 | Полная система |

---

## ✅ Чеклист документации

Убедись что прочитал:

### Обязательно (минимум)
- [ ] **[TUTORIAL_SYSTEM_SUMMARY.md](TUTORIAL_SYSTEM_SUMMARY.md)** — краткое описание
- [ ] **[TUTORIAL_INTEGRATION_GUIDE.md](TUTORIAL_INTEGRATION_GUIDE.md)** — руководство по интеграции
- [ ] **[tutorial-demo.html](tutorial-demo.html)** — демонстрация

### Рекомендуется
- [ ] **[TUTORIAL_VISUAL_GUIDE.md](TUTORIAL_VISUAL_GUIDE.md)** — визуальное руководство
- [ ] **[js/tutorial/README.md](js/tutorial/README.md)** — документация API
- [ ] **[js/tutorial/EXAMPLES.md](js/tutorial/EXAMPLES.md)** — примеры кода

### Для углублённого изучения
- [ ] **[js/tutorial/ARCHITECTURE.md](js/tutorial/ARCHITECTURE.md)** — архитектура
- [ ] **[TUTORIAL_SYSTEM_COMPLETE.md](TUTORIAL_SYSTEM_COMPLETE.md)** — полное описание
- [ ] Исходный код всех модулей

---

## 🔗 Быстрые ссылки

### Документация
- [Краткое описание](TUTORIAL_SYSTEM_SUMMARY.md)
- [Полное описание](TUTORIAL_SYSTEM_COMPLETE.md)
- [Руководство по интеграции](TUTORIAL_INTEGRATION_GUIDE.md)
- [Визуальное руководство](TUTORIAL_VISUAL_GUIDE.md)
- [API документация](js/tutorial/README.md)
- [Архитектура](js/tutorial/ARCHITECTURE.md)
- [Примеры кода](js/tutorial/EXAMPLES.md)
- [История изменений](js/tutorial/CHANGELOG.md)

### Код
- [TutorialStateMachine.js](js/tutorial/TutorialStateMachine.js)
- [MentorshipData.js](js/tutorial/MentorshipData.js)
- [TutorialUIController.js](js/tutorial/TutorialUIController.js)
- [TutorialManager.js](js/tutorial/TutorialManager.js)
- [integration.js](js/tutorial/integration.js)

### Демо
- [tutorial-demo.html](tutorial-demo.html)

---

## 📞 Поддержка

Если не нашёл ответ в документации:

1. **Проверь логи в консоли** (F12)
2. **Используй Console API** (`window.tutorialManager`)
3. **Читай комментарии в коде** (все модули хорошо задокументированы)
4. **Проверь примеры** в [EXAMPLES.md](js/tutorial/EXAMPLES.md)

---

## 🎉 Готово!

Теперь у тебя есть полная карта документации.

Выбери свой путь и начинай изучение! 🚀

---

**Автор:** Kiro AI  
**Проект:** DispatcherTraining  
**Дата:** 2026-05-02  
**Версия:** 1.0.0
