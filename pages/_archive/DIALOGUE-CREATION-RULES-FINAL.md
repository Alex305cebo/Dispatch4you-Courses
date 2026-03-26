# 📚 ПРАВИЛА СОЗДАНИЯ ДИАЛОГОВ - ФИНАЛЬНАЯ ВЕРСИЯ

**Дата:** 2026-03-09  
**Статус:** 🔒 ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ  
**Версия:** 3.0 FINAL

---

## 🚨 КРИТИЧЕСКИЕ ПРАВИЛА (НЕЛЬЗЯ НАРУШАТЬ!)

### 1. ДИСПЕТЧЕР ВСЕГДА ЗВОНИТ ПЕРВЫМ
**НИКОГДА не нарушать!** Диспетчер инициирует звонок:
```
initialMessage: "Good morning! This is [Name] from [Company].\nI'm calling about your posted [equipment] load [route] with [cargo].\nIs this load still available?"
```

### 2. MULTI-STEP WARNING (11 ШАГОВ)
**ОБЯЗАТЕЛЬНО!** Warning путь должен иметь 11 шагов - по одному для каждого шага master.

Каждый warning шаг имеет УНИКАЛЬНОЕ сообщение специфичное для этого этапа:

```javascript
warning: [
    // WARNING ШАГ 1: MC/Company
    {
        brokerResponse: "⚠️ I need your MC number and company name clearly. Can you provide that?",
        dispatcherPrompt: "💡 Брокер хочет MC и компанию! Дайте четко!",
        suggestions: [
            { text: "I apologize! MC 445566, AutoHaul Express...", quality: "excellent", path: "master" },
            { text: "Sorry. MC 445566, AutoHaul...", quality: "good", path: "master" },
            { text: "MC 445566, AutoHaul.", quality: "normal", path: "master" },
            { text: "I think I said MC...", quality: "weak", path: "reject_weak_final" },
            { text: "Why so many questions?", quality: "aggressive", path: "reject_attitude_final" },
            { text: "Not sure about MC.", quality: "fail", path: "reject_weak_final" }
        ]
    },
    // WARNING ШАГ 2: Location/Equipment
    {
        brokerResponse: "⚠️ I need to know where your van is and if you can pick up tomorrow. Can you confirm?",
        dispatcherPrompt: "💡 Брокер хочет местоположение и timing! Подтвердите!",
        suggestions: [...]
    },
    // ... ШАГ 3-11 с уникальными сообщениями
]
```

**Примеры уникальных warning сообщений для каждого шага:**
- Шаг 1 (MC/Company): "I need your MC number and company name clearly..."
- Шаг 2 (Location): "I need to know where your van is and timing..."
- Шаг 3 (Experience): "I need driver's experience and DOT status..."
- Шаг 4 (Insurance): "I need confirmation of insurance coverage..."
- Шаг 5 (Handling): "I need to know how you'll handle the cargo..."
- Шаг 6 (Commitment): "I need commitment for delivery timing..."
- Шаг 7 (Rate): "I need a realistic rate for this load..."
- Шаг 8 (Counter): "I gave you my counter offer. Can you work with it?"
- Шаг 9 (Final): "This is my final offer. Can you accept or not?"
- Шаг 10 (Email): "I need your email to send rate confirmation..."
- Шаг 11 (Success): Outcome с пониженным качеством

---

## 📋 СТРУКТУРА ДИАЛОГА

### Master Path: 11 шагов
1. MC, Company, Fleet
2. Location, Equipment
3. Experience, DOT
4. Insurance
5. Handling/Monitoring
6. Commitment
7. Rate Question (ТОРГ начинается)
8. Counter Offer
9. Final Offer
10. Email
11. SUCCESS OUTCOME

### Warning Path: 11 шагов
- По одному для каждого шага master
- Уникальное сообщение для каждого шага
- Возможность вернуться в master или reject

### Warning_Strict Path: 1 шаг
- Строгое предупреждение
- Последний шанс

### Reject Paths: 7 путей
- reject_weak_final
- reject_attitude_final
- reject_timing_final
- reject_rate_final
- reject_ultimatum_final
- reject_final_final
- reject_email_final

---

## 💰 ПРАВИЛА ТОРГА

### Шкала баллов:
- ⭐ **excellent**: 100 баллов
- ✓ **good**: 80 баллов
- ⚠️ **normal**: 60 баллов
- ⚠️ **weak**: 40 баллов
- ❌ **aggressive/fail**: 10 баллов

### Целевые цены:
- **Excellent**: +$350-500 от posted
- **Good**: +$250-350 от posted
- **Normal**: +$150-200 от posted
- **Weak**: +$50-100 от posted

---

## 🎯 ПРАВИЛА ПУТЕЙ

### Шаги 1-6 (начало):
- Варианты 1-2 (excellent/good) → master
- Варианты 3-4 (normal/weak) → warning
- Варианты 5-6 (aggressive/fail) → warning_strict

### Шаги 7+ (торг):
- Варианты 1-2 (excellent/good) → master
- Варианты 3-4 (normal/weak) → warning
- Варианты 5-6 (aggressive/fail) → reject_*_final (можно прямой reject!)

---

## 📊 РАСПРЕДЕЛЕНИЕ ГРУЗОВ

- **50% Dry Van** - General freight, Electronics, Furniture, Automotive
- **35% Reefer** - Produce, Frozen food, Dairy, Seafood
- **15% Specialized** - Flatbed, Hazmat, Auto, Heavy

---

## ✍️ ПРАВИЛА РЕПЛИК

- Максимум 2-3 предложения
- Короткие, четкие ответы
- Реалистичный язык

---

## 🎨 РАЗНООБРАЗИЕ ДИАЛОГОВ

### Можно нарушать (кроме пункта 1 и 2):
- Стиль брокера (агрессивный, дружелюбный, новичок)
- Брокер называет цену первым
- Груз меняется в середине
- Конкурент появляется
- Backhaul предлагается
- Контракт предлагается
- Длина диалога (7-15 шагов)

### Нельзя нарушать:
1. ❌ Диспетчер звонит первым
2. ❌ Multi-step warning (11 шагов)

---

## 🔍 ПРОВЕРКА ПЕРЕД ДЕПЛОЕМ

```bash
node pages/check-deadlocks.js pages/scenarios-data-vX.js
```

Должно быть:
- ✅ 0 ошибок
- ✅ 0 тупиков
- ✅ Master: 11 шагов
- ✅ Warning: 11 шагов
- ✅ Warning_strict: 1 шаг
- ✅ Reject: 7 путей

---

## 📝 ШАБЛОН НОВОГО ДИАЛОГА

```javascript
const scenarioX = {
    id: X,
    route: "City A → City B",
    distance: XXXX,
    equipment: "Type (size)",
    cargo: "Description",
    weight: "XX,000 lbs",
    postedRate: "$X,XXX ($X.XX/mile)",
    deadline: "Pickup time, Delivery time",
    brokerStyle: "Description",
    difficulty: "easy/medium/hard",
    initialMessage: "Good morning! This is [Name] from [Company].\nI'm calling about your posted [equipment] load...",

    paths: {
        master: [
            // 11 шагов
        ],
        warning: [
            // 11 шагов с уникальными сообщениями
        ],
        warning_strict: [
            // 1 шаг
        ],
        reject_weak_final: [/* outcome */],
        reject_attitude_final: [/* outcome */],
        reject_timing_final: [/* outcome */],
        reject_rate_final: [/* outcome */],
        reject_ultimatum_final: [/* outcome */],
        reject_final_final: [/* outcome */],
        reject_email_final: [/* outcome */]
    }
};
```

---

**Версия:** 3.0 FINAL  
**Последнее обновление:** 2026-03-09  
**Статус:** 🔒 ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ

**ВСЕ БУДУЩИЕ ДИАЛОГИ ДОЛЖНЫ СЛЕДОВАТЬ ЭТИМ ПРАВИЛАМ!**
