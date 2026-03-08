# Архив информации из диалогов (перед удалением)
## Дата: 8 марта 2026

## ВАЖНАЯ ИНФОРМАЦИЯ ДЛЯ СОЗДАНИЯ НОВЫХ ДИАЛОГОВ

### Список всех диалогов (v1-v16)

1. **Scenario 1** - Los Angeles CA → New York NY (2,800 mi)
   - Equipment: Reefer (53ft)
   - Cargo: Fresh produce (avocados, berries)
   - Posted: $7,500 ($2.68/mile), Target: $8,200-8,500
   - Difficulty: hard

2. **Scenario 5** - Chicago IL → Dallas TX (780 mi)
   - Equipment: Dry Van (53ft)
   - Cargo: Retail products
   - Posted: $1,800 ($2.31/mile), Target: $2,000-2,100
   - Difficulty: easy

3. **Scenario 6** - Los Angeles CA → Denver CO (820 mi)
   - Equipment: Reefer (53ft)
   - Cargo: Frozen food
   - Posted: $2,300 ($2.80/mile), Target: $2,550-2,650
   - Difficulty: medium

4. **Scenario 7** - Seattle WA → Miami FL (3,300 mi)
   - Equipment: Dry Van (53ft)
   - Cargo: Electronics
   - Posted: $8,500 ($2.58/mile), Target: $9,200-9,500
   - Difficulty: hard

5. **Scenario 8** - Phoenix AZ → Portland OR (1,200 mi)
   - Equipment: Reefer (53ft)
   - Cargo: Dairy products
   - Posted: $3,200 ($2.67/mile), Target: $3,500-3,700
   - Difficulty: medium

6. **Scenario 9** - Houston TX → Atlanta GA (800 mi)
   - Equipment: Dry Van (53ft)
   - Cargo: Hazmat chemicals
   - Posted: $2,400 ($3.00/mile), Target: $2,600-2,800
   - Difficulty: hard

7. **Scenario 10** - Denver CO → Kansas City MO (600 mi)
   - Equipment: Flatbed (48ft)
   - Cargo: Building materials
   - Posted: $1,500 ($2.50/mile), Target: $1,650-1,750
   - Difficulty: easy

8. **Scenario 11** - Salinas CA → Boston MA (3,000 mi)
   - Equipment: Reefer (53ft)
   - Cargo: Fresh produce (lettuce, broccoli)
   - Posted: $8,000 ($2.67/mile), Target: $8,700-9,000
   - Difficulty: hard

9. **Scenario 12** - Detroit MI → Phoenix AZ (1,900 mi)
   - Equipment: Enclosed Auto Carrier
   - Cargo: Luxury vehicles
   - Posted: $5,500 ($2.89/mile), Target: $6,000-6,300
   - Difficulty: hard

10. **Scenario 13** - Chicago IL → Dallas TX (900 mi)
    - Equipment: Flatbed (48ft)
    - Cargo: Construction materials
    - Posted: $2,200 ($2.44/mile)
    - Difficulty: medium
    - Note: Uses CHECKBOX SYSTEM

11. **Scenario 14** - Atlanta GA → Miami FL (650 mi)
    - Equipment: Dry Van (53ft)
    - Cargo: Food and beverage (non-perishable)
    - Posted: $1,750 ($2.69/mile), Target: $1,900-2,000
    - Difficulty: easy

12. **Scenario 15** - Phoenix AZ → Seattle WA (1,420 mi)
    - Equipment: Reefer (53ft)
    - Cargo: Fresh produce (lettuce, tomatoes)
    - Posted: $3,800 ($2.68/mile), Target: $4,200-4,400
    - Difficulty: medium

13. **Scenario 16** - Dallas TX → Denver CO (780 mi)
    - Equipment: Flatbed (48ft)
    - Cargo: Construction materials (steel beams)
    - Posted: $2,100 ($2.69/mile), Target: $2,300-2,400
    - Difficulty: medium
    - Note: ЭТАЛОН с warning_path системой

## КЛЮЧЕВЫЕ ПАТТЕРНЫ ИЗ ДИАЛОГОВ

### Типы оборудования:
- **Dry Van (53ft)**: Retail, electronics, food/beverage, hazmat
- **Reefer (53ft)**: Produce, frozen food, dairy (34-38°F)
- **Flatbed (48ft)**: Construction materials, steel beams
- **Enclosed Auto Carrier**: Luxury vehicles

### Типы грузов и их особенности:

1. **Fresh Produce (Reefer)**
   - Temperature: 34-38°F constant
   - Требования: Temperature monitoring (GPS + sensors), 4-6 hour readings
   - Insurance: $100K+ cargo (perishable coverage)
   - Premium rates: $2.80-3.10/mile
   - Time-sensitive delivery
   - Weekly loads potential: 6-12 loads

2. **Frozen Food (Reefer)**
   - Temperature: 0°F to -10°F
   - Требования: Temperature monitoring, reefer operational
   - Insurance: $100K+ cargo
   - Premium rates: $2.80-3.20/mile

3. **Dairy Products (Reefer)**
   - Temperature: 34-38°F
   - Требования: Temperature monitoring, quick delivery
   - Insurance: $100K+ cargo
   - Premium rates: $2.70-3.00/mile

4. **Construction Materials (Flatbed)**
   - Требования: Tarps, straps, chains, DOT compliance
   - Insurance: $100K+ cargo
   - Rates: $2.50-3.00/mile
   - Loading/unloading: 3 hours each

5. **Electronics (Dry Van)**
   - Требования: Climate control, security, careful handling
   - Insurance: $250K+ cargo
   - Premium rates: $2.60-3.00/mile

6. **Hazmat Chemicals (Dry Van)**
   - Требования: Hazmat endorsement, placards, special permits
   - Insurance: $1M+ liability
   - Premium rates: $3.00-3.50/mile

7. **Luxury Vehicles (Auto Carrier)**
   - Требования: Enclosed carrier, insurance photos, careful handling
   - Insurance: $500K+ cargo
   - Premium rates: $2.80-3.30/mile

8. **Retail Products (Dry Van)**
   - Требования: Standard dry van, basic insurance
   - Insurance: $100K cargo
   - Standard rates: $2.30-2.70/mile

### Структура торга (Negotiation Pattern):

**Формула успешного торга:**
1. Posted rate (базовая ставка брокера)
2. Your ask (ваш запрос): +$300-$1,000 выше posted
3. Broker counter (встречное предложение): посередине
4. Final rate (финальная ставка): компромисс

**Примеры:**
- Posted $7,500 → Ask $8,500 → Counter $7,900 → Final $8,000 (+$500)
- Posted $3,800 → Ask $4,400 → Counter $4,000 → Final $4,100 (+$300)
- Posted $2,100 → Ask $2,400 → Counter $2,200 → Final $2,250 (+$150)

**Процент прибавки:**
- Easy loads: 5-8% выше posted
- Medium loads: 7-10% выше posted
- Hard loads: 8-15% выше posted

### Broker Questions Pattern (Типичные вопросы брокера):

**Шаг 1: Verification (Проверка компании)**
- "What's your MC?"
- "Where is your truck?"
- "Do you have [equipment type] experience?"

**Шаг 2: Equipment Check (Проверка оборудования)**
- Reefer: "Is unit operational? Temperature range? Last service?"
- Flatbed: "Do you have tarps, straps, chains?"
- Auto Carrier: "Enclosed carrier? Insurance photos?"

**Шаг 3: Load Details (Детали груза)**
- Distance, cargo type, weight
- Pickup/delivery times
- Special requirements

**Шаг 4: Additional Requirements**
- "Loading/unloading time?"
- "Detention pay?"
- "Temperature monitoring?" (для reefer)
- "DOT compliance?" (для flatbed/hazmat)

**Шаг 5: Insurance**
- "Insurance current?"
- "What's coverage amount?"
- "Can you send certificate?"

**Шаг 6: Rate Negotiation**
- "What do you need for [distance] miles?"
- Counter-offers
- Final agreement

**Шаг 7: Factoring**
- "Which factoring?"
- "Send insurance certificate"
- Rate con details

### Quality Levels (Качество ответов):

1. **excellent** - Максимум деталей, профессионализм, энтузиазм
   - MC + company + fleet size + experience + location + equipment status + questions
   - Example: "MC 887766, CrossCountry Reefer, 25 trucks. Reefer in LA at Sysco DC, empty yesterday. Unit serviced 2 weeks ago. Ready 6 AM. Where's pickup?"

2. **good** - Достаточно деталей, профессионализм
   - MC + company + location + equipment + readiness
   - Example: "MC 887766, CrossCountry Reefer. Reefer in LA, empty. Ready 6 AM. What's cargo?"

3. **normal** - Минимум деталей, базовая информация
   - MC + basic info
   - Example: "MC 887766. Reefer in LA. What's load?"

4. **weak** - Неуверенность, мало деталей
   - Vague answers, uncertainty
   - Example: "MC 887766... somewhere in LA... what's cargo?"

5. **aggressive** - Грубость, требования, пренебрежение
   - Rude, demanding, dismissive
   - Example: "Just send pickup address!" or "Why all these questions?"

6. **fail** - Провал, нет информации, непрофессионализм
   - Missing critical info, unprofessional
   - Example: "Reefer available. Details?" (no MC, no location)

### Broker Responses to Quality:

**Excellent answers:**
- Strengthened relationship
- Future loads opportunity (weekly loads)
- Premium rates
- Fast booking

**Good answers:**
- Positive relationship
- Load booked
- Fair rates

**Normal answers:**
- Neutral relationship
- Load booked
- Standard rates

**Weak answers:**
- Uncertain relationship
- May reject at end
- Lower rates

**Aggressive answers:**
- Warning first (warning_path)
- Rejection if continues
- Blacklist possible

**Fail answers:**
- Warning first (warning_path)
- Rejection if no improvement
- Blacklist

### Weekly Loads Potential (Долгосрочные отношения):

**Produce loads:**
- 6-12 loads weekly
- $64,000-96,000/week
- $256,000-384,000/month potential

**Construction loads:**
- 5-7 loads weekly
- $11,250-15,750/week
- $45,000-63,000/month potential

**General freight:**
- 3-5 loads weekly
- $6,000-10,000/week
- $24,000-40,000/month potential

## КРИТИЧЕСКИЕ ПРАВИЛА (из всех диалогов)

### 1. initialMessage Format (ОБЯЗАТЕЛЬНО!)
```javascript
initialMessage: "Good morning/afternoon! This is [Name] from [Company].\nI'm calling about your posted [equipment] load [Route] with [Cargo].\nIs this load still available?"
```

**Ключевые фразы:**
- "I'm calling about your posted load..."
- "I saw your load posting..."
- "Is this load still available?"

### 2. warning_path System (НЕТ ОТКАЗА НА ШАГЕ 1!)

**Плохой ответ на шаге 1 → warning_path (второй шанс)**

```javascript
master: [
    {
        brokerQuestion: "What's your MC?",
        suggestions: [
            { text: "Good answer", quality: "good", path: "master" },
            { text: "Bad answer", quality: "fail", path: "warning_path" }  // НЕ reject!
        ]
    }
]

warning_path: [
    {},
    {
        brokerQuestion: "Professional warning with explanation WHY info is needed",
        dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс!",
        suggestions: [
            { text: "Apology + correct answer", quality: "good", path: "master" },
            { text: "Second bad answer", quality: "fail", path: "reject_early" }
        ]
    }
]
```

### 3. Reject Paths Structure

**Количество элементов = номер шага отказа**

```javascript
reject_early: [{}, {}, { brokerResponse: "...", outcome: {...} }]  // Отказ на шаге 2
reject_mid: [{}, {}, {}, {}, { brokerResponse: "...", outcome: {...} }]  // Отказ на шаге 4
reject_late: [{}, {}, {}, {}, {}, {}, {}, {}, { brokerResponse: "...", outcome: {...} }]  // Отказ на шаге 8
```

### 4. Path Switching Logic

```javascript
// ВСЕГДА проверяем explicit path
const clickedSuggestion = currentPathSteps[conversationStep].suggestions?.find(s => s.text === text);
if (clickedSuggestion && clickedSuggestion.path && clickedSuggestion.path !== currentPath) {
    currentPath = clickedSuggestion.path;
}
```

### 5. Equipment-Specific Requirements

**Reefer:**
- Temperature range (34-38°F for produce, 0°F to -10°F for frozen)
- Last service date
- Fuel level (72+ hours)
- Temperature monitoring (GPS + sensors)
- 4-6 hour readings
- Emergency protocols

**Flatbed:**
- Tarps, straps, chains
- DOT compliance
- Securement certification
- Loading/unloading time (3 hours each)

**Dry Van:**
- Standard equipment
- Climate control (for electronics)
- Hazmat endorsement (for chemicals)

**Auto Carrier:**
- Enclosed carrier
- Insurance photos
- Careful handling procedures

### 6. Insurance Requirements by Cargo Type

- **Standard freight**: $100K cargo
- **Produce/Perishable**: $100K-250K cargo (perishable coverage)
- **Electronics**: $250K+ cargo
- **Hazmat**: $1M+ liability
- **Luxury vehicles**: $500K+ cargo

### 7. Factoring Companies (Examples)

- Triumph Factoring: factoring@triumphbc.com
- RTS Financial: factoring@rtsfin.com
- OTR Capital: factoring@otrcapital.com

## ЭТАЛОННЫЕ ПРИМЕРЫ

### Эталон #1: warning_path (из v16)
```javascript
warning_path: [
    {},
    {
        brokerQuestion: "I understand you're busy, but I need to verify your company for insurance and liability purposes. This is standard procedure for all carriers working with construction materials. Can you please provide your MC number and confirm you have flatbed experience? This is important for both of us.",
        dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Брокер дал второй шанс. Ответьте профессионально с MC и опытом!",
        suggestions: [
            { text: "Sorry for that. MC 445566, SteelRoad Transport. We have 15 flatbed trucks, handle construction materials regularly. Truck in Dallas with tarps and straps. Where's pickup?", quality: "good", analytics: "✔️ Хорошо! Исправился!", path: "master" },
            { text: "MC 445566, SteelRoad Transport. Flatbed in Dallas with equipment.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
            { text: "I don't have MC right now...", quality: "fail", analytics: "❌ ПРОВАЛ! Второй шанс упущен!", path: "reject_early" },
            { text: "Just send me the load info!", quality: "aggressive", analytics: "🔴 Агрессивно! Второй раз!", path: "reject_early" }
        ]
    }
]
```

### Эталон #2: Excellent Answer (из v1)
```javascript
{ 
    text: "Good morning Amanda! CrossCountry Reefer Transport, MC 887766. Yes, we have reefer available - it's at Sysco distribution center in Los Angeles, empty since yesterday evening. Reefer unit operational, last serviced 2 weeks ago. Driver ready for 6 AM pickup tomorrow. What's the cargo and exact pickup address?", 
    quality: "excellent", 
    analytics: "✨ ОТЛИЧНО! Приветствие по имени, MC, компания, точное местоположение (Sysco DC LA), статус (empty yesterday), reefer operational, last service, готовность, вопрос о грузе!", 
    path: "master" 
}
```

### Эталон #3: Successful Outcome (из v15)
```javascript
{
    brokerResponse: "Perfect! Rate con sent to factoring@triumphbc.com. Sign and return. After pickup send BOL, photos, and temp logs. If this goes well, I have 6-8 produce loads weekly Phoenix-Seattle. Good luck!",
    outcome: {
        type: "success",
        quality: "excellent",
        rate: "$4,100",
        ratePerMile: "$2.89/mile",
        relationship: "strengthened",
        dialogueTime: "6-7 min",
        questionsAsked: "Professional",
        detailLevel: "high",
        futureOpportunity: "repeat",
        weeklyLoads: "6-8 produce loads weekly Phoenix-Seattle ($24,600-32,800/week)",
        feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $300 больше ($4,100 vs $3,800 posted).\n\n💡 УРОК: Produce требует reefer, temp monitoring 24/7, time-sensitive delivery. Торг: Posted $3,800 → Вы $4,400 → Встречное $4,000 → Финал $4,100 ($2.89/mile). Заработали $300 = 7.9% прибавка!\n\n🎯 РЕАЛЬНОСТЬ: Produce loads - premium rates ($2.80-3.20/mile). Ваш профессионализм = 6-8 loads weekly ($24,600-32,800/неделю = $98,400-131,200/месяц потенциал)!`
    }
}
```

## ПОЛЕЗНЫЕ ДОКУМЕНТЫ (НЕ УДАЛЯТЬ!)

1. **DIALOGUE-CREATION-GUIDE.md** - Полное руководство по созданию диалогов
2. **DEVELOPMENT-RULES-AND-CHANGES.md** - Все правила и история изменений
3. **TASK-COMPLETION-STATUS.md** - Статус выполнения задач
4. **slot-machine-improved-v2.js** - Улучшенная анимация слот-машины

## ФАЙЛЫ ДЛЯ УДАЛЕНИЯ

Локально удалить (уже в git):
- pages/scenarios-data-v1.js
- pages/scenarios-data-v5.js
- pages/scenarios-data-v6.js
- pages/scenarios-data-v7.js
- pages/scenarios-data-v8.js
- pages/scenarios-data-v9.js
- pages/scenarios-data-v10.js
- pages/scenarios-data-v11.js
- pages/scenarios-data-v12.js
- pages/scenarios-data-v13.js
- pages/scenarios-data-v14.js
- pages/scenarios-data-v15.js
- pages/scenarios-data-v16.js

## ПРИМЕЧАНИЯ

- Все диалоги уже сохранены в git и задеплоены на сайт
- Эта информация сохранена для создания новых диалогов
- При создании новых диалогов используйте v16 как эталон (с warning_path)
- Всегда следуйте правилам из DIALOGUE-CREATION-GUIDE.md
