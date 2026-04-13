# Структура аудио-плеера курса

## ✅ Правильная структура (используется на всех страницах)

```html
<section class="section" data-audio-id="audio-id-name">
    <div class="container">
        <div class="section-audio-wrap" data-audio-id="audio-id-name">
            <h2 class="section-title">Заголовок секции</h2>
            <div class="la-container">
                <div class="la-wave"></div>
                <div class="la-wave"></div>
                <div class="la-wave"></div>
                <button class="la-btn" onclick="laToggle(this, 'audio-id-name')" aria-label="Play audio">
                    <span class="la-play">▶</span>
                    <span class="la-pause">⏸</span>
                </button>
                <div class="la-time">0:00 / 0:00</div>
                <div class="la-counter">Трек X из Y</div>
                <div class="la-mobile-fill"></div>
            </div>
        </div>
        
        <!-- Контент секции -->
        <p>...</p>
    </div>
</section>

<!-- В конце страницы перед </body> -->
<audio id="audio-id-name" data-duration="180" preload="metadata">
    <source src="../audio/audio-file.mp3" type="audio/mpeg">
</audio>
```

## 🎯 Ключевые элементы

### 1. Обёртка `.section-audio-wrap`
- **ОБЯЗАТЕЛЬНО** должна иметь `data-audio-id="audio-id-name"`
- JavaScript использует этот атрибут для определения активной секции при скролле
- Должна быть прямым родителем `.la-container`

### 2. Контейнер `.la-container`
- Содержит 3 элемента `.la-wave` для анимации волн
- Кнопку `.la-btn` с `onclick="laToggle(this, 'audio-id-name')"`
- Элемент `.la-time` для отображения времени
- Элемент `.la-counter` для номера трека
- Элемент `.la-mobile-fill` для прогресс-бара

### 3. Скрытый элемент `<audio>`
- ID должен совпадать с `data-audio-id`
- Атрибут `data-duration` в секундах (для fallback)
- Размещается в конце страницы перед `</body>`

## 🚫 Устаревшая структура (НЕ использовать)

```html
<!-- ❌ НЕПРАВИЛЬНО - старая структура -->
<div class="la-container">
    <button class="la-btn" onclick="laToggle(this, 'audio-id')">
        <span class="la-play">▶</span>
        <span class="la-pause">⏸</span>
    </button>
    <div class="la-time">0:00</div>
    <div class="la-mobile-bar" onclick="laSeekMobile(event, 'audio-id')">
        <div class="la-mobile-fill"></div>
    </div>
</div>
```

**Проблемы старой структуры:**
- `.la-mobile-bar` отключён в CSS (`display: none !important`)
- Нет волн для анимации
- Нет `data-audio-id` на родителе
- Перемотка не работает на круговой кнопке

## 📱 Как работает плеер

### Desktop (>768px)
- При скролле появляется **фиксированный sidebar** справа
- Sidebar показывает текущий трек и элементы управления
- Клик по прогресс-бару в sidebar → перемотка
- Стрелки ← → для переключения треков

### Mobile (≤768px)
- При скролле появляется **bottom bar** внизу экрана
- Bottom bar можно свернуть/развернуть
- Клик по прогресс-бару → перемотка
- Автоматически становится прозрачным через 3 сек неактивности

### Общее поведение
- При скролле к секции с аудио → плеер автоматически переключается на этот трек
- При окончании трека → автоматически переключается на следующий
- При переключении трека → автоматический скролл к секции

## 📊 Статус страниц курса

### ✅ Исправлены (новая структура):
1. intro.html (3 плеера)
2. role.html (7 плееров)
3. equipment.html (5 плееров)
4. routes.html (5 плееров)
5. loadboards.html (5 плееров)
6. negotiation.html (5 плееров)
7. brokers.html (6 плееров)
8. docs.html (4 плеера)
9. regulations.html (5 плееров)
10. documentation.html (1 плеер)

### ℹ️ Без аудио-плееров:
- glossary.html
- communication.html
- problems.html
- finances.html
- technology.html
- cases.html
- career.html

## 🔧 Файлы системы

- **CSS**: `lesson-audio.css` (v25)
- **JavaScript**: `lesson-audio.js` (833 строки)
- **Аудио файлы**: `audio/*.mp3`
- **Транскрипты**: `audio-transcripts/*.txt`

## 📝 Чеклист для новых страниц

При добавлении аудио-плеера на новую страницу:

- [ ] Подключить `lesson-audio.css?v=25`
- [ ] Подключить `lesson-audio.js`
- [ ] Использовать правильную HTML-структуру (см. выше)
- [ ] Добавить `data-audio-id` на `.section-audio-wrap`
- [ ] Добавить 3 элемента `.la-wave`
- [ ] Добавить `.la-mobile-fill`
- [ ] Добавить `.la-counter` с правильным номером трека
- [ ] Добавить скрытый `<audio>` элемент в конце страницы
- [ ] Указать `data-duration` в секундах
- [ ] Проверить что ID аудио совпадает с `data-audio-id`

## 🐛 Troubleshooting

**Плеер не появляется при скролле:**
- Проверьте наличие `.section-audio-wrap` с `data-audio-id`
- Убедитесь что `lesson-audio.js` загружен

**Перемотка не работает:**
- Проверьте наличие 3 элементов `.la-wave`
- Убедитесь что `.la-mobile-fill` присутствует
- Проверьте что старый `.la-mobile-bar` удалён

**Трек не переключается при скролле:**
- Проверьте что `data-audio-id` уникален для каждой секции
- Убедитесь что `.section-audio-wrap` является прямым родителем `.la-container`

**Время не обновляется:**
- Проверьте наличие атрибута `data-duration` на `<audio>`
- Убедитесь что аудио-файл существует и доступен
