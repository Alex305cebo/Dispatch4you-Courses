# Bugfix Design Document

## Overview

Этот документ описывает техническое решение для исправления бага с тупиками в диалогах симулятора. Проблема возникает из-за несинхронизированных путей - когда диспетчер выбирает слабый ответ на шаге N, он попадает в промежуточный reject путь, который начинается с шага 1 вместо финального outcome.

## Root Cause Analysis

### Текущая проблема

В некоторых диалогах (например, scenarios-data-v17.js, v18.js, v19.js) существуют промежуточные reject пути:

```javascript
paths: {
    master: [
        { brokerQuestion: "...", suggestions: [...] },  // ШАГ 1
        { brokerQuestion: "...", suggestions: [...] },  // ШАГ 2
        // ... шаги 3-14
    ],
    
    // ❌ ПРОБЛЕМА: Промежуточный путь с несколькими шагами
    weak: [
        { brokerQuestion: "...", suggestions: [...] },  // ШАГ 1 weak пути
        { brokerQuestion: "...", suggestions: [...] }   // ШАГ 2 weak пути
    ],
    
    // ❌ ПРОБЛЕМА: Путь без суффикса _final
    reject_attitude: [
        { brokerResponse: "...", outcome: {...} }
    ]
}
```

**Что происходит:**
1. Диспетчер на шаге 5 master пути выбирает вариант 4 (weak)
2. Система направляет в `path: "weak"`
3. Диспетчер попадает на ШАГ 1 weak пути (не на шаг 5!)
4. Брокер задает вопрос шага 1 вместо финального ответа
5. ТУПИК: несинхронизация между путями

### Правильная структура

В scenarios-data-v20.js используется правильная структура:

```javascript
paths: {
    master: [
        { brokerQuestion: "...", suggestions: [...] },  // ШАГ 1
        { brokerQuestion: "...", suggestions: [...] },  // ШАГ 2
        // ... шаги 3-14
    ],
    
    // ✅ ПРАВИЛЬНО: Только финальные outcomes
    reject_weak_final: [
        { brokerResponse: "...", outcome: { type: "failure", ... } }
    ],
    
    reject_attitude_final: [
        { brokerResponse: "...", outcome: { type: "failure", ... } }
    ],
    
    reject_nomc_final: [
        { brokerResponse: "...", outcome: { type: "failure", ... } }
    ]
    // ... другие reject_*_final пути
}
```

## Design Solution

### Архитектура путей

```
DIALOGUE STRUCTURE
│
├── master path (единственный путь с несколькими шагами)
│   ├── Step 1: MC, company, fleet
│   ├── Step 2: Location, equipment
│   ├── Step 3: Driver experience, DOT
│   ├── Step 4: Insurance
│   ├── Step 5: Tracking, communication
│   ├── Step 6: Appointment, backup plan
│   ├── Step 7: Equipment, inspection
│   ├── Step 8: Specific cargo question
│   ├── Step 9: References
│   ├── Step 10: Detention, payment
│   ├── Step 11: FSC, emergency contacts
│   ├── Step 12: Backup truck, claims
│   ├── Step 13: Negotiation - first offer
│   ├── Step 14: Negotiation - counter offer
│   ├── Step 15: Negotiation - final offer
│   ├── Step 16: Email
│   └── Step 17: SUCCESS outcome
│
└── reject paths (только финальные outcomes)
    ├── reject_weak_final → outcome
    ├── reject_attitude_final → outcome
    ├── reject_nomc_final → outcome
    ├── reject_timing_final → outcome
    ├── reject_experience_final → outcome
    ├── reject_insurance_final → outcome
    ├── reject_communication_final → outcome
    ├── reject_commitment_final → outcome
    ├── reject_equipment_final → outcome
    ├── reject_specific_final → outcome
    ├── reject_references_final → outcome
    ├── reject_terms_final → outcome
    ├── reject_backup_final → outcome
    ├── reject_ultimatum_final → outcome
    └── reject_email_final → outcome
```

### Правила создания путей

#### ПРАВИЛО #1: Типы путей

1. **master** - единственный путь с несколькими шагами (15-17 шагов)
2. **reject_*_final** - множество путей с ОДНИМ элементом (только outcome)

#### ПРАВИЛО #2: Структура шага master пути

```javascript
{
    brokerQuestion: "Вопрос брокера",
    dispatcherPrompt: "💎 Подсказка что спрашивает брокер",
    suggestions: [
        // Варианты 1-3: ведут в следующий шаг master
        { 
            text: "Детальный ответ", 
            quality: "excellent", 
            analytics: "✨ Что сделал хорошо", 
            path: "master" 
        },
        { 
            text: "Хороший ответ", 
            quality: "good", 
            analytics: "✔️ Что сделал", 
            path: "master" 
        },
        { 
            text: "Нормальный ответ", 
            quality: "normal", 
            analytics: "⚪ Что сделал", 
            path: "master" 
        },
        
        // Варианты 4-6: ведут СРАЗУ в финальный reject
        { 
            text: "Слабый ответ", 
            quality: "weak", 
            analytics: "⚠️ Почему слабо", 
            path: "reject_weak_final" 
        },
        { 
            text: "Грубый ответ", 
            quality: "aggressive", 
            analytics: "🔴 Почему плохо", 
            path: "reject_attitude_final" 
        },
        { 
            text: "Неправильный ответ", 
            quality: "fail", 
            analytics: "❌ Почему провал", 
            path: "reject_specific_final" 
        }
    ]
}
```

#### ПРАВИЛО #3: Структура reject пути

```javascript
reject_weak_final: [
    {
        brokerResponse: "I appreciate your interest, but I need a more confident carrier for this load. Thanks anyway.",
        outcome: {
            type: "failure",
            quality: "fail",
            rate: "$0",
            feedback: "❌ ОТКАЗ: Неуверенность в ответах показала недостаток опыта или подготовки."
        }
    }
]
```

### Validation Rules

#### Проверка перед созданием диалога

1. ✅ Все варианты 1-3 (excellent/good/normal) ведут в `path: "master"`
2. ✅ Все варианты 4-6 (weak/aggressive/fail) ведут в `path: "reject_*_final"`
3. ✅ Каждый reject_*_final путь существует в объекте paths
4. ✅ Каждый reject_*_final путь содержит только ОДИН элемент с outcome
5. ✅ Нет путей без суффикса _final (кроме master)
6. ✅ В master пути 15-17 шагов

#### Запрещенные паттерны

❌ **НЕ СОЗДАВАТЬ:**
- Промежуточные пути: `weak`, `warning`, `reject_attitude` (без _final)
- Пути с несколькими шагами кроме master
- Пути которые не существуют в объекте paths
- Варианты с path который не определен

## Implementation Plan

### Фаза 1: Создание validation утилиты

Создать файл `pages/validate-dialogue.js` с функциями проверки:

```javascript
function validateDialogue(scenario) {
    const errors = [];
    
    // Проверка 1: master путь существует
    if (!scenario.paths.master) {
        errors.push("Missing master path");
    }
    
    // Проверка 2: master путь имеет 15-17 шагов
    if (scenario.paths.master && 
        (scenario.paths.master.length < 15 || scenario.paths.master.length > 17)) {
        errors.push(`Master path has ${scenario.paths.master.length} steps, expected 15-17`);
    }
    
    // Проверка 3: все suggestions в master ведут в существующие пути
    scenario.paths.master?.forEach((step, stepIndex) => {
        step.suggestions?.forEach((suggestion, suggIndex) => {
            if (!scenario.paths[suggestion.path]) {
                errors.push(`Step ${stepIndex + 1}, suggestion ${suggIndex + 1}: path "${suggestion.path}" does not exist`);
            }
        });
    });
    
    // Проверка 4: варианты 1-3 ведут в master
    scenario.paths.master?.forEach((step, stepIndex) => {
        const suggestions = step.suggestions || [];
        if (suggestions[0] && suggestions[0].path !== "master") {
            errors.push(`Step ${stepIndex + 1}, suggestion 1 (excellent): should lead to "master", got "${suggestions[0].path}"`);
        }
        if (suggestions[1] && suggestions[1].path !== "master") {
            errors.push(`Step ${stepIndex + 1}, suggestion 2 (good): should lead to "master", got "${suggestions[1].path}"`);
        }
        if (suggestions[2] && suggestions[2].path !== "master") {
            errors.push(`Step ${stepIndex + 1}, suggestion 3 (normal): should lead to "master", got "${suggestions[2].path}"`);
        }
    });
    
    // Проверка 5: варианты 4-6 ведут в reject_*_final
    scenario.paths.master?.forEach((step, stepIndex) => {
        const suggestions = step.suggestions || [];
        [3, 4, 5].forEach(i => {
            if (suggestions[i] && !suggestions[i].path.endsWith("_final")) {
                errors.push(`Step ${stepIndex + 1}, suggestion ${i + 1}: should lead to reject_*_final path, got "${suggestions[i].path}"`);
            }
        });
    });
    
    // Проверка 6: все reject пути имеют суффикс _final
    Object.keys(scenario.paths).forEach(pathName => {
        if (pathName !== "master" && !pathName.endsWith("_final")) {
            errors.push(`Path "${pathName}" should end with "_final"`);
        }
    });
    
    // Проверка 7: все reject_*_final пути содержат только один элемент
    Object.keys(scenario.paths).forEach(pathName => {
        if (pathName.endsWith("_final")) {
            const path = scenario.paths[pathName];
            if (path.length !== 1) {
                errors.push(`Path "${pathName}" should have exactly 1 element, got ${path.length}`);
            }
            if (path[0] && !path[0].outcome) {
                errors.push(`Path "${pathName}" should have outcome in first element`);
            }
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}
```

### Фаза 2: Исправление существующих диалогов

Проверить и исправить диалоги в файлах:
- scenarios-data-v17.js
- scenarios-data-v18.js
- scenarios-data-v19.js

Для каждого диалога:
1. Запустить validation
2. Найти промежуточные reject пути
3. Преобразовать в reject_*_final с одним outcome
4. Обновить все path в suggestions

### Фаза 3: Создание template для новых диалогов

Создать файл `pages/dialogue-template.js` с шаблоном правильной структуры:

```javascript
const dialogueTemplate = {
    id: XX,
    route: "City A → City B",
    distance: XXXX,
    equipment: "Type (size)",
    cargo: "Cargo description",
    weight: "XX,000 lbs",
    postedRate: "$X,XXX ($X.XX/mile)",
    deadline: "Pickup time, Delivery time",
    brokerStyle: "Broker personality",
    difficulty: "easy/medium/hard",
    initialMessage: "Greeting message",

    paths: {
        master: [
            // 15-17 шагов с 6 вариантами каждый
        ],
        
        // Только финальные reject пути
        reject_weak_final: [
            { brokerResponse: "...", outcome: {...} }
        ],
        reject_attitude_final: [
            { brokerResponse: "...", outcome: {...} }
        ],
        // ... другие reject_*_final
    }
};
```

### Фаза 4: Документация

Обновить или создать документацию:
1. DIALOGUE-CREATION-SPEC.md - спецификация создания диалогов
2. README для разработчиков с правилами
3. Примеры правильных и неправильных структур

## Testing Strategy

### Unit Tests

Тестировать validation функции:
```javascript
// Test 1: Valid dialogue passes
const validDialogue = scenario20;
assert(validateDialogue(validDialogue).valid === true);

// Test 2: Missing master path fails
const noMaster = { paths: {} };
assert(validateDialogue(noMaster).valid === false);

// Test 3: Intermediate reject path fails
const badDialogue = {
    paths: {
        master: [{ suggestions: [{ path: "weak" }] }],
        weak: [{ brokerQuestion: "..." }, { brokerQuestion: "..." }]
    }
};
assert(validateDialogue(badDialogue).valid === false);
```

### Integration Tests

Тестировать в симуляторе:
1. Загрузить диалог
2. На каждом шаге master пути выбрать вариант 4 (weak)
3. Проверить что брокер дает финальный ответ (не задает новый вопрос)
4. Проверить что outcome отображается корректно

### Manual Testing Checklist

Для каждого диалога:
- [ ] Выбрать вариант 1 на шаге 1 → переход на шаг 2
- [ ] Выбрать вариант 4 на шаге 1 → финальный outcome
- [ ] Выбрать вариант 5 на шаге 5 → финальный outcome
- [ ] Выбрать вариант 6 на шаге 10 → финальный outcome
- [ ] Пройти весь master путь → success outcome
- [ ] Проверить что нет тупиков

## Files to Modify

### Новые файлы

1. `pages/validate-dialogue.js` - validation утилита
2. `pages/dialogue-template.js` - шаблон для новых диалогов
3. `pages/DIALOGUE-CREATION-SPEC.md` - спецификация (если не существует)

### Файлы для исправления

1. `pages/scenarios-data-v17.js` - исправить промежуточные пути
2. `pages/scenarios-data-v18.js` - исправить промежуточные пути
3. `pages/scenarios-data-v19.js` - исправить промежуточные пути

### Файлы для reference

1. `pages/scenarios-data-v20.js` - правильная структура (не трогать!)

## Success Criteria

### Критерии успеха

1. ✅ Все существующие диалоги проходят validation
2. ✅ Нет промежуточных reject путей (только reject_*_final)
3. ✅ Все варианты 1-3 ведут в master
4. ✅ Все варианты 4-6 ведут в reject_*_final
5. ✅ При выборе любого варианта 4-6 на любом шаге брокер дает финальный ответ
6. ✅ Нет тупиков в симуляторе
7. ✅ Создан template для новых диалогов
8. ✅ Создана validation утилита

### Regression Prevention

Убедиться что НЕ сломалось:
1. ✅ Варианты 1-3 продолжают вести на следующий шаг master
2. ✅ Success outcome работает при прохождении всего master пути
3. ✅ Существующие правильные диалоги (v20) работают как раньше
4. ✅ UI симулятора корректно отображает все пути

## Risk Analysis

### Риски

1. **Риск:** Изменение существующих диалогов может сломать сохраненный прогресс пользователей
   **Митигация:** Создать новые версии файлов (v21, v22, v23) вместо изменения существующих

2. **Риск:** Validation может быть слишком строгой и блокировать валидные кейсы
   **Митигация:** Тестировать validation на scenarios-data-v20.js (известно правильный)

3. **Риск:** Разработчики могут забыть использовать validation
   **Митигация:** Добавить автоматическую проверку при загрузке диалога в симулятор

## Implementation Order

### Порядок выполнения

1. **Task 1:** Создать validation утилиту (validate-dialogue.js)
2. **Task 2:** Протестировать validation на scenarios-data-v20.js
3. **Task 3:** Запустить validation на v17, v18, v19 и найти ошибки
4. **Task 4:** Исправить диалог #17 (создать v21)
5. **Task 5:** Исправить диалог #18 (создать v22)
6. **Task 6:** Исправить диалог #19 (создать v23)
7. **Task 7:** Создать dialogue-template.js
8. **Task 8:** Создать DIALOGUE-CREATION-SPEC.md (если не существует)
9. **Task 9:** Обновить simulator.html для загрузки исправленных версий
10. **Task 10:** Manual testing всех диалогов

## Notes

### Важные замечания

1. Файл scenarios-data-v20.js является эталоном правильной структуры - НЕ ТРОГАТЬ!
2. Все новые диалоги должны следовать структуре v20
3. Validation должна быть запущена перед добавлением нового диалога
4. Суффикс _final обязателен для всех reject путей
5. Master путь - единственный путь с несколькими шагами
