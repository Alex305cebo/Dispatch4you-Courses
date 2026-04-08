# 📚 БАЗА ЗНАНИЙ ДЛЯ СОЗДАНИЯ РЕАЛИСТИЧНЫХ ДИАЛОГОВ
## Проект Симуль - Dispatch Simulator

---

## 🎯 ГЛАВНАЯ ЦЕЛЬ
Обучать диспетчера правильно и грамотно общаться с брокером

---

## ✅ ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ДЛЯ СОЗДАНИЯ ДИАЛОГОВ

### ⚠️ КРИТИЧЕСКОЕ ПРАВИЛО #0: ЛАКОНИЧНОСТЬ И ЕДИНООБРАЗИЕ ТЕКСТА

**🎯 ЭТО ОЧЕНЬ ВАЖНО ДЛЯ УДОБСТВА ПОЛЬЗОВАТЕЛЯ!**

#### Требования к длине текста:

**1. СООБЩЕНИЯ БРОКЕРА:**
- Не слишком короткие (минимум 2 предложения)
- Не слишком длинные (максимум 4 предложения)
- Оптимально: 2-3 предложения по 10-15 слов каждое
- Примерно 100-200 символов на сообщение

**2. ПОДСКАЗКИ (SUGGESTIONS):**
- ВСЕ подсказки должны быть примерно ОДИНАКОВОЙ длины
- Не слишком короткие (минимум 2 предложения)
- Не слишком длинные (максимум 4 предложения)
- Оптимально: 2-3 предложения
- Примерно 150-250 символов на подсказку
- Разница между самой короткой и самой длинной подсказкой не более 50 символов

**3. АНАЛИТИКА (ANALYTICS):**
- Максимум 1-2 предложения
- Краткое объяснение почему этот выбор хорош/плох
- Примерно 80-150 символов

**4. СОВЕТЫ (DISPATCHER PROMPT):**
- Максимум 1 предложение
- Краткая подсказка что нужно сделать
- Примерно 50-100 символов

#### ❌ НЕПРАВИЛЬНО (разная длина подсказок):
```javascript
suggestions: [
    { 
        text: "MC 445566.", // ← Слишком коротко! (11 символов)
        quality: "weak" 
    },
    { 
        text: "MC 445566.\nWe specialize in temperature-controlled freight with 12 years of experience in the industry.\n2023 Carrier reefer unit, 53ft trailer with advanced multi-temp zones capability.\nDriver currently in Chicago, HACCP certified, ready for morning pickup with full tank.", // ← Слишком длинно! (300+ символов)
        quality: "master" 
    }
]
```

#### ✅ ПРАВИЛЬНО (одинаковая длина подсказок):
```javascript
suggestions: [
    { 
        text: "MC 445566.\nWe have reefer experience, 12 years in business.\n2023 Carrier unit, driver in Chicago ready.", // ← 120 символов
        quality: "good" 
    },
    { 
        text: "MC 445566.\nTemperature-controlled specialist, 12 years experience.\n2023 Carrier reefer, 53ft multi-temp, driver Chicago, HACCP certified.", // ← 150 символов
        quality: "master" 
    },
    { 
        text: "MC 445566.\nWe do reefer loads.\nDriver available in Chicago area.", // ← 90 символов
        quality: "weak" 
    }
]
```

#### 💡 ПРАВИЛО:
- Все подсказки должны быть визуально примерно одинаковой длины
- Пользователь не должен видеть одну подсказку в 1 строку, а другую в 5 строк
- Это создает визуальный баланс и удобство выбора
- Качество ответа определяется СОДЕРЖАНИЕМ, а не длиной

---

### ⚠️ КРИТИЧЕСКОЕ ПРАВИЛО #1: НИКОГДА НЕ СОЗДАВАТЬ ТУПИКОВЫЕ СИТУАЦИИ!

**🚨 ЭТО САМОЕ ВАЖНОЕ ПРАВИЛО! БЕЗ ЭТОГО ДИАЛОГ СЛОМАЕТСЯ!**

#### Проблема:
Если в диалоге есть только путь `master`, а пользователь выбирает вариант `good` или `weak`, диалог останавливается и заходит в тупик. Брокер не отвечает, пользователь застревает.

#### Решение - ДВА СПОСОБА:

**СПОСОБ 1: Добавить `path: "master"` ко ВСЕМ вариантам в первом шаге**
```javascript
suggestions: [
    {
        text: "Отличный ответ...",
        quality: "master",
        path: "master",  // ← ОБЯЗАТЕЛЬНО!
        analytics: "..."
    },
    {
        text: "Хороший ответ...",
        quality: "good",
        path: "master",  // ← ВСЕ ВЕДУТ К MASTER!
        analytics: "..."
    },
    {
        text: "Слабый ответ...",
        quality: "weak",
        path: "master",  // ← ДАЖЕ WEAK ВЕДЕТ К MASTER!
        analytics: "..."
    }
]
```

**СПОСОБ 2: Создать все пути (master, good, normal, weak)**
```javascript
paths: {
    master: [ /* 18-30 шагов */ ],
    good: [ /* 14-22 шагов */ ],
    normal: [ /* 12-17 шагов */ ],
    weak: [ /* 8-12 шагов */ ]
}
```

#### ✅ ПРАВИЛО:
- Если у вас только один путь → добавьте `path: "master"` ко ВСЕМ suggestions в первом шаге
- Если у вас несколько путей → убедитесь что ВСЕ пути существуют
- НИКОГДА не оставляйте suggestions без `path` если путей меньше чем вариантов ответов

#### ❌ НЕПРАВИЛЬНО (ТУПИК):
```javascript
paths: {
    master: [...]  // Только один путь
},
suggestions: [
    { quality: "master" },  // ← Нет path!
    { quality: "good" },    // ← Система ищет paths.good - НЕ НАХОДИТ - ТУПИК!
    { quality: "weak" }     // ← Система ищет paths.weak - НЕ НАХОДИТ - ТУПИК!
]
```

#### ✅ ПРАВИЛЬНО (НЕТ ТУПИКА):
```javascript
paths: {
    master: [...]  // Только один путь
},
suggestions: [
    { quality: "master", path: "master" },  // ← Явно указан путь
    { quality: "good", path: "master" },    // ← Все ведут к master
    { quality: "weak", path: "master" }     // ← Нет тупика!
]
```

---

### 1. ПЕРВОЕ СООБЩЕНИЕ ДИСПЕТЧЕРА - ВСЕГДА ПРОФЕССИОНАЛЬНОЕ
```
"Good morning!
This is [Имя] from [Компания].
I'm calling about your [Маршрут] [Тип] load.
Is this still available?"
```

**Обязательно включает:**
- Приветствие (Good morning/afternoon)
- Имя диспетчера
- Название компании
- Полный маршрут
- Тип оборудования
- Вежливый вопрос

**❌ НЕ ВКЛЮЧАТЬ:** Reference номер груза (очень редко нужен)

### 2. БРОКЕР ОТПРАВЛЯЕТ ТОЛЬКО ОДНО СООБЩЕНИЕ
- Брокер пишет ОДНО сообщение (2-4 предложения)
- Ждет ответа диспетчера
- Только потом следующее сообщение
- ❌ НЕТ нескольких сообщений подряд
- ❌ НЕТ массивов в brokerResponse

### 3. КАЖДОЕ СООБЩЕНИЕ БРОКЕРА ДОЛЖНО ДАВАТЬ НОВУЮ ИНФОРМАЦИЮ
- Брокер не просто задает вопросы
- Брокер ОТВЕЧАЕТ на предыдущий ответ диспетчера
- Брокер ДАЕТ информацию о грузе постепенно
- Брокер РЕАГИРУЕТ на то что сказал диспетчер
- Диалог развивается логично - каждый ответ связан с предыдущим

**ПРАВИЛЬНО:**
```
Диспетчер: "MC 445566, reefer specialist, driver in Chicago"
Брокер: "Excellent! Verified MC 445566 - 99% safety score.
This is 44,000 lbs produce, must maintain 34°F.
Pickup tomorrow 6 AM Chicago, delivery Miami in 48 hours.
What's your rate?"
```

**НЕПРАВИЛЬНО:**
```
Диспетчер: "MC 445566, reefer specialist"
Брокер: "Where is your driver?" ❌ (не отреагировал на информацию)
```

### 4. ЛОГИЧНОЕ РАЗВИТИЕ СОБЫТИЙ
Диалог должен идти в правильной последовательности.

**МАСТЕР путь:** минимум 18 шагов, рекомендуется 18-30+
**ХОРОШИЙ путь:** 14-22 шагов
**НОРМАЛЬНЫЙ путь:** 12-17 шагов

Базовая структура реального диалога для МАСТЕР пути:

**ШАГ 1: Первый контакт**
- Диспетчер звонит профессионально (Good morning, имя, компания, маршрут, оборудование)
- Брокер подтверждает груз доступен
- Брокер спрашивает MC + местоположение/оборудование

**ШАГ 2: Проверка перевозчика и местоположение**
- Диспетчер дает MC номер
- Диспетчер дает местоположение водителя (empty in [city], deadhead distance)
- Брокер проверяет MC

**ШАГ 3: Детали оборудования**
- Диспетчер дает детали трейлера (год, марка, тип дверей для dry van, reefer unit для reefer)
- Диспетчер дает детали трака (год, марка)
- Брокер подтверждает и дает ПЕРВЫЕ детали груза

**ШАГ 4: Опыт и сертификаты**
- Диспетчер показывает опыт компании (years in business, специализация)
- Диспетчер показывает опыт водителя (years OTR, сертификаты)
- Брокер впечатлен и дает больше деталей груза

**ШАГ 5: Детали груза - вес и commodity**
- Брокер дает полные детали: точный вес, commodity, количество паллет
- Брокер дает специальные требования (температура для reefer, handling для хрупкого)
- Диспетчер подтверждает возможности или задает уточняющие вопросы

**ШАГ 6: Pickup время и адрес**
- Брокер дает pickup дату, время, окно загрузки
- Брокер дает адрес, город, штат
- Диспетчер спрашивает про dock number, gate code, appointment

**ШАГ 7: Pickup детали и процесс**
- Брокер дает dock number, gate code (если есть)
- Брокер объясняет процесс загрузки (FCFS или appointment, сколько часов)
- Диспетчер спрашивает про lumper fee, кто загружает, special instructions

**ШАГ 8: Delivery адрес и окно**
- Брокер дает delivery адрес, город, штат
- Брокер дает delivery window (дата, время, или "X days from pickup")
- Диспетчер спрашивает про appointment requirement, receiver contact

**ШАГ 9: Delivery детали и процесс**
- Брокер дает receiver contact, appointment details
- Брокер объясняет процесс разгрузки (сколько часов, FCFS или appointment)
- Диспетчер спрашивает про detention policy, unloading process

**ШАГ 10: HOS и timeline**
- Брокер уточняет timeline (can you make it in X days?)
- Диспетчер объясняет HOS situation (hours available, team или solo)
- Диспетчер подтверждает возможность доставки в срок

**ШАГ 11: Обсуждение ставки**
- Брокер называет posted rate ИЛИ спрашивает "what's your rate?"
- Диспетчер называет свою ставку с детальным обоснованием ($/mile, fuel, опыт, сервис)
- Брокер реагирует на предложение

**ШАГ 12: Торговля раунд 1**
- Брокер дает контр-предложение с объяснением (budget, customer constraints)
- Диспетчер обосновывает свою ценность (опыт, надежность, специальный сервис)
- Брокер рассматривает

**ШАГ 13: Торговля раунд 2 (опционально)**
- Брокер говорит что позвонит клиенту или проверит budget
- Диспетчер добавляет дополнительные гарантии (updates, photos, special care)
- Компромисс найден

**ШАГ 14: Согласие на ставку**
- Финальная ставка согласована
- Брокер подтверждает и спрашивает про factoring
- Диспетчер радуется сделке

**ШАГ 15: Factoring и документы**
- Диспетчер дает factoring company name
- Диспетчер говорит что отправит NOA немедленно
- Брокер подтверждает, говорит что отправит rate con

**ШАГ 16: Shipper контакт**
- Брокер дает shipper contact (имя, телефон)
- Диспетчер говорит что свяжется с shipper
- Диспетчер спрашивает дополнительные детали

**ШАГ 17: Специальное оборудование**
- Диспетчер спрашивает про load locks, straps, blankets (кто предоставляет?)
- Брокер объясняет что нужно принести
- Диспетчер подтверждает наличие оборудования

**ШАГ 18: Routing и ограничения**
- Диспетчер спрашивает про routing restrictions, preferred route
- Брокер дает рекомендации (avoid certain roads, best route)
- Диспетчер подтверждает маршрут

**ШАГ 19: Технологии и отслеживание**
- Брокер спрашивает про GPS tracking, updates frequency
- Диспетчер объясняет систему отслеживания (Macropoint, check calls, photos)
- Брокер доволен уровнем коммуникации

**ШАГ 20: Специальные требования**
- Брокер требует seal photos, securement photos, temperature logs (для reefer)
- Диспетчер подтверждает и обещает отправить все фото
- Брокер дает свой email и 24/7 contact

**ШАГ 21: Weather и delays protocol**
- Диспетчер спрашивает про weather delays protocol, что делать если проблемы
- Брокер дает 24/7 contact и объясняет процедуру
- Диспетчер сохраняет контакты

**ШАГ 22: Финальное подтверждение**
- Диспетчер подтверждает ВСЕ детали (pickup, delivery, rate, requirements)
- Диспетчер показывает проактивность (позвоню shipper сегодня, pre-cool unit, и т.д.)
- Брокер впечатлен организованностью

**ШАГ 23: Построение отношений**
- Брокер выражает благодарность за профессионализм
- Брокер обещает будущие грузы (preferred carrier status)
- Диспетчер благодарит за возможность

**ШАГ 24-25+: Дополнительные детали (опционально)**
- Вопросы про detention rates
- Вопросы про TONU policy
- Вопросы про layover pay
- Вопросы про accessorial charges
- Любые другие реалистичные детали

**ВАЖНО:** 
- Это базовая структура из 23+ шагов для ДЕТАЛЬНОГО МАСТЕР диалога
- Можно добавлять еще больше шагов с дополнительными вопросами
- Каждый шаг должен давать новую информацию и развивать диалог
- Брокер всегда реагирует на ответы диспетчера
- Нет пустых вопросов - каждый вопрос имеет цель

### 5. БРОКЕР НЕ ЗАДАЕТ ПУСТЫЕ ВОПРОСЫ
- Каждый вопрос брокера имеет цель
- Брокер не спрашивает одно и то же
- Брокер дает информацию ВМЕСТЕ с вопросом

**ПРАВИЛЬНО:**
```
"Verified your MC - excellent record.
This is 44,000 lbs produce, 34°F constant.
Pickup tomorrow 6 AM, delivery in 48 hours.
Can you handle this and what's your rate?"
```

**НЕПРАВИЛЬНО:**
```
"What's your rate?" ❌ (слишком пусто, нет контекста)
"Any questions?" ❌ (пустой вопрос)
```

### 6. МАКСИМУМ 3-4 ПРЕДЛОЖЕНИЯ ВЕЗДЕ
- Вопросы брокера: 2-4 предложения
- Ответы диспетчера: 2-4 предложения
- Советы (dispatcherPrompt): 1 предложение
- Аналитика: 1-2 предложения

### 7. НИКОГДА НЕ ЗАХОДИТЬ В ТУПИК
- Всегда есть выход из ситуации
- Даже отказ ведет к обучению
- Нет тупиковых ситуаций без объяснения

### 8. КАЖДОЕ СООБЩЕНИЕ УНИКАЛЬНО
- Нет повторяющихся фраз
- Каждый ответ добавляет новую информацию
- Прогрессия в диалоге

### 9. РЕАЛИСТИЧНЫЕ ПЕРЕГОВОРЫ О СТАВКЕ
- Брокер не соглашается сразу
- Идет торговля (2-3 раунда)
- Компромисс или отказ
- Обоснование цены с обеих сторон

### 10. КАЖДОЕ ПРЕДЛОЖЕНИЕ С НОВОЙ СТРОКИ `\n`
```javascript
text: "Good morning!\nThis is Robert from Lone Star Logistics.\nI'm calling about your Dallas to Atlanta dry van load.\nIs this still available?"
```

---

## 📝 ФОРМАТ СООБЩЕНИЙ

### Каждое предложение с новой строки `\n`:

```javascript
initialMessage: "Good morning!\nThis is Michael from Midwest Cold Chain Logistics.\nI'm calling about your Chicago to Miami reefer load.\nIs this still available?"

brokerQuestion: "Yes, available.\nMC number and equipment details?"

brokerResponse: "Excellent!\nVerified MC 445566 - 99% safety score.\nThis is 44,000 lbs produce, must maintain 34°F constant.\nPickup tomorrow 6 AM, delivery in 48 hours Miami.\nCan you handle this?"

dispatcherPrompt: "💎 Брокер хочет услышать ваш MC номер и вид трейлера"

suggestions: [
    { 
        text: "MC 445566.\nWe specialize in temperature-controlled freight, 12 years experience.\n2023 Carrier reefer unit, 53ft with multi-temp zones.\nDriver in Chicago now, HACCP certified, ready for morning pickup.", 
        quality: "master" 
    }
]
```

---

## 🛤️ СТРУКТУРА ПУТЕЙ РАЗВИТИЯ

Минимум 3 пути, рекомендуется 5-6:

### МАСТЕР/EXCELLENT (💎)
- Минимум 18 шагов, рекомендуется 18-30+
- Максимальный результат
- Детальная информация
- Проактивность
- Все возможные вопросы и уточнения
- Построение долгосрочных отношений

### ХОРОШИЙ/GOOD (✅)
- 14-22 шагов
- Стандартный успех
- Профессионализм
- Основные вопросы
- Хорошая ставка

### НОРМАЛЬНЫЙ/NORMAL (⚪)
- 12-17 шагов
- Базовый успех
- Минимум информации
- Средняя ставка

### АГРЕССИВНЫЙ/AGGRESSIVE (⚠️)
- 3-4 шага
- Испорченные отношения
- Высокие требования
- Обучение: что НЕ надо делать

### СЛАБЫЙ/WEAK (⚠️)
- 3-4 шага
- Низкая ставка
- Неуверенность
- Обучение: потеря денег

### ОТКАЗ/FAIL (❌)
- 1-2 шага
- Потеря груза
- Непрофессионализм
- Обучение: критические ошибки

---

## 📈 МЕТРИКИ УСПЕХА В OUTCOME

Каждый outcome должен содержать детальную информацию:

### Основные метрики:
```javascript
outcome: {
    type: "success" / "fail" / "partial",
    quality: "master" / "good" / "normal" / "weak" / "aggressive" / "fail",
    rate: "$X,XXX",
    ratePerMile: "$X.XX/mile",
    relationship: "описание отношений с брокером",
    
    // Новые метрики:
    dialogueTime: "Примерное время диалога (5-15 минут)",
    questionsAsked: "Количество заданных вопросов диспетчером",
    detailLevel: "high / medium / low",
    futureOpportunity: "one-time / repeat / preferred / partnership",
    weeklyLoads: "0 / 1-2 / 3-5 / 5-10",
    
    feedback: "Детальная обратная связь"
}
```

### Примеры relationship статусов:
- **One-time carrier:** Разовый груз, нет гарантий на будущее
- **Repeat carrier:** Брокер позвонит снова при наличии грузов
- **Preferred carrier:** Первый в списке, 3-5 грузов в неделю
- **Partnership:** Долгосрочное сотрудничество, 5-10+ грузов в неделю
- **Blacklisted:** Больше никогда не позвонит

---

## 🎓 ОБУЧАЮЩИЕ МОМЕНТЫ

После каждого outcome добавлять детальный разбор:

### Структура обучения:
```javascript
outcome: {
    // ... основные данные ...
    
    feedback: `
🏆 РЕЗУЛЬТАТ: [Master/Good/Normal/Weak/Fail]

✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:
- Пункт 1: конкретное действие и почему это хорошо
- Пункт 2: конкретное действие и почему это хорошо
- Пункт 3: конкретное действие и почему это хорошо

⚠️ ЧТО МОЖНО УЛУЧШИТЬ:
- Пункт 1: что упущено и как это исправить
- Пункт 2: что упущено и как это исправить

💡 КЛЮЧЕВОЙ УРОК:
Одна главная мысль, которую нужно запомнить из этого диалога

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:
Как использовать эти навыки в реальных переговорах с брокерами
    `
}
```

### Пример для MASTER outcome:
```
✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:
- Показали специализацию и опыт с первого ответа - это сразу повысило доверие брокера
- Обосновали ставку через market rate и ценность сервиса - брокер понял за что платит
- Задали все критические вопросы о pickup, delivery, routing - показали профессионализм
- Проактивно предложили дополнительные сервисы - выделились среди конкурентов
- Построили долгосрочные отношения - обеспечили будущие грузы

⚠️ ЧТО МОЖНО УЛУЧШИТЬ:
- Можно было спросить про backhaul возможности для максимизации прибыли
- Можно было уточнить про другие lanes которые есть у брокера

💡 КЛЮЧЕВОЙ УРОК:
Профессионализм и детальная коммуникация = высокие ставки и долгосрочные отношения

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:
Всегда показывайте свою экспертизу, обосновывайте ставки, задавайте детальные вопросы
```

### Пример для WEAK outcome:
```
✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:
- Получили груз - это лучше чем ничего
- Коммуникация была вежливой

⚠️ ЧТО МОЖНО УЛУЧШИТЬ:
- Сдались на ставке слишком быстро - потеряли $300-500
- Не показали свою ценность и опыт - брокер не понял за что платить больше
- Не задали важные вопросы - могут быть проблемы на pickup/delivery
- Не построили отношения - брокер не запомнит вас для будущих грузов

💡 КЛЮЧЕВОЙ УРОК:
Низкая ставка = низкая прибыль. Всегда обосновывайте свою ценность.

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:
Не бойтесь торговаться и объяснять почему вы стоите больше. Брокеры уважают уверенных диспетчеров.
```

---

## 👥 СТИЛИ БРОКЕРОВ

### 🏃 Торопливый
- Быстрые короткие ответы
- Нет времени на детали
- "Quick! Yes or no?"

### 😊 Дружелюбный
- Приветливый, разговорчивый
- "Hey there! How's your day going?"
- Делится информацией

### 😠 Строгий
- Требовательный, без эмоций
- "MC number. Now."
- Только факты

### 🎓 Опытный
- Профессиональный, знает рынок
- Задает правильные вопросы
- Проверяет детали

### 🆕 Новичок
- Неуверенный
- "Let me check with my manager..."
- Спрашивает много

### 💪 Агрессивный
- Давит, торопит решение
- "Take it or leave it!"
- Жесткие переговоры

### 👔 Профессиональный
- Деловой, четкий
- Структурированный подход
- Эффективный

### ⏰ Занятой
- Очень короткие сообщения
- "MC? Rate? Yes/no?"
- Нет времени

### 📋 Детальный
- Требует много информации
- Проверяет все
- Документация важна

### 😎 Расслабленный
- Спокойный, дружелюбный
- "No rush, let's talk"
- Гибкий

### 🤔 Осторожный
- Проверяет опыт, документы
- "Can I see your insurance?"
- Минимизирует риски

### ➡️ Прямолинейный
- Сразу к делу
- Без лишних слов
- Быстрые решения

### 👴 Старый опытный
- 30 лет опыта
- Знает все трюки
- Мудрый подход

### 🎉 Веселый
- Энергичный, позитивный
- "Awesome! Let's do this!"
- Приятное общение

### 😐 Серьезный
- Строгий
- Требует надежности
- Без шуток

---

## 📊 ЧТО МОЖЕТ СПРОСИТЬ БРОКЕР

### 1. 📍 МЕСТОПОЛОЖЕНИЕ ВОДИТЕЛЯ

**Базовые вопросы:**
- Where is your driver now?
- When can you pickup?
- How far from pickup location?

**Варианты ответов:**
- Empty in Chicago
- 50 miles away from pickup
- Just delivered in [city]
- Available now
- In 2 hours
- Tomorrow morning
- Finishing current load in [city] at [time]
- Empty trailer ready
- Home base location (откуда компания)

**Deadhead distance:**
- Пустой пробег до загрузки
- Willing to deadhead 50 miles / 100 miles

**❌ ВАЖНО:** Все водители имеют трейлер! Bobtail не используется.

---

### 2. 🚛 ВИД ТРЕЙЛЕРА И ДЕТАЛИ

**Основные типы:**
- Dry Van
- Reefer
- Flatbed

**Если Dry Van, брокер может спросить:**
- Swing doors или Roll-up doors?
- Cleer (без запахов)?
- Food grade?
- Год трейлера (2023 Utility / 2022 Great Dane)
- Длина (53ft / 48ft)

**Если Reefer, брокер может спросить:**
- Multi-temp zones?
- Thermo King или Carrier unit?
- Year of reefer unit?
- Temperature range capability?
- Fuel level for reefer?
- Reefer hours available?

**Если Flatbed, брокер может спросить:**
- Flatbed или Step deck?
- Length and width?
- Weight capacity?
- Securement equipment available?

---

### 3. 🚚 ТРАК (КАБИНА)

**Год и марка:**
- 2022 Freightliner
- 2023 Volvo
- 2021 Kenworth
- 2024 Peterbilt

**DOT требования (на кабине трака):**
- MC номер
- DOT номер
- Название компании
- Все должно быть написано на двери кабины или рядом (по закону США)

**Брокер может спросить:**
- What's written on your truck door?
- Is your MC number visible on the truck?
- Company name on the cab?

---

### 4. 👨‍✈️ ИНФОРМАЦИЯ О ВОДИТЕЛЕ

**Тип водителя:**
- Solo driver
- Team drivers (преимущество для long haul)

**Опыт:**
- 5 years experience
- 10 years OTR (Over The Road)
- 15+ years veteran driver
- Temperature-controlled experience (для Reefer)
- Flatbed securement certified
- Hazmat hauling experience

**Сертификаты:**
- TWIC card (для портов)
- Hazmat endorsement
- FAST card (для Канады)
- Passport (для Канады/Мексики)
- Tanker endorsement

**Безопасность:**
- Clean driving record
- No accidents in X years
- No violations
- Drug & alcohol testing program compliant

**Язык:**
- English speaking
- Bilingual (English/Spanish)

---

### 5. 📱 ТЕХНОЛОГИИ И ОТСЛЕЖИВАНИЕ

**GPS и ELD:**
- GPS tracking available?
- ELD system (Electronic Logging Device)
- Real-time updates capability

**Системы отслеживания:**
- Samsara
- KeepTruckin
- Macropoint

**Для Reefer:**
- Reefer monitoring system (Thermo King / Carrier)
- Temperature alerts setup
- Real-time temperature tracking

**Дополнительно:**
- Geofencing capability
- Photo documentation (BOL, seals, damage)
- Email/SMS updates available
- Mobile app for updates

---

### 7. ⏰ HOS (Hours of Service)

**Основные вопросы:**
- How many hours does your driver have?
- When was last reset?
- Can you deliver without HOS violation?

**Детали:**
- Drive time available (8 hours left / 11 hours available)
- On-duty time remaining
- 70-hour clock status
- Next mandatory 10-hour break
- Team advantage (continuous driving без остановок)

**Планирование:**
- Can you make pickup time?
- Will you need to stop for 10-hour break?
- ETA to delivery?

---

### 8. 🔧 СПЕЦИАЛЬНОЕ ОБОРУДОВАНИЕ

**Базовое (Dry Van):**
- Load locks (сколько?)
- Straps
- E-track system
- Pallet jack
- Blankets/pads (для furniture)
- Dunnage bags (для securement)

**Для Flatbed:**
- Chains (сколько?)
- Binders
- Tarps (количество и размер)
- Corner protectors
- Coil racks (для steel coils)
- Ramps
- Winches

**Для Reefer:**
- Load locks
- Pallet jack
- Temperature monitoring device

**Дополнительно:**
- Liftgate available?
- Air ride suspension?
- Logistic straps quantity?

---

### 9. 💼 ОПЫТ КОМПАНИИ

**Основная информация:**
- How long in business? (2 years / 5 years / 10+ years)
- Fleet size (1 truck / 5 trucks / 20+ trucks)
- Owner-operator или company driver?

**Специализация:**
- Produce specialist
- Automotive parts
- Hazmat certified
- Temperature-controlled expert
- Flatbed heavy haul
- Dry van general freight

**Репутация:**
- Preferred carrier status у других брокеров?
- References available?
- Repeat customer list?
- Industry awards/recognition?

**Опыт по регионам:**
- West Coast lanes
- Midwest specialist
- Cross-country experience
- Regional carrier

---

### 10. 📋 ДОКУМЕНТЫ

**Основные:**
- W9 on file?
- Certificate of Insurance ready?
- Signed broker-carrier agreement?
- Rate confirmation signed?

**Delivery документы:**
- BOL (Bill of Lading) process
- POD (Proof of Delivery) - scan/email/fax?
- How fast can you send POD?

**Дополнительные расходы:**
- Lumper receipt policy (кто платит за разгрузку?)
- Detention time documentation (простой)
- TONU (Truck Ordered Not Used) policy

---

### 11. 💰 PAYMENT TERMS

**❗ ВАЖНО: Диспетчер работает ТОЛЬКО через Factoring company!**

**Factoring (единственный способ оплаты):**
- Do you work with factoring?
- Factoring company name (RTS / RTS Pro / Saint Johns / Triumph / TBS / OTR)
- NOA (Notice of Assignment) required?
- Can you send NOA immediately?

**Главные factoring компании:**
- RTS (RTS Financial)
- RTS Pro
- Saint Johns Capital
- Triumph Business Capital
- TBS Factoring
- OTR Capital

**❌ ОТКАЗ ОТ ГРУЗА если брокер предлагает:**
- Quick pay (2-3% fee)
- Standard 30 days NET
- Cash payment
- Direct payment without factoring
- Any payment method other than factoring

**Правильный ответ диспетчера:**
```
"We work only through factoring company.
Our factoring is [Company Name].
Can you work with factoring?"
```

**Если брокер отказывается от factoring:**
```
"Unfortunately, we can only accept loads through factoring.
Thank you for your time."
```

---

### 12. 🔄 BACKHAUL ВОЗМОЖНОСТИ

**Основные вопросы:**
- Looking for backhaul?
- Where are you heading after delivery?
- Flexible on route?

**Детали:**
- Willing to deadhead how far? (50 miles / 100 miles / 200 miles)
- Partial loads acceptable?
- Multi-stop loads OK?
- Preferred return lanes?
- Time flexibility (can wait for backhaul?)

**Стратегия:**
- Do you have return load already?
- Open to suggestions?
- Need to get back to home base?

---

### 13. 🚨 EMERGENCY CONTACT

**Контакты:**
- 24/7 dispatch contact number?
- After-hours number?
- Direct driver cell phone?

**❌ НЕ ИСПОЛЬЗУЕТСЯ:** Брокер не спрашивает про emergency breakdown plan, backup drivers, roadside assistance, towing coverage, alternate equipment, communication protocol during delays

---

## 🔧 ДОПОЛНИТЕЛЬНЫЕ КАТЕГОРИИ ВОПРОСОВ БРОКЕРА

### 14. 📋 INSURANCE COVERAGE

**Cargo Insurance:**
- $100,000 coverage (standard)
- $250,000 coverage (high value loads)
- ❌ НЕ $1,000,000 (слишком высоко для обычных грузов)

**Liability Insurance:**
- $1,000,000 minimum required
- Certificate of Insurance available?
- How fast can you send COI?

**Proof of Insurance:**
- Can you email COI right now?
- Is your insurance current?
- Any claims in last 2 years?

### 15. ⚖️ SCALE TICKETS И WEIGH STATIONS

**Scale Tickets:**
- Who pays for scale ticket? (обычно carrier)
- Scale ticket required before delivery?
- Cost: $10-$15 per ticket

**Weigh Stations:**
- Will you stop at weigh stations?
- PrePass or bypass system?
- Overweight procedures if needed

**Weight Verification:**
- Shipper provides weight ticket?
- Need certified weight?
- Reweigh at destination?

### 16. ⛽ FUEL SURCHARGE

**Fuel Surcharge Questions:**
- Is fuel surcharge included in rate?
- Separate FSC calculation?
- Based on DOE average?

**Typical Structure:**
- Usually included in all-in rate
- Rarely separate for spot market
- Contract loads may have separate FSC

### 17. 🎯 ТИПЫ APPOINTMENT

**FCFS (First Come First Served):**
- No appointment needed
- Show up anytime during hours
- May wait in line

**Scheduled Appointment:**
- Exact time (e.g., 10:00 AM sharp)
- Must be on time
- Late = reschedule

**Window Appointment:**
- Time range (e.g., 8 AM - 12 PM)
- Arrive anytime in window
- More flexible

**Live Load vs Drop and Hook:**
- Live load: wait while loading/unloading
- Drop and hook: drop trailer, pick up loaded one
- Drop and hook faster but needs empty trailer

---

## 🎯 ВОПРОСЫ КОТОРЫЕ ДИСПЕТЧЕР МОЖЕТ ЗАДАВАТЬ БРОКЕРУ

### 📍 О PICKUP LOCATION:
- What's the exact pickup address?
- Is there a specific dock number?
- Any gate code or special instructions?
- Is it easy to find or should I send driver directions?
- Warehouse or distribution center?

### ⏰ О PICKUP TIME:
- What's the pickup window?
- Is it FCFS or appointment time?
- What time can my driver pickup?
- Can my driver pickup by [time]?
- What's the latest pickup time?
- Will they still be open at [time]?
- How many hours for loading?

### 📦 О ГРУЗЕ:
- What's the commodity?
- Exact weight?
- How many pallets?
- Is it stackable?
- Any special handling requirements?
- Fragile cargo?
- How is it loaded - floor loaded or palletized?

### 🚛 О ТРЕБОВАНИЯХ К ТРЕЙЛЕРУ:
- Do they require specific door type?
- Food grade required?
- Any trailer age restrictions?
- Trailer must be clean/swept?
- Any branding restrictions on trailer?

### ❄️ ДЛЯ REEFER:
- What temperature?
- Continuous run or cycle?
- Pre-cool required?
- How long for pre-cool?
- Multi-temp zones needed?
- Temperature logs required?

### 📋 О DELIVERY:
- What's the delivery window?
- Delivery appointment or FCFS?
- Any delivery restrictions?
- Receiver contact number?
- Delivery address?
- Any delivery time requirements?

### ⏱️ О ВРЕМЕНИ И DETENTION:
- How many hours for loading?
- How many hours for unloading?
- Is there detention pay?
- After how many hours detention starts?
- What's the detention rate?
- TONU policy if cancelled?
- Layover pay if delayed?

### 🔒 О БЕЗОПАСНОСТИ/ТРЕБОВАНИЯХ:
- Team seal required?
- GPS tracking required?
- Macropoint tracking needed?
- Any routing restrictions?
- Toll roads allowed or avoid?
- Hazmat placards needed?

### 💰 О ДОПОЛНИТЕЛЬНЫХ РАСХОДАХ:
- Who pays lumper fee?
- Is there lumper at pickup/delivery?
- Any additional stops?
- Fuel advance available?
- Typical lumper fee amount?
- Scale ticket required?

### 💵 О СТАВКЕ:
- What's your best rate on this?
- Is the rate fixed or are you flexible?
- Posted rate is $[X], can you do $[Y]?
- Can you do $[X]/mile?
- What's the all-in rate?
- Any accessorials included?

### 🔄 О BACKHAUL:
- Do you have anything coming back?
- Any loads returning to [city]?
- Can you help with backhaul?
- What lanes do you have from [delivery city]?

### 📱 О КОММУНИКАЦИИ:
- Who do I contact for check calls?
- What's the shipper contact?
- What's the receiver contact?
- Do you need updates during transit?
- How often do you need check calls?
- After hours contact?

### 📄 О ДОКУМЕНТАХ:
- BOL at pickup or you'll send?
- How to send POD - scan or original?
- Rate con ready to send?
- Any special paperwork required?
- Signed rate con before pickup?
- Do you need insurance certificate?

### 🚨 О ПРОБЛЕМАХ/DELAYS:
- What if driver is delayed?
- Weather delay procedure?
- Breakdown protocol?
- Who to call if issues?
- Reschedule policy?

### 🏢 О SETUP/PAYMENT:
- Do we have setup with you?
- Do you work with factoring?
- Which factoring company?
- How fast can you send rate con?
- NOA required?

---

## 💼 ДОПОЛНИТЕЛЬНЫЕ СБОРЫ (ACCESSORIALS)

### Detention Time:
- **Ставка:** $75-$100/hour
- **Free time:** Обычно 2 часа
- **Когда начинается:** После истечения free time
- **Документация:** Требуется signed detention receipt

### Layover Pay:
- **Ставка:** $200-$300/day
- **Когда:** Если водитель ждет более 24 часов
- **Причины:** Receiver не готов, weekend delay, holiday

### TONU (Truck Ordered Not Used):
- **Ставка:** $200-$400
- **Когда:** Груз отменен после того как водитель в пути
- **Покрывает:** Deadhead, потерянное время, упущенные возможности

### Lumper Fees:
- **Ставка:** $100-$300
- **Кто платит:** Обычно shipper или receiver
- **Процесс:** Carrier платит, потом reimbursement
- **Документация:** Lumper receipt required

### Scale Tickets:
- **Стоимость:** $10-$15
- **Кто платит:** Обычно carrier
- **Когда нужен:** Certified weight required

### Pallet Exchange:
- **CHEP pallets:** $15-$20 each
- **Standard pallets:** $10-$15 each
- **Кто платит:** Зависит от договоренности

---

## 🌍 РЕГИОНАЛЬНЫЕ ОСОБЕННОСТИ

### California Loads:
- **CARB Compliance:** Truck must be CARB compliant (2011+ engine)
- **Strict regulations:** Emissions, idle time limits
- **Weigh stations:** Very strict, always open
- **Routing:** Avoid certain roads for trucks

### New York City Deliveries:
- **Time restrictions:** Often early morning only (5-7 AM)
- **Parking:** Very limited, tight spaces
- **Traffic:** Plan extra time
- **Tolls:** Expensive ($50-$100+)

### Canadian Border Crossings:
- **FAST card:** Expedited clearance
- **Passport:** Required for driver
- **Customs paperwork:** BOL, commercial invoice, packing list
- **Delays:** Can be 2-4 hours at border

### Hazmat Loads:
- **Placards:** Required, carrier provides
- **Routing restrictions:** Avoid certain tunnels, bridges
- **Endorsement:** Driver must have Hazmat endorsement
- **Documentation:** Emergency response info required

---

## 📦 ТИПЫ ГРУЗОВ С ОСОБЕННОСТЯМИ

### Produce (Фрукты/Овощи):
- **Temperature critical:** Must maintain exact temp
- **Time sensitive:** Spoils quickly
- **HACCP certified:** Driver certification preferred
- **Pulp temp checks:** At pickup and delivery
- **Reefer fuel:** Must be full, continuous run

### Electronics (High Value):
- **Insurance:** $250K coverage required
- **Careful handling:** No rough roads
- **Security:** GPS tracking mandatory
- **Documentation:** Photos at pickup/delivery
- **Securement:** Extra straps, blankets

### Automotive Parts (JIT - Just In Time):
- **No delays allowed:** Production line stops if late
- **Appointment critical:** Must be on time
- **Penalties:** $500-$1000 per hour late
- **Communication:** Updates every 4 hours

### Furniture:
- **Blankets required:** Carrier provides (20-30 blankets)
- **White glove service:** Sometimes required
- **Careful handling:** Scratches = claims
- **Residential delivery:** May need liftgate

### Beverages (Beer, Soda, Water):
- **Heavy:** 44,000-45,000 lbs typical
- **Pallet configuration:** Important for weight distribution
- **Floor loaded:** Sometimes, takes longer
- **Breakage risk:** Careful handling

### Paper Products:
- **Light but bulky:** "Cube out" before "weight out"
- **Volume:** Takes full trailer space
- **Easy to handle:** Less risk
- **Lower rates:** Because of low weight

---

## 🌦️ СЕЗОННЫЕ ФАКТОРЫ

### Зима (Декабрь - Февраль):
- **Snow/Ice delays:** Add 20-30% extra time
- **Chain requirements:** Mountain passes
- **Road closures:** I-80, I-90 often closed
- **Higher rates:** Winter premium $0.10-$0.20/mile

### Лето (Июнь - Август):
- **Heat:** Reefer challenges, more fuel
- **Construction:** Road work delays
- **Vacation season:** Some facilities closed
- **Produce season:** High demand for reefers

### Праздники:
- **Thanksgiving week:** Many receivers closed Thursday-Sunday
- **Christmas/New Year:** Limited hours, 2-3 days closed
- **July 4th:** Many facilities closed
- **Plan ahead:** Book early, confirm hours

### Peak Season (Q4):
- **Higher rates:** October-December
- **Retail freight:** Black Friday, Christmas rush
- **Capacity tight:** Hard to find trucks
- **Premium rates:** +$0.20-$0.40/mile

---

## 🎯 ПРОАКТИВНЫЕ ПРЕДЛОЖЕНИЯ ДИСПЕТЧЕРА

### Показать гибкость:
- "I can have driver there 2 hours early if that helps"
- "Driver can wait for evening delivery if needed"
- "We're flexible on pickup time within your window"

### Дополнительные возможности:
- "We have another truck in that area if you need backup"
- "Our team can handle multi-stop loads efficiently"
- "We can do temperature-controlled and dry van loads"

### Backhaul предложения:
- "We're looking for backhaul from [delivery city]"
- "Any loads returning to [home base]?"
- "Willing to deadhead 100 miles for good backhaul"

### Построение отношений:
- "We run this lane weekly, would love to be your regular carrier"
- "Happy to provide references from other brokers"
- "We're looking for long-term partnerships"

---

## 📊 ВАРИАНТЫ РАЗВИТИЯ СОБЫТИЙ

### Брокер отказывается от Factoring:
**Диспетчер:**
```
"I understand, but we work exclusively through factoring for cash flow.
We can't accept direct payment or quick pay.
If you change your mind or have other loads that work with factoring, please call us.
Thank you for your time!"
```
**Outcome:** Вежливый отказ, дверь открыта для будущего

### Ставка слишком низкая:
**Диспетчер:**
```
"I appreciate the offer, but $X is below our operating costs for this lane.
Market rate is $X.XX/mile, and we need at least $X to cover fuel and expenses.
If budget opens up, we'd love to work with you.
Thanks for considering us!"
```
**Outcome:** Профессиональный отказ с объяснением

### Груз уже забронирован:
**Брокер:**
```
"Sorry, just booked it 2 minutes ago!
But I have another [route] [equipment] load, [distance] miles, pickup [date].
Interested?"
```
**Outcome:** Возможность получить другой груз

### Водитель слишком далеко:
**Диспетчер:**
```
"Driver is 200 miles away, that's 4 hours deadhead.
Can you add $200 for deadhead to make it work?
Or we can pickup tomorrow instead of today?"
```
**Outcome:** Переговоры о deadhead pay или timing

---

## 🚨 РЕАЛИСТИЧНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Водитель опаздывает на pickup:
**Правильная коммуникация:**
```
"Hi [broker], this is [dispatcher].
Driver is running 30 minutes late due to traffic on I-95.
New ETA is 8:30 AM instead of 8:00 AM.
I've already called shipper to notify them.
Will this cause any issues?"
```

### Поломка в пути:
**Правильная коммуникация:**
```
"[Broker], we have a situation - truck broke down in [city].
Mechanic is on the way, estimated 3-4 hours for repair.
This will delay delivery by 4-5 hours.
Should I arrange backup truck or can receiver accept late delivery?
I'll update you every hour."
```

### Погодные задержки:
**Правильная коммуникация:**
```
"[Broker], I-80 is closed due to blizzard in Wyoming.
DOT says road will reopen in 6-8 hours.
Driver is safe at truck stop waiting.
This will delay delivery by approximately 8 hours.
Can you notify receiver and get new appointment?"
```

### Receiver закрыт / отказ принять груз:
**Правильная коммуникация:**
```
"[Broker], driver arrived at receiver but they're closed (holiday).
No one answered phone, gate is locked.
What should driver do? Wait for tomorrow or return to shipper?
We'll need detention pay for waiting time."
```

---

## 💰 РЕАЛИСТИЧНЫЕ СТАВКИ 2026 ($/миля)

### Dry Van:
- **Short Haul (350-650 миль):** $2.80-$3.50/mile
- **Medium Haul (650-1500 миль):** $2.40-$3.00/mile
- **Long Haul (1500+ миль):** $2.20-$2.70/mile

### Reefer:
- **Short Haul (350-650 миль):** $3.20-$4.00/mile
- **Medium Haul (650-1500 миль):** $2.80-$3.50/mile
- **Long Haul (1500+ миль):** $2.60-$3.20/mile

### Flatbed:
- **Short Haul (350-650 миль):** $3.00-$3.80/mile
- **Medium Haul (650-1500 миль):** $2.60-$3.30/mile
- **Long Haul (1500+ миль):** $2.40-$3.00/mile

### Факторы влияющие на ставку:
- Срочность (+$0.20-0.50/mile)
- Hazmat (+$0.30-0.60/mile)
- Team drivers (+$0.30-0.50/mile)
- Специальное оборудование (+$0.20-0.40/mile)
- Высокая ценность груза (+$0.20-0.40/mile)
- Удаленный район (-$0.30-0.50/mile)
- Backhaul (-$0.40-0.80/mile)

---

## 📏 РАССТОЯНИЯ И ВРЕМЯ ДОСТАВКИ

### Правило: 650 миль в день максимум (solo driver)

### Short Haul: 350-650 миль
- Delivery: Завтра (next day)
- Время в пути: 6-10 часов

### Medium Haul: 650-1500 миль
- Delivery: 2-3 дня
- Время в пути: 10-23 часа driving time

### Long Haul: 1500+ миль
- Delivery: 3-4 дня
- Время в пути: 23+ часа driving time

### Team Drivers преимущество:
- Могут ехать 24/7 (по очереди)
- 1000-1100 миль в день
- Cross-country за 2.5-3 дня

---

## ⚖️ ВЕС ГРУЗА

### Легкий: 10,000-25,000 lbs
- Обычный груз
- Нет особых требований

### Средний: 25,000-40,000 lbs
- Стандартный вес
- Большинство грузов

### Тяжелый: 40,000-45,000 lbs
- Максимум легальный вес
- Требует внимания к весовым станциям
- ❌ НЕ ПРЕВЫШАТЬ 45,000 lbs (перегруз = штрафы)

---

## 💡 КЛЮЧЕВЫЕ ФРАЗЫ

### Представление (первое сообщение):
```
"Good morning!
This is [Name] from [Company].
I'm calling about your [Origin] to [Destination] [Equipment] load.
Is this still available?"
```

### Детали о компании:
```
"MC [number].
We specialize in [type], [years] years experience.
[Year] [brand] [equipment], [details].
Driver in [location] now, [certification], ready for pickup."
```

### Обоснование ставки:
```
"For [miles] miles with [requirements], I'm at $[amount].
That's $[rate]/mile covering [factors]."
```

### Переговоры:
```
"I appreciate that, but market rate for this lane is $[rate]/mile.
Can you meet me at $[amount]?"
```

### Компромисс:
```
"$[amount] works for us.
Let's book it.
Send rate con with all details?"
```

### Проактивные вопросы:
```
"Any routing restrictions?"
"Weather delay procedure?"
"Specific dock number?"
"Load locks provided or do we need to bring?"
"Lumper fee - who covers?"
"Detention time policy?"
```

---

## 🚫 ЧЕГО ИЗБЕГАТЬ

❌ Длинные сообщения (>4 предложений)
❌ Повторяющиеся фразы
❌ Тупиковые ситуации
❌ Непрофессиональное первое сообщение
❌ Нереалистичные ставки
❌ Неправильные расстояния
❌ Перегруз (>45,000 lbs)
❌ Неестественный язык
❌ Отсутствие обучения
❌ Слишком короткие диалоги
❌ Reference номера в первом сообщении
❌ Бонусы от брокера (только базовая ставка)
❌ Массивы в brokerResponse

---

## ✅ ЧЕКЛИСТ ПЕРЕД СОЗДАНИЕМ ДИАЛОГА

- [ ] Первое сообщение профессиональное
- [ ] Все сообщения 2-4 предложения
- [ ] Каждое предложение с новой строки `\n`
- [ ] Нет тупиков
- [ ] Нет повторений
- [ ] Минимум 3 пути
- [ ] МАСТЕР путь 10+ шагов
- [ ] Реалистичные данные (ставки, расстояния, вес)
- [ ] Советы на каждом шаге
- [ ] Уникальные варианты ответов
- [ ] Обучающие элементы
- [ ] Четкие результаты
- [ ] Профессиональный язык
- [ ] Стиль брокера определен
- [ ] Нет reference номеров
- [ ] Брокер отправляет только одно сообщение
- [ ] dispatcherPrompt объясняет что хочет брокер

---

## 📚 ВЕРСИЯ ДОКУМЕНТА

**Версия:** 2.0
**Дата:** 2026-03-03
**Обновление:** Добавлены дополнительные категории, региональные особенности, типы грузов, сезонные факторы, проблемы и решения, метрики успеха, обучающие моменты
**Проект:** Симуль - Dispatch Simulator
**Цель:** База знаний для создания реалистичных диалогов обучения диспетчеров

---

## 📋 НОВЫЕ ДОПОЛНЕНИЯ В ВЕРСИИ 2.0

### Добавлено:
1. ✅ Insurance coverage (cargo $100K/$250K, liability)
2. ✅ Scale tickets и weigh stations
3. ✅ Fuel surcharge
4. ✅ Типы appointment (FCFS, scheduled, window, live load vs drop and hook)
5. ✅ Дополнительные сборы (detention, layover, TONU, lumper, scale tickets, pallet exchange)
6. ✅ Региональные особенности (California, NYC, Canada, Hazmat)
7. ✅ Типы грузов с особенностями (produce, electronics, automotive, furniture, beverages, paper)
8. ✅ Сезонные факторы (зима, лето, праздники, peak season)
9. ✅ Проактивные предложения диспетчера
10. ✅ Варианты развития событий (отказ от factoring, низкая ставка, груз забронирован, deadhead)
11. ✅ Реалистичные проблемы и решения (опоздание, поломка, погода, receiver проблемы)
12. ✅ Метрики успеха в outcome (время, вопросы, детализация, будущие возможности)
13. ✅ Обучающие моменты (что правильно, что улучшить, ключевой урок, применение)

---

**Все детали готовы для создания 20 уникальных реалистичных диалогов! 🚀**
