# Обновление структуры модулей

## Изменения:

### 1. Добавить номера секторов
Каждый content-block должен иметь номер сектора в левом верхнем углу:
- Формат: С1Б1, С1Б2, С1Б3 (Сектор 1 Блок 1, и т.д.)
- Стиль: Большие, полупрозрачные цифры на фоне

### 2. Переместить кнопку "Я закончил слушать"
- Убрать из block-content
- Добавить в quiz секцию ПЕРЕД вопросом
- Добавить текст: "Разблокируется после прослушивания аудио"

### 3. Структура блока:

```html
<div class="content-block" data-sector="С1Б1">
    <div class="sector-number">С1Б1</div>
    
    <div class="block-header">
        <h2 class="block-title">Заголовок</h2>
        <div class="audio-container">
            <!-- аудио кнопка -->
        </div>
    </div>
    
    <div class="block-content">
        <!-- контент БЕЗ кнопки "Я закончил слушать" -->
    </div>
</div>

<!-- Quiz Block -->
<div class="quick-check-block locked" id="quiz-1">
    <div class="quiz-unlock-notice">
        🔒 Разблокируется после прослушивания аудио
    </div>
    
    <button class="audio-completion-btn" data-unlocks="quiz-1">
        🎧 Я закончил(а) слушать
    </button>
    
    <div class="quick-check-header">
        <span class="quick-check-icon">✅</span>
        <h3 class="quick-check-title">Быстрая проверка</h3>
    </div>
    
    <!-- вопрос и ответы -->
</div>
```

### 4. CSS для номеров секторов:

```css
.content-block {
    position: relative;
}

.sector-number {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 80px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.03);
    z-index: 0;
    pointer-events: none;
    user-select: none;
}

.quiz-unlock-notice {
    text-align: center;
    padding: 15px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 15px;
}

.audio-completion-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, var(--audio-primary), var(--audio-secondary));
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.audio-completion-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

.audio-completion-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

## Применить к модулям:
- Модуль 1: 3 блока (С1Б1, С1Б2, С1Б3)
- Модуль 2: 4 блока (С2Б1, С2Б2, С2Б3, С2Б4)
- Модуль 3: 5 блоков (С3Б1, С3Б2, С3Б3, С3Б4, С3Б5)
- И так далее...
