# Правила и Условия Создания Диалогов для Dispatch Simulator

## 📋 Общие Требования

### Структура Сценария
Каждый сценарий должен содержать:
- **3 пути развития** (GOOD → 3 шага, NORMAL → длинный путь, BAD → 3 шага)
- **Реалистичные данные** (расстояния, вес, ставки)
- **Разные типы оборудования** (Dry Van, Reefer, Flatbed)
- **Географическое разнообразие** (разные штаты США)
- **Короткие и конкретные** диалоги (профессиональный стиль)

### Распределение Грузов (15 сценариев)
1. **20% (3 груза) - Short Haul: 350-650 миль** - Delivery завтра
2. **50% (8 грузов) - Medium Haul: 650-1500 миль** - Delivery через 2-3 дня
3. **30% (4 груза) - Long Haul: 1500+ миль** - Delivery через 3-4 дня

### Типы Грузов
1. **Dry Van** - стандартные грузы, 80% рынка
2. **Reefer** - рефрижераторы с температурным режимом
3. **Flatbed** - открытые платформы для негабарита

### Правило Водителя
- Водитель может проехать **650 миль в день**
- До 650 миль = pickup сегодня, delivery завтра
- 650+ миль = pickup сегодня, delivery послезавтра или позже

---

## 🎯 Структура Сценария с 3 Путями

### Новая Структура:

```javascript
{
  id: 1,
  route: "Atlanta, GA → Charlotte, NC",
  distance: 400,
  equipment: "Dry Van",
  weight: "32,000 lbs",
  rate: 1200,
  ratePerMile: 3.00,
  
  // Начальное сообщение диспетчера
  initialMessage: "Morning. Atlanta to Charlotte dry van - still open?",
  
  // 3 пути развития
  paths: {
    good: [ /* 3 шага → успех */ ],
    normal: [ /* длинный путь → может быть успех или отказ */ ],
    bad: [ /* 3 шага → отказ */ ]
  }
}
```

---

## 📊 3 Типа Ответов Пользователя

### 1. **GOOD (Хороший ответ)** ✅
**Критерии:**
- Красивое профессиональное общение
- Достоверная и правильная информация по грузу
- Все необходимые детали
- Проактивность

**Результат:** Быстрое бронирование (3 шага)

**Примеры:**
- "MC 123456. 53' dry van, air ride, clean. Driver in Atlanta now, ready for 2 PM pickup."
- "Yes. Driver there at 3 PM today. Delivery tomorrow noon, no problem."
- "$1,200 works. Let's book it. Email: dispatch@company.com"

### 2. **NORMAL (Средний ответ)** ⚪
**Критерии:**
- Нейтральный ответ
- Базовая информация
- Без особых деталей

**Результат:** Длинный путь с переговорами (может быть успех или отказ)

**Примеры:**
- "MC 123456. Dry van available."
- "Yes, that works."
- "Can you do better on rate?"

### 3. **BAD (Плохой ответ)** ❌
**Критерии:**
- Некрасивое, непрофессиональное общение
- Неполная или неправильная информация
- Неуверенность

**Результат:** Отказ брокера (3 шага)

**Примеры:**
- "Uh... let me find my MC... one sec..."
- "Maybe... need to check with driver..."
- "That's too low, need way more"

---

## 🗣️ Стиль Диалогов

### Требования:
- **Короткие и конкретные** - без лишних слов
- **Профессиональные** - реальная терминология
- **Богатые по содержанию** - каждое слово важно
- **Естественные** - как в реальных переговорах

### Примеры:

❌ **Плохо (длинно):**
"Good morning! I hope you're having a great day. I wanted to reach out regarding the load from Atlanta to Charlotte."

✅ **Хорошо (коротко):**
"Morning. Atlanta to Charlotte dry van - still open?"

❌ **Плохо (неконкретно):**
"We have some equipment available"

✅ **Хорошо (конкретно):**
"53' dry van, air ride. Ready now."

---

## 💰 Правила Расчета Ставок

### Формула:
```
Ставка = Расстояние × Цена за милю
```

### Средние Ставки по Типам (2026):

**Dry Van:**
- Short Haul (350-650 миль): $2.80 - $3.50/миля
- Medium Haul (650-1500 миль): $2.40 - $3.00/миля
- Long Haul (1500+ миль): $2.20 - $2.70/миля

**Reefer:**
- Short Haul (350-650 миль): $3.20 - $4.00/миля
- Medium Haul (650-1500 миль): $2.80 - $3.50/миля
- Long Haul (1500+ миль): $2.60 - $3.20/миля

**Flatbed:**
- Short Haul (350-650 миль): $3.00 - $3.80/миля
- Medium Haul (650-1500 миль): $2.60 - $3.30/миля
- Long Haul (1500+ миль): $2.40 - $3.00/миля

---

## 🚛 Реалистичные Параметры Грузов

### Вес:
- **Легкий груз:** 10,000 - 25,000 lbs
- **Средний груз:** 25,000 - 40,000 lbs
- **Тяжелый груз:** 40,000 - 45,000 lbs (максимум)

### Расстояния и Delivery:
- **Short Haul (350-650 миль):** Pickup сегодня → Delivery завтра
- **Medium Haul (650-1500 миль):** Pickup сегодня → Delivery через 2-3 дня
- **Long Haul (1500+ миль):** Pickup сегодня → Delivery через 3-4 дня

### Временные Окна:
- **Pickup:** Обычно 4-8 часовое окно (например, 2-6 PM, 7 AM-3 PM)
- **Delivery:** Зависит от расстояния (650 миль в день максимум)

---

## 📍 Популярные Маршруты

### Short Haul (350-650 миль) - 20% (3 груза):
- Atlanta, GA → Charlotte, NC (400 миль)
- Dallas, TX → Houston, TX (240 миль) + Houston → San Antonio (200 миль) = 440 миль
- Chicago, IL → Indianapolis, IN (185 миль) + Indianapolis → Columbus, OH (175 миль) = 360 миль

### Medium Haul (650-1500 миль) - 50% (8 грузов):
- Miami, FL → Atlanta, GA (650 миль)
- Chicago, IL → Atlanta, GA (715 миль)
- LA, CA → Phoenix, AZ → Albuquerque, NM (800 миль)
- Dallas, TX → Denver, CO (800 миль)
- New York, NY → Chicago, IL (790 миль)
- Atlanta, GA → New York, NY (870 миль)
- Phoenix, AZ → Seattle, WA (1,420 миль)
- Houston, TX → Los Angeles, CA (1,550 миль)

### Long Haul (1500+ миль) - 30% (4 груза):
- Los Angeles, CA → Chicago, IL (2,015 миль)
- New York, NY → Los Angeles, CA (2,790 миль)
- Miami, FL → Seattle, WA (3,300 миль)
- Boston, MA → San Francisco, CA (3,100 миль)

---

## ✍️ Стиль Общения

### Брокер:
- **Тон:** Деловой, прямой
- **Стиль:** Короткий, конкретный
- **Скорость:** Быстрые вопросы, ценит время

### Диспетчер (3 типа ответов):
- **GOOD:** Профессиональный, детальный, проактивный → Быстрое бронирование
- **NORMAL:** Нейтральный, базовый → Длинные переговоры
- **BAD:** Непрофессиональный, неполный → Отказ

---

## 🎓 Пример Сценария с 3 Путями

### Сценарий: Atlanta, GA → Charlotte, NC
**Расстояние:** 400 миль  
**Оборудование:** Dry Van  
**Вес:** 32,000 lbs  
**Ставка:** $1,200 ($3.00/миля)  
**Pickup:** Сегодня 2-6 PM  
**Delivery:** Завтра до полудня

### GOOD Path (3 шага → успех):
1. Broker: "Yeah, it's open. MC number?"
   User: "MC 123456. 53' dry van, air ride. Driver in Atlanta, ready at 2 PM."
   
2. Broker: "Verified. Pickup today 2-6 PM, deliver tomorrow noon. $1,200 flat. Deal?"
   User: "Yes. $1,200 works. Let's book it."
   
3. Broker: "Booked. Rate con to your email in 2 min. Email?"
   User: "dispatch@company.com. We'll call at pickup. Thanks!"

### NORMAL Path (длинный → переговоры):
1. Broker: "Yeah, it's open. MC number?"
   User: "MC 123456. Dry van available."
   
2. Broker: "What type? Air ride?"
   User: "Yes, 53 footer with air ride."
   
3. Broker: "Pickup today 2-6 PM, deliver tomorrow noon. Can you do it?"
   User: "Yes, that works."
   
4. Broker: "$1,200 for 400 miles. That's $3 per mile. Deal?"
   User: "Can you do $1,300?"
   
5. Broker: "Best I can do is $1,250. Final offer."
   User: "Okay, $1,250 works."
   
6. Broker: "Booked. Email for rate con?"
   User: "dispatch@company.com"

### BAD Path (3 шага → отказ):
1. Broker: "Yeah, it's open. MC number?"
   User: "Uh... let me find it... one second..."
   
2. Broker: "I need it now. Got other calls waiting."
   User: "Okay okay, it's... MC 123456. We have a van."
   
3. Broker: "Too slow. Load's going to someone else. Thanks anyway."

---

## ⚠️ Частые Ошибки (Чего Избегать)

### ❌ НЕ ДЕЛАТЬ:
1. Длинные ответы и вопросы
2. Нереалистичные ставки
3. Неправильные расстояния
4. Перегруз (более 45,000 lbs)
5. Неестественный язык
6. Игнорировать правило 650 миль в день

### ✅ ДЕЛАТЬ:
1. Короткие, конкретные диалоги
2. Реалистичные рыночные ставки
3. Правильные расстояния и delivery сроки
4. Естественный разговорный стиль
5. Профессиональная терминология
6. 3 четких пути развития (GOOD/NORMAL/BAD)

---

## 📝 Чек-лист Перед Добавлением Сценария

- [ ] 3 пути развития (GOOD/NORMAL/BAD)
- [ ] GOOD path: 3 шага → успех
- [ ] NORMAL path: длинный → может быть успех или отказ
- [ ] BAD path: 3 шага → отказ
- [ ] Короткие и конкретные диалоги
- [ ] Реалистичные расстояния и ставки
- [ ] Правильный расчет delivery (650 миль в день)
- [ ] Естественный профессиональный язык
- [ ] Уникальный маршрут
- [ ] Соответствие распределению (20% short, 50% medium, 30% long)

---

## 🎯 Цель

Создать **15 уникальных, реалистичных, обучающих сценариев** с 3 путями развития, которые:
1. Покрывают разные типы грузов и расстояния
2. Учат профессиональному общению
3. Показывают разницу между хорошими, средними и плохими ответами
4. Готовят к реальной работе диспетчера

---

**Версия:** 2.0  
**Дата:** 2026-03-01  
**Статус:** Активный документ - Новая структура с 3 путями
