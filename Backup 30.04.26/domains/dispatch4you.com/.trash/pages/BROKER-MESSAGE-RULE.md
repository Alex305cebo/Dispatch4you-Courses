# 📨 ПРАВИЛО: БРОКЕР ОТПРАВЛЯЕТ ТОЛЬКО ОДНО СООБЩЕНИЕ

## ✅ НОВОЕ ОБЯЗАТЕЛЬНОЕ ПРАВИЛО

### Брокер НИКОГДА не отправляет несколько сообщений подряд

**Правильный формат:**
```javascript
brokerResponse: "Excellent! Verified MC 445566 - 99% safety score. This is 44,000 lbs produce, must maintain 34°F. Pickup tomorrow 6 AM, delivery in 48 hours Miami."
```

**Что это значит:**
- ✅ Брокер пишет ОДНО сообщение
- ✅ Ждет ответа диспетчера
- ✅ Только потом следующее сообщение
- ✅ Все информация в одном блоке текста (2-3 предложения)

---

## ❌ НЕПРАВИЛЬНО

### НЕ использовать массивы:
```javascript
// ❌ ПЛОХО - создает несколько строк
brokerResponse: [
    "Excellent! Let me pull up your information.",
    "OK, MC 567890 verified.",
    "This is a high-value pharmaceutical shipment."
]
```

### НЕ отправлять несколько сообщений:
```javascript
// ❌ ПЛОХО - несколько вызовов addMessage
addMessage("First message", 'broker');
addMessage("Second message", 'broker');
addMessage("Third message", 'broker');
```

---

## ✅ ПРАВИЛЬНО

### Одно сообщение со всей информацией:
```javascript
// ✅ ХОРОШО - одно сообщение, 2-3 предложения
brokerResponse: "Excellent! Verified MC 445566 - 99% safety score, impressive. This is 44,000 lbs produce, must maintain 34°F constant. Pickup tomorrow 6 AM, delivery in 48 hours Miami."
```

### Структура диалога:
```
1. Брокер: "Question?"
2. Диспетчер: "Answer"
3. Брокер: "Next question?"
4. Диспетчер: "Next answer"
```

**НЕ:**
```
1. Брокер: "Message 1"
2. Брокер: "Message 2"  ❌ НЕПРАВИЛЬНО
3. Брокер: "Message 3"  ❌ НЕПРАВИЛЬНО
```

---

## 🎯 ПОЧЕМУ ЭТО ВАЖНО

### Реализм:
В реальных переговорах брокер:
- Задает вопрос
- Ждет ответа
- Задает следующий вопрос

### Обучение:
Диспетчер должен:
- Обработать информацию
- Подумать над ответом
- Сделать выбор

### UX:
Пользователь:
- Не перегружен информацией
- Видит четкую структуру
- Понимает очередность

---

## 📝 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### В коде simulator.html:
```javascript
// Брокер отправляет ОДНО сообщение
addMessage(currentStep.brokerResponse, 'broker');

// Потом показывает варианты ответов
showSuggestions(currentStep.suggestions);

// Ждет выбора пользователя
// Только после выбора - следующее сообщение брокера
```

### В scenarios-data-test.js:
```javascript
{
    brokerQuestion: "Question text here?",
    brokerResponse: "Single response text here. Max 2-3 sentences."
    // НЕ массив, НЕ несколько полей
}
```

---

## ✅ ПРОВЕРКА

### Чеклист для каждого шага:
- [ ] `brokerResponse` - это строка (не массив)
- [ ] Только одно поле `brokerResponse` на шаг
- [ ] 2-3 предложения максимум
- [ ] Вся информация в одном сообщении
- [ ] После сообщения - ожидание ответа диспетчера

---

## 🔍 ПРИМЕРЫ ИЗ ДИАЛОГА

### Шаг 1:
```javascript
{
    brokerQuestion: "Yes, available. MC number and equipment details?",
    brokerResponse: "Excellent! Verified MC 445566 - 99% safety score, impressive. This is 44,000 lbs produce, must maintain 34°F constant. Pickup tomorrow 6 AM, delivery in 48 hours Miami."
}
// ✅ Одно сообщение, вся информация
```

### Шаг 2:
```javascript
{
    brokerQuestion: "Perfect equipment. What rate are you looking for on this?",
    brokerResponse: "I appreciate the breakdown. Shipper budgeted $3,850 for this run. However, this is a weekly contract - 3-4 produce loads per week on this lane."
}
// ✅ Одно сообщение, контекст и предложение
```

### Шаг 3:
```javascript
{
    brokerQuestion: "How about $3,950 for first load?",
    brokerResponse: "Fantastic! Really appreciate your professionalism. Sending rate con now with $400 bonus clause. Pickup at Fresh Harvest, 2200 Industrial Dr, Chicago."
}
// ✅ Одно сообщение, подтверждение и детали
```

---

## 🎓 ОБУЧАЮЩИЙ МОМЕНТ

Это правило учит диспетчера:
- **Слушать внимательно** - вся информация в одном сообщении
- **Обрабатывать быстро** - нужно понять все сразу
- **Отвечать четко** - брокер ждет конкретного ответа

Как в реальной жизни:
- Брокер не повторяет информацию
- Нужно записывать детали
- Нужно задавать вопросы если что-то непонятно

---

**Версия:** 1.0  
**Дата:** 2026-03-02  
**Статус:** ОБЯЗАТЕЛЬНОЕ ПРАВИЛО
