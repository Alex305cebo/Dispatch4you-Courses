# Озвучка модуля: Regulations (Законы и регулирование)

## Файлы для озвучки

1. **regulations-section-1.txt** - Введение + Почему диспетчер обязан знать законы
2. **regulations-section-2.txt** - DOT и FMCSA: кто контролирует индустрию
3. **regulations-section-3.txt** - HOS: 11-Hour Driving, 14-Hour Window, 30-Min Break
4. **regulations-section-4.txt** - HOS: 60/70-Hour Weekly, 34-Hour Restart, Sleeper Berth, Short-Haul, Adverse Conditions
5. **regulations-section-5.txt** - CSA Scores: категории 1-4
6. **regulations-section-6.txt** - CSA Scores: категории 5-7 + ELD
7. **regulations-section-7.txt** - Страхование: все типы
8. **regulations-section-8.txt** - Штрафы и последствия + заключение

## Настройки озвучки

- **Голос**: Alan - Soft, Hasty and Warm (или аналогичный)
- **Скорость**: 100-110 (нормальная, чуть быстрее для длинных секций)
- **Стабильность**: 60-70
- **Similarity Boost**: 70-75
- **Style Exaggeration**: 15-20

## Особенности произношения

### Аббревиатуры (произносить по буквам):
- HOS = "эйч-оу-эс"
- DOT = "ди-оу-ти"
- FMCSA = "эф-эм-си-эс-эй"
- ELD = "и-эл-ди"
- CSA = "си-эс-эй"
- CDL = "си-ди-эл"
- MC# = "эм-си номер"
- USDOT = "ю-эс-ди-оу-ти"

### Термины (произносить как есть):
- pickup = "пикап"
- delivery = "деливери"
- driving = "драйвинг"
- on-duty = "он-дьюти"
- off-duty = "офф-дьюти"
- sleeper berth = "слипер берс"
- coercion = "коэршн"
- tampering = "тэмперинг"
- out-of-service = "аут-оф-сервис"
- roadside inspection = "роудсайд инспекшн"

### Числа:
- $16,000 = "16 тысяч долларов"
- $1M = "1 миллион долларов"
- 11ч = "11 часов"
- 14ч = "14 часов"
- 70/8 = "70 за 8" или "70 часов за 8 дней"

## Имена файлов после озвучки

Сохранять как:
- `regulations-audio-1.mp3`
- `regulations-audio-2.mp3`
- `regulations-audio-3.mp3`
- `regulations-audio-4.mp3`
- `regulations-audio-5.mp3`
- `regulations-audio-6.mp3`
- `regulations-audio-7.mp3`
- `regulations-audio-8.mp3`

## Интеграция в HTML

После создания аудиофайлов добавить в regulations.html перед каждой секцией:

```html
<!-- Секция 1: Введение -->
<div class="audio-player-wrapper">
    <audio controls class="audio-player">
        <source src="../audio/regulations-audio-1.mp3" type="audio/mpeg">
    </audio>
</div>
```

## Примечания

- Общая длительность: ~25-30 минут
- Самые длинные секции: 3, 4, 5 (HOS и CSA)
- Важно: четкое произношение цифр и аббревиатур
- Тон: серьезный, информативный, но не пугающий
- Акценты на ключевых моментах: штрафы, ответственность диспетчера
