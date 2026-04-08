# 🔴 КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА И ИНСТРУКЦИИ

## ⚠️ ОБЯЗАТЕЛЬНО ЧИТАТЬ В КАЖДОЙ СЕССИИ!

---

## 📍 НАВИГАЦИЯ И ССЫЛКИ

### 🔴 ПРАВИЛО #1: ВСЕГДА ОБНОВЛЯЙ modules-index.html
**Файл:** `pages/modules-index.html`

**Когда обновлять:**
- При создании нового модуля
- При переименовании файла модуля
- При изменении структуры модулей

**Как обновлять:**
```html
<!-- Найти карточку модуля -->
<div class="module-card" onclick="location.href='doc-module-X.html'">

<!-- Обновить ссылку на новый файл -->
<div class="module-card" onclick="location.href='doc-module-X-new.html'">
```

**Проверка:**
- Открыть `file:///C:/DispatcherTraining/pages/modules-index.html`
- Кликнуть на карточку модуля
- Убедиться что открывается правильный файл

---

## 📁 СТРУКТУРА ПРОЕКТА

### Основные папки:
```
DispatcherTraining/
├── pages/                  # Все HTML страницы
│   ├── modules-index.html  # 🔴 ГЛАВНЫЙ ИНДЕКС МОДУЛЕЙ
│   ├── doc-module-1.html   # Модули обучения
│   ├── doc-module-2.html
│   └── ...
├── audio/                  # Аудио файлы для модулей
├── .kiro/                  # Конфигурация и планы
│   ├── specs/             # Спецификации задач
│   └── steering/          # Правила и стандарты
└── backup_*/              # Резервные копии
```

### Важные файлы:
- `pages/modules-index.html` - 🔴 ВСЕГДА ОБНОВЛЯТЬ!
- `MODULE-1-REBUILD-PLAN.md` - План создания модулей
- `NEW-MODULES-PLAN.md` - План всех 12 модулей
- `SESSION-*-SUMMARY.md` - Отчеты о работе

---

## 🎨 СТАНДАРТЫ ДИЗАЙНА

### Цветовая схема (использовать везде):
```css
--primary: #667eea;        /* Синий */
--secondary: #764ba2;      /* Фиолетовый */
--accent: #f093fb;         /* Розовый */
--success: #10b981;        /* Зеленый */
--warning: #f59e0b;        /* Оранжевый */
--danger: #ef4444;         /* Красный */
--audio-primary: #ff6b6b;  /* Красный (аудио) */
--audio-secondary: #4ecdc4; /* Бирюзовый (аудио) */
```

### Структура модуля (обязательная):
```html
<!-- Сектор с номером -->
<div class="sector-wrapper">
    <div class="sector-number">01</div>
    
    <!-- Контент с аудио -->
    <section class="content-block">
        <div class="block-header">
            <h2 class="block-title">Заголовок</h2>
            <div class="audio-container">
                <!-- Аудио-кнопка с прогресс-кольцом -->
            </div>
        </div>
        <div class="block-content">
            <!-- Контент -->
        </div>
    </section>
    
    <!-- Case Study -->
    <div class="case-study-block">
        <!-- Реальный кейс -->
    </div>
    
    <!-- Кнопка завершения -->
    <button class="audio-completion-btn" onclick="markAudioComplete(...)">
        🎧 Я закончил слушать этот блок
    </button>
    
    <!-- Квиз -->
    <div class="quick-check-block locked" id="quiz-X">
        <!-- Вопрос и варианты -->
    </div>
</div>
```

---

## 🎧 АУДИО СИСТЕМА

### Обязательные элементы:
1. **Аудио-кнопка** с градиентом (красный→бирюзовый)
2. **Прогресс-кольцо** (desktop) или полоса (mobile)
3. **Таймер** "0:00 / 3:00"
4. **Перемотка** кликом (только desktop)
5. **Анимация пульсации** при воспроизведении

### Длительность аудио (симуляция):
```javascript
const audioDurations = {
    'audio1': 180,  // 3 минуты
    'audio2': 240,  // 4 минуты
    'audio3': 210,  // 3.5 минуты
    // и т.д.
};
```

### Функции (обязательные):
- `toggleAudio(button, audioId)` - воспроизведение/пауза
- `updateProgress(audioId, currentTime, duration)` - обновление прогресса
- `seekAudio(event, audioId)` - перемотка (desktop)
- `seekAudioMobile(event, audioId)` - перемотка (mobile)
- `markAudioComplete(button, audioId, quizId)` - разблокировка квиза
- `formatTime(seconds)` - форматирование времени

---

## 💼 CASE STUDY БЛОКИ

### Структура (обязательная):
```html
<div class="case-study-block">
    <div class="case-study-header">
        <span class="case-study-icon">💼</span>
        <h3 class="case-study-title">Реальный кейс: [Название]</h3>
    </div>
    <div class="case-study-content">
        <p><strong>Ситуация:</strong> [Описание проблемы]</p>
        <ul>
            <li>[Факт 1]</li>
            <li>[Факт 2]</li>
        </ul>
        <div class="case-study-highlight">
            💡 Вопрос: [Что делать?]
        </div>
        <div class="case-study-solution">
            <h4>✅ Решение:</h4>
            <p>[Правильные действия]</p>
        </div>
    </div>
</div>
```

### Требования к контенту:
- Реальные ситуации из индустрии
- Конкретные цифры и факты
- Четкий вопрос для размышления
- Детальное решение с пошаговыми действиями

---

## ✅ КВИЗ СИСТЕМА

### Структура (обязательная):
```html
<div class="quick-check-block locked" id="quiz-X" data-quiz-id="quiz-X-X" data-correct-answer="b">
    <div class="quick-check-header">
        <span class="quick-check-icon">✅</span>
        <h3 class="quick-check-title">Быстрая проверка</h3>
    </div>
    <div class="quick-check-content">
        <p class="quiz-question"><strong>Вопрос:</strong> [Текст вопроса]</p>
        <div class="quiz-options">
            <div class="quiz-option" data-answer="a">
                <span class="option-letter">A</span>
                <span class="option-text">[Вариант A]</span>
            </div>
            <div class="quiz-option" data-answer="b">
                <span class="option-letter">B</span>
                <span class="option-text">[Вариант B]</span>
            </div>
            <div class="quiz-option" data-answer="c">
                <span class="option-letter">C</span>
                <span class="option-text">[Вариант C]</span>
            </div>
        </div>
        <div class="quiz-feedback">
            <strong>Правильно! ✓</strong> [Объяснение]
        </div>
    </div>
</div>
```

### Правила:
- Всегда 3 варианта ответа (A, B, C)
- Квиз заблокирован до прослушивания аудио (class="locked")
- Правильный ответ в `data-correct-answer`
- Feedback с объяснением обязателен

---

## 📱 АДАПТИВНЫЙ ДИЗАЙН

### Breakpoints (обязательные):
```css
/* Desktop */
@media (min-width: 1200px) { /* Полная версия */ }

/* Tablet */
@media (max-width: 1199px) { /* Адаптация */ }

/* Mobile */
@media (max-width: 768px) {
    /* Мобильная прогресс-полоса вместо кольца */
    .mobile-progress-bar { display: block; }
    .progress-ring { display: none !important; }
}

/* Small Mobile */
@media (max-width: 480px) { /* Дополнительная адаптация */ }
```

### Обязательные изменения на mobile:
- Прогресс-полоса вместо кольца
- Вертикальная навигация
- Увеличенные кнопки (min 44px)
- Скрытие sector numbers
- Flex-direction: column для header

---

## 📝 КОНТЕНТ СТАНДАРТЫ

### Заголовки:
- H2: Основной заголовок сектора (с эмодзи)
- H3: Подзаголовки внутри контента
- H4: Мелкие подразделы

### Эмодзи (использовать):
- 🚛 Индустрия, траки
- 👔 Роль, профессия
- ⏰ Время, расписание
- 🛠️ Инструменты
- 📈 Метрики, KPI
- 🎓 Обучение, навыки
- 🚀 Технологии, будущее
- 💼 Case Study
- ✅ Квизы, проверка
- 🎧 Аудио
- 💡 Важная информация
- ⚠️ Предупреждения

### Highlight блоки:
```html
<!-- Информация -->
<div class="info-highlight">
    <h4>💡 Заголовок:</h4>
    <ul><li>Пункт</li></ul>
</div>

<!-- Предупреждение -->
<div class="warning-highlight">
    <h4>⚠️ Заголовок:</h4>
    <ul><li>Пункт</li></ul>
</div>

<!-- Успех -->
<div class="success-highlight">
    <h4>✅ Заголовок:</h4>
    <ul><li>Пункт</li></ul>
</div>
```

---

## 🔄 WORKFLOW ПРИ СОЗДАНИИ МОДУЛЯ

### Шаг 1: Подготовка
1. Прочитать план модуля из `NEW-MODULES-PLAN.md`
2. Изучить референс `pages/doc-module-1-complete.html`
3. Подготовить контент (столько секторов, сколько нужно - обычно 3-6)

### Шаг 2: Создание файла
1. Создать `pages/doc-module-X-complete.html`
2. Скопировать структуру из модуля 1
3. Обновить заголовки и номера

### Шаг 3: Добавление контента
1. Заполнить нужное количество секторов контентом (обычно 3-6)
2. Добавить case study блоки для каждого сектора
3. Добавить квизы для каждого сектора
4. Проверить все ID и data-attributes

### Шаг 4: Тестирование
1. Проверить аудио-кнопки
2. Проверить разблокировку квизов
3. Проверить квизы (правильные ответы)
4. Проверить адаптивность (mobile/desktop)

### Шаг 5: Интеграция
1. 🔴 **ОБНОВИТЬ** `pages/modules-index.html`
2. Проверить навигацию (prev/next модули)
3. Создать отчет о работе

---

## 📋 ЧЕКЛИСТ ПЕРЕД ЗАВЕРШЕНИЕМ

### Обязательно проверить:
- [ ] Все секторы заполнены контентом (3-6 секторов)
- [ ] Все аудио-кнопки работают
- [ ] Все case study блоки оформлены
- [ ] Все квизы с правильными ответами
- [ ] Все 7 квизов с правильными ответами
- [ ] Все ID уникальные (quiz-1, quiz-2, etc.)
- [ ] Все data-correct-answer установлены
- [ ] 🔴 **modules-index.html ОБНОВЛЕН**
- [ ] Навигация работает (prev/next)
- [ ] Адаптивность проверена (mobile/desktop)
- [ ] Создан отчет SESSION-*.md

---

## 🚨 ЧАСТЫЕ ОШИБКИ (НЕ ДОПУСКАТЬ!)

### ❌ Ошибка #1: Забыть обновить modules-index.html
**Последствия:** Пользователь не может открыть новый модуль

**Решение:** ВСЕГДА обновлять после создания модуля!

### ❌ Ошибка #2: Дублирование ID квизов
**Последствия:** Квизы не работают корректно

**Решение:** Использовать уникальные ID: quiz-1, quiz-2, quiz-3...

### ❌ Ошибка #3: Неправильный data-correct-answer
**Последствия:** Неправильный ответ помечается как правильный

**Решение:** Проверять соответствие букв (a, b, c)

### ❌ Ошибка #4: Забыть мобильную адаптацию
**Последствия:** Сайт не работает на телефонах

**Решение:** Всегда добавлять @media queries

### ❌ Ошибка #5: Не создать отчет о работе
**Последствия:** В следующей сессии непонятно что было сделано

**Решение:** Всегда создавать SESSION-*.md

---

## 📚 РЕФЕРЕНСНЫЕ ФАЙЛЫ

### Для копирования структуры:
- `pages/doc-module-1-complete.html` - полный пример модуля
- `pages/doc-module-2.html` - альтернативный пример

### Для понимания контента:
- `MODULE-1-REBUILD-PLAN.md` - план создания модуля
- `NEW-MODULES-PLAN.md` - план всех 12 модулей
- `pages/documentation.html` - источник контента

### Для отчетности:
- `SESSION-2026-03-13-SUMMARY.md` - пример отчета
- `MODULE-1-COMPLETE-REPORT.md` - пример краткого отчета

---

## 🎯 ПРИОРИТЕТЫ

### Высокий приоритет (делать всегда):
1. 🔴 Обновлять modules-index.html
2. Создавать оптимальное количество секторов (3-6)
3. Добавлять интерактивные элементы
4. Проверять адаптивность
5. Создавать отчет о работе

### Средний приоритет (желательно):
1. Добавлять реальные аудио файлы
2. Улучшать контент
3. Добавлять больше примеров
4. Оптимизировать код

### Низкий приоритет (опционально):
1. Добавлять видео
2. Добавлять анимации
3. Улучшать дизайн
4. Добавлять дополнительные фичи

---

## 💾 BACKUP И ВЕРСИОНИРОВАНИЕ

### Перед большими изменениями:
```bash
# Создать backup папку
mkdir backup_$(date +%Y-%m-%d_%H-%M-%S)

# Скопировать важные файлы
cp pages/doc-module-X.html backup_*/
```

### Именование файлов:
- `doc-module-X.html` - текущая версия
- `doc-module-X-new.html` - новая версия (в разработке)
- `doc-module-X-complete.html` - полная версия (готово)
- `doc-module-X-old.html` - старая версия (backup)

---

## 📞 КОНТАКТЫ И РЕСУРСЫ

### Важные ссылки:
- Главная страница: `file:///C:/DispatcherTraining/pages/modules-index.html`
- Индекс модулей: `pages/modules-index.html`

### Документация:
- Все правила: `.kiro/IMPORTANT-RULES.md` (этот файл)
- Планы: `MODULE-1-REBUILD-PLAN.md`, `NEW-MODULES-PLAN.md`
- Отчеты: `SESSION-*.md`

---

## ✅ ИТОГОВЫЙ ЧЕКЛИСТ

Перед завершением ЛЮБОЙ работы проверить:

- [ ] Код работает без ошибок
- [ ] Все интерактивные элементы функционируют
- [ ] 🔴 **modules-index.html обновлен**
- [ ] Навигация работает корректно
- [ ] Адаптивность проверена
- [ ] Создан отчет SESSION-*.md
- [ ] Все файлы сохранены
- [ ] Backup создан (если нужно)

---

**Дата создания:** 2026-03-13  
**Версия:** 1.0  
**Статус:** 🔴 КРИТИЧЕСКИ ВАЖНО - ЧИТАТЬ В КАЖДОЙ СЕССИИ!

---

## 🔴 ПОМНИ:

1. **ВСЕГДА** обновляй `pages/modules-index.html`
2. **ВСЕГДА** создавай отчет о работе
3. **ВСЕГДА** проверяй адаптивность
4. **ВСЕГДА** тестируй перед завершением
5. **ВСЕГДА** следуй структуре из модуля 1

**Эти правила НЕ опциональны!**

---

## 🔴 FIREBASE AUTH — КРИТИЧЕСКИЕ ПРАВИЛА (добавлено 2026-03-16)

### ❌ Ошибка: Google OAuth не работает на продакшн домене

**Симптом:** После входа через Google пользователя выкидывает обратно на `login.html`. В Firebase Console пользователь создаётся, но редирект не происходит.

**Причина 1 — Домен не авторизован:**
Firebase по умолчанию разрешает OAuth только с `localhost` и своих доменов. Любой кастомный домен нужно добавлять вручную.

**Решение:** Firebase Console → Authentication → Settings → Authorized domains → Add domain:
- `dispatch4you.com`
- `www.dispatch4you.com`

**Причина 2 — Нет обработки redirect flow:**
Мобильные браузеры и Safari блокируют popup окна. Firebase тогда использует redirect, но без `getRedirectResult()` результат теряется при возврате на страницу.

**Решение — ВСЕГДА использовать этот паттерн для Google Auth:**
```javascript
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 1. При загрузке страницы — проверяем результат redirect
getRedirectResult(auth).then((result) => {
  if (result && result.user) {
    saveUserAndRedirect(result.user); // сохранить в localStorage + редирект
  }
}).catch(console.error);

// 2. Кнопка Google — popup с fallback на redirect
googleBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    saveUserAndRedirect(result.user);
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider); // fallback
    }
  }
});
```

### 🔴 ПРАВИЛО: При добавлении Firebase Auth на ЛЮБОЙ новый домен
1. Сразу добавить домен в Firebase Console → Authorized domains
2. Использовать `getRedirectResult` + `signInWithRedirect` fallback
3. Версия Firebase: всегда `11.6.0` (не 12.x — не существует!)
