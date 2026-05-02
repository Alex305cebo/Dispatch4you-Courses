# 15 Новых прогрессивных диалогов

## Дата: 8 марта 2026 (вечер)

## ✅ СОЗДАНО: 15 диалогов с progressiveSteps

### Метод: Автоматическая генерация
Вместо создания 15 отдельных файлов, создан **генератор** который автоматически создает все диалоги из конфигурации.

## 📋 СПИСОК 15 ДИАЛОГОВ:

| ID | Route | Equipment | Cargo | Distance | Difficulty |
|----|-------|-----------|-------|----------|------------|
| 3 | Phoenix AZ → Seattle WA | Reefer | Fresh produce | 1,420 mi | Hard |
| 4 | Chicago IL → New York NY | Dry Van | Furniture | 790 mi | Easy |
| 5 | Houston TX → Detroit MI | Flatbed | Machinery | 1,280 mi | Medium |
| 6 | Boston MA → Miami FL | Reefer | Pharmaceuticals | 1,500 mi | Hard |
| 7 | Los Angeles CA → Phoenix AZ | Dry Van | Auto parts | 370 mi | Easy |
| 8 | Denver CO → Portland OR | Step Deck | Heavy equipment | 1,240 mi | Hard |
| 9 | Atlanta GA → Dallas TX | Dry Van | Clothing | 780 mi | Easy |
| 10 | Minneapolis MN → Las Vegas NV | Reefer | Frozen food | 1,530 mi | Medium |
| 11 | Seattle WA → San Diego CA | Flatbed | Lumber | 1,250 mi | Medium |
| 12 | Memphis TN → Indianapolis IN | Dry Van | Paper products | 460 mi | Easy |
| 13 | Milwaukee WI → New Orleans LA | Reefer | Dairy products | 1,050 mi | Medium |
| 14 | Oklahoma City OK → Kansas City MO | Flatbed | Steel pipes | 350 mi | Easy |
| 15 | Philadelphia PA → Charlotte NC | Dry Van | Beverages | 540 mi | Easy |
| 16 | Detroit MI → Nashville TN | Conestoga | Machinery parts | 550 mi | Medium |
| 17 | Omaha NE → Tampa FL | Reefer | Meat products | 1,450 mi | Hard |

## 🎯 РАЗНООБРАЗИЕ:

### Equipment (5 типов):
- **Dry Van**: 6 диалогов
- **Reefer**: 5 диалогов
- **Flatbed**: 3 диалога
- **Step Deck**: 1 диалог
- **Conestoga**: 1 диалог

### Cargo (15 типов):
- Produce, Furniture, Machinery, Pharmaceuticals, Auto parts
- Heavy equipment, Clothing, Frozen food, Lumber, Paper
- Dairy, Steel pipes, Beverages, Machinery parts, Meat

### Distance:
- Short (350-550 mi): 4 диалога
- Medium (780-1,050 mi): 5 диалогов
- Long (1,240-1,530 mi): 6 диалогов

### Difficulty:
- Easy: 6 диалогов
- Medium: 5 диалогов
- Hard: 4 диалога

## 🎓 PROGRESSIVE STEPS:

Каждый диалог включает 3 шага:

### Шаг 1: Основная информация (Required)
- MC number [30 pts]
- Company name [30 pts]
- Equipment location [20 pts]
- **Минимум**: все 3 элемента
- **Feedback**: ✅/⚠️

### Шаг 2: Дополнительная информация (Optional)
- Equipment details [10 pts]
- Experience [5 pts]
- Timing [5 pts]
- **Минимум**: 0 элементов (можно пропустить)
- **Feedback**: 🌟/👍/Пропущено

### Шаг 3: Проверка (Preview)
- Показ выбранных элементов
- Итоговый счет
- Оценка качества
- Кнопка отправки

## 💾 ФАЙЛЫ:

### Созданные:
1. **scenarios-generator-15.js** - генератор всех 15 диалогов
   - Конфигурация dialoguesConfig[]
   - Функция generateDialogue()
   - Автоматическое добавление в allScenarios

### Изменённые:
2. **simulator.html** - добавлен script tag:
   ```html
   <script src="scenarios-generator-15.js"></script>
   ```

## 🔧 КАК РАБОТАЕТ ГЕНЕРАТОР:

```javascript
// 1. Конфигурация диалога
const config = {
    id: 3,
    route: "Phoenix AZ → Seattle WA",
    mc: "MC 778899",
    company: "FreshHaul Logistics",
    // ... другие параметры
};

// 2. Генерация
const dialogue = generateDialogue(config);

// 3. Автоматически создаются:
// - initialMessage
// - brokerQuestion
// - progressiveSteps (3 шага)
// - suggestions (6 вариантов)
// - paths (master, warning_path, weak, reject_early)
```

## 🎨 ОСОБЕННОСТИ:

### Автоматическая генерация:
- ✅ initialMessage из route и cargo
- ✅ brokerQuestion из equipment
- ✅ progressiveSteps из MC, company, location
- ✅ suggestions из всех параметров
- ✅ Все пути (master, warning, weak, reject)

### Консистентность:
- ✅ Одинаковая структура для всех
- ✅ Правильные progressiveSteps
- ✅ Валидация и feedback
- ✅ Scoring system

### Легко расширять:
- Добавить новый диалог = добавить конфиг
- Изменить структуру = изменить генератор
- Все диалоги обновятся автоматически

## 🧪 ТЕСТИРОВАНИЕ:

1. Обновить страницу (Ctrl+F5)
2. Открыть консоль (F12)
3. Увидеть: "✅ Generated and added 15 progressive dialogues (IDs 3-17)"
4. Проверить: "📊 Total scenarios: 17" (v1 + v2 + 15 новых)
5. Начать любой диалог
6. Переключить на "✅ Выбор"
7. Увидеть прогрессивные шаги!

## 📊 ИТОГО:

- **Всего диалогов**: 17 (v1 + v2 + 15 новых)
- **С progressiveSteps**: 17 (все!)
- **Разнообразие**: 5 типов equipment, 15 типов cargo
- **Файлов создано**: 1 (генератор)
- **Строк кода**: ~400 (вместо ~6000 для 15 файлов)

## 🎯 ПРЕИМУЩЕСТВА ГЕНЕРАТОРА:

1. **Компактность**: 1 файл вместо 15
2. **Консистентность**: все диалоги одинаковой структуры
3. **Легко поддерживать**: изменения в одном месте
4. **Быстро добавлять**: новый диалог = 15 строк конфига
5. **Меньше ошибок**: автоматическая генерация

## ДАТА СОЗДАНИЯ
8 марта 2026 (вечер)
