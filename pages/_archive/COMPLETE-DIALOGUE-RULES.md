# 📚 ПОЛНОЕ РУКОВОДСТВО ПО СОЗДАНИЮ ДИАЛОГОВ
## Все правила в одном месте

**Дата создания:** 2026-03-09  
**Версия:** 1.0 MASTER  
**Статус:** 🔒 ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ

---

## 🎯 ЦЕЛЬ

Создавать профессиональные диалоги для симулятора переговоров диспетчер-брокер:
- ✅ БЕЗ ТУПИКОВ
- ✅ С правильной структурой
- ✅ С обучающими элементами
- ✅ С реалистичными данными

---

## 📋 ЧАСТЬ 1: СТРУКТУРА БЕЗ ТУПИКОВ

### ПРАВИЛО #1: Только ДВА типа путей

**ОБЯЗАТЕЛЬНО:**
1. **`master`** - единственный путь с 15-17 шагами
2. **`reject_*_final`** - финальные outcomes (1 элемент каждый)

**❌ ЗАПРЕЩЕНО:**
- Промежуточные пути (`weak`, `warning` без _final)
- Пути с несколькими шагами кроме master
- Пути без суффикса _final

**✅ ПРАВИЛЬНО:**
```javascript
paths: {
    master: [ /* 15-17 steps */ ],
    reject_weak_final: [ /* 1 element */ ],
    reject_attitude_final: [ /* 1 element */ ],
    reject_nomc_final: [ /* 1 element */ ]
}
```

### ПРАВИЛО #2: Варианты 1-3 ведут в "master"

**Каждый шаг имеет 6 вариантов:**
- Вариант 1 (excellent) → `path: "master"`
- Вариант 2 (good) → `path: "master"`
- Вариант 3 (normal) → `path: "master"`
- Вариант 4 (weak) → `path: "reject_weak_final"`
- Вариант 5 (aggressive) → `path: "reject_attitude_final"`
- Вариант 6 (fail) → `path: "reject_*_final"` (специфичный)

**✅ ПРАВИЛЬНО:**
```javascript
suggestions: [
    { text: "Excellent answer", quality: "excellent", path: "master" },
    { text: "Good answer", quality: "good", path: "master" },
    { text: "Normal answer", quality: "normal", path: "master" },
    { text: "Weak answer", quality: "weak", path: "reject_weak_final" },
    { text: "Aggressive answer", quality: "aggressive", path: "reject_attitude_final" },
    { text: "Fail answer", quality: "fail", path: "reject_nomc_final" }
]
```

### ПРАВИЛО #3: Структура reject пути

**Каждый reject_*_final путь содержит ТОЛЬКО 1 элемент:**

```javascript
reject_weak_final: [
    {
        brokerResponse: "I need a more confident carrier. Thanks anyway.",
        outcome: {
            type: "failure",
            quality: "fail",
            rate: "$0",
            feedback: "❌ REJECT: Lack of confidence showed inexperience."
        }
    }
]
```

---

## 📋 ЧАСТЬ 2: СТРУКТУРА ДИАЛОГА (14 ШАГОВ)

### БЛОК 1: ПРЕДСТАВЛЕНИЕ (3 шага)

**Шаг 1:** Диспетчер звонит и представляется
```
"Good morning! [Name] from [Company]. 
I'm calling about your [Route] [Equipment] load. 
Is this still available?"
```

**Шаг 2:** Брокер подтверждает + спрашивает MC

**Шаг 3:** Диспетчер дает местоположение + спрашивает детали

### БЛОК 2: ДЕТАЛИ ГРУЗА (2 шага)

**Шаг 4:** Брокер дает детали груза (КРАТКО!)

**Шаг 5:** Диспетчер подтверждает + дает ETA

### БЛОК 3: REQUIREMENTS (2 шага)

**Шаг 6:** Брокер спрашивает о специальных requirements (КРАТКО!)

**Шаг 7:** Диспетчер подтверждает compliance (КРАТКО!)

### БЛОК 4: ТОРГ ЗА ЦЕНУ (4 шага) ⭐ КЛЮЧЕВОЙ БЛОК

**Шаг 8:** Брокер спрашивает: "What rate do you need?"

**Шаг 9:** Диспетчер называет цену (чем больше → тем лучше!)

**Шаг 10:** Брокер отвечает встречным предложением

**Шаг 11:** Диспетчер финальный ответ

### БЛОК 5: ФИНАЛИЗАЦИЯ (3 шага)

**Шаг 12:** Брокер финализирует rate + дает pickup/delivery детали

**Шаг 13:** Диспетчер дает factoring + обещает updates

**Шаг 14:** OUTCOME - Результат диалога

---

## 📋 ЧАСТЬ 3: ТОРГ ЗА ЦЕНУ

### КРИТИЧЕСКИ ВАЖНО:

**Чем БОЛЬШЕ диспетчер просит → тем ЛУЧШЕ качество!**

### Шкала качества торга:

| Качество | Сколько просит | Пример (posted $3,200) |
|----------|----------------|------------------------|
| ✨ Excellent | +$500-600 | $3,700-3,800 |
| ✔️ Good | +$300-400 | $3,500-3,600 |
| ⚪ Normal | +$200-300 | $3,400-3,500 |
| ⚠️ Weak | +$50-100 | $3,250-3,300 |
| 🔴 Aggressive | Нереально (+$1000+) | $4,500+ |
| ❌ Fail | Принял posted | $3,200 |

### Формула брокера:

```
Предложение брокера = (Posted rate + Запрошенная цена) / 2
```

**Примеры:**
- Диспетчер просит $3,800 → Брокер предлагает $3,500
- Диспетчер просит $3,600 → Брокер предлагает $3,400
- Диспетчер просит $3,500 → Брокер предлагает $3,350

---

## 📋 ЧАСТЬ 4: РАСПРЕДЕЛЕНИЕ ТИПОВ ГРУЗОВ

### ОБЯЗАТЕЛЬНОЕ СООТНОШЕНИЕ:

**50% - Dry Van грузы**
- General freight
- Consumer goods
- Electronics
- Furniture
- Retail products

**35% - Reefer грузы**
- Produce (фрукты, овощи)
- Frozen food
- Dairy products
- Meat and poultry
- Pharmaceuticals

**15% - Специализированные грузы**
- Flatbed (3%)
- Hazmat (5%)
- Auto transport (3%)
- Heavy haul (2%)
- Oversized (2%)

### Правило для создания серии:

**Из 10 диалогов:**
- 5 Dry Van
- 3-4 Reefer
- 1-2 Специализированные

---

## 📋 ЧАСТЬ 5: КОРОТКИЕ РЕПЛИКИ

### ПРАВИЛО: Максимум 2-3 предложения

**❌ ЗАПРЕЩЕНО:**
```
"Perfect! My truck is in Houston right now, just finished delivery 
at the warehouse district this morning around 9 AM. Driver is at 
the Love's truck stop on I-10, exit 770. Tank is cleaned, inspected, 
and ready for Class 3 Flammable. We can pick up tomorrow morning. 
What are the load details?"
```

**✅ ПРАВИЛЬНО:**
```
"Truck's in Houston, empty at Port. Ready tomorrow. 
What's pickup time and rate?"
```

### Применяется к:
- ✅ Вопросам брокера: 2-3 предложения
- ✅ Ответам диспетчера: 2-4 предложения
- ✅ Советам (dispatcherPrompt): 1 предложение
- ✅ Аналитике (analytics): 1-2 предложения

---

## 📋 ЧАСТЬ 6: РЕАЛИСТИЧНЫЕ ДАННЫЕ

### Расстояния и Delivery:

**Правило водителя: 650 миль в день максимум**

- **Short Haul (350-650 миль):** Pickup сегодня → Delivery завтра
- **Medium Haul (650-1500 миль):** Pickup сегодня → Delivery через 2-3 дня
- **Long Haul (1500+ миль):** Pickup сегодня → Delivery через 3-4 дня

### Ставки (2026):

**Dry Van:**
- Short: $2.80-$3.50/миля
- Medium: $2.40-$3.00/миля
- Long: $2.20-$2.70/миля

**Reefer:**
- Short: $3.20-$4.00/миля
- Medium: $2.80-$3.50/миля
- Long: $2.60-$3.20/миля

**Flatbed:**
- Short: $3.00-$3.80/миля
- Medium: $2.60-$3.30/миля
- Long: $2.40-$3.00/миля

### Вес:
- Легкий: 10,000-25,000 lbs
- Средний: 25,000-40,000 lbs
- Тяжелый: 40,000-45,000 lbs (максимум)

---

## 📋 ЧАСТЬ 7: СТАНДАРТНЫЕ REJECT ПУТИ

### Обязательные reject_*_final пути:

| Path Name | Когда использовать |
|-----------|-------------------|
| `reject_weak_final` | Неуверенные ответы |
| `reject_attitude_final` | Грубость, агрессия |
| `reject_nomc_final` | Нет MC number |
| `reject_timing_final` | Не может вовремя |
| `reject_experience_final` | Нет опыта |
| `reject_insurance_final` | Недостаточная страховка |
| `reject_communication_final` | Нет tracking |
| `reject_commitment_final` | Нет commitment |
| `reject_equipment_final` | Нет оборудования |
| `reject_references_final` | Нет references |
| `reject_terms_final` | Неприемлемые условия |
| `reject_ultimatum_final` | Ультиматумы |
| `reject_email_final` | Нет email |

---

## 📋 ЧАСТЬ 8: ПРОФЕССИОНАЛИЗМ

### Стиль диалога:

- ✅ Профессиональный
- ✅ Деловой
- ✅ Конкретный
- ✅ Понятный
- ❌ БЕЗ сленга
- ❌ БЕЗ лишних слов
- ❌ БЕЗ повторений

### Примеры профессиональных фраз:

**Диспетчер:**
- "Truck's in Houston, empty at Port."
- "Driver can be there by 7 AM."
- "$3,600 for this Hazmat load."
- "RTS Factoring, factoring@rtsfin.com."

**Брокер:**
- "MC verified, good rating."
- "1,100 miles, 44K lbs Class 3 Flammable."
- "I can do $3,500. That's $3.18/mile."
- "Rate con sent to RTS."

---

## 📋 ЧАСТЬ 9: TIMING

### Реалистичный timing разговора:

**5-7 минут** реального разговора

### Это значит:
- Короткие реплики (2-3 предложения)
- Быстрый темп диалога
- Без пауз и раздумий
- Профессиональный стиль

---

## 📋 ЧАСТЬ 10: OUTCOME

### SUCCESS (если все шаги Excellent/Good/Normal):

```javascript
{
  type: "success",
  quality: "excellent" / "good" / "normal",
  rate: "$3,550",
  ratePerMile: "$3.23/mile",
  relationship: "strengthened" / "maintained",
  feedback: "✅ SUCCESS: Детальный feedback с уроками"
}
```

### FAILURE (если были Aggressive/Fail):

```javascript
{
  type: "failure",
  quality: "fail",
  rate: "$0",
  ratePerMile: "$0/mile",
  relationship: "rejected",
  feedback: "❌ REJECT: Объяснение почему отказали + уроки"
}
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД СОЗДАНИЕМ ДИАЛОГА

### Структура:
- [ ] Только 2 типа путей: master и reject_*_final
- [ ] Master путь имеет 15-17 шагов
- [ ] Каждый шаг имеет 6 вариантов
- [ ] Варианты 1-3 ведут в "master"
- [ ] Варианты 4-6 ведут в "reject_*_final"
- [ ] Все reject пути имеют суффикс _final
- [ ] Каждый reject путь содержит 1 элемент с outcome

### Содержание:
- [ ] Первое сообщение профессиональное и полное
- [ ] Все реплики 2-3 предложения максимум
- [ ] Торг за цену детально проработан (шаги 8-11)
- [ ] Чем больше диспетчер просит → тем лучше качество
- [ ] Брокер предлагает среднее между posted и запрошенным
- [ ] Requirements спрашиваются кратко (1-2 вопроса)

### Данные:
- [ ] Реалистичные расстояния
- [ ] Правильный расчет delivery (650 миль/день)
- [ ] Реалистичные ставки для типа груза
- [ ] Вес не более 45,000 lbs
- [ ] Соблюдено соотношение типов грузов (50% Dry Van, 35% Reefer, 15% Специализированные)

### Качество:
- [ ] Нет тупиковых ситуаций
- [ ] Нет повторяющихся фраз
- [ ] Профессиональный стиль
- [ ] Обучающие элементы в каждом пути
- [ ] Четкие результаты (outcome)

### Validation:
- [ ] Запущена validation утилита
- [ ] Получено 0 ошибок
- [ ] Протестировано в симуляторе
- [ ] Проверены все пути (master и reject)

---

## 🚫 СТРОГО ЗАПРЕЩЕНО

### ❌ НЕ ДЕЛАТЬ:

1. **Длинные реплики** (более 3 предложений)
2. **Промежуточные пути** (weak, warning без _final)
3. **Пути без _final** (кроме master)
4. **Тупиковые ситуации**
5. **Повторяющиеся фразы**
6. **Нереалистичные ставки**
7. **Неправильные расстояния**
8. **Перегруз** (более 45,000 lbs)
9. **Брокер называет цену первым**
10. **Диспетчер принимает posted rate без торга**

---

## 📖 ПРИМЕР ИДЕАЛЬНОГО ШАГА

```javascript
{
    brokerQuestion: "Perfect equipment. What rate are you looking for on this?",
    dispatcherPrompt: "💎 Обоснуйте ставку: расстояние, специфика, требования",
    suggestions: [
        { 
            text: "For 1,377 miles with constant 34°F monitoring, I'm at $4,200. That's $3.05/mile covering fuel, team operation, and temperature compliance.", 
            quality: "excellent",
            analytics: "✨ Обосновал ставку: расстояние, температура, team, compliance!",
            path: "master"
        },
        { 
            text: "I'm thinking $4,200 for this reefer load.", 
            quality: "good",
            analytics: "✔️ Назвал цену выше posted.",
            path: "master"
        },
        { 
            text: "$3,900 works for me.", 
            quality: "normal",
            analytics: "⚪ Назвал цену, но без обоснования.",
            path: "master"
        },
        { 
            text: "What's your budget on this?", 
            quality: "weak",
            analytics: "⚠️ Слабо! Спросил вместо того чтобы назвать цену.",
            path: "reject_weak_final"
        },
        { 
            text: "I need $5,000 minimum!", 
            quality: "aggressive",
            analytics: "🔴 Нереально высокая цена!",
            path: "reject_attitude_final"
        },
        { 
            text: "I'll take $3,850 posted.", 
            quality: "fail",
            analytics: "❌ Принял posted без торга!",
            path: "master"
        }
    ]
}
```

---

## 📚 РЕСУРСЫ

### Файлы для использования:

1. **Template:** `pages/dialogue-template.js` - Шаблон для новых диалогов
2. **Validation:** `pages/validate-dialogue.js` - Проверка на ошибки
3. **Reference:** `pages/scenarios-data-v20.js` - Эталонный пример
4. **Spec:** `pages/DIALOGUE-CREATION-SPEC.md` - Детальная спецификация
5. **Rules:** `.kiro/specs/add-two-new-dialogues/STRICT-RULES.md` - Строгие правила

### Workflow создания диалога:

1. Скопировать template из `dialogue-template.js`
2. Заполнить metadata (id, route, distance, etc.)
3. Создать 15-17 шагов master пути с 6 вариантами каждый
4. Создать все reject_*_final пути (1 элемент каждый)
5. Запустить validation: `node validate-dialogue.js`
6. Исправить все ошибки
7. Протестировать в симуляторе
8. Добавить в simulator.html
9. Commit и push

---

## 🎯 ГЛАВНОЕ ПРАВИЛО

**ТОРГ ЗА ЦЕНУ - ЭТО ГЛАВНАЯ ЦЕЛЬ ДИСПЕТЧЕРА!**

Чем больше диспетчер заработает → тем лучше его результат!

---

## 📊 ТЕКУЩИЙ БАЛАНС ДИАЛОГОВ

### v20-v23 (4 диалога):

- v20: Flatbed (Steel coils) - Специализированный ✅
- v21: Dry Van (Electronics) - Dry Van ✅
- v22: Reefer (Produce) - Reefer ✅
- v23: Dry Van (Furniture) - Dry Van ✅

**Итого:** 2 Dry Van (50%), 1 Reefer (25%), 1 Специализированный (25%)

**Для #24 нужен: REEFER** (чтобы выровнять до 50% Dry Van / 35% Reefer)

---

## 🔄 ИСТОРИЯ ВЕРСИЙ

- **v1.0** (2026-03-09) - Создан мастер-файл со всеми правилами
  - Объединены правила из STRICT-RULES.md
  - Объединены правила из DIALOGUE-CREATION-SPEC.md
  - Объединены правила из MASTER-DIALOG-RULES.md
  - Добавлен чеклист и примеры

---

**Версия:** 1.0 MASTER  
**Статус:** 🔒 ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ  
**Последнее обновление:** 2026-03-09

**Этот файл содержит ВСЕ правила для создания диалогов в одном месте!**
