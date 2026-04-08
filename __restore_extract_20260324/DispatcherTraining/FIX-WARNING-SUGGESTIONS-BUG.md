# ИСПРАВЛЕНИЕ БАГА - WARNING SUGGESTIONS НЕ ПОКАЗЫВАЛИСЬ

## ПРОБЛЕМА
После выбора плохого варианта (5-6) на первом шаге, диалог переходил на warning_strict путь, показывал brokerResponse, но НЕ показывал suggestions для ответа. Диалог застревал.

## ПРИЧИНА
В коде была логика:
```javascript
// Show broker's question
if (nextStep.brokerQuestion && nextStep.brokerQuestion.trim() !== '') {
    addMessage(nextStep.brokerQuestion, 'broker');
}

// Show suggestions
showSuggestions(nextStep.responseComponents || nextStep.suggestions);
```

Проблема: `showSuggestions` вызывался ВСЕГДА, но в warning путях нет `brokerQuestion` - есть только `brokerResponse` и `suggestions`.

Код показывал `brokerResponse`, но потом не показывал `suggestions`, потому что не было `brokerQuestion`.

## РЕШЕНИЕ
Изменил логику чтобы показывать suggestions ВСЕГДА когда они есть, независимо от наличия brokerQuestion:

```javascript
// Show suggestions if available (even if no brokerQuestion - for warning paths)
if (nextStep.responseComponents || nextStep.suggestions) {
    showSuggestions(nextStep.responseComponents || nextStep.suggestions);
}
```

## СТРУКТУРА WARNING ПУТЕЙ

Warning пути имеют такую структуру:
```javascript
warning: [
    {
        brokerResponse: "⚠️ Предупреждение...",  // Есть
        dispatcherPrompt: "💡 Исправьтесь!",      // Есть
        suggestions: [...]                         // Есть
        // brokerQuestion: НЕТ!
    }
]
```

Теперь код правильно обрабатывает эту структуру.

## ТЕСТИРОВАНИЕ

### Тест 1: Warning path
1. Открыть simulator.html
2. Выбрать диалог #1
3. Выбрать вариант 3 "MC 556677, FreightLink Carriers."
4. ✅ Должен показаться warning с 6 вариантами ответа

### Тест 2: Warning_strict path
1. Выбрать диалог #1
2. Выбрать вариант 6 "Van available."
3. ✅ Должен показаться warning_strict с 6 вариантами ответа

## СТАТУС
✅ Исправлено
⏳ Требует тестирования в браузере

## ФАЙЛЫ
- `pages/simulator.html` (строка ~5475)
