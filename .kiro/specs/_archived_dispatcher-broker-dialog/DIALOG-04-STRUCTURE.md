# Диалог #4: Paper Products - Bulk Freight

## Базовая информация

- **ID**: 4
- **Маршрут**: Portland ME → Boston MA
- **Расстояние**: 100 миль
- **Оборудование**: Dry Van (53ft)
- **Груз**: Paper rolls (бумажные рулоны)
- **Вес**: 44,000 lbs
- **Сложность**: Easy
- **Ставка**: $350 ($3.50/mile)
- **Тип**: Short haul, heavy load
- **Значок**: 🚛

---

## Цель обучения

Научить диспетчера работать с:
- Short haul грузами (короткие расстояния)
- Heavy loads (тяжелые грузы близкие к максимуму)
- Простыми переговорами без сложных требований
- Быстрым booking процессом
- Local/regional доставками

---

## Initial Message (Первое сообщение брокера)

```
Good morning!
This is Mike from Northeast Logistics.
MC 778899.
I'm calling about your Portland to Boston dry van load.
Paper products - quick turnaround.
Is this load still available?
```

---

## Master Path (Успешный путь - 8 шагов)

### Шаг 1: MC Verification и Location
**Брокер**: 
```
Good morning! This is Lisa from Regional Freight Solutions.
Yes, load is available.
MC 778899 verified, good record.
Where is your truck right now?
```

**Prompt**: 💎 Брокер проверил MC. Дайте местоположение грузовика.

**Варианты ответов** (6 уровней качества):

1. **Excellent** ✨:
```
Good morning Lisa! My truck is in Portland right now, just finished unloading at the warehouse on Commercial Street about an hour ago. Driver is at the rest area on I-295, exit 5. Empty and ready to load today. What are the pickup details?
```
*Analytics*: Отлично! Точное местоположение, время, готовность.

2. **Good** ✔️:
```
Truck is in Portland, empty since this morning. At a rest area near I-295. Available to pick up today. What's the schedule?
```
*Analytics*: Хорошо! Местоположение и готовность.

3. **Normal** ⚪:
```
Truck is in Portland now, empty. We can pick up today.
```
*Analytics*: Нормально. Базовая информация.

4. **Weak** ⚠️:
```
Somewhere in Portland area. Driver will be ready when you need him.
```
*Analytics*: Слабо. Неточное местоположение.

5. **Aggressive** 🔴:
```
Why do you need exact location? Just give me the pickup address!
```
*Analytics*: Агрессивно. Грубый тон.

6. **Fail** ❌:
```
Uh... let me call the driver and find out. Can I call you back?
```
*Analytics*: Провал. Не знает местоположение своего грузовика.

---

### Шаг 2: Equipment Details
**Брокер**:
```
Good, Portland location works perfectly.
What equipment do you have?
I need trailer type and condition.
This is heavy freight - 44,000 lbs.
```

**Prompt**: 💎 Брокер спрашивает об оборудовании. Груз тяжелый - подтвердите capability.

**Варианты ответов**:

1. **Excellent** ✨:
```
2022 Freightliner with 53-foot dry van, swing doors, air ride suspension. Trailer is rated for 45,000 lbs capacity, well-maintained. We regularly haul paper products and heavy freight. Last DOT inspection passed 3 weeks ago. Ready for 44,000 lbs load.
```

2. **Good** ✔️:
```
53-foot dry van with air ride, rated for 45,000 lbs. Equipment is in good condition. We can handle 44,000 lbs no problem.
```

3. **Normal** ⚪:
```
53-foot dry van. Can handle heavy loads. Equipment is good.
```

4. **Weak** ⚠️:
```
Dry van, 53 feet. Should be fine for paper. How heavy is it exactly?
```

5. **Aggressive** 🔴:
```
It's a dry van! It can handle anything! What else matters?
```

6. **Fail** ❌:
```
44,000 lbs? That's really heavy. Are you sure it will fit?
```

---

### Шаг 3: Schedule и Timeline
**Брокер**:
```
Perfect equipment for paper rolls.
Load details: 44,000 lbs paper rolls, 20 pallets.
Pickup today 2 PM at Portland Paper Mill.
Delivery tomorrow morning by 8 AM at Boston Distribution Center.
That's overnight delivery, 100 miles.
Can you make this schedule?
```

**Prompt**: 💎 Брокер дал tight overnight timeline. Подтвердите способность.

**Варианты ответов**:

1. **Excellent** ✨:
```
Absolutely! Today 2 PM Portland pickup, tomorrow 8 AM Boston delivery. 100 miles overnight - very comfortable schedule. Driver can depart Portland by 3-4 PM, arrive Boston around 6-7 PM tonight, rest, and deliver fresh in the morning. This works perfectly for us.
```

2. **Good** ✔️:
```
Yes, we can make that schedule. Today 2 PM pickup, tomorrow 8 AM delivery. 100 miles overnight is no problem.
```

3. **Normal** ⚪:
```
Yes, we can do it. Today pickup, tomorrow morning delivery.
```

4. **Weak** ⚠️:
```
Overnight? That's tight. What if there's traffic on I-95?
```

5. **Aggressive** 🔴:
```
100 miles overnight? That's way too much time! We can deliver tonight!
```

6. **Fail** ❌:
```
Can we deliver tomorrow afternoon instead? Morning is too early.
```

---

### Шаг 4: Rate Discussion
**Брокер**:
```
Good. For this load, I'm offering $350 all-in.
That's $3.50 per mile for 100 miles.
Short haul premium rate.
Interested?
```

**Prompt**: 💎 Брокер предложил premium short haul ставку. Оцените и ответьте.

**Варианты ответов**:

1. **Excellent** ✨:
```
Thank you for the offer. $350 at $3.50/mile works for us. That's fair for short haul with overnight delivery. Let's book it. What about detention pay if there are delays at shipper or receiver?
```

2. **Good** ✔️:
```
$350 works for us. Fair rate for short haul. What about detention pay?
```

3. **Normal** ⚪:
```
$350 is okay. Do you pay detention?
```

4. **Weak** ⚠️:
```
Hmm, $350... I was hoping for $400. Can you go higher?
```

5. **Aggressive** 🔴:
```
$350? That's too low for heavy freight! I need $500!
```

6. **Fail** ❌:
```
Let me check with my boss and call back.
```

---

### Шаг 5: Detention Terms
**Брокер**:
```
Yes, detention is $50/hour after 2 hours free time.
Both pickup and delivery.
Sound good?
```

**Prompt**: 💎 Брокер дал detention условия. Подтвердите.

**Варианты ответов**:

1. **Excellent** ✨:
```
Perfect! $50/hour detention after 2 hours - that's fair for short haul. We'll track all times with timestamps. How do you handle payment? We use factoring.
```

2. **Good** ✔️:
```
Yes, those terms are good. What about payment? We use factoring.
```

3. **Normal** ⚪:
```
Okay, detention terms accepted. How do we get paid?
```

4. **Weak** ⚠️:
```
Only $50/hour? Other brokers pay $75. Can you match?
```

5. **Aggressive** 🔴:
```
2 hours free time? That's ridiculous! Should be 1 hour!
```

6. **Fail** ❌:
```
What's detention? I don't understand that term.
```

---

### Шаг 6: Factoring
**Брокер**:
```
Yes, we work with all major factoring companies.
Which one do you use?
```

**Prompt**: 💎 Брокер работает с factoring. Назовите компанию.

**Варианты ответов**:

1. **Excellent** ✨:
```
We use Triumph Business Capital. Please send rate confirmation to factoring@triumphpay.com with our MC 778899. They process within 24 hours. Do you need our insurance certificate now?
```

2. **Good** ✔️:
```
We work with OTR Solutions. Can you send rate con to their email? Do you need insurance certificate?
```

3. **Normal** ⚪:
```
We use RTS Financial. Should I give you their contact?
```

4. **Weak** ⚠️:
```
I think it's Triumph or RTS. Let me check and get back.
```

5. **Aggressive** 🔴:
```
Why do you care? Just send us the paperwork!
```

6. **Fail** ❌:
```
We don't use factoring. Can you pay us directly?
```

---

### Шаг 7: Shipper Details
**Брокер**:
```
Perfect! I'll send rate con to Triumph.
Shipper details:
Portland Paper Mill
500 Industrial Way, Portland ME 04101
Contact: John Smith 207-555-0155
Pickup today 2 PM - 4 PM
Any questions about pickup?
```

**Prompt**: 💎 Брокер дал shipper детали. Задайте вопросы.

**Варианты ответов**:

1. **Excellent** ✨:
```
Got it! Portland Paper Mill, 500 Industrial Way, John Smith 207-555-0155, 2-4 PM window. Questions: How long does loading take? Do they provide load locks? Any special handling for paper rolls? Should driver call John before arrival?
```

2. **Good** ✔️:
```
Understood. John 207-555-0155, 2-4 PM. How long is loading? Any special handling?
```

3. **Normal** ⚪:
```
Got it. 2 PM today. What's the delivery address?
```

4. **Weak** ⚠️:
```
500 Industrial Way - is that easy to find?
```

5. **Aggressive** 🔴:
```
Too much info! Just email it all!
```

6. **Fail** ❌:
```
Wait, can you repeat the address?
```

---

### Шаг 8: Delivery Details и Outcome
**Брокер**:
```
Loading takes 60-90 minutes.
They provide load locks and straps.
Paper rolls are heavy - driver supervises loading.
Call John 30 minutes before arrival.
Delivery:
Boston Distribution Center
1200 Warehouse Blvd, Boston MA 02128
Contact: Mary Johnson 617-555-0199
Delivery tomorrow 6 AM - 8 AM
Call Mary tonight to confirm ETA.
```

**Prompt**: 💎 Брокер дал все детали. Подтвердите booking.

**Варианты ответов**:

1. **Excellent** ✨:
```
Perfect! Let me confirm: Pickup today 2-4 PM Portland Paper Mill, John 207-555-0155. Delivery tomorrow 6-8 AM Boston Distribution, Mary 617-555-0199. $350 all-in, detention $50/hr. 60-90 min loading, load locks provided. Driver calls John before pickup, Mary tonight. We're 100% confirmed! Sending NOA now.
```

2. **Good** ✔️:
```
Confirmed! Today 2-4 PM Portland, tomorrow 6-8 AM Boston. $350 all-in. Driver calls both contacts. Sending NOA now. Thank you!
```

3. **Normal** ⚪:
```
Confirmed. Today pickup, tomorrow delivery. Sending NOA.
```

4. **Weak** ⚠️:
```
Okay, I think I got everything. We'll be there.
```

5. **Aggressive** 🔴:
```
Yeah, we got it. Just send paperwork!
```

6. **Fail** ❌:
```
Wait, what was the pickup time again?
```

**Outcome (Success)**:
```javascript
{
    brokerResponse: "Excellent! You're very professional and organized.\nRate con sent to Triumph.\nLooking forward to working with you on this load.\nIf everything goes well, I have 5-10 Portland to Boston loads weekly.\nGood luck!",
    outcome: {
        type: "success",
        quality: "excellent",
        rate: "$350",
        ratePerMile: "$3.50/mile",
        relationship: "Excellent - Weekly short haul loads opportunity",
        dialogueTime: "5-7 minutes",
        questionsAsked: "8+ professional questions",
        detailLevel: "high",
        futureOpportunity: "repeat",
        weeklyLoads: "5-10 short haul loads if perform well",
        feedback: "🏆 ОТЛИЧНО!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Дали точное местоположение грузовика\n- Подтвердили capability для heavy load (44,000 lbs)\n- Приняли справедливую short haul ставку ($3.50/mile)\n- Задали важные вопросы о loading и handling\n- Сделали полное резюме всех деталей\n- Быстро подтвердили booking\n\n💡 КЛЮЧЕВОЙ УРОК:\nShort haul грузы имеют premium ставки per mile ($3.50 vs $2.50 long haul). Быстрый и профессиональный booking процесс открывает доступ к weekly loads.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nДля short haul критично: быстрое подтверждение, знание local area, готовность к overnight delivery. Это строит репутацию reliable carrier для regional freight."
    }
}
```

---

## Reject Paths (Пути отказа)

### Reject Path 1: Cannot Handle Heavy Load
**Триггер**: Weak/Fail ответы на шаге 2 (equipment)

**Брокер**:
```
Sorry, I need a carrier with experience handling heavy paper loads.
44,000 lbs requires proper equipment and load securement knowledge.
This is not a training load.
Good luck!
```

**Outcome**:
```javascript
{
    type: "failure",
    quality: "fail",
    rate: "$0",
    ratePerMile: "$0/mile",
    relationship: "Rejected - No heavy load experience",
    dialogueTime: "2-3 minutes",
    questionsAsked: "2 questions",
    detailLevel: "low",
    futureOpportunity: "possible after gaining experience",
    weeklyLoads: "No loads - need heavy load experience",
    feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нет опыта с heavy loads.\n\n44,000 lbs близко к максимальной capacity. Brokers ищут carriers с опытом heavy freight.\n\n💡 УРОК: Для heavy loads нужно показать: equipment capacity, опыт с подобными грузами, понимание load securement. Начните с lighter loads чтобы набрать опыт."
}
```

### Reject Path 2: Cannot Meet Timeline
**Триггер**: Weak/Fail ответы на шаге 3 (schedule)

**Брокер**:
```
Sorry, overnight delivery is mandatory for this customer.
They need paper rolls for morning production run.
I need a carrier who can commit to the timeline.
Thanks anyway.
```

**Outcome**:
```javascript
{
    type: "failure",
    quality: "fail",
    rate: "$0",
    ratePerMile: "$0/mile",
    relationship: "Rejected - Cannot meet timeline",
    dialogueTime: "3-4 minutes",
    questionsAsked: "3 questions",
    detailLevel: "medium",
    futureOpportunity: "possible if can commit to timelines",
    weeklyLoads: "No loads - need timeline commitment",
    feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - не можете выполнить timeline.\n\n100 миль overnight - это очень comfortable schedule. Отказ показывает lack of confidence.\n\n💡 УРОК: Short haul overnight deliveries - это standard practice. 100 миль можно проехать за 2-3 часа. Показывайте уверенность в способности выполнить reasonable timelines."
}
```

### Reject Path 3: Unrealistic Rate
**Триггер**: Aggressive ответ на шаге 4 (rate)

**Брокер**:
```
$500 for 100 miles? That's $5.00 per mile!
Market rate for short haul is $3.00-3.50/mile.
I can't justify $5.00 to my customer.
You're pricing yourself out of the market.
Good luck finding that rate!
```

**Outcome**:
```javascript
{
    type: "failure",
    quality: "fail",
    rate: "$0",
    ratePerMile: "$0/mile",
    relationship: "Rejected - Unrealistic pricing",
    dialogueTime: "4-5 minutes",
    questionsAsked: "4 questions",
    detailLevel: "medium",
    futureOpportunity: "unlikely",
    weeklyLoads: "No loads - damaged relationship",
    feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нереальная агрессивная цена.\n\n$500 ($5.00/mile) слишком высоко для short haul. Рыночная ставка: $3.00-3.50/mile.\n\n💡 УРОК: Short haul имеет premium rates per mile, но есть рыночные пределы. $3.50/mile - это уже premium rate. Агрессивная цена отпугивает brokers и портит репутацию."
}
```

---

## Ключевые навыки диалога

1. **Short haul logistics** - понимание regional freight
2. **Heavy load handling** - работа с грузами близкими к максимуму
3. **Overnight delivery** - планирование tight timelines
4. **Premium short haul rates** - понимание pricing для коротких расстояний
5. **Quick booking** - быстрый и эффективный процесс
6. **Local area knowledge** - знание Portland-Boston lane

---

## Технические детали

- **Общее время диалога**: 5-7 минут (короткий, простой)
- **Количество шагов master path**: 8
- **Количество reject paths**: 3
- **Уровней качества**: 6 (excellent, good, normal, weak, aggressive, fail)
- **Тип груза**: Paper products (не требует специальных permits)
- **Особенности**: Heavy load, short haul, overnight delivery

---

## Следующие шаги

1. Согласовать структуру с пользователем
2. Создать полный JavaScript код диалога
3. Добавить в scenarios-data-v3.js
4. Протестировать в симуляторе
5. Зафиксировать в Git
