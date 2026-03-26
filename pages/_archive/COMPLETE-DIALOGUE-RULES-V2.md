# 📚 ПОЛНОЕ РУКОВОДСТВО ПО СОЗДАНИЮ ДИАЛОГОВ V2.0
## НОВАЯ СТРУКТУРА С WARNING ПУТЯМИ

**Дата создания:** 2026-03-09  
**Версия:** 2.0 FINAL  
**Статус:** 🔒 ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ

---

## 🎯 ГЛАВНОЕ ИЗМЕНЕНИЕ

**ТЕПЕРЬ 3 ТИПА ПУТЕЙ вместо 2!**

1. **MASTER** - хороший путь (15+ шагов)
2. **WARNING** - предупреждение (1 шаг с шансом исправиться)
3. **WARNING_STRICT** - строгое предупреждение (1 шаг, последний шанс)
4. **REJECT_*_FINAL** - полный отказ (только после warning или на шагах 7+)

---

## 🔒 ОСНОВНЫЕ ПРАВИЛА СТРУКТУРЫ

### ШАГИ 1-6 (начало диалога):

**Варианты 1-2** (excellent/good) → **MASTER**
**Варианты 3-4** (normal/weak) → **WARNING** (вежливое предупреждение)
**Варианты 5-6** (aggressive/fail) → **WARNING_STRICT** (строгое предупреждение)

❌ **НЕТ прямого REJECT на шагах 1-6!** Всегда даем шанс исправиться!

### ШАГИ 7+ (середина/конец диалога):

**Варианты 1-2** (excellent/good) → **MASTER**
**Варианты 3-4** (normal/weak) → **WARNING** (вежливое предупреждение)
**Варианты 5-6** (aggressive/fail) → **REJECT_*_FINAL** (прямой отказ!)

✅ **Можно прямой REJECT на шагах 7+!** Брокер уже дал шансы в начале!

---

## 📋 СТРУКТУРА ПУТЕЙ

```javascript
paths: {
    master: [
        // 15+ шагов с 6 вариантами каждый
    ],
    
    warning: [
        {
            brokerResponse: "⚠️ Вежливое предупреждение...",
            dispatcherPrompt: "💡 Брокер сомневается! Исправьтесь!",
            suggestions: [
                { text: "Исправился отлично", quality: "excellent", path: "master" },
                { text: "Исправился хорошо", quality: "good", path: "master" },
                { text: "Исправился минимально", quality: "normal", path: "master" },
                { text: "Не исправился", quality: "weak", path: "reject_weak_final" },
                { text: "Стало хуже", quality: "aggressive", path: "reject_attitude_final" },
                { text: "Провал", quality: "fail", path: "reject_weak_final" }
            ]
        }
    ],
    
    warning_strict: [
        {
            brokerResponse: "⚠️ STOP! Последний шанс! Ответьте профессионально!",
            dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Брокер очень недоволен!",
            suggestions: [
                { text: "Извинился и исправился", quality: "excellent", path: "master" },
                { text: "Исправился", quality: "good", path: "master" },
                { text: "Минимально исправился", quality: "normal", path: "master" },
                { text: "Не исправился", quality: "weak", path: "reject_attitude_final" },
                { text: "Еще хуже", quality: "aggressive", path: "reject_attitude_final" },
                { text: "Провал", quality: "fail", path: "reject_weak_final" }
            ]
        }
    ],
    
    reject_weak_final: [ /* outcome */ ],
    reject_attitude_final: [ /* outcome */ ],
    // ... другие reject
}
```

---

## 📖 ПРИМЕРЫ WARNING ФРАЗ

### WARNING (вежливое для normal/weak):

1. "⚠️ I need more confidence and details. Can you provide clear information?"
2. "⚠️ I'm concerned about uncertainty. Can you clarify?"
3. "⚠️ That's vague. Can you be more specific?"
4. "⚠️ I need better communication. Can you be more professional?"

### WARNING_STRICT (строгое для aggressive/fail):

1. "⚠️ STOP! I don't appreciate that attitude. Last chance - answer professionally!"
2. "⚠️ Hold on! This is business, not a fight. Be respectful or I'm done!"
3. "⚠️ That's unacceptable! Last chance - can you meet requirements or not?"
4. "⚠️ I'm about to hang up. Give me a straight answer!"

---

## 📋 СТРУКТУРА ДИАЛОГА (15+ ШАГОВ)

### БЛОК 1: ПРЕДСТАВЛЕНИЕ (2-3 шага)
1. Диспетчер звонит и представляется
2. Брокер подтверждает + спрашивает MC
3. Диспетчер дает местоположение

### БЛОК 2: ДЕТАЛИ ГРУЗА (2 шага)
4. Брокер дает детали груза
5. Диспетчер подтверждает + дает ETA

### БЛОК 3: REQUIREMENTS (1-2 шага)
6. Брокер спрашивает о requirements (tracking, ETA)

### БЛОК 4: ТОРГ ЗА ЦЕНУ (3-4 шага) ⭐ КЛЮЧЕВОЙ
7. Брокер: "What rate do you need?"
8. Диспетчер называет цену
9. Брокер встречное предложение
10. Диспетчер финальный ответ

### БЛОК 5: ФИНАЛИЗАЦИЯ (2-3 шага)
11. Брокер финализирует + детали
12. Диспетчер дает email
13. OUTCOME

---

## 💰 ПРАВИЛА ТОРГА

### Шкала качества:
- ✨ **Excellent**: +$350-500 от posted
- ✔️ **Good**: +$250-350 от posted
- ⚪ **Normal**: +$150-200 от posted
- ⚠️ **Weak**: +$50-100 от posted
- 🔴 **Aggressive**: +$600+ (нереально)
- ❌ **Fail**: Принял posted без торга

### Формула брокера:
```
Предложение = (Posted + Запрошенная цена) / 2
```

---

## 📊 РАСПРЕДЕЛЕНИЕ ТИПОВ ГРУЗОВ

- **50% Dry Van** - General freight, Electronics, Furniture
- **35% Reefer** - Produce, Frozen food, Dairy, Seafood
- **15% Специализированные** - Flatbed, Hazmat, Auto, Heavy

---

## ✍️ ПРАВИЛА РЕПЛИК

**Максимум 2-3 предложения!**

❌ ЗАПРЕЩЕНО: Длинные реплики
✅ ПРАВИЛЬНО: Короткие, четкие ответы

---

## 🚛 РЕАЛИСТИЧНЫЕ ДАННЫЕ

### Расстояния (650 миль/день):
- Short (350-650): Delivery завтра
- Medium (650-1500): Delivery через 2-3 дня
- Long (1500+): Delivery через 3-4 дня

### Ставки 2026:
**Dry Van:** $2.20-3.50/миля
**Reefer:** $2.60-4.00/миля
**Flatbed:** $2.40-3.80/миля

**Вес:** Максимум 45,000 lbs

---

## 🚫 СТАНДАРТНЫЕ REJECT ПУТИ

- `reject_weak_final` - Неуверенность
- `reject_attitude_final` - Грубость
- `reject_timing_final` - Не вовремя
- `reject_rate_final` - Нереальная цена
- `reject_ultimatum_final` - Ультиматумы
- `reject_final_final` - Торг после "final"
- `reject_email_final` - Нет email

---

## ✅ ЧЕКЛИСТ

### Структура:
- [ ] ТРИ типа путей: master, warning, warning_strict, reject_*_final
- [ ] Master путь 15+ шагов
- [ ] Warning пути по 1 шагу
- [ ] Шаги 1-6: варианты 3-6 → warning
- [ ] Шаги 7+: варианты 5-6 → reject_final
- [ ] Каждый reject = 1 элемент с outcome

### Validation:
- [ ] Запущена `node validate-dialogue.js`
- [ ] Получено 0 ошибок
- [ ] Протестировано в симуляторе
- [ ] Проверены все пути (master, warning, reject)

---

## 🚫 СТРОГО ЗАПРЕЩЕНО

1. Прямой reject на шагах 1-6 (только через warning!)
2. Длинные реплики (>3 предложений)
3. Тупиковые ситуации
4. Нереалистичные ставки
5. Брокер называет цену первым

---

## 🎯 ГЛАВНОЕ ПРАВИЛО

**ТОРГ ЗА ЦЕНУ - ГЛАВНАЯ ЦЕЛЬ ДИСПЕТЧЕРА!**

Чем больше заработает → тем лучше результат!

---

## 📖 ПРИМЕР ПОЛНОЙ СТРУКТУРЫ

```javascript
// ШАГ 2 (рано - через warning)
{
    brokerQuestion: "Where is your reefer?",
    suggestions: [
        { text: "Reefer in Miami at port, empty.", quality: "excellent", path: "master" },
        { text: "Reefer in Miami.", quality: "good", path: "master" },
        { text: "In Miami.", quality: "normal", path: "warning" },
        { text: "Should be in Miami...", quality: "weak", path: "warning" },
        { text: "Just tell rate!", quality: "aggressive", path: "warning_strict" },
        { text: "Can't be there until 8 AM", quality: "fail", path: "warning_strict" }
    ]
},

// ШАГ 8 (поздно - можно прямой reject)
{
    brokerQuestion: "What rate do you need?",
    suggestions: [
        { text: "$4,200 for this load.", quality: "excellent", path: "master" },
        { text: "$4,100 works.", quality: "good", path: "master" },
        { text: "$3,950.", quality: "normal", path: "warning" },
        { text: "$3,900?", quality: "weak", path: "warning" },
        { text: "I need $5,000 minimum!", quality: "aggressive", path: "reject_rate_final" },
        { text: "I'll take $3,850 posted.", quality: "fail", path: "reject_weak_final" }
    ]
}
```

---

**Версия:** 2.0 FINAL  
**Статус:** 🔒 ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ  
**Последнее обновление:** 2026-03-09

**Этот файл содержит НОВЫЕ правила с WARNING путями!**
