# 🚛 ПОЛНЫЙ ПРИМЕР: DRY VAN ДИАЛОГ (Phoenix AZ → Miami FL)

## 📋 МЕТАДАННЫЕ

- **ID:** 7
- **Route:** Phoenix AZ → Miami FL
- **Distance:** 2,400 miles
- **Equipment:** Dry Van (53ft)
- **Cargo:** Electronics (laptops, tablets, monitors)
- **Weight:** 38,000 lbs
- **Posted Rate:** $5,500 ($2.29/mile)
- **Target Rate:** $6,000-6,500 ($2.50-2.71/mile)
- **Difficulty:** Medium
- **Broker:** Jennifer from TechFreight Logistics
- **Тип груза:** Dry Van (50% категория) ✅

---

## 🎬 ДИАЛОГ (14 ШАГОВ)

### ШАГ 1: Диспетчер звонит

**dispatcherPrompt:** "💎 Вы звоните брокеру. Представьтесь профессионально."

**brokerQuestion:** (Нет - диспетчер звонит первым)

**suggestions:**

**1. Excellent:**
```
"Good afternoon! This is calling from FastLane Transport, MC 554433. 
I saw your Phoenix to Miami dry van load, 2,400 miles. Still available?"
```
- quality: "excellent"
- analytics: "✨ Отлично! Полное представление, MC номер, маршрут, вопрос."
- path: "master"

**2. Good:**
```
"Hi, FastLane Transport. Phoenix-Miami dry van load available?"
```
- quality: "good"
- analytics: "✔️ Хорошо! Представление и вопрос."
- path: "master"

**3. Normal:**
```
"Hi, calling about Phoenix-Miami load. Available?"
```
- quality: "normal"
- analytics: "⚪ Нормально. Базовое представление."
- path: "master"

**4. Weak:**
```
"Uh... hello, is the Phoenix load still there?"
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неуверенное представление, не назвал компанию."
- path: "master"

**5. Aggressive:**
```
"Yeah, what's the rate on that Miami load?"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Грубость, не представился, сразу к деньгам."
- path: "reject1"

**6. Fail:**
```
"Hi, is the load available?"
```
- quality: "fail"
- analytics: "❌ Провал. Не представился, не назвал компанию, не указал маршрут."
- path: "reject1"

---


### ШАГ 2: Брокер подтверждает + спрашивает MC

**dispatcherPrompt:** "💎 Брокер отвечает. Дайте информацию о местоположении."

**brokerQuestion:** (Реагирует на качество Шага 1)

**Если Excellent/Good:**
```
"Yes, available! MC 554433 verified, excellent safety rating. 
Where's your truck right now?"
```

**Если Normal:**
```
"Yes, available. What's your MC number?"
```

**Если Weak:**
```
"It's available... who are you with?"
```

**Если Aggressive/Fail:**
```
"Hold on, who is this? What company?"
```

**suggestions:**

**1. Excellent:**
```
"Truck's in Phoenix, empty at distribution center. 
Ready today. What's pickup time and rate?"
```
- quality: "excellent"
- analytics: "✨ Отлично! Точное местоположение, готовность, проактивные вопросы."
- path: "master"

**2. Good:**
```
"In Phoenix, empty. When's pickup?"
```
- quality: "good"
- analytics: "✔️ Хорошо! Местоположение и вопрос."
- path: "master"

**3. Normal:**
```
"Phoenix area. When's pickup?"
```
- quality: "normal"
- analytics: "⚪ Нормально. Базовая информация."
- path: "master"

**4. Weak:**
```
"Somewhere near Phoenix..."
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неточное местоположение."
- path: "master"

**5. Aggressive:**
```
"Just tell me the rate!"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Игнорирует вопрос брокера."
- path: "reject1"

**6. Fail:**
```
"Let me check where the truck is..."
```
- quality: "fail"
- analytics: "❌ Провал. Не знает местоположение своего грузовика."
- path: "reject1"

---

### ШАГ 3: Диспетчер спрашивает детали

**dispatcherPrompt:** "💎 Брокер дал местоположение. Уточните детали груза."

**brokerQuestion:** (Реагирует на качество Шага 2)

**Если Excellent/Good:**
```
"Perfect! Phoenix location works great."
```

**Если Normal:**
```
"Okay, Phoenix area."
```

**Если Weak:**
```
"Phoenix area... can you be more specific?"
```

**Если Aggressive/Fail:**
```
"I need exact location. Call me back when you know."
```

**suggestions:**

**1. Excellent:**
```
"Great! What's the cargo, pickup window, and delivery deadline?"
```
- quality: "excellent"
- analytics: "✨ Отлично! Три ключевых вопроса сразу."
- path: "master"

**2. Good:**
```
"What's pickup time and delivery deadline?"
```
- quality: "good"
- analytics: "✔️ Хорошо! Важные вопросы."
- path: "master"

**3. Normal:**
```
"When's pickup and delivery?"
```
- quality: "normal"
- analytics: "⚪ Нормально. Базовые вопросы."
- path: "master"

**4. Weak:**
```
"When do I pick up?"
```
- quality: "weak"
- analytics: "⚠️ Слабо. Только один вопрос."
- path: "master"

**5. Aggressive:**
```
"Just tell me the rate already!"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Не интересуется деталями груза."
- path: "reject2"

**6. Fail:**
```
"Okay, send me the details."
```
- quality: "fail"
- analytics: "❌ Провал. Не задает вопросы, пассивен."
- path: "reject2"

---

