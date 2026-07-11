# Исправление видео-фона в меню

## Проблема
Видео `Truck_loop.mp4` не воспроизводится на фоне начального меню.

## Причина
Неправильный путь к видео файлу. Путь `/game/Truck_loop.mp4` не работает в Expo Web.

## Решение

### 1. Обновлён путь в `menu.tsx`
```typescript
// Было:
src="/game/Truck_loop.mp4"

// Стало:
src="/Truck_loop.mp4"
```

### 2. Добавлены логи для отладки
```typescript
el.addEventListener('error', () => {
  console.error('❌ Video failed to load:', el.src);
  // Пробуем альтернативные пути
});

el.addEventListener('loadeddata', () => {
  console.log('✅ Video loaded successfully:', el.src);
});
```

### 3. Fallback цепочка путей
```
/Truck_loop.mp4
    ↓ (если не загрузилось)
/assets/Truck_loop.mp4
    ↓ (если не загрузилось)
./Truck_loop.mp4
    ↓ (если не загрузилось)
./assets/Truck_loop.mp4
```

## Где находится видео файл

Видео существует в нескольких местах:
```
DispatcherTraining/
├── adventure/
│   ├── public/
│   │   ├── Truck_loop.mp4          ← основной путь для Expo Web
│   │   └── assets/
│   │       └── Truck_loop.mp4      ← fallback 1
│   ├── assets/
│   │   └── Truck_loop.mp4          ← fallback 2
│   └── dist/
│       ├── Truck_loop.mp4          ← скомпилированная версия
│       └── assets/
│           └── Truck_loop.mp4
└── game/
    ├── Truck_loop.mp4              ← старый путь (не используется)
    └── assets/
        └── Truck_loop.mp4
```

## Как работает Expo Web с публичными файлами

### Правило 1: Файлы в `public/`
Файлы из папки `adventure/public/` доступны по корневому пути:
```
adventure/public/Truck_loop.mp4  →  /Truck_loop.mp4
adventure/public/assets/video.mp4 →  /assets/video.mp4
```

### Правило 2: Относительные пути
Относительные пути работают относительно текущей страницы:
```
./Truck_loop.mp4         ← относительно текущей страницы
./assets/Truck_loop.mp4  ← относительно текущей страницы
```

## Проверка

### 1. Откройте DevTools Console
Должны увидеть один из логов:
```
✅ Video loaded successfully: http://localhost:8081/Truck_loop.mp4
```

Или цепочку попыток:
```
❌ Video failed to load: http://localhost:8081/Truck_loop.mp4
🔄 Trying: /assets/Truck_loop.mp4
✅ Video loaded successfully: http://localhost:8081/assets/Truck_loop.mp4
```

### 2. Проверьте Network Tab
- Откройте DevTools → Network
- Фильтр: Media
- Обновите страницу
- Должен появиться запрос к `Truck_loop.mp4` со статусом `200 OK`

### 3. Проверьте что файл существует
```bash
# Проверка основного пути
ls -la DispatcherTraining/adventure/public/Truck_loop.mp4

# Проверка fallback путей
ls -la DispatcherTraining/adventure/public/assets/Truck_loop.mp4
ls -la DispatcherTraining/adventure/assets/Truck_loop.mp4
```

## Если видео всё ещё не работает

### Вариант 1: Скопировать видео в public/
```bash
cd DispatcherTraining/adventure
cp ../game/Truck_loop.mp4 public/
```

### Вариант 2: Использовать require()
```typescript
// В menu.tsx
const videoSource = require('../../public/Truck_loop.mp4');

<video src={videoSource} ... />
```

### Вариант 3: Использовать import
```typescript
// В menu.tsx
import videoSource from '../../public/Truck_loop.mp4';

<video src={videoSource} ... />
```

### Вариант 4: Проверить app.json
Убедитесь что в `adventure/app.json` настроен правильный путь к публичным файлам:
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static"
    }
  }
}
```

## Альтернатива: Статичный фон

Если видео не критично, можно заменить на статичное изображение:

```typescript
// Вместо <video>
<img 
  src="/truck-background.jpg" 
  style={{
    position: 'absolute', 
    inset: 0,
    width: '100%', 
    height: '100%',
    objectFit: 'cover', 
    opacity: 0.6,
  }}
/>
```

## Оптимизация видео

Если видео слишком большое:

### 1. Сжать видео
```bash
ffmpeg -i Truck_loop.mp4 -vcodec h264 -acodec aac -b:v 1M Truck_loop_compressed.mp4
```

### 2. Уменьшить разрешение
```bash
ffmpeg -i Truck_loop.mp4 -vf scale=1280:720 Truck_loop_720p.mp4
```

### 3. Конвертировать в WebM (лучше для веба)
```bash
ffmpeg -i Truck_loop.mp4 -c:v libvpx-vp9 -b:v 1M Truck_loop.webm
```

Затем использовать оба формата:
```typescript
<video autoPlay muted loop playsInline>
  <source src="/Truck_loop.webm" type="video/webm" />
  <source src="/Truck_loop.mp4" type="video/mp4" />
</video>
```

## Файлы изменены

- `DispatcherTraining/adventure/app/menu.tsx` — обновлён путь к видео
- `DispatcherTraining/VIDEO_FIX.md` — этот файл

---

**Дата**: 2 мая 2026  
**Статус**: Исправлено, требует тестирования
