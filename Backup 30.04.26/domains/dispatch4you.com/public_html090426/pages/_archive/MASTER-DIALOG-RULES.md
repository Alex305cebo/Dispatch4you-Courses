# 📚 МАСТЕР-ПРАВИЛА ДЛЯ ПОСТРОЕНИЯ ДИАЛОГОВ
## Dispatch Simulator - Полное Руководство

---

## 🎯 ЦЕЛЬ СИМУЛЯТОРА
**Обучать диспетчера правильно и грамотно общаться с брокером**

Симулятор создан для тренировки профессиональных навыков переговоров диспетчера с брокером в реальных условиях грузоперевозок США.

---

## ✅ ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА

### 1. ПЕРВОЕ СООБЩЕНИЕ ДИСПЕТЧЕРА
**ВСЕГДА профессиональное, красивое и полное**

Структура:
```
[Приветствие] [Имя] from [Компания]. 
I'm calling about your [Маршрут] [Тип оборудования] load, reference [Номер]. 
Is this still available?
```

✅ **ПРАВИЛЬНЫЕ ПРИМЕРЫ:**
```
"Good morning! This is Michael from Midwest Cold Chain Logistics. 
I'm calling about your Chicago to Miami reefer load, reference CHI-5847. 
Is this still available?"

"Good afternoon! This is Sarah from Pacific Reefer Transport. 
I'm calling about your Los Angeles to Dallas reefer load, reference LAX-7823. 
Is this load still available?"
```

❌ **НЕПРАВИЛЬНЫЕ ПРИМЕРЫ:**
```
"Hi, got a load Chicago to Miami?"
"Is the reefer load still open?"
"I'm calling about the load."
```

**Обязательные элементы:**
- ✅ Приветствие (Good morning/afternoon/evening)
- ✅ Имя диспетчера
- ✅ Название компании
- ✅ Полный маршрут (город → город)
- ✅ Тип оборудования
- ✅ Номер груза (reference number)
- ✅ Вежливый вопрос

---

### 2. МАКСИМУМ 3-4 ПРЕДЛОЖЕНИЯ
**ВЕЗДЕ В ДИАЛОГЕ**

Это правило применяется к:
- ✅ Вопросам брокера: 2-3 предложения
- ✅ Ответам диспетчера: 2-4 предложения
- ✅ Советам (dispatcherPrompt): 1 предложение
- ✅ Аналитике: 1-2 предложения
- ✅ Результатам (outcome): 1-2 предложения

**ПРИМЕРЫ:**

❌ **ПЛОХО (слишком длинно - 7 предложений):**
```javascript
brokerResponse: [
    "Excellent! Let me pull up your information.",
    "OK, MC 567890 verified. I see you have a 99% safety rating.",
    "This is a high-value pharmaceutical shipment - 44,000 pounds.",
    "It needs to maintain 2-8°C throughout transit.",
    "Pickup is tomorrow at 6 AM at PharmaCorp Distribution in LA.",
    "Delivery must be completed within 48 hours at MedSupply Warehouse.",
    "The shipper requires real-time temperature monitoring."
]
```

✅ **ХОРОШО (3 предложения):**
```javascript
brokerResponse: "Excellent! Verified MC 445566 - 99% safety score, impressive. This is 44,000 lbs produce, must maintain 34°F constant. Pickup tomorrow 6 AM, delivery in 48 hours Miami."
```

✅ **ХОРОШО (dispatcherPrompt - 1 предложение):**
```javascript
dispatcherPrompt: "💎 Представьтесь детально: MC, опыт, оборудование, местоположение"
```

---

### 3. НИКОГДА НЕ ЗАХОДИТЬ В ТУПИК
**Всегда есть выход из ситуации**

Правила:
- ❌ НЕТ тупиковых ситуаций без выхода
- ✅ Даже плохой выбор ведет к обучению
- ✅ Всегда есть альтернативный путь
- ✅ Отказ брокера объясняет причину

**ПРИМЕРЫ:**

❌ **ПЛОХО (тупик):**
```javascript
{
    text: "I don't have that information.",
    quality: "bad"
}
brokerResponse: "OK, bye."
isSuccess: false
// Нет объяснения, нет обучения
```

✅ **ХОРОШО (обучающий отказ):**
```javascript
{
    text: "Uh... give me a second... I need to find it...",
    quality: "bad"
}
brokerResponse: "I've got 10 other calls waiting. You don't have your MC ready? That's basic stuff. Call me back when you're prepared. I can't wait around."
isSuccess: false
outcome: "❌ ОТКАЗ: Неподготовленность = потеря груза и репутации"
// Объясняет ЧТО не так и ПОЧЕМУ это важно
```

---

### 4. НИКАКИХ ПОВТОРЯЮЩИХСЯ СООБЩЕНИЙ
**Каждое сообщение уникально**

Правила:
- ❌ Не повторять одно и то же
- ✅ Каждый ответ добавляет новую информацию
- ✅ Прогрессия в диалоге
- ✅ Развитие ситуации

**ПРИМЕРЫ:**

❌ **ПЛОХО (повторение):**
```javascript
// Шаг 1
brokerResponse: "OK, let me verify you in the system."

// Шаг 2
brokerResponse: "OK, let me check that information."

// Шаг 3
brokerResponse: "OK, let me look that up."
```

✅ **ХОРОШО (уникальные ответы):**
```javascript
// Шаг 1
brokerResponse: "Excellent! Verified MC 445566 - 99% safety score, impressive."

// Шаг 2
brokerResponse: "I appreciate the breakdown. Shipper budgeted $3,850 for this run."

// Шаг 3
brokerResponse: "Fantastic! Really appreciate your professionalism."
```

---

### 5. КОРОТКИЕ И КОНКРЕТНЫЕ ДИАЛОГИ
**Профессиональный стиль**

Характеристики:
- ✅ Без воды и лишних слов
- ✅ Только важная информация
- ✅ Деловой тон
- ✅ Конкретные детали
- ✅ Быстрый темп

### 6. БРОКЕР ОТПРАВЛЯЕТ ТОЛЬКО ОДНО СООБЩЕНИЕ
**Никогда не отправляет несколько сообщений подряд**

Правила:
- ✅ Брокер пишет ОДНО сообщение
- ✅ Ждет ответа диспетчера
- ✅ Только потом следующее сообщение
- ❌ НЕТ нескольких сообщений подряд от брокера
- ❌ НЕТ автоматических follow-up сообщений

**ПРИМЕРЫ:**

❌ **ПЛОХО (много воды):**
```
"Well, you know, I was thinking that maybe we could possibly 
discuss the rate for this particular load if you have time 
and if it's convenient for you to talk about it right now..."
```

✅ **ХОРОШО (конкретно):**
```
"For 1,377 miles with constant 34°F monitoring, I'm at $4,200. 
That's $3.05/mile covering fuel, team operation, and temperature compliance."
```

---

## 🛤️ СТРУКТУРА ПУТЕЙ РАЗВИТИЯ

### Минимум 3 Пути, Рекомендуется 5-6

**Обязательные пути:**
1. **МАСТЕР/EXCELLENT** - Максимальный результат (10+ шагов)
2. **ХОРОШИЙ/GOOD** - Стандартный успех (6-8 шагов)
3. **НОРМАЛЬНЫЙ/NORMAL** - Базовый успех (3-5 шагов)

**Дополнительные пути:**
4. **АГРЕССИВНЫЙ/AGGRESSIVE** - Испорченные отношения (3-4 шага)
5. **СЛАБЫЙ/WEAK** - Низкая ставка (3-4 шага)
6. **ОТКАЗ/FAIL** - Потеря груза (1-2 шага)

---

## 📊 ДЛИНА ДИАЛОГОВ ПО ПУТЯМ

### МАСТЕР Путь (10-15 шагов):
1. MC и оборудование - Детальное представление
2. Обсуждение ставки - Обоснованное предложение
3. Переговоры - Компромисс с бонусами
4. Время доставки - Точный расчет
5. Проактивные вопросы - Детали перевозки
6. Информация о водителях - Полные данные
7. БОНУС: Backhaul - Дополнительный груз
8. Принятие backhaul - Максимизация прибыли
9. Детали backhaul - Подтверждение
10. Прямой контакт - Долгосрочные отношения
11-15. Дополнительные детали по необходимости

### ХОРОШИЙ Путь (6-8 шагов):
1. MC номер
2. Обсуждение ставки
3. Переговоры
4. Подтверждение деталей
5. Информация о водителях
6. Возможность backhaul
7-8. Финализация

### НОРМАЛЬНЫЙ Путь (3-5 шагов):
1. MC номер
2. Ставка
3. Принятие/отказ
4-5. Базовые детали

### Короткие Пути (1-4 шага):
- Быстрый успех или отказ
- Минимум деталей
- Четкий результат

---

## 💡 СОВЕТЫ (dispatcherPrompt)

### Формат:
```javascript
dispatcherPrompt: "[Эмодзи] [Краткая инструкция на русском]"
```

### Эмодзи по типам:
- 💎 МАСТЕР - Профессиональный подход
- ✅ ХОРОШИЙ - Стандартный подход
- ⚪ НОРМАЛЬНЫЙ - Базовый подход
- ⚠️ ОСТОРОЖНО - Риск или проблема
- ❌ ОШИБКА - Неправильный подход

### Примеры:
```javascript
dispatcherPrompt: "💎 Представьтесь детально: MC, опыт, оборудование, местоположение"
dispatcherPrompt: "✅ Назовите разумную ставку с обоснованием"
dispatcherPrompt: "⚠️ АГРЕССИЯ: Требуете сразу высокую ставку"
dispatcherPrompt: "❌ НЕПРОФЕССИОНАЛИЗМ: Нет базовой информации"
```

---

## 🎯 ВАРИАНТЫ ОТВЕТОВ (suggestions)

### Структура:
```javascript
suggestions: [
    { 
        text: "Полный текст ответа диспетчера", 
        quality: "master/excellent/good/normal/aggressive/weak/bad",
        path: "master/good/normal/aggressive/weak/fail" // опционально
    }
]
```

### Типы качества (quality):
- **master/excellent** - Идеальный ответ
- **good** - Хороший ответ
- **normal** - Нормальный ответ
- **aggressive** - Агрессивный ответ
- **weak** - Слабый ответ
- **bad** - Плохой ответ
- **reject** - Отказ

### Количество вариантов:
- Минимум: 2 варианта
- Рекомендуется: 3-4 варианта
- Максимум: 5 вариантов

---

## 📝 ОТВЕТЫ БРОКЕРА (brokerResponse)

### Формат:
```javascript
brokerResponse: "Текст ответа брокера в 2-3 предложениях."
```

### Правила:
- ✅ 2-3 предложения максимум
- ✅ Конкретная информация
- ✅ Естественный язык
- ✅ Профессиональный тон
- ✅ Прогрессия диалога

### Типы ответов:
1. **Подтверждение** - "Excellent! Verified MC 445566."
2. **Информация** - "This is 44,000 lbs produce, must maintain 34°F."
3. **Вопрос** - "Can you handle this?"
4. **Переговоры** - "Best I can do is $3,950."
5. **Финализация** - "Rate con sent. Call when loaded."

---

## 🏆 РЕЗУЛЬТАТЫ (outcome)

### Формат:
```javascript
outcome: "[Эмодзи] [СТАТУС]: [Детали результата]"
```

### Примеры:
```javascript
outcome: "🏆 МАСТЕР-КЛАСС! $6,200 total + preferred status + 3-4 loads/week"
outcome: "✅ ХОРОШИЙ РЕЗУЛЬТАТ! $5,750 + возможность $400 бонуса"
outcome: "⚪ БАЗОВЫЙ УСПЕХ: $3,900 + возможность бонуса"
outcome: "⚠️ ПЛОХОЙ РЕЗУЛЬТАТ: $3,950 но испорченные отношения"
outcome: "❌ ОТКАЗ: Неподготовленность = потеря груза"
```

---

## 🎨 ВИЗУАЛЬНЫЕ ИНДИКАТОРЫ

### Цвета по качеству:
```javascript
// EXCELLENT/MASTER
borderColor: 'rgba(34, 197, 94, 0.6)'
background: 'rgba(34, 197, 94, 0.1)'

// GOOD
borderColor: 'rgba(34, 197, 94, 0.4)'
background: 'rgba(34, 197, 94, 0.05)'

// AGGRESSIVE
borderColor: 'rgba(251, 191, 36, 0.5)'
background: 'rgba(251, 191, 36, 0.08)'

// WEAK
borderColor: 'rgba(156, 163, 175, 0.5)'
background: 'rgba(156, 163, 175, 0.08)'

// BAD/REJECT
borderColor: 'rgba(239, 68, 68, 0.4)'
background: 'rgba(239, 68, 68, 0.05)'
```

---

## 📚 РЕАЛИСТИЧНЫЕ ДАННЫЕ

### Расстояния и Delivery:
- **Short Haul (350-650 миль):** Pickup сегодня → Delivery завтра
- **Medium Haul (650-1500 миль):** Pickup сегодня → Delivery через 2-3 дня
- **Long Haul (1500+ миль):** Pickup сегодня → Delivery через 3-4 дня

### Правило Водителя:
**650 миль в день максимум**

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

## 🎓 ОБУЧАЮЩИЕ ЭЛЕМЕНТЫ

### Что должен показывать каждый путь:

**МАСТЕР:**
- Как профессионалы получают максимум
- Детальная подготовка
- Обоснованные решения
- Проактивность
- Долгосрочное мышление

**ХОРОШИЙ:**
- Стандартный успешный подход
- Профессионализм
- Разумные компромиссы

**НОРМАЛЬНЫЙ:**
- Базовый минимум для успеха
- Что нужно обязательно

**АГРЕССИВНЫЙ:**
- Почему агрессия вредит
- Испорченные отношения
- Краткосрочная выгода vs долгосрочные потери

**СЛАБЫЙ:**
- Как неуверенность стоит денег
- Важность уверенности
- Брокер использует слабость

**ОТКАЗ:**
- Критические ошибки
- Важность подготовки
- Последствия непрофессионализма

---

## ✨ КЛЮЧЕВЫЕ ФРАЗЫ

### Профессиональное Представление:
```
"MC [number]. We specialize in [type], [years] years experience."
"[Year] [brand] [equipment], [details]."
"Driver in [location] now, [certification], ready for [time] pickup."
```

### Обоснование Ставки:
```
"For [miles] miles with [requirements], I'm at $[amount]."
"That's $[rate]/mile covering [factors]."
"Fair for [timeframe] [cargo type] delivery."
```

### Принятие Компромисса:
```
"$[amount] plus bonus works - that's $[total] if we execute perfectly."
"Let's book it. Send rate con with bonus terms included?"
```

### Проактивные Вопросы:
```
"Any routing restrictions?"
"Weather delay procedure?"
"Specific dock number at delivery?"
"Load locks provided or bring our own?"
```

---

## 🚫 ЧАСТЫЕ ОШИБКИ - ЧЕГО ИЗБЕГАТЬ

### ❌ НЕ ДЕЛАТЬ:

1. **Длинные сообщения** (более 4 предложений)
2. **Повторяющиеся фразы**
3. **Тупиковые ситуации**
4. **Непрофессиональное первое сообщение**
5. **Нереалистичные ставки**
6. **Неправильные расстояния**
7. **Перегруз** (более 45,000 lbs)
8. **Неестественный язык**
9. **Отсутствие обучения в отказах**
10. **Слишком короткие диалоги** (менее 3 шагов в основных путях)

---

## ✅ ЧЕКЛИСТ ПЕРЕД СОЗДАНИЕМ ДИАЛОГА

- [ ] Первое сообщение профессиональное и полное
- [ ] Все сообщения 2-4 предложения максимум
- [ ] Нет тупиковых ситуаций
- [ ] Нет повторяющихся фраз
- [ ] Минимум 3 пути развития
- [ ] МАСТЕР путь 10+ шагов
- [ ] Реалистичные расстояния и ставки
- [ ] Правильный расчет delivery (650 миль/день)
- [ ] Советы (dispatcherPrompt) на каждом шаге
- [ ] Уникальные варианты ответов
- [ ] Обучающие элементы в каждом пути
- [ ] Четкие результаты (outcome)
- [ ] Естественный профессиональный язык

---

## 📖 ПРИМЕР ИДЕАЛЬНОГО ШАГА

```javascript
{
    brokerQuestion: "Perfect equipment. What rate are you looking for on this?",
    dispatcherPrompt: "💎 Обоснуйте ставку: расстояние, специфика, требования, расчет",
    suggestions: [
        { 
            text: "For 1,377 miles with constant 34°F monitoring, I'm at $4,200. That's $3.05/mile covering fuel, team operation, and temperature compliance. Fair for 48-hour produce delivery.", 
            quality: "master",
            path: "master"
        },
        { 
            text: "I'm thinking $4,200 for this reefer load.", 
            quality: "good",
            path: "good"
        },
        { 
            text: "What's your budget on this?", 
            quality: "weak",
            path: "weak"
        }
    ],
    brokerResponse: "I appreciate the breakdown. Shipper budgeted $3,850 for this run. However, this is a weekly contract - 3-4 produce loads per week on this lane. Plus $400 bonus for perfect temp logs."
}
```

---

## 🔄 ОБНОВЛЕНИЯ ПРАВИЛ

**Дата последнего обновления:** 2026-03-02

**История изменений:**
- v1.0 (2026-03-01) - Базовые правила
- v2.0 (2026-03-02) - Добавлены правила о длине сообщений
- v2.1 (2026-03-02) - Добавлено правило о первом сообщении
- v2.2 (2026-03-02) - Добавлены правила о тупиках и повторениях
- v2.3 (2026-03-02) - Добавлено правило: брокер отправляет только одно сообщение

**Следующие обновления будут добавляться сюда автоматически**

---

## 📞 ВАЖНО ПОМНИТЬ

**Цель симулятора:**
> Обучать диспетчера правильно и грамотно общаться с брокером

**Главный принцип:**
> Каждый диалог должен учить чему-то полезному

**Золотое правило:**
> Короткие, конкретные, профессиональные диалоги

---

**Версия:** 2.3  
**Статус:** АКТИВНЫЙ ДОКУМЕНТ  
**Обновляется:** При появлении новых правил
