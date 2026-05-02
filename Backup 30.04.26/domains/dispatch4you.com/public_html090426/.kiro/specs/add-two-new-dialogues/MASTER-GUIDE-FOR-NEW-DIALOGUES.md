# 📚 МАСТЕР-ГАЙД: Создание новых диалогов

## Дата создания: 2026-03-07
## Версия: 2.0 FINAL

---

## 🎯 ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА (STRICT RULES)

### ВАЖНО: Отображение результатов

**Результаты диалога (outcome) показываются в специальной карточке, а НЕ как сообщение брокера!**

- Статистика отображается графически (карточки с иконками)
- Weekly loads в отдельном зеленом блоке
- Feedback в отдельном блоке без подписи "(Broker)"
- Брокер НЕ пишет длинные сообщения со статистикой

### ВАЖНО: Имена персонажей

**Имена ОБЯЗАТЕЛЬНО должны совпадать в тексте и в UI!**

- Имя диспетчера извлекается из `initialMessage`
- Имя брокера извлекается из первого `brokerQuestion`
- Формат: "This is [NAME] from [COMPANY]"
- Имя должно быть в ПЕРВОМ сообщении брокера!

**Пример:**
```javascript
initialMessage: "Good morning! This is Maria Garcia from Texas Freight..."
// UI покажет: Maria (Dispatcher)

paths: {
    master: [
        { brokerQuestion: "Good afternoon! This is Rachel from FurnitureFreight Brokers..."
        // UI покажет: Rachel (Broker) ✅
```

### 1. Структура диалога

**14 ШАГОВ (или 10 для сложных грузов):**

#### Блок 1: Введение (3 шага)
- Шаг 1: MC verification + представление
- Шаг 2: Местоположение truck/equipment
- Шаг 3: Подтверждение основных деталей груза

#### Блок 2: Детали груза (2 шага)
- Шаг 4: Requirements (оборудование, handling)
- Шаг 5: Страховка

#### Блок 3: Торг за цену (4 шага) ⭐ ГЛАВНОЕ!
- Шаг 6: Брокер спрашивает цену - ДИСПЕТЧЕР НАЗЫВАЕТ ПЕРВЫМ
- Шаг 7: Брокер дает встречное предложение
- Шаг 8: Финальное предложение + detention/layover
- Шаг 9: Factoring email

#### Блок 4: Финализация (3 шага)
- Шаг 10: Pickup details + вопросы
- Шаг 11: Delivery details + вопросы (опционально)
- Шаг 12: Финальное резюме + благодарность

### 2. Имена и персонажи

**initialMessage ОБЯЗАТЕЛЬНО включает:**
```javascript
initialMessage: "Good morning! This is [DISPATCHER NAME] from [COMPANY NAME].\nI saw your load posting for [route] [cargo type].\nIs this load still available?"
```

**Примеры имен:**
- Dry Van: Tom Wilson, Robert Johnson, Michael Brown, Maria Garcia
- Reefer: David Martinez, James Rodriguez, Sarah Chen
- Hazmat: Kevin Anderson
- Auto: Jennifer Williams

**Брокеры:**
- Разные имена для каждого диалога
- Профессиональные: Mike, Lisa, Jennifer, Carlos, Amanda, Rachel, Sarah, David

### 3. dispatcherPrompt - ОБУЧАЮЩИЙ ФОРМАТ

**ОБЯЗАТЕЛЬНАЯ СТРУКТУРА:**

```
💎 [КОНТЕКСТ - что происходит]. [ЧТО СКАЗАТЬ - конкретные элементы]. [КАК СКАЗАТЬ - структура]. [ПОЧЕМУ - важность]!
```

**Примеры по шагам:**

#### Шаг 1 - Представление:
```
💎 Брокер проверяет вашу компанию. Представьтесь: MC номер, название компании, размер флота, специализация ([тип груза]). Укажите где [equipment] сейчас. Чем больше деталей - тем профессиональнее!
```

#### Шаг 2 - Местоположение:
```
💎 Брокер хочет знать местоположение водителя. Дайте ТОЧНЫЙ адрес или landmark (truck stop, warehouse, distribution center), статус (empty/loaded), когда освободился. Точность = профессионализм!
```

#### Шаг 3 - Детали груза:
```
💎 Брокер дал детали груза. Подтвердите: расстояние ([X] mi), [специфика груза], pickup ([время]), delivery ([срок]). Дайте ETA. Спросите о special requirements ([что именно]). Вопросы = профессионализм!
```

#### Шаг 4 - Оборудование:
```
💎 Брокер назвал requirements: [список оборудования]. Подтвердите что у вас есть [оборудование]. Упомяните опыт водителя с [тип груза]. Готовность оборудования = получите груз!
```

#### Шаг 5 - Страховка:
```
💎 Брокер проверяет страховку [для типа груза]. Назовите: сумму покрытия ($[X]K+), страховую компанию, срок действия [+ специфика]. Предложите отправить certificate сразу. Страховка = доверие!
```

#### Шаг 6 - ТОРГ ЗА ЦЕНУ:
```
💎 ТОРГ ЗА ЦЕНУ! Брокер спрашивает ВАШУ цену. Назовите цену ПЕРВЫМ! Posted rate $[X] - просите $[Y]-[Z] ($[rate]/mile). [Тип груза] платит [больше/стандарт]! Обоснуйте: [специфика груза, оборудование, опыт]. Чем больше просите - тем больше заработаете!
```

#### Шаг 7 - Встречное предложение:
```
💎 Брокер дал встречное предложение $[X] (вы просили $[Y]). Варианты: 1) Встречное $[Z] посередине, 2) Принять $[X] + добавить условие (detention), 3) Принять $[X]. НЕ стойте на $[Y] - потеряете груз!
```

#### Шаг 8 - ФИНАЛ:
```
💎 ФИНАЛЬНОЕ ПРЕДЛОЖЕНИЕ! Брокер дал $[X] (вы просили $[Y], posted $[Z]). Вы заработали $[N] больше! [+ дополнительные условия]. Это ПОСЛЕДНИЙ шанс - принимайте! Скажите 'Deal!' и спросите про factoring. НЕ торгуйтесь дальше!
```

#### Шаг 9 - Factoring:
```
💎 Брокер финализирует rate и спрашивает про factoring. Дайте: название factoring компании + email адрес. Предложите отправить insurance certificate сразу. Быстрый ответ = профессионализм!
```

#### Шаг 10 - Pickup:
```
💎 Брокер дал pickup детали [для типа груза]. Задайте ВАЖНЫЕ вопросы: сколько времени loading, [специфические вопросы по типу груза], нужно ли звонить перед arrival, [safety/handling procedures]. Вопросы = профессионализм!
```

#### Шаг 11 - Delivery (опционально):
```
💎 Брокер дал loading информацию ([детали]). Спросите о delivery: полный адрес, контакт, time window, сколько времени unloading, звонить ли заранее, [специфические требования]. Детали = успех!
```

#### Шаг 12 - УСПЕХ:
```
💎 УСПЕХ! Брокер отправил Rate Con и предлагает [X]-[Y] [тип] loads weekly! Поблагодарите профессионально, подтвердите что подпишете rate con, отправите BOL/photos [+ специфика]. Выразите интерес к будущим грузам. Хорошие отношения = постоянные грузы!
```

### 4. analytics - ИНФОРМАТИВНЫЙ ФОРМАТ

**ОБЯЗАТЕЛЬНАЯ СТРУКТУРА:**

```javascript
analytics: "[Emoji] [Оценка]! [Конкретика - что именно сделано]. [Детали]. [Последствия]."
```

**Примеры:**

#### Excellent (✨):
```javascript
analytics: "✨ Отлично! MC, компания, размер флота, специализация, местоположение, готовность - полная информация!"
```

#### Good (✔️):
```javascript
analytics: "✔️ Хорошо! Точное местоположение (O'Hare), статус (empty), время, готовность."
```

#### Normal (⚪):
```javascript
analytics: "⚪ Нормально. Базовая информация, но неточное местоположение."
```

#### Weak (⚠️):
```javascript
analytics: "⚠️ Слабо. Очень неточное местоположение, нет уверенности."
```

#### Aggressive (🔴):
```javascript
analytics: "🔴 Агрессивно! Грубость, нет профессионализма."
```

#### Fail (❌):
```javascript
analytics: "❌ Провал! Не представился, не дал MC номер."
```

### 5. Формула торга (КРИТИЧЕСКИ ВАЖНО!)

**Диспетчер называет цену ПЕРВЫМ!**

```
Posted Rate → Dispatcher Request → Broker Counter → Final
```

**Формула качества:**
- **Excellent**: Request +15-20% выше posted
- **Good**: Request +10-15% выше posted
- **Normal**: Request +5-10% выше posted
- **Weak**: Request +1-5% выше posted (ПЛОХО!)
- **Fail**: Принимает posted rate (ПОТЕРЯЛ ДЕНЬГИ!)

**Формула брокера:**
```
Final = (Posted + Requested) / 2 ± $50-100
```

**Пример:**
- Posted: $2,700
- Dispatcher requests: $3,100 (Excellent - +15%)
- Broker counters: $2,900
- Final: $2,925 (заработал $225!)

### 6. Распределение грузов

**ОБЯЗАТЕЛЬНОЕ соотношение:**
- 50% Dry Van
- 35% Reefer
- 15% Specialized (Hazmat, Auto, Flatbed, etc.)

### 7. Rate Con подход

**ВАЖНО:** Брокер НЕ диктует все адреса в диалоге!

После согласования цены брокер говорит:
```
"Rate con sent to factoring@[email] with all pickup/delivery details. Sign and return it. After pickup send BOL and photos."
```

Все детали (адреса, контакты, времена) в Rate Con документе!

---

## 📋 СПЕЦИФИКА ПО ТИПАМ ГРУЗОВ

### Dry Van (50% грузов)

**Характеристики:**
- Equipment: 53ft Dry Van
- Rates: $2.30-2.60/mile
- Requirements: Load locks, straps
- Insurance: $100K cargo coverage
- Handling: Standard, palletized

**Типы грузов:**
- Retail products (clothing, home goods)
- Electronics (laptops, tablets)
- Furniture (sofas, tables, chairs)
- Building materials (drywall, lumber)
- Food (non-perishable)

**Ключевые вопросы в prompts:**
- Load locks и straps
- Trailer clean and dry
- Experience с типом груза
- Standard handling procedures

**Пример торга:**
- Posted: $1,800 ($2.31/mile, 780 mi)
- Request: $2,000-2,100 ($2.56-2.69/mile)
- Final: $1,975 ($2.53/mile) = +$175

### Reefer (35% грузов)

**Характеристики:**
- Equipment: 53ft Refrigerated trailer
- Rates: $2.75-3.20/mile (выше чем Dry Van!)
- Temperature ranges:
  - Frozen: -10°F to 0°F
  - Dairy: 36-38°F
  - Produce: 34-36°F
- Requirements: Temperature monitoring, GPS tracking

**Критические требования:**
- Minimize door openings
- Fuel stops max 20-30 minutes
- Call if temp rises above threshold
- Send temp logs every 6 hours
- Pre-cool trailer before loading

**Типы грузов:**
- Frozen food (ice cream, frozen meals)
- Dairy products (milk, cheese, yogurt)
- Produce (lettuce, tomatoes, peppers)
- Meat and poultry

**Ключевые вопросы в prompts:**
- Reefer unit operational
- Temperature capability
- When last serviced
- GPS temp monitoring
- Experience with temp-controlled

**Пример торга:**
- Posted: $2,300 ($2.80/mile, 820 mi)
- Request: $2,550-2,650 ($3.11-3.23/mile)
- Final: $2,475 ($3.02/mile) = +$175

### Hazmat (часть 15% Specialized)

**Характеристики:**
- Equipment: Tanker with Hazmat certification
- Rates: $3.00-3.50/mile (САМЫЕ ВЫСОКИЕ!)
- Classes: 3 (Flammable), 8 (Corrosive), etc.
- Requirements: Специальные endorsements

**ОБЯЗАТЕЛЬНЫЕ требования:**
- Hazmat endorsement on CDL
- Tanker endorsement
- Class-specific placards (red diamond для Class 3)
- Emergency response kit:
  - Fire extinguisher (20-lb ABC)
  - Spill containment kit
  - Emergency triangles
  - First aid kit
  - ERG (Emergency Response Guidebook)
- CHEMTREC number: 1-800-424-9300
- Routing restrictions (tunnel prohibitions)
- 49 CFR 172 regulations

**Ключевые вопросы в prompts:**
- Hazmat + Tanker endorsements
- Years of experience with Class X
- Placards и placarding requirements
- Emergency equipment
- Routing restrictions knowledge
- Tunnel prohibitions
- Safety procedures

**Пример торга:**
- Posted: $3,200 ($2.91/mile, 1,100 mi)
- Request: $3,500-3,600 ($3.18-3.27/mile)
- Final: $3,500 ($3.18/mile) = +$300

### Auto Transport (часть 15% Specialized)

**Характеристики:**
- Equipment: Car carrier (9-car capacity)
- Enclosed vs Open carrier
- Rates: $2.75-3.00/mile для enclosed
- Insurance: $1M+ для luxury vehicles

**Критические требования:**
- Enclosed carrier для luxury (hard-sided, not tarp)
- Insurance: $150K per vehicle minimum
- 360-degree inspection:
  - 20-30 photos per vehicle
  - Detailed condition report
  - Customer signature at pickup/delivery
  - Mobile app with timestamps/GPS
- Experience with high-value vehicles
- Zero damage claims track record

**Типы грузов:**
- Luxury vehicles (Tesla, BMW, Mercedes)
- Classic cars
- Exotic vehicles
- Dealership transport

**Ключевые вопросы в prompts:**
- Enclosed carrier confirmation
- Insurance coverage ($1M+, per-vehicle limit)
- Inspection process (photos, reports)
- Experience with luxury vehicles
- Track record (zero claims)
- References from dealerships

**Специфика:**
- Tesla battery maintenance (>20%)
- Daily location updates
- Call 24 hours before delivery
- White-glove service

**Пример торга:**
- Posted: $5,000 ($2.63/mile, 1,900 mi)
- Request: $5,500-5,700 ($2.89-3.00/mile)
- Final: $5,500 ($2.89/mile) = +$500

---

## 💰 ФИНАНСОВАЯ МОТИВАЦИЯ

### Weekly Loads Potential

**Включать в каждый диалог:**

```javascript
weeklyLoads: "X-Y [тип] loads weekly [lane]"
```

**Примеры:**
- Dry Van Retail: "8-10 retail loads weekly Chicago-Texas"
- Reefer Dairy: "6-8 dairy loads weekly LA-Denver"
- Hazmat: "3-4 Hazmat loads weekly on this lane"
- Auto: "5-7 auto loads weekly Detroit-Southwest"

### Расчет заработка

**Показывать в feedback:**

```
Заработали $[N] больше ($[final] vs $[posted]).
Торг: Posted $[X] → Вы $[Y] → Финал $[Z] ($[rate]/mile).
Заработали $[N] = [%]% прибавка!
```

**Weekly potential:**
```
Ваш профессионализм = [X]-[Y] loads weekly ($[amount]-[amount]/месяц)!
```

---

## 🎯 КАЧЕСТВО ОТВЕТОВ (6 вариантов)

### 1. Excellent (✨)
- Все элементы присутствуют
- Детальная информация
- Профессиональные вопросы
- Обоснование
- Энтузиазм

### 2. Good (✔️)
- Основные элементы
- Достаточная информация
- Некоторые вопросы
- Профессионализм

### 3. Normal (⚪)
- Базовая информация
- Минимум деталей
- Нет вопросов
- Достаточно для продолжения

### 4. Weak (⚠️)
- Неполная информация
- Неуверенность
- Нет деталей
- Риск потерять груз

### 5. Aggressive (🔴)
- Грубость
- Нереалистичные требования
- Ультиматумы
- Пренебрежение деталями
- Path: reject

### 6. Fail (❌)
- Критические ошибки
- Нет квалификации
- Нет оборудования
- Принял posted без торга
- Path: reject

---

## 📝 ШАБЛОН НОВОГО ДИАЛОГА

```javascript
// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #[N] - [Тип] [Груз] (NEW DIALOG SYSTEM V2.0)
// Дата: [YYYY-MM-DD]
// ПРАВИЛО: 14 шагов, 6 вариантов качества, ТОРГ ЗА ЦЕНУ!

console.log('🔵 Loading scenarios-data-v[N].js...');

// Dialogue #[N]: [Тип] - [Route]
// [Difficulty] difficulty, [cargo description]
// Posted rate: $[X] ($[rate]/mile), Target: $[Y]-[Z] ($[rate]-[rate]/mile)

const scenario[N] = {
    id: [N],
    route: "[Origin] → [Destination]",
    distance: [miles],
    equipment: "[Equipment type]",
    cargo: "[Cargo description]",
    weight: "[weight] lbs",
    deadline: "Pickup [time], Delivery [time]",
    brokerStyle: "Professional [type] broker",
    difficulty: "[easy/medium/medium-hard/hard]",

    initialMessage: "Good [morning/afternoon]! This is [DISPATCHER NAME] from [COMPANY NAME].\nI saw your load posting for [route] [cargo].\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1-14 с улучшенными prompts и analytics
        ],
        reject1: [/* ... */],
        reject2: [/* ... */],
        reject3: [/* ... */],
        reject4: [/* ... */]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario[N]);
    console.log('✅ Scenario [N] ([Type] [Cargo]) added');
} else {
    console.warn('⚠️ allScenarios not found');
}
```

---

## ✅ ЧЕКЛИСТ ДЛЯ НОВОГО ДИАЛОГА

### Перед созданием:
- [ ] Определен тип груза (Dry Van / Reefer / Specialized)
- [ ] Проверено распределение (50% / 35% / 15%)
- [ ] Выбран маршрут и расстояние
- [ ] Рассчитаны rates (posted, target, final)
- [ ] Придуманы имена (диспетчер, брокер)

### Структура:
- [ ] 14 шагов (или 10 для сложных)
- [ ] 6 вариантов качества в каждом шаге
- [ ] Имя диспетчера в initialMessage
- [ ] Все prompts детальные и обучающие
- [ ] Все analytics информативные

### Торг:
- [ ] Диспетчер называет цену первым (шаг 6)
- [ ] Формула качества соблюдена
- [ ] Показан заработок в analytics
- [ ] Финальное предложение с detention/layover

### Специфика груза:
- [ ] Правильное оборудование
- [ ] Специфические requirements
- [ ] Правильные rates для типа
- [ ] Ключевые вопросы в prompts

### Финализация:
- [ ] Rate Con approach
- [ ] Weekly loads указаны
- [ ] Полное резюме в последнем шаге
- [ ] Feedback с расчетом заработка

---

## 🚀 ИСПОЛЬЗОВАНИЕ ЭТОГО ГАЙДА

**Для создания нового диалога:**

1. Прочитай ВЕСЬ этот документ
2. Выбери тип груза (проверь распределение)
3. Используй шаблон выше
4. Копируй структуру prompts из раздела "dispatcherPrompt"
5. Копируй структуру analytics из раздела "analytics"
6. Добавь специфику из раздела "Специфика по типам грузов"
7. Проверь по чеклисту

**Этот документ - ЕДИНСТВЕННЫЙ источник правды для новых диалогов!**

---

## 📊 СТАТИСТИКА ТЕКУЩИХ ДИАЛОГОВ

| ID | Тип | Груз | Miles | Posted | Final | Заработок | Weekly |
|----|-----|------|-------|--------|-------|-----------|--------|
| v5 | Hazmat | Chemicals | 1,100 | $3,200 | $3,500 | +$300 | 3-4 |
| v6 | Auto | Luxury 9 cars | 1,900 | $5,000 | $5,500 | +$500 | 5-7 |
| v7 | Dry Van | Electronics | 2,400 | $5,500 | $6,200 | +$700 | - |
| v8 | Reefer | Frozen Food | 2,800 | $6,800 | $7,400 | +$600 | 5-6 |
| v9 | Dry Van | Retail | 780 | $1,800 | $1,975 | +$175 | 8-10 |
| v10 | Reefer | Dairy | 820 | $2,300 | $2,475 | +$175 | 6-8 |
| v11 | Dry Van | Building | 650 | $1,450 | $1,600 | +$150 | 10-12 |
| v12 | Reefer | Produce | 2,900 | $7,500 | $8,100 | +$600 | 4-5 |
| v13 | Dry Van | Furniture | 1,180 | $2,700 | $2,925 | +$225 | 7-9 |

**Текущее распределение:**
- Dry Van: 4 (44%) ✅
- Reefer: 3 (33%) ✅
- Specialized: 2 (22%) ✅

---

## 🎓 ПОМНИ!

1. **dispatcherPrompt** - это ГЛАВНАЯ подсказка для студента
2. **analytics** - это обратная связь для обучения
3. **Торг** - это ЦЕЛЬ диалога (заработать больше)
4. **Специфика груза** - это профессионализм
5. **Weekly loads** - это мотивация

**Каждый диалог должен ОБУЧАТЬ, а не просто тестировать!**

---

**Версия: 2.0 FINAL**
**Дата: 2026-03-07**
**Статус: ГОТОВ К ИСПОЛЬЗОВАНИЮ** ✅
