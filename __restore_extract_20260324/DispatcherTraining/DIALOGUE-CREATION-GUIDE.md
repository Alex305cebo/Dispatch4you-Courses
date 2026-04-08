# ПОЛНОЕ РУКОВОДСТВО ПО СОЗДАНИЮ ДИАЛОГОВ

## БАЗОВАЯ ЛОГИКА (КРИТИЧЕСКИ ВАЖНО!)

### Роли и сценарий:
1. **БРОКЕР** размещает груз на loadboard (DAT, Truckstop, etc.)
2. **ДИСПЕТЧЕР** видит груз и ЗВОНИТ брокеру
3. **ДИСПЕТЧЕР** представляется и спрашивает о грузе
4. **БРОКЕР** отвечает и задает вопросы для проверки

### Структура диалога:
```
ДИСПЕТЧЕР → звонит → БРОКЕР
ДИСПЕТЧЕР: "I'm calling about your posted load..."
БРОКЕР: "Yes, available. What's your MC?"
ДИСПЕТЧЕР: отвечает
БРОКЕР: задает следующий вопрос
... и так далее
```

## ШАБЛОН СОЗДАНИЯ НОВОГО ДИАЛОГА

### 1. Базовая информация

```javascript
const scenarioXX = {
    id: XX,  // Номер по порядку
    route: "City A State → City B State",  // Маршрут
    distance: XXXX,  // Мили
    equipment: "Type (size)",  // Dry Van (53ft), Reefer (53ft), Flatbed (48ft)
    cargo: "Description",  // Что везем
    weight: "XX,000 lbs",  // Вес
    postedRate: "$X,XXX ($X.XX/mile)",  // Posted rate
    deadline: "Pickup ... Delivery ...",  // Сроки
    brokerStyle: "Professional ... broker",  // Стиль брокера
    difficulty: "easy/medium/hard",  // Сложность
    
    // КРИТИЧЕСКИ ВАЖНО: Правильный initialMessage!
    initialMessage: "Good morning/afternoon! This is [Name] from [Company].\nI'm calling about your posted load [Route] with [Cargo].\nIs this load still available?",
    
    paths: { ... }
};
```

### 2. Правильный initialMessage (ОБЯЗАТЕЛЬНО!)

**ПРАВИЛЬНЫЕ ВАРИАНТЫ ✅:**

```javascript
// Вариант 1 (полный):
initialMessage: "Good morning! This is Sarah from ColdChain Transport.\nI'm calling about your posted reefer load Phoenix to Seattle with produce.\nIs this load still available?"

// Вариант 2 (короткий):
initialMessage: "Good afternoon! This is Mike from SteelRoad Logistics.\nI saw your load posting for Dallas to Denver with construction materials.\nIs it still available?"

// Вариант 3 (очень короткий):
initialMessage: "Hi! This is Jennifer from FastFreight.\nCalling about the dry van load Atlanta to Miami you posted.\nStill available?"
```

**НЕПРАВИЛЬНЫЕ ВАРИАНТЫ ❌:**

```javascript
// НЕПРАВИЛЬНО - диспетчер предлагает груз:
initialMessage: "I have a load Dallas to Denver. Is your truck available?"

// НЕПРАВИЛЬНО - брокер предлагает груз:
initialMessage: "I have a reefer load Phoenix to Seattle. Do you have available reefer?"

// НЕПРАВИЛЬНО - нет упоминания о posted load:
initialMessage: "Do you have a truck available for Phoenix to Seattle?"
```

**КЛЮЧЕВЫЕ ФРАЗЫ (использовать обязательно):**
- "I'm calling about your posted load..."
- "I saw your load posting..."
- "Calling about the [equipment] load you posted..."
- "Is this load still available?"
- "Is it still available?"
- "Still available?"

### 3. Структура путей

**ОБЯЗАТЕЛЬНЫЕ ПУТИ:**
- `master` - основной путь (отличные/хорошие ответы)
- `warning_path` - путь предупреждения (второй шанс после плохого ответа на шаге 1)
- `reject_early` - ранний отказ (шаг 2-3)
- `reject_mid` - средний отказ (шаг 4-6)
- `reject_late` - поздний отказ (шаг 7-9)
- `weak` - слабые ответы (отказ в конце)

### 4. КРИТИЧЕСКОЕ ПРАВИЛО: НЕТ ОТКАЗА НА ШАГЕ 1!

**Плохой ответ на шаге 1 → warning_path (второй шанс)**

```javascript
master: [
    {
        brokerQuestion: "Yes, available. What's your MC?",
        dispatcherPrompt: "💎 Брокер проверяет компанию...",
        suggestions: [
            { text: "MC 123456, ABC Transport...", quality: "excellent", path: "master" },
            { text: "Good answer", quality: "good", path: "master" },
            { text: "Normal answer", quality: "normal", path: "master" },
            { text: "Weak answer", quality: "weak", path: "weak" },
            // ПЛОХИЕ ОТВЕТЫ → warning_path (НЕ reject!)
            { text: "Why you need MC?", quality: "aggressive", path: "warning_path" },
            { text: "Hi, available?", quality: "fail", path: "warning_path" }
        ]
    },
    // ... остальные шаги
]
```

**warning_path - Брокер дает второй шанс:**

```javascript
warning_path: [
    {},  // Пропускаем шаг 0
    {
        brokerQuestion: "I need to verify your company for insurance and liability purposes. This is standard procedure for all carriers. Can you please provide your MC number? This is important for both of us.",
        dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Брокер дал второй шанс. Ответьте профессионально!",
        suggestions: [
            { text: "Sorry. MC 123456, ABC Transport...", quality: "good", path: "master" },
            { text: "MC 123456, ABC Transport.", quality: "normal", path: "master" },
            // Второй плохой ответ → ТОГДА reject!
            { text: "I don't have it...", quality: "fail", path: "reject_early" },
            { text: "Just send load info!", quality: "aggressive", path: "reject_early" }
        ]
    }
]
```

**Элементы предупреждения брокера:**
- ✅ Объясняет ПОЧЕМУ нужна информация (insurance, liability, DOT, etc.)
- ✅ Упоминает стандартную процедуру
- ✅ Просит ответить правильно
- ✅ Подчеркивает важность для обеих сторон
- ✅ Профессиональный тон (не агрессивный!)

### 5. Структура reject путей (количество элементов)

```javascript
// reject_early - отказ на шаге 2 (после warning_path)
reject_early: [
    {},
    {},
    { brokerResponse: "I need professional carrier. Thanks.", outcome: {...} }
]

// reject_mid - отказ на шаге 4
reject_mid: [
    {},
    {},
    {},
    {},
    { brokerResponse: "I need carrier with proper equipment. Thanks.", outcome: {...} }
]

// reject_late - отказ на шаге 8
reject_late: [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    { brokerResponse: "That doesn't work for me. Thanks.", outcome: {...} }
]

// weak - отказ на шаге 9 (после всех слабых ответов)
weak: [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    { brokerQuestion: "Factoring?", dispatcherPrompt: "💎 Factoring.", suggestions: [...] },
    {},
    { brokerResponse: "Thanks, but I need more confident carrier.", outcome: {...} }
]
```

**ПРАВИЛО:** Количество `{}` = номер шага где происходит отказ

### 6. Качество ответов (quality)

- `excellent` - отличный ответ (максимум деталей, профессионализм)
- `good` - хороший ответ (достаточно деталей)
- `normal` - нормальный ответ (минимум деталей)
- `weak` - слабый ответ (неуверенность, мало деталей)
- `aggressive` - агрессивный ответ (грубость, требования)
- `fail` - провал (нет информации, непрофессионализм)

### 7. Пример полного диалога

```javascript
const scenario17 = {
    id: 17,
    route: "Houston TX → Chicago IL",
    distance: 1080,
    equipment: "Dry Van (53ft)",
    cargo: "General freight",
    weight: "40,000 lbs",
    postedRate: "$2,800 ($2.59/mile)",
    deadline: "Pickup tomorrow 8 AM, Delivery in 3 days",
    brokerStyle: "Professional general freight broker",
    difficulty: "easy",
    
    // ПРАВИЛЬНЫЙ initialMessage!
    initialMessage: "Good morning! This is Alex from RoadRunner Transport.\nI'm calling about your posted dry van load Houston to Chicago.\nIs this load still available?",
    
    paths: {
        master: [
            {
                brokerQuestion: "Good morning! This is John from FreightPro.\nYes, available.\nWhat's your MC?",
                dispatcherPrompt: "💎 Брокер проверяет компанию. Дайте: MC, компания, опыт!",
                suggestions: [
                    { text: "Good morning John! MC 778899, RoadRunner Transport. We're a 20-truck fleet handling general freight regularly. Truck in Houston, empty. Ready for 8 AM pickup. Where's pickup?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Morning! MC 778899, RoadRunner Transport. We handle general freight. Truck in Houston. Ready 8 AM.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "MC 778899, RoadRunner Transport. Truck in Houston.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 778899... truck somewhere in Houston...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Why you need MC? Just give rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_path" },
                    { text: "Hi, available?", quality: "fail", analytics: "❌ Провал!", path: "warning_path" }
                ]
            },
            // ... остальные шаги master пути
        ],
        
        warning_path: [
            {},
            {
                brokerQuestion: "I need to verify your company for insurance purposes. This is standard procedure. Can you please provide your MC number?",
                dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс!",
                suggestions: [
                    { text: "Sorry. MC 778899, RoadRunner Transport. Truck in Houston, ready 8 AM.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 778899, RoadRunner Transport.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I don't have MC...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" },
                    { text: "Just send load info!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_early" }
                ]
            }
        ],
        
        reject_early: [
            {},
            {},
            {
                brokerResponse: "I need professional carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Непрофессионализм даже после предупреждения!"
                }
            }
        ],
        
        // ... остальные пути
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario17);
    console.log('✅ Scenario 17 added');
} else {
    console.warn('⚠️ allScenarios not found');
}
```

## ЧЕКЛИСТ ПЕРЕД СОЗДАНИЕМ

- [ ] Проверил что initialMessage правильный (диспетчер звонит о posted load)
- [ ] Добавил warning_path для первого плохого ответа
- [ ] Проверил что НЕТ отказа на шаге 1
- [ ] Проверил количество `{}` в каждом reject пути
- [ ] Добавил профессиональное предупреждение в warning_path
- [ ] Проверил что все suggestions имеют path
- [ ] Добавил `<script src="scenarios-data-vXX.js"></script>` в simulator.html

## ЧАСТЫЕ ОШИБКИ

❌ **Ошибка 1:** Диспетчер предлагает груз
```javascript
initialMessage: "I have a load... Is your truck available?"
```

✅ **Правильно:**
```javascript
initialMessage: "I'm calling about your posted load... Is it still available?"
```

❌ **Ошибка 2:** Отказ на первом шаге
```javascript
{ text: "Hi, available?", quality: "fail", path: "reject_early" }
```

✅ **Правильно:**
```javascript
{ text: "Hi, available?", quality: "fail", path: "warning_path" }
```

❌ **Ошибка 3:** Неправильное количество элементов в reject пути
```javascript
// Отказ на шаге 3, но только 2 элемента:
reject_early: [{}, { brokerResponse: "...", outcome: {...} }]
```

✅ **Правильно:**
```javascript
// Отказ на шаге 3 = 3 элемента:
reject_early: [{}, {}, { brokerResponse: "...", outcome: {...} }]
```

## СОХРАНЕНИЕ И ПОДКЛЮЧЕНИЕ

1. Создать файл `pages/scenarios-data-vXX.js`
2. **ОБЯЗАТЕЛЬНО** добавить в `pages/simulator.html`:
   ```html
   <script src="scenarios-data-vXX.js"></script>
   ```
3. Проверить в консоли браузера:
   ```
   ✅ Scenario XX added
   ```
4. Протестировать все пути диалога

## ДАТА СОЗДАНИЯ РУКОВОДСТВА
8 марта 2026

## ИСТОРИЯ ОБНОВЛЕНИЙ
- **8 марта 2026 (вечер):** Исправлены initialMessage в существующих диалогах v1, v13, v15 - теперь все следуют правильной логике (диспетчер звонит о posted грузе брокера)
