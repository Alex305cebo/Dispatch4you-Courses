# План работы на следующую сессию

## Текущее состояние

### Завершено ✅
1. ✅ Создан steering-файл с правилами создания диалогов (`.kiro/steering/dialog-creation-rules.md`)
2. ✅ Добавлен диалог #3: Produce Reefer (Fresno → NYC) в `scenarios-data-v3.js`
3. ✅ Обновлена цветовая палитра качества ответов (зеленый → красный градиент)
4. ✅ Добавлены номера и значки для всех диалогов
5. ✅ Создан план для 15 новых диалогов (`DIALOG-PLAN-15.md`)
6. ✅ Создана детальная структура диалога #4 (`DIALOG-04-STRUCTURE.md`)
7. ✅ Начат новый файл `scenarios-data-v4.js` (4 шага из 8 готовы)

### Текущие диалоги в системе
- **scenarios-data-v3.js**: Диалоги #1, #2, #3 (работает в симуляторе)
- **scenarios-data-v4.js**: Диалог #4 (в процессе создания, 50% готов)

---

## План на следующую сессию

### Задача 1: Завершить диалог #4 в scenarios-data-v4.js
**Статус**: 🟡 В процессе (4 из 8 шагов готовы)

**Что нужно добавить**:

#### Шаг 5: Detention Terms
```javascript
{
    brokerQuestion: "Yes, detention is $50/hour after 2 hours free time.\nBoth pickup and delivery.\nSound good?",
    dispatcherPrompt: "💎 Брокер дал detention условия. Подтвердите.",
    suggestions: [
        // 6 вариантов качества: excellent, good, normal, weak, aggressive, fail
    ]
}
```

#### Шаг 6: Factoring
```javascript
{
    brokerQuestion: "Yes, we work with all major factoring companies.\nWhich one do you use?",
    dispatcherPrompt: "💎 Брокер работает с factoring. Назовите компанию.",
    suggestions: [
        // 6 вариантов качества
    ]
}
```

#### Шаг 7: Shipper Details
```javascript
{
    brokerQuestion: "Perfect! I'll send rate con to Triumph.\nShipper details:\nPortland Paper Mill\n500 Industrial Way, Portland ME 04101\nContact: John Smith 207-555-0155\nPickup today 2 PM - 4 PM\nAny questions about pickup?",
    dispatcherPrompt: "💎 Брокер дал shipper детали. Задайте вопросы.",
    suggestions: [
        // 6 вариантов качества
    ]
}
```

#### Шаг 8: Delivery Details и Outcome
```javascript
{
    brokerQuestion: "Loading takes 60-90 minutes.\nThey provide load locks and straps.\nPaper rolls are heavy - driver supervises loading.\nCall John 30 minutes before arrival.\nDelivery:\nBoston Distribution Center\n1200 Warehouse Blvd, Boston MA 02128\nContact: Mary Johnson 617-555-0199\nDelivery tomorrow 6 AM - 8 AM\nCall Mary tonight to confirm ETA.",
    dispatcherPrompt: "💎 Брокер дал все детали. Подтвердите booking.",
    suggestions: [
        // 6 вариантов качества
    ]
},
{
    brokerResponse: "Excellent! You're very professional and organized...",
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
        feedback: "🏆 ОТЛИЧНО!..."
    }
}
```

#### Reject Paths (3 пути)
```javascript
reject1: [
    { /* пустой шаг */ },
    {
        brokerResponse: "Sorry, I need a carrier with experience handling heavy paper loads...",
        outcome: { /* reject outcome */ }
    }
],
reject2: [
    { /* пустой шаг */ },
    {
        brokerResponse: "Sorry, overnight delivery is mandatory...",
        outcome: { /* reject outcome */ }
    }
],
reject3: [
    { /* пустой шаг */ },
    {
        brokerResponse: "$500 for 100 miles? That's $5.00 per mile!...",
        outcome: { /* reject outcome */ }
    }
]
```

**Время**: ~30-40 минут

---

### Задача 2: Обновить simulator.html для использования v4
**Статус**: 🔴 Не начато

**Что нужно сделать**:
1. Изменить подключение файла в `pages/simulator.html`:
   ```javascript
   // Было:
   <script src="scenarios-data-v3.js"></script>
   
   // Станет:
   <script src="scenarios-data-v4.js"></script>
   ```

2. Проверить что все работает корректно

**Время**: ~5 минут

---

### Задача 3: Протестировать диалог #4 в симуляторе
**Статус**: 🔴 Не начато

**Что нужно проверить**:
1. ✅ Диалог отображается на главной странице как "#4 🚛 Portland ME → Boston MA"
2. ✅ Все 8 шагов работают корректно
3. ✅ Все 6 уровней качества отображаются правильно
4. ✅ Цвета градиента работают (зеленый → красный)
5. ✅ Reject paths срабатывают правильно
6. ✅ Outcome отображается корректно
7. ✅ Нет синтаксических ошибок

**Время**: ~10-15 минут

---

### Задача 4: Зафиксировать изменения в Git
**Статус**: 🔴 Не начато

**Команды**:
```bash
git add -A
git commit -m "Add dialog #4: Paper Products short haul (Portland-Boston) and create scenarios-data-v4.js"
git status
```

**Что будет в коммите**:
- `pages/scenarios-data-v4.js` (новый файл с диалогом #4)
- `pages/simulator.html` (обновлено подключение на v4)
- `.kiro/specs/dispatcher-broker-dialog/DIALOG-04-STRUCTURE.md` (структура)
- `.kiro/specs/dispatcher-broker-dialog/NEXT-SESSION-PLAN.md` (этот план)

**Время**: ~5 минут

---

### Задача 5 (опционально): Начать диалог #5
**Статус**: 🔴 Не начато

Если останется время, можно начать следующий диалог из плана:

**Диалог #17: Retail Distribution** (Easy, 200 миль)
- Маршрут: Dallas TX → Oklahoma City OK
- Оборудование: Dry Van (53ft)
- Груз: Retail merchandise (clothing, shoes)
- Сложность: Easy
- Особенности: Store delivery, appointment window

**Или**

**Диалог #13: Beverage Distribution** (Easy-Medium, 340 миль)
- Маршрут: Milwaukee WI → Minneapolis MN
- Оборудование: Dry Van (53ft)
- Груз: Beer and wine (palletized)
- Сложность: Easy-Medium
- Особенности: Alcohol permits, multiple stops

**Время**: ~60-90 минут (если начинать новый диалог)

---

## Итоговый план сессии

### Обязательные задачи (50-60 минут):
1. ✅ Завершить диалог #4 (шаги 5-8 + reject paths) - 30-40 мин
2. ✅ Обновить simulator.html на v4 - 5 мин
3. ✅ Протестировать в симуляторе - 10-15 мин
4. ✅ Зафиксировать в Git - 5 мин

### Опциональные задачи (если останется время):
5. 🔄 Начать диалог #5 или #17 - 60-90 мин

---

## Ожидаемый результат

После завершения сессии:
- ✅ Диалог #4 полностью готов и работает в симуляторе
- ✅ Система использует `scenarios-data-v4.js`
- ✅ Все изменения зафиксированы в Git
- ✅ Готовы к созданию следующих диалогов (#5-#18)

---

## Файлы для работы

### Основные файлы:
1. `pages/scenarios-data-v4.js` - основной файл для работы
2. `pages/simulator.html` - обновить подключение
3. `.kiro/specs/dispatcher-broker-dialog/DIALOG-04-STRUCTURE.md` - справочник по структуре

### Справочные файлы:
- `.kiro/specs/dispatcher-broker-dialog/DIALOG-PLAN-15.md` - план всех 15 диалогов
- `.kiro/steering/dialog-creation-rules.md` - правила создания диалогов
- `pages/scenarios-data-v3.js` - примеры существующих диалогов

---

## Команды для быстрого старта

```bash
# Проверить текущее состояние
git status

# Открыть файл для редактирования
# pages/scenarios-data-v4.js

# После завершения - протестировать
# Открыть pages/simulator.html в браузере

# Зафиксировать изменения
git add -A
git commit -m "Add dialog #4: Paper Products short haul"
```

---

## Контрольный список (Checklist)

### Диалог #4:
- [ ] Шаг 5: Detention Terms (6 вариантов)
- [ ] Шаг 6: Factoring (6 вариантов)
- [ ] Шаг 7: Shipper Details (6 вариантов)
- [ ] Шаг 8: Delivery Details (6 вариантов)
- [ ] Outcome для success
- [ ] Reject Path 1: Heavy Load
- [ ] Reject Path 2: Timeline
- [ ] Reject Path 3: Pricing
- [ ] Закрывающая скобка массива `];`

### Интеграция:
- [ ] Обновить simulator.html на v4
- [ ] Проверить отображение на главной
- [ ] Протестировать все шаги
- [ ] Проверить reject paths
- [ ] Проверить цвета качества

### Git:
- [ ] git add -A
- [ ] git commit
- [ ] git status
- [ ] (опционально) git push

---

## Готово к следующей сессии! 🚀
