# 🎙️ Руководство по генерации аудио файлов

## Шаг 1: Установка Python

### Windows:
1. Скачай Python с https://www.python.org/downloads/
2. Запусти установщик
3. ✅ Отметь "Add Python to PATH"
4. Нажми "Install Now"

### Проверка установки:
```bash
python --version
```
Должно показать: `Python 3.x.x`

---

## Шаг 2: Установка библиотеки gTTS

Открой PowerShell или CMD и выполни:

```bash
pip install gtts
```

Это установит Google Text-to-Speech библиотеку.

---

## Шаг 3: Запуск скрипта

В папке проекта выполни:

```bash
python generate_audio.py
```

### Что произойдет:

1. Скрипт прочитает все фразы из словаря
2. Для каждой фразы:
   - Отправит текст в Google TTS API
   - Получит аудио файл
   - Сохранит как MP3 в папку `audio/`
3. Покажет прогресс:
   ```
   ✅ Created: disp_load_from_X_to_Y_posted_on_DAT.mp3
   ✅ Created: broker_yes_its_still_available_load_number.mp3
   ...
   ```

---

## Как это работает внутри

### 1. Импорт библиотек
```python
from gtts import gTTS  # Google Text-to-Speech
import os              # Работа с файлами
import time            # Задержки между запросами
```

### 2. Словарь фраз
```python
phrases = {
    "filename.mp3": "Text to speak",
    ...
}
```

### 3. Генерация аудио
```python
for filename, text in phrases.items():
    # Создать TTS объект
    tts = gTTS(text=text, lang='en', slow=False, tld='com')
    
    # Сохранить как MP3
    tts.save(f'audio/{filename}')
```

### 4. Google TTS API
- Бесплатный API от Google Translate
- Не требует регистрации
- Лимит: ~100 запросов в минуту
- Качество: хорошее, но не идеальное

---

## Параметры настройки

### Скорость речи:
```python
tts = gTTS(text=text, lang='en', slow=True)  # Медленная речь
```

### Акцент:
```python
tts = gTTS(text=text, lang='en', tld='com')    # Американский
tts = gTTS(text=text, lang='en', tld='co.uk')  # Британский
tts = gTTS(text=text, lang='en', tld='com.au') # Австралийский
```

### Язык:
```python
tts = gTTS(text=text, lang='en')  # Английский
tts = gTTS(text=text, lang='ru')  # Русский
tts = gTTS(text=text, lang='es')  # Испанский
```

---

## Альтернативы gTTS

### 1. pyttsx3 (офлайн, хуже качество)
```bash
pip install pyttsx3
```

```python
import pyttsx3

engine = pyttsx3.init()
engine.save_to_file('Hello world', 'output.mp3')
engine.runAndWait()
```

### 2. Google Cloud TTS (платно, лучше качество)
```bash
pip install google-cloud-texttospeech
```

Требует API ключ и оплату.

### 3. ElevenLabs (платно, отличное качество)
```bash
pip install elevenlabs
```

Требует API ключ ($5/месяц).

---

## Troubleshooting

### Ошибка: "pip not found"
```bash
python -m pip install gtts
```

### Ошибка: "Permission denied"
Запусти PowerShell от имени администратора.

### Ошибка: "Connection timeout"
Проверь интернет соединение. gTTS требует интернет.

### Файлы не создаются
Проверь что папка `audio/` существует:
```bash
mkdir audio
```

---

## Добавление новых фраз

Открой `generate_audio.py` и добавь в словарь `phrases`:

```python
phrases = {
    # ... существующие фразы ...
    
    # Твоя новая фраза
    "my_new_phrase.mp3": "This is my new phrase to speak",
}
```

Запусти скрипт снова - он создаст только новые файлы.

---

## Результат

После выполнения в папке `audio/` будут файлы:
- `disp_load_from_X_to_Y_posted_on_DAT.mp3`
- `broker_yes_its_still_available_load_number.mp3`
- `disp_53_foot_reefer_with_temperature_control.mp3`
- ... и все остальные

Эти файлы готовы для использования на сайте!
