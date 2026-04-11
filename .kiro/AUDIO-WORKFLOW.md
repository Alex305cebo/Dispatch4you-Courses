# Рабочий процесс добавления аудио на страницы

## Последнее обновление: 2026-04-11

### ✅ ЗАВЕРШЕНО:
- **loadboards.html** - 5 аудио секций (готово, задеплоено)
- **negotiation.html** - 5 аудио секций (готово, задеплоено)

### 📋 СЛЕДУЮЩИЕ СТРАНИЦЫ ДЛЯ ОЗВУЧКИ:
1. **brokers.html** ⬅️ СЛЕДУЮЩАЯ (завтра)
2. routes.html
3. equipment.html
4. intro.html
5. role.html
6. docs.html
7. regulations.html
8. technology.html
9. communication.html
10. problems.html
11. finances.html
12. career.html

---

## 🔧 ПРОЦЕСС ДОБАВЛЕНИЯ АУДИО (пошагово):

### ШАГ 1: Создание транскриптов
```bash
# Создать файл: audio-transcripts/[page-name]-transcripts.md
# Структура: 5 секций по 3000-4500 символов каждая
```

**КРИТИЧЕСКИЕ ПРАВИЛА АДАПТАЦИИ ДЛЯ ELEVENLABS TTS:**
1. **DAT** → "ДиЭйТи" (D-A-T spelled out)
2. **Запятые вместо коротких точек** - избегать прерывистой речи
3. **Числа прописью**: 40,000 → "сорок тысяч", $2.45 → "два доллара сорок пять центов"
4. **Англицизмы фонетически**: Load Board → "Лоад Борд", Rate Confirmation → "Рейт Конфирмэйшн"
5. **Аббревиатуры по буквам**: MC# → "эм-си номер", RPM → "ар-пи-эм", TONU → "ти-о-эн-ю"
6. **Английские фразы с транскрипцией**: "Can you do better?" → Кэн ю ду бэттер
7. **Диапазоны чисел**: "от... до..." вместо дефисов (20-50 → "от двадцати до пятидесяти")

### ШАГ 2: Озвучка через ElevenLabs
```
Настройки голоса: Alan - Soft, Hasty and Warm
Параметры: pvc_sp100_s62_sb75_se17_m2
```

### ШАГ 3: Переименование файлов
```powershell
# Пример для negotiation.html:
Rename-Item "ElevenLabs_2026-04-11T04_17_19_...mp3" -NewName "negotiation-audio-1.mp3"
Rename-Item "ElevenLabs_2026-04-11T04_17_41_...mp3" -NewName "negotiation-audio-2.mp3"
# ... и так далее для всех 5 файлов
```

### ШАГ 4: Получение длительности
```powershell
Get-ChildItem "C:\DispatcherTraining\audio\[page-name]-audio-*.mp3" | ForEach-Object { 
    $shell = New-Object -ComObject Shell.Application
    $folder = $shell.Namespace($_.DirectoryName)
    $file = $folder.ParseName($_.Name)
    $duration = $folder.GetDetailsOf($file, 27)
    Write-Output "$($_.Name): $duration"
}
```

**Конвертация в секунды:**
- 2:45 → 165 сек
- 3:20 → 200 сек
- 3:56 → 236 сек
- 5:22 → 322 сек
- 3:58 → 238 сек

### ШАГ 5: Добавление на страницу

#### 5.1 Подключить CSS в `<head>`:
```html
<link rel="stylesheet" href="../lesson-audio.css?v=5">
```

#### 5.2 Обернуть заголовки секций:
```html
<div class="section-audio-wrap">
    <h2 class="section-title">🎯 Заголовок секции</h2>
    <div class="la-container">
        <button class="la-btn" onclick="laToggle(this, '[page-name]-audio-1')" aria-label="Play/Pause">
            <span class="la-play">▶</span>
            <span class="la-pause">⏸</span>
        </button>
        <svg class="la-ring" viewBox="0 0 68 68" onclick="laSeek(event, '[page-name]-audio-1')">
            <circle class="la-ring-bg" cx="34" cy="34" r="32"></circle>
            <circle class="la-ring-fill" cx="34" cy="34" r="32"></circle>
        </svg>
        <div class="la-time">0:00 / 2:45</div>
        <div class="la-mobile-bar" onclick="laSeekMobile(event, '[page-name]-audio-1')">
            <div class="la-mobile-fill"></div>
        </div>
    </div>
</div>
```

#### 5.3 Добавить аудио элементы перед `</body>`:
```html
<!-- AUDIO ELEMENTS -->
<audio id="[page-name]-audio-1" src="../audio/[page-name]-audio-1.mp3" data-duration="165" preload="metadata"></audio>
<audio id="[page-name]-audio-2" src="../audio/[page-name]-audio-2.mp3" data-duration="200" preload="metadata"></audio>
<audio id="[page-name]-audio-3" src="../audio/[page-name]-audio-3.mp3" data-duration="236" preload="metadata"></audio>
<audio id="[page-name]-audio-4" src="../audio/[page-name]-audio-4.mp3" data-duration="322" preload="metadata"></audio>
<audio id="[page-name]-audio-5" src="../audio/[page-name]-audio-5.mp3" data-duration="238" preload="metadata"></audio>
<script src="../lesson-audio.js?v=5"></script>
```

### ШАГ 6: Деплой
```bash
git add .
git commit -m "Add audio player to [page-name].html with 5 audio sections"
git push origin main
```

---

## 📁 СТРУКТУРА ФАЙЛОВ:

```
DispatcherTraining/
├── audio/
│   ├── loadboards-audio-1.mp3 (185 сек)
│   ├── loadboards-audio-2.mp3 (265 сек)
│   ├── loadboards-audio-3.mp3 (246 сек)
│   ├── loadboards-audio-4.mp3 (228 сек)
│   ├── loadboards-audio-5.mp3 (214 сек)
│   ├── negotiation-audio-1.mp3 (165 сек)
│   ├── negotiation-audio-2.mp3 (200 сек)
│   ├── negotiation-audio-3.mp3 (236 сек)
│   ├── negotiation-audio-4.mp3 (322 сек)
│   └── negotiation-audio-5.mp3 (238 сек)
├── audio-transcripts/
│   ├── loadboards-NEW-5-sections.md
│   └── negotiation-transcripts.md
├── lesson-audio.css (v=5)
└── lesson-audio.js (v=5)
```

---

## 🎯 ТЕКУЩАЯ ВЕРСИЯ ПЛЕЕРА: v=5

**Изменения в v=5:**
- ✅ Убран счётчик "5 / 5" из плеера
- ✅ Время перемещено под прогресс-бар (не мешает перемотке)
- ✅ Отключены tooltips при наведении на таймлайн
- ✅ Добавлен z-index для прогресс-баров
- ✅ Прогресс-бар увеличивается при наведении для лучшей видимости

---

## 🚀 БЫСТРЫЙ СТАРТ ДЛЯ СЛЕДУЮЩЕЙ СТРАНИЦЫ:

1. Открыть страницу (например, routes.html)
2. Прочитать контент и разбить на 5 секций по 3000-4500 символов
3. Создать транскрипты с правильной адаптацией (DAT → ДиЭйТи, числа прописью, etc.)
4. Озвучить через ElevenLabs
5. Переименовать файлы: routes-audio-1.mp3 до routes-audio-5.mp3
6. Получить длительность и конвертировать в секунды
7. Добавить аудио-плеер на страницу (CSS + HTML + audio elements)
8. Деплой

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ:

1. **Всегда проверяй длительность аудио** через PowerShell команду
2. **Конвертируй время в секунды** для атрибута `data-duration`
3. **Используй версию v=5** для CSS и JS
4. **Не забывай фонетическую транскрипцию** английских фраз
5. **Проверяй что все 5 аудио файлов переименованы** правильно
6. **Тестируй перемотку** перед деплоем

---

## 📝 ШАБЛОН ДЛЯ БЫСТРОГО КОПИРОВАНИЯ:

### Команда переименования (замени [page-name]):
```powershell
Rename-Item "C:\DispatcherTraining\audio\ElevenLabs_..._m2.mp3" -NewName "[page-name]-audio-1.mp3"
```

### Команда получения длительности:
```powershell
Get-ChildItem "C:\DispatcherTraining\audio\[page-name]-audio-*.mp3" | ForEach-Object { $shell = New-Object -ComObject Shell.Application; $folder = $shell.Namespace($_.DirectoryName); $file = $folder.ParseName($_.Name); $duration = $folder.GetDetailsOf($file, 27); Write-Output "$($_.Name): $duration" }
```

---

**Последнее обновление:** 11 апреля 2026, 04:35
**Следующая страница:** brokers.html (завтра)
**Статус:** Готов к продолжению работы


---

## СТАТУС НА 2026-04-11 (СЕССИЯ 2)

### ✅ Завершено:
- loadboards.html (5 аудио, задеплоено)
- negotiation.html (5 аудио, задеплоено)
- brokers.html (5 аудио, плеер добавлен, НЕ задеплоено)

### 🔄 brokers.html — СТАТУС:
Аудио файлы: все 5 переименованы
- brokers-audio-1.mp3 — 343 сек (5:43) — Кто такие брокеры + Типы
- brokers-audio-2.mp3 — 294 сек (4:54) — Топ-10 + Шаг 0 (факторинг)
- brokers-audio-3.mp3 — 285 сек (4:45) — Проверка брокера шаги 1-8
- brokers-audio-4.mp3 — 309 сек (5:09) — Мошенничество + Факторинг
- brokers-audio-5.mp3 — 312 сек (5:12) — Carrier Packet + Отношения

HTML плеер добавлен (section-audio-wrap + la-container):
- section data-audio-id="brokers-audio-1" → 🤝 Кто такие freight брокеры
- section data-audio-id="brokers-audio-2" → 🏆 Топ-10 брокеров США
- section data-audio-id="brokers-audio-3" → 🔍 Как проверить брокера
- section data-audio-id="brokers-audio-4" → 🚨 Мошенничество
- section data-audio-id="brokers-audio-5" → 📦 Carrier Packet

CSS: lesson-audio.css?v=5 в head
JS: lesson-audio.js?v=5 перед </body>
НУЖНО: проверить на localhost:8000 и задеплоить

### ПРАВИЛА АДАПТАЦИИ TTS:
- DAT → ДиЭйТи
- США → СэШэА
- Остальные аббревиатуры на английском (FMCSA, MC#, D2P, TQL и т.д.)
- Числа прописью
- Запятые вместо коротких точек

### ⏳ Следующие страницы:
docs.html, regulations.html, technology.html, communication.html, problems.html, finances.html, career.html
