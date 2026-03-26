# 🔧 ИСПРАВЛЕНИЕ ИМЕН БРОКЕРОВ

## Дата: 2026-03-07
## Статус: ✅ ИСПРАВЛЕНО

---

## 🔴 ПРОБЛЕМА

На скриншоте видно несоответствие имен:

```
Maria (Dispatcher) ✅
"Good afternoon! This is Maria Garcia from Texas Freight..."

Michael (Broker) ❌
"Good afternoon! This is Rachel from FurnitureFreight Brokers..."
```

**Проблема:** В тексте брокер представляется как "Rachel", но в UI показывается "Michael"!

---

## 🔍 ПРИЧИНА

В `pages/simulator.html` строка 2738:

```javascript
// Имя диспетчера извлекается из initialMessage ✅
const nameMatch = greeting.match(/This is ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/);
if (nameMatch && nameMatch[1]) {
    dispatcherName = nameMatch[1].split(' ')[0];
}

// Имя брокера выбирается СЛУЧАЙНО! ❌
brokerName = brokerNames[Math.floor(Math.random() * brokerNames.length)];
```

Имя брокера бралось из массива случайных имен:
```javascript
const brokerNames = ['James', 'Robert', 'Jennifer', 'Michael', 'Linda', ...];
```

---

## ✅ РЕШЕНИЕ

Извлекать имя брокера из первого сообщения брокера в диалоге!

### Код ДО исправления:

```javascript
// Extract names from initialMessage
const nameMatch = greeting.match(/This is ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/);
if (nameMatch && nameMatch[1]) {
    dispatcherName = nameMatch[1].split(' ')[0];
} else {
    dispatcherName = dispatcherNames[Math.floor(Math.random() * dispatcherNames.length)];
}
brokerName = brokerNames[Math.floor(Math.random() * brokerNames.length)]; // ❌
```

### Код ПОСЛЕ исправления:

```javascript
// Extract dispatcher name from initialMessage
const nameMatch = greeting.match(/This is ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/);
if (nameMatch && nameMatch[1]) {
    dispatcherName = nameMatch[1].split(' ')[0];
} else {
    dispatcherName = dispatcherNames[Math.floor(Math.random() * dispatcherNames.length)];
}

// Extract broker name from first broker message ✅
const firstPath = Object.keys(currentScenario.paths)[0];
const firstStep = currentScenario.paths[firstPath][0];
const brokerMessage = firstStep.brokerQuestion || '';
const brokerNameMatch = brokerMessage.match(/This is ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/);
if (brokerNameMatch && brokerNameMatch[1]) {
    brokerName = brokerNameMatch[1].split(' ')[0]; // Get first name only
} else {
    brokerName = brokerNames[Math.floor(Math.random() * brokerNames.length)];
}
```

---

## 📋 ПРАВИЛО ДЛЯ НОВЫХ ДИАЛОГОВ

### ОБЯЗАТЕЛЬНО в первом сообщении брокера:

```javascript
paths: {
    master: [
        { 
            brokerQuestion: "Good [morning/afternoon]! This is [BROKER NAME] from [COMPANY].\n[Rest of message]...",
            // ↑ ИМЯ БРОКЕРА ОБЯЗАТЕЛЬНО В ПЕРВОМ СООБЩЕНИИ!
        }
    ]
}
```

### Примеры правильных имен:

```javascript
// v5 - Hazmat
"Good morning! This is Mike from SafeHaul Logistics..."
// UI: Mike (Broker) ✅

// v6 - Auto
"Good morning! This is Jennifer from Premier Auto Transport..."
// UI: Jennifer (Broker) ✅

// v13 - Furniture
"Good afternoon! This is Rachel from FurnitureFreight Brokers..."
// UI: Rachel (Broker) ✅
```

---

## ✅ РЕЗУЛЬТАТ

Теперь имена ВСЕГДА совпадают:
- Диспетчер: извлекается из `initialMessage`
- Брокер: извлекается из первого `brokerQuestion`
- Формат: "This is [NAME] from [COMPANY]"
- Fallback: случайное имя если формат не найден

---

## 📝 ОБНОВЛЕНА ДОКУМЕНТАЦИЯ

Файл: `.kiro/specs/add-two-new-dialogues/MASTER-GUIDE-FOR-NEW-DIALOGUES.md`

Добавлен раздел:
```markdown
### ВАЖНО: Имена персонажей

**Имена ОБЯЗАТЕЛЬНО должны совпадать в тексте и в UI!**

- Имя диспетчера извлекается из initialMessage
- Имя брокера извлекается из первого brokerQuestion
- Формат: "This is [NAME] from [COMPANY]"
- Имя должно быть в ПЕРВОМ сообщении брокера!
```

---

**Версия: 1.0**
**Дата: 2026-03-07**
**Статус: ✅ ИСПРАВЛЕНО И ЗАДОКУМЕНТИРОВАНО**
