# 3 НОВЫХ ПРОСТЫХ ДИАЛОГА

## ИЗМЕНЕНИЯ
- ✅ Откатил все изменения в simulator.html к исходному состоянию
- ✅ Удалил scenarios-generator-15.js (15 диалогов)
- ✅ Создал 3 новых простых диалога

## НОВЫЕ ДИАЛОГИ

### Диалог #1: Dry Van General Freight
- **Маршрут**: Chicago IL → New York NY
- **Расстояние**: 790 miles
- **Оборудование**: Dry Van (53ft)
- **Груз**: General freight, 40,000 lbs
- **Ставка**: $2,100 ($2.66/mile)
- **Компания**: FastLoad Logistics
- **Сложность**: Easy

**Структура**:
- 3 шага в master path
- Weak path с шансом исправиться
- Reject path при провале

### Диалог #2: Reefer Produce
- **Маршрут**: Los Angeles CA → Seattle WA
- **Расстояние**: 1,135 miles
- **Оборудование**: Reefer (53ft)
- **Груз**: Fresh produce, 44,000 lbs
- **Ставка**: $3,200 ($2.82/mile)
- **Компания**: ColdChain Express
- **Сложность**: Medium
- **Особенность**: Требуется поддержание температуры 34°F

**Структура**:
- 3 шага в master path
- Weak path с проверкой опыта с reefer
- Reject path при отсутствии опыта

### Диалог #3: Flatbed Construction
- **Маршрут**: Dallas TX → Denver CO
- **Расстояние**: 780 miles
- **Оборудование**: Flatbed (48ft)
- **Груз**: Steel beams, 45,000 lbs
- **Ставка**: $2,400 ($3.08/mile)
- **Компания**: SteelHaul Logistics
- **Сложность**: Medium
- **Особенность**: Требуется securement equipment (tarps, chains, straps)

**Структура**:
- 3 шага в master path
- Weak path с проверкой опыта с flatbed
- Reject path при отсутствии опыта

## ФАЙЛЫ

- `pages/scenarios-data-v1.js` - Диалог #1 (Dry Van)
- `pages/scenarios-data-v2.js` - Диалог #2 (Reefer)
- `pages/scenarios-data-v3.js` - Диалог #3 (Flatbed)
- `pages/simulator.html` - Обновлен для загрузки 3 файлов

## СТРУКТУРА КАЖДОГО ДИАЛОГА

```javascript
{
    id: 1-3,
    route: "Origin → Destination",
    distance: miles,
    equipment: "Type",
    cargo: "Description",
    weight: "lbs",
    postedRate: "$amount ($per_mile)",
    initialMessage: "Dispatcher greeting",
    
    paths: {
        master: [
            { brokerQuestion, suggestions: [excellent, normal, weak] },
            { brokerQuestion, suggestions: [excellent, normal, weak] },
            { brokerQuestion, brokerResponse, outcome: success }
        ],
        weak: [
            {},
            { brokerQuestion, suggestions: [good to master, fail to reject] }
        ],
        reject: [
            {}, {},
            { brokerResponse, outcome: failure }
        ]
    }
}
```

## КАК ТЕСТИРОВАТЬ

1. Откройте `pages/simulator.html` в браузере
2. Должны увидеть 3 карточки грузов:
   - #1: Chicago → New York (Dry Van) 🚛
   - #2: Los Angeles → Seattle (Reefer) ❄️
   - #3: Dallas → Denver (Flatbed) 📦
3. Кликните на любую карточку для начала диалога
4. Кнопка "Случайный диалог" выбирает случайный из 3

## КОНСОЛЬ

Должно показать:
```
✅ Initialized allScenarios array
🔵 Loading scenario #1...
✅ Scenario #1 added
🔵 Loading scenario #2...
✅ Scenario #2 added
🔵 Loading scenario #3...
✅ Scenario #3 added
📊 Total scenarios loaded: 3
  - #1: Chicago IL → New York NY
  - #2: Los Angeles CA → Seattle WA
  - #3: Dallas TX → Denver CO
```

## СТАТУС
✅ ГОТОВО - 3 простых диалога созданы

Date: March 8, 2026
