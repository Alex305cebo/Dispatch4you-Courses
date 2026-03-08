# Правила разработки и история изменений

## КРИТИЧЕСКИЕ ПРАВИЛА (ВСЕГДА СОБЛЮДАТЬ!)

### 1. При создании нового диалога (scenarios-data-vXX.js)
- ✅ **ОБЯЗАТЕЛЬНО** добавить `<script src="scenarios-data-vXX.js"></script>` в `simulator.html`
- ✅ **ПРАВИЛЬНЫЕ РОЛИ:** Диспетчер звонит брокеру по поводу POSTED груза
- ✅ **initialMessage:** Диспетчер представляется и спрашивает о грузе брокера
- ✅ **brokerQuestion:** Брокер отвечает и задает вопросы
- ✅ Проверить структуру reject путей - количество элементов должно соответствовать шагу отказа
- ✅ Reject пути: `[{}, {}, ..., { brokerResponse: "...", outcome: {...} }]`
- ✅ Количество `{}` = номер шага где происходит отказ
- ✅ **НЕТ ОТКАЗОВ НА ПЕРВОМ ШАГЕ!** Брокер всегда дает второй шанс с предупреждением
- ✅ **НИКОГДА НЕ ОСТАВЛЯЙТЕ ПУСТЫЕ `{}` В WEAK ПУТИ!** Каждая позиция должна иметь brokerQuestion или outcome

### 2. Логика первого плохого ответа (НОВОЕ ПРАВИЛО!)
**НА ПЕРВОМ ШАГЕ НЕТ REJECT!**

Если диспетчер дает плохой ответ на первом шаге:
- ❌ НЕ отказывать сразу
- ✅ Брокер дает профессиональное предупреждение
- ✅ Намекает на ответственность и серьезность
- ✅ Просит ответить на вопрос правильно
- ✅ Дает второй шанс

**Пример:**
```javascript
{
    brokerQuestion: "What's your MC?",
    dispatcherPrompt: "💎 Брокер проверяет компанию...",
    suggestions: [
        { text: "MC 123456, ABC Transport...", quality: "excellent", path: "master" },
        { text: "Why you need MC?", quality: "fail", path: "warning_path" }
    ]
}
```

**warning_path** (путь предупреждения):
```javascript
warning_path: [
    {},
    {
        brokerQuestion: "I need to verify your company for insurance and liability purposes. This is standard procedure for all carriers. Can you please provide your MC number?",
        dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Брокер дал второй шанс. Ответьте профессионально!",
        suggestions: [
            { text: "Sorry, MC 123456, ABC Transport.", quality: "good", path: "master" },
            { text: "I don't have it...", quality: "fail", path: "reject_early" }
        ]
    }
]
```

**Только на ВТОРОМ плохом ответе → reject!**

### 3. Структура reject путей
```javascript
// Отказ на шаге 2:
reject_early: [{}, {}, { brokerResponse: "...", outcome: {...} }]

// Отказ на шаге 5:
reject_mid: [{}, {}, {}, {}, {}, { brokerResponse: "...", outcome: {...} }]

// Отказ на шаге 9:
reject_late: [{}, {}, {}, {}, {}, {}, {}, {}, {}, { brokerResponse: "...", outcome: {...} }]
```

### 3. Логика переключения путей
- ✅ Система ВСЕГДА проверяет `suggestion.path` в выбранном ответе
- ✅ Если есть `path: "reject_XXX"` - переключается на этот путь НЕМЕДЛЕННО
- ✅ После переключения берется элемент `newPath[conversationStep + 1]`
- ✅ Если элемент пустой `{}` - показывается следующий шаг из master пути (ОШИБКА!)

### 4. Размеры текста (увеличены 8 марта 2026)
```css
/* Сообщения чата */
.message-content {
    font-size: clamp(16px, 2.5vw, 18px);
    line-height: 1.7;
    padding: 14px 18px;
}

/* Подсказки в чате */
.suggestion-btn {
    font-size: clamp(16px, 2.5vw, 18px);
    line-height: 1.7;
    padding: 18px 22px;
}

/* Промпт диспетчера */
.dispatcher-prompt {
    font-size: 16px;
    line-height: 1.6;
    padding: 14px;
}

/* Модальное окно - заголовок */
.modal h3 {
    font-size: 20px;
}

/* Модальное окно - текст подсказок */
.messageText {
    font-size: 16px;
    line-height: 1.6;
}

/* Модальное окно - analytics */
.analyticsText {
    font-size: 13px;
}
```

### 5. Анимация слот-машины (улучшена 8 марта 2026)
**Файл:** `pages/slot-machine-improved-v2.js`

**Логика:**
- 3 РАЗНЫХ сценария в каждом слоте
- ОДИН случайный слот выделяется зеленым (победитель)
- Остальные 2 слота серые
- Запускается диалог из победившего слота

**Тайминги:**
- Слот 1: останавливается через 1.5 сек
- Слот 2: останавливается через 2.2 сек
- Слот 3: останавливается через 2.9 сек
- Замедление: 150ms, 200ms, 250ms, 300ms, 350ms

**Эффекты:**
- Bounce при остановке: `scale(1.1)` → `scale(1.0)` за 200ms
- Зеленая подсветка только у победителя
- Серый фон у остальных

## ИСТОРИЯ ИЗМЕНЕНИЙ

### 8 марта 2026 (ВЕЧЕР - Исправление тупиков в weak путях v1 и v2)

#### 13. Устранены ВСЕ тупики в weak путях диалогов v1 и v2
- **Проблема:** Пользователь снова столкнулся с тупиком на шаге 2 после выбора слабого ответа
- **Причина:** В weak пути были пустые `{}` элементы между вопросами
- **Пример тупика:** Шаг 2 weak ответ → переключение на weak путь → `weak[3] = {}` → ТУПИК!
- **Решение:** Заполнены ВСЕ пустые позиции дополнительными вопросами брокера
- **Логика дополнительных вопросов:**
  - Брокер показывает сомнения: "You think so?", "You think?", "Okay?"
  - Требует уверенности: "I need confirmation", "I need to know for sure"
  - Повторяет ключевые детали
  - Дает выбор: исправиться (→ master) или продолжить слабые ответы (→ weak)
- **Исправленные файлы:**
  - `scenarios-data-v1.js`: Заполнены позиции 2, 4, 6, 8, 10 в weak пути (5 дополнительных вопросов)
  - `scenarios-data-v2.js`: Заполнены позиции 2, 4, 6, 8, 10 в weak пути (5 дополнительных вопросов)
- **Результат:** ✅ НЕТ ТУПИКОВ! Каждая позиция имеет brokerQuestion или outcome
- **Документация:** `WEAK-PATH-DEADEND-FIX.md`
- **НОВОЕ ПРАВИЛО:** НИКОГДА НЕ ОСТАВЛЯЙТЕ ПУСТЫЕ `{}` В WEAK ПУТИ!

#### 14. Исправлена роль диспетчера - не должен спрашивать про email
- **Проблема:** На шаге 6 диспетчер спрашивал брокера "What's your email for rate confirmation?"
- **Почему неправильно:** Брокер ВСЕГДА спрашивает email диспетчера, не наоборот!
- **Правильная логика:**
  1. Торг завершен → Диспетчер: "Deal!"
  2. Брокер спрашивает: "What's your email?"
  3. Диспетчер дает свой email
  4. Брокер отправляет rate confirmation
- **Исправление:**
  - ДО: "$2,250 perfect! Deal! What's your email for rate confirmation?"
  - ПОСЛЕ: "$2,250 perfect! Deal!"
- **Исправленные файлы:**
  - `scenarios-data-v1.js`: Шаг 6 - убрано "What's your email for rate confirmation?"
  - `scenarios-data-v2.js`: Шаг 6 - убрано "What's your email for rate confirmation?"
- **Документация:** `DISPATCHER-ROLE-FIX.md`
- **НОВОЕ ПРАВИЛО:** Диспетчер НЕ спрашивает email брокера. Брокер контролирует процесс документов!

### 8 марта 2026 (ПРОДОЛЖЕНИЕ - Исправление initialMessage)

#### 10. Исправлены initialMessage в диалогах v1, v13, v15
- **Проблема:** Неправильная логика ролей - диспетчер предлагал груз вместо того, чтобы звонить о posted грузе брокера
- **Файлы исправлены:**
  - `scenarios-data-v1.js`: "I posted urgent reefer load..." → "I'm calling about your posted reefer load..."
  - `scenarios-data-v13.js`: "I'm calling about your flatbed load..." → "I'm calling about your posted flatbed load..."
  - `scenarios-data-v15.js`: "I have a reefer load..." → "I'm calling about your posted reefer load..."
- **Правильная логика:** Брокер размещает груз → Диспетчер видит → Диспетчер звонит → Брокер отвечает
- **Ключевые фразы:** "I'm calling about your posted load...", "I saw your load posting...", "Is this load still available?"
- **Проверено:** Все остальные диалоги (v5-v12, v14, v16) уже имеют правильный формат

### 8 марта 2026

#### 1. Исправлена проблема с диалогом #14
- **Проблема:** Файл `scenarios-data-v14.js` не был подключен в `simulator.html`
- **Решение:** Добавлена строка `<script src="scenarios-data-v14.js"></script>`
- **Урок:** ВСЕГДА добавлять script при создании нового файла сценария!

#### 2. Исправлена логика переключения путей
- **Проблема:** Плохие ответы не переключали путь на reject
- **Причина:** Условие `if (currentPath === null)` блокировало смену пути после первого ответа
- **Решение:** Добавлена проверка `suggestion.path` ПЕРЕД условием `currentPath === null`
- **Код:**
```javascript
// ВСЕГДА проверяем explicit path
const clickedSuggestion = currentPathSteps[conversationStep].suggestions?.find(s => s.text === text);
if (clickedSuggestion && clickedSuggestion.path && clickedSuggestion.path !== currentPath) {
    currentPath = clickedSuggestion.path;
}
```

#### 3. Исправлена структура reject путей в диалоге #14
- **Проблема:** reject1 имел 2 элемента, но отказ происходил на шаге 3
- **Решение:** Добавлен дополнительный `{}` в начало массива
- **Структура:**
```javascript
reject1: [{}, {}, {}, { brokerResponse: "...", outcome: {...} }]
// Теперь reject1[3] существует!
```

#### 4. Создан диалог #15 (Phoenix → Seattle, Reefer Produce)
- **Файл:** `pages/scenarios-data-v15.js`
- **Подключен:** ✅ Добавлен в `simulator.html`
- **Особенности:**
  - 4 reject пути: reject_early, reject_mid, reject_late, weak
  - Правильная структура всех путей
  - Produce требует reefer, temp monitoring, time-sensitive delivery

#### 5. Увеличены размеры текста
- **Сообщения:** 15-17px → 16-18px
- **Подсказки:** 15-17px → 16-18px
- **Промпт:** 15px → 16px
- **Line-height:** 1.6 → 1.7
- **Padding:** увеличен для лучшей читаемости

#### 6. Улучшена анимация слот-машины
- **Файл:** `pages/slot-machine-improved-v2.js`
- **Изменения:**
  - Каждый слот показывает РАЗНЫЙ сценарий
  - Только ОДИН случайный слот выделяется зеленым
  - Остальные остаются серыми
  - Реалистичное замедление перед остановкой
  - Bounce эффект при остановке

#### 7. Добавлено логирование для отладки
```javascript
console.log(`📍 Current state: step=${conversationStep}, path=${currentPath}`);
console.log(`➡️ Moving to step ${conversationStep}`);
console.log(`📋 Next step:`, nextStep);
```

## ТЕКУЩИЕ ФАЙЛЫ

### Диалоги (подключены в simulator.html)
1. `scenarios-data-v1.js` - #1
2. `scenarios-data-v5.js` - #5
3. `scenarios-data-v6.js` - #6
4. `scenarios-data-v7.js` - #7
5. `scenarios-data-v8.js` - #8
6. `scenarios-data-v9.js` - #9
7. `scenarios-data-v10.js` - #10
8. `scenarios-data-v11.js` - #11
9. `scenarios-data-v12.js` - #12
10. `scenarios-data-v13.js` - #13
11. `scenarios-data-v14.js` - #14 (Atlanta → Miami, Food/Beverage)
12. `scenarios-data-v15.js` - #15 (Phoenix → Seattle, Reefer Produce)

### Вспомогательные файлы
- `slot-machine-improved-v2.js` - Улучшенная анимация слот-машины
- `SIMULATOR-FIX-REPORT.md` - Отчет об исправлении диалога #14
- `SLOT-MACHINE-UPGRADE-INSTRUCTIONS.md` - Инструкции по обновлению анимации

## ЧЕКЛИСТ ПРИ СОЗДАНИИ НОВОГО ДИАЛОГА

- [ ] Создать файл `scenarios-data-vXX.js`
- [ ] Добавить `<script src="scenarios-data-vXX.js"></script>` в `simulator.html`
- [ ] **ВАЖНО:** Добавить `warning_path` для первого плохого ответа (НЕТ ОТКАЗА НА ШАГЕ 1!)
- [ ] Проверить что брокер дает профессиональное предупреждение с объяснением
- [ ] Проверить структуру всех путей (master, warning_path, reject_early, reject_mid, reject_late, weak)
- [ ] Убедиться что количество `{}` в reject путях = номер шага отказа
- [ ] Проверить что все suggestions имеют `path` для плохих ответов
- [ ] Протестировать все пути диалога
- [ ] Проверить что плохие ответы на шаге 1 ведут к warning_path, а не reject
- [ ] Проверить что второй плохой ответ ведет к reject
- [ ] Убедиться что нет "тупиков" (пустых шагов без brokerQuestion/brokerResponse)

## ИЗВЕСТНЫЕ ПРОБЛЕМЫ

### Решенные
- ✅ Диалог #14 не отображался (не был подключен)
- ✅ Плохие ответы не переключали путь (исправлена логика)
- ✅ Тупики в диалогах (исправлена структура reject путей)
- ✅ Текст слишком мелкий (увеличен)
- ✅ Анимация слот-машины нереалистична (улучшена)

### Текущие
- Нет

## КОНТАКТЫ И ДАТЫ

**Последнее обновление:** 8 марта 2026
**Разработчик:** Kiro AI Assistant
**Проект:** Dispatcher Training Simulator


## КРИТИЧЕСКОЕ ПРАВИЛО: РОЛИ В ДИАЛОГЕ

### ПРАВИЛЬНАЯ ЛОГИКА:
1. **Брокер** размещает груз на loadboard (posted load)
2. **Диспетчер** видит груз и ЗВОНИТ брокеру
3. **Диспетчер** спрашивает: "Is this load still available?"
4. **Брокер** отвечает и задает вопросы

### НЕПРАВИЛЬНО ❌:
```javascript
initialMessage: "I have a load... Is your truck available?"
// Это брокер предлагает груз - НЕПРАВИЛЬНО!
```

### ПРАВИЛЬНО ✅:
```javascript
initialMessage: "Good morning! This is [Name] from [Company].\nI'm calling about your posted load [Route] with [Cargo].\nIs this load still available?"
// Диспетчер звонит по поводу POSTED груза брокера!
```

### Примеры правильных initialMessage:

**Пример 1:**
```javascript
initialMessage: "Good morning! This is Sarah from ColdChain Transport.\nI'm calling about your posted reefer load Phoenix to Seattle with produce.\nIs this load still available?"
```

**Пример 2:**
```javascript
initialMessage: "Good afternoon! This is Mike from SteelRoad Logistics.\nI saw your load posting for Dallas to Denver with construction materials.\nIs it still available?"
```

**Пример 3:**
```javascript
initialMessage: "Hi! This is Jennifer from FastFreight Solutions.\nCalling about the dry van load Atlanta to Miami you posted.\nStill available?"
```

### Ключевые фразы:
- "I'm calling about your posted load..."
- "I saw your load posting..."
- "Calling about the [equipment] load you posted..."
- "Is this load still available?"
- "Is it still available?"

**ЗАПОМНИТЬ:** Диспетчер ВСЕГДА звонит по поводу груза БРОКЕРА!


### 8 марта 2026 (ВЕЧЕР - Исправление тупиков в v1)

#### 11. Устранены ВСЕ тупики в диалоге v1
- **Проблема:** Множественные тупики - после fail/aggressive ответов не было продолжения
- **Причина:** reject пути начинались с поздних шагов, но переключение происходило на ранних шагах
- **Пример тупика:** Шаг 2 insurance fail → `path: "reject_late"` → `reject_late[3] = {}` → ТУПИК!
- **Решение:** Создал отдельные reject пути для каждого шага где возможен fail/aggressive ответ
- **Созданные пути:**
  - `reject_late` (шаг 2 - insurance)
  - `reject_rate` (шаг 4 - unrealistic rate)
  - `reject_ultimatum` (шаг 5 - ultimatum)
  - `reject_final_offer` (шаг 6 - торг после final)
  - `reject_no_email` (шаг 7 - no email)
- **Результат:** ✅ НЕТ ТУПИКОВ! Каждый ответ ведет к продолжению!
- **Документация:** `DIALOGUE-V1-DEADEND-FIX.md`

#### 12. Добавлено критическое правило: НЕТ ТУПИКОВ
**ПРАВИЛО:** Для каждого fail/aggressive ответа на шаге N создайте отдельный reject путь с элементом на позиции N+1!

**Формула:**
```
Переключение на шаге N → reject_path должен иметь элемент на позиции N+1
```

**Проверка перед созданием диалога:**
Для каждого шага проверьте куда ведут ВСЕ 6 качеств ответов:
- [ ] excellent → куда?
- [ ] good → куда?
- [ ] normal → куда?
- [ ] weak → куда?
- [ ] aggressive → куда?
- [ ] fail → куда?

**ВСЕ должны вести куда-то, НЕ в пустоту!**
