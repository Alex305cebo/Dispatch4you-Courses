# 🚛 DRY VAN ДИАЛОГ - ЧАСТЬ 3: ТОРГ ЗА ЦЕНУ ⭐ (Шаги 8-11)

## ⭐ КЛЮЧЕВОЙ БЛОК: ТОРГ ЗА ЦЕНУ

**Posted rate: $5,500 ($2.29/mile)**
**Target rate: $6,000-6,500 ($2.50-2.71/mile)**

---

## ШАГ 8: Брокер спрашивает о rate

**dispatcherPrompt:** "💎 Брокер готов обсудить цену. Назовите ВАШУ цену первым!"

**brokerQuestion:** (Реагирует на качество Шага 7)

**Если Excellent/Good:**
```
"Perfect! You're well-prepared for this electronics load. 
Let's talk rate. What do you need for 2,400 miles?"
```

**Если Normal:**
```
"Okay. What rate are you looking for?"
```

**Если Weak:**
```
"Are you sure you can handle this? What rate?"
```

**Если Aggressive/Fail:**
```
"I need a professional carrier. Let me think about it."
```

**suggestions:**

**1. Excellent:**
```
"For 2,400 miles cross-country with high-value electronics, 
team drivers, 3-day delivery - I'm looking at $6,500. 
That's $2.71/mile, fair for the service level."
```
- quality: "excellent"
- analytics: "✨ Отлично! Просит $1,000 больше posted ($6,500 vs $5,500). Агрессивный торг с обоснованием!"
- path: "master"

**2. Good:**
```
"$6,200 for this load. That's $2.58/mile for cross-country electronics."
```
- quality: "good"
- analytics: "✔️ Хорошо! Просит $700 больше posted. Хороший торг!"
- path: "master"

**3. Normal:**
```
"I'm looking at $6,000 for 2,400 miles."
```
- quality: "normal"
- analytics: "⚪ Нормально. Просит $500 больше posted. Базовый торг."
- path: "master"

**4. Weak:**
```
"Can you do $5,700?"
```
- quality: "weak"
- analytics: "⚠️ Слабо. Просит только $200 больше posted. Плохой торг!"
- path: "master"

**5. Aggressive:**
```
"I need $7,500 minimum or I'm not interested!"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Просит $2,000 больше - нереалистично!"
- path: "reject4"

**6. Fail:**
```
"I'll take the $5,500 posted rate!"
```
- quality: "fail"
- analytics: "❌ ПРОВАЛ! Принял posted rate без торга. Потерял $500-1,000!"
- path: "master"

---


## ШАГ 9: Брокер отвечает встречным предложением

**dispatcherPrompt:** "💎 Брокер дает встречное предложение. Решайте - принять или торговаться еще."

**brokerQuestion:** (Реагирует на качество Шага 8 - ФОРМУЛА!)

**Формула брокера:** `(Posted + Запрошенная) / 2`

**Если Excellent (просил $6,500):**
```
"That's high, but I see you're professional. 
I can do $6,000. That's $2.50/mile for team cross-country."
```
**Расчет:** ($5,500 + $6,500) / 2 = $6,000

**Если Good (просил $6,200):**
```
"I can meet you halfway. How about $5,850?"
```
**Расчет:** ($5,500 + $6,200) / 2 = $5,850

**Если Normal (просил $6,000):**
```
"I can do $5,750 final."
```
**Расчет:** ($5,500 + $6,000) / 2 = $5,750

**Если Weak (просил $5,700):**
```
"$5,600. That's only $100 more than posted."
```
**Расчет:** ($5,500 + $5,700) / 2 = $5,600

**Если Aggressive (просил $7,500):**
```
"That's way too high. Market rate is $2.30-2.50/mile. 
I can't go above $6,000."
```

**Если Fail (принял $5,500):**
```
"Great! $5,500 it is."
```
**(Диспетчер потерял $500-1,000!)**

**suggestions:**

**1. Excellent:**
```
"I appreciate that. Can we do $6,200? 
That's fair for both of us with team drivers and tight schedule."
```
- quality: "excellent"
- analytics: "✨ Отлично! Продолжает торг профессионально, просит еще $200."
- path: "master"

**2. Good:**
```
"$6,000 works if detention is $75/hr after 2 hours."
```
- quality: "good"
- analytics: "✔️ Хорошо! Принимает с условием detention."
- path: "master"

**3. Normal:**
```
"$5,850 works. Let's book it."
```
- quality: "normal"
- analytics: "⚪ Нормально. Принимает предложение брокера."
- path: "master"

**4. Weak:**
```
"Okay, I guess $5,750 is acceptable..."
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неуверенно принимает."
- path: "master"

**5. Aggressive:**
```
"$6,000 or I walk! This is cross-country!"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Ультиматум, риск отказа."
- path: "reject4"

**6. Fail:**
```
"No, I need $6,500 minimum!"
```
- quality: "fail"
- analytics: "❌ Провал. Отказывается от разумного предложения."
- path: "reject4"

---


## ШАГ 10: Брокер финализирует rate

**dispatcherPrompt:** "💎 Брокер дает финальное предложение. Это последний шанс!"

**brokerQuestion:** (Реагирует на качество Шага 9)

**Если Excellent (просил еще $6,200):**
```
"You drive a hard bargain! I can do $6,100 final. 
That's $2.54/mile. Detention $75/hr after 2 hours. Deal?"
```

**Если Good (принял $6,000 с условием):**
```
"Deal! $6,000 with $75/hr detention after 2 hours. 
Pickup today 2-6 PM at TechHub Distribution, 
4500 E Van Buren St, Phoenix. Delivery Thursday noon Miami."
```

**Если Normal (принял $5,850):**
```
"Perfect! $5,850, detention $50/hr after 2 hours. 
Pickup today Phoenix, delivery Thursday Miami."
```

**Если Weak (принял $5,750):**
```
"Okay, $5,750, detention $50/hr. Pickup today Phoenix."
```

**Если Aggressive:**
```
"My final is $6,000. Take it or leave it."
```

**Если Fail:**
```
"I'll call someone more reasonable. Thanks anyway."
```

**suggestions:**

**1. Excellent:**
```
"$6,100 works! Detention $75/hr is fair. 
What's the exact pickup address and contact?"
```
- quality: "excellent"
- analytics: "✨ Отлично! Принимает и сразу к деталям. Заработал $600!"
- path: "master"

**2. Good:**
```
"Perfect! $6,000 with detention. Let's get pickup details."
```
- quality: "good"
- analytics: "✔️ Хорошо! Четкое принятие. Заработал $500!"
- path: "master"

**3. Normal:**
```
"$5,850 confirmed. Pickup address?"
```
- quality: "normal"
- analytics: "⚪ Нормально. Принимает. Заработал $350."
- path: "master"

**4. Weak:**
```
"Okay, $5,750. What's next?"
```
- quality: "weak"
- analytics: "⚠️ Слабо. Заработал только $250."
- path: "master"

**5. Aggressive:**
```
"Fine, $6,000. But I want $100/hr detention!"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Новые требования после согласования."
- path: "reject4"

**6. Fail:**
```
"Wait, can we do $6,200?"
```
- quality: "fail"
- analytics: "❌ Провал. Пытается пересмотреть после финала."
- path: "reject4"

---

## 📊 РЕЗУЛЬТАТЫ ТОРГА

| Качество | Начальная цена | Финальная ставка | Заработал | Оценка |
|----------|----------------|------------------|-----------|--------|
| Excellent | $6,500 | $6,100 | +$600 | ⭐⭐⭐⭐⭐ |
| Good | $6,200 | $6,000 | +$500 | ⭐⭐⭐⭐ |
| Normal | $6,000 | $5,850 | +$350 | ⭐⭐⭐ |
| Weak | $5,700 | $5,750 | +$250 | ⭐⭐ |
| Aggressive | $7,500 | Отказ | $0 | ❌ |
| Fail | $5,500 | $5,500 | $0 | ❌ |

---
