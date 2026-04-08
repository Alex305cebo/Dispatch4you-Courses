# 🚛 DRY VAN ДИАЛОГ - ЧАСТЬ 2 (Шаги 4-7)

## ШАГ 4: Брокер дает детали груза (КРАТКО!)

**dispatcherPrompt:** "💎 Брокер дает детали груза. Подтвердите способность выполнить."

**brokerQuestion:** (Реагирует на качество Шага 3)

**Если Excellent/Good:**
```
"2,400 miles, 38K lbs electronics - laptops, tablets, monitors. 
Pickup today 2-6 PM Phoenix, delivery Thursday by noon Miami. 
3 days for cross-country. Works for you?"
```

**Если Normal:**
```
"Phoenix to Miami, 2,400 miles, electronics. 
Pickup today, delivery Thursday. Can you do it?"
```

**Если Weak:**
```
"It's electronics, Phoenix to Miami. Can you handle it?"
```

**Если Aggressive/Fail:**
```
"You seem rushed. Are you serious about this load?"
```

**suggestions:**

**1. Excellent:**
```
"Perfect! 38K lbs electronics, today 2-6 PM pickup, Thursday noon delivery. 
That's 800 miles per day with team drivers. We handle electronics regularly. 
This schedule works great for us."
```
- quality: "excellent"
- analytics: "✨ Отлично! Подтверждение деталей, математика, опыт, уверенность."
- path: "master"

**2. Good:**
```
"Yes, we can make that schedule. 
Team drivers, 2,400 miles in 3 days is comfortable."
```
- quality: "good"
- analytics: "✔️ Хорошо! Четкое подтверждение способности."
- path: "master"

**3. Normal:**
```
"Yes, we can do it. Driver will be on time."
```
- quality: "normal"
- analytics: "⚪ Нормально. Базовое подтверждение."
- path: "master"

**4. Weak:**
```
"I think we can make it... traffic permitting."
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неуверенность, оговорки."
- path: "master"

**5. Aggressive:**
```
"3 days? That's tight! What if there's weather?"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Негатив вместо решения."
- path: "reject2"

**6. Fail:**
```
"Can we have 4 days instead? 3 days seems really tight."
```
- quality: "fail"
- analytics: "❌ Провал. Не может выполнить требования."
- path: "reject2"

---

## ШАГ 5: Диспетчер подтверждает + дает ETA

**dispatcherPrompt:** "💎 Брокер подтвердил детали. Дайте точное ETA на pickup."

**brokerQuestion:** (Реагирует на качество Шага 4)

**Если Excellent/Good:**
```
"Excellent! You sound well-prepared. 
When can your driver be at pickup?"
```

**Если Normal:**
```
"Okay. What time can you pick up?"
```

**Если Weak:**
```
"Are you sure about the timeline?"
```

**Если Aggressive/Fail:**
```
"I need a carrier who can commit to the schedule."
```

**suggestions:**

**1. Excellent:**
```
"Driver's empty now at Phoenix distribution center, 
can be at pickup by 3 PM today. That's within your 2-6 PM window."
```
- quality: "excellent"
- analytics: "✨ Отлично! Точное ETA, текущее местоположение, подтверждение window."
- path: "master"

**2. Good:**
```
"Driver can be there by 4 PM today."
```
- quality: "good"
- analytics: "✔️ Хорошо! Четкое ETA."
- path: "master"

**3. Normal:**
```
"We can pick up today during the window."
```
- quality: "normal"
- analytics: "⚪ Нормально. Базовое подтверждение."
- path: "master"

**4. Weak:**
```
"Driver should be able to make it today..."
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неуверенность."
- path: "master"

**5. Aggressive:**
```
"Yeah, we'll be there. What's the rate?"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Нетерпение, сразу к деньгам."
- path: "reject2"

**6. Fail:**
```
"Driver won't be empty until 8 PM tonight..."
```
- quality: "fail"
- analytics: "❌ Провал. Не может сделать pickup в требуемое время."
- path: "reject2"

---


## ШАГ 6: Брокер спрашивает о requirements (КРАТКО!)

**dispatcherPrompt:** "💎 Брокер проверяет requirements. Подтвердите оборудование."

**brokerQuestion:** (Реагирует на качество Шага 5)

**Если Excellent/Good:**
```
"Perfect timing! This is high-value electronics. 
Trailer clean and dry? Any logistics tracking?"
```

**Если Normal:**
```
"Okay. Is your trailer clean and in good condition?"
```

**Если Weak:**
```
"Can you really make 3 PM pickup?"
```

**Если Aggressive/Fail:**
```
"I'll call someone more reliable."
```

**suggestions:**

**1. Excellent:**
```
"Yes, 2022 dry van, clean interior, air ride suspension. 
We have GPS tracking, updates every 2 hours. 
Trailer inspected last week, perfect for electronics."
```
- quality: "excellent"
- analytics: "✨ Отлично! Детали оборудования, tracking, опыт с electronics."
- path: "master"

**2. Good:**
```
"Yes, clean dry van with air ride. GPS tracking available."
```
- quality: "good"
- analytics: "✔️ Хорошо! Подтверждение оборудования и tracking."
- path: "master"

**3. Normal:**
```
"Yes, trailer is clean and ready."
```
- quality: "normal"
- analytics: "⚪ Нормально. Базовое подтверждение."
- path: "master"

**4. Weak:**
```
"Trailer should be fine... it's pretty clean."
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неуверенность в состоянии оборудования."
- path: "master"

**5. Aggressive:**
```
"It's a dry van! What else matters?"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Пренебрежение требованиями."
- path: "reject3"

**6. Fail:**
```
"Actually, trailer needs cleaning. Can we do it after pickup?"
```
- quality: "fail"
- analytics: "❌ Провал. Оборудование не готово для high-value cargo."
- path: "reject3"

---

## ШАГ 7: Диспетчер подтверждает compliance (КРАТКО!)

**dispatcherPrompt:** "💎 Брокер доволен оборудованием. Подтвердите готовность."

**brokerQuestion:** (Реагирует на качество Шага 6)

**Если Excellent/Good:**
```
"Excellent! You're well-equipped for this load."
```

**Если Normal:**
```
"Okay, sounds good."
```

**Если Weak:**
```
"Make sure trailer is really clean for electronics."
```

**Если Aggressive/Fail:**
```
"I need proper equipment for $200K cargo."
```

**suggestions:**

**1. Excellent:**
```
"We're ready! Trailer secured, load locks available, 
driver experienced with high-value cargo. 
We'll handle this professionally."
```
- quality: "excellent"
- analytics: "✨ Отлично! Полная готовность, детали, профессионализм."
- path: "master"

**2. Good:**
```
"Ready to go! Load locks available, driver experienced."
```
- quality: "good"
- analytics: "✔️ Хорошо! Подтверждение готовности."
- path: "master"

**3. Normal:**
```
"Yes, we're ready."
```
- quality: "normal"
- analytics: "⚪ Нормально. Краткое подтверждение."
- path: "master"

**4. Weak:**
```
"I think we're ready..."
```
- quality: "weak"
- analytics: "⚠️ Слабо. Неуверенность."
- path: "master"

**5. Aggressive:**
```
"Of course we're ready! Let's talk rate!"
```
- quality: "aggressive"
- analytics: "🔴 Агрессивно. Нетерпение."
- path: "reject3"

**6. Fail:**
```
"Do we need special insurance for electronics?"
```
- quality: "fail"
- analytics: "❌ Провал. Не знает базовые требования."
- path: "reject3"

---
