# Тест: Видео-фон в меню

## ✅ Что исправлено

1. **Путь к видео**: изменён с `/game/Truck_loop.mp4` на `/Truck_loop.mp4`
2. **Fallback система**: добавлена цепочка альтернативных путей
3. **Логирование**: добавлены console.log для отладки

## 🧪 Как протестировать

### Шаг 1: Запустить приложение
```bash
cd DispatcherTraining/adventure
npm start
# или
yarn start
```

### Шаг 2: Открыть в браузере
```
http://localhost:8081
```

### Шаг 3: Открыть DevTools Console
**Windows/Linux**: `F12` или `Ctrl+Shift+I`  
**Mac**: `Cmd+Option+I`

### Шаг 4: Проверить логи

#### ✅ Успешная загрузка
Должны увидеть:
```
✅ Video loaded successfully: http://localhost:8081/Truck_loop.mp4
```

#### ⚠️ Fallback сработал
Если первый путь не сработал:
```
❌ Video failed to load: http://localhost:8081/Truck_loop.mp4
🔄 Trying: /assets/Truck_loop.mp4
✅ Video loaded successfully: http://localhost:8081/assets/Truck_loop.mp4
```

#### ❌ Видео не загрузилось
Если все пути не сработали:
```
❌ Video failed to load: http://localhost:8081/Truck_loop.mp4
🔄 Trying: /assets/Truck_loop.mp4
❌ Video failed to load: http://localhost:8081/assets/Truck_loop.mp4
🔄 Trying: ./Truck_loop.mp4
❌ Video failed to load: http://localhost:8081/./Truck_loop.mp4
🔄 Trying: ./assets/Truck_loop.mp4
❌ All video paths failed
```

### Шаг 5: Проверить Network Tab

1. Откройте DevTools → **Network**
2. Фильтр: **Media** (или **All**)
3. Обновите страницу (`F5`)
4. Найдите запрос `Truck_loop.mp4`

#### ✅ Успешно
```
Name: Truck_loop.mp4
Status: 200 OK
Type: video/mp4
Size: ~XX MB
```

#### ❌ Ошибка
```
Name: Truck_loop.mp4
Status: 404 Not Found
```

### Шаг 6: Визуальная проверка

На фоне меню должно быть:
- ✅ Видео с движущимся траком (замедленное воспроизведение 0.5x)
- ✅ Полупрозрачное затемнение (opacity: 0.6)
- ✅ Градиентный оверлей
- ✅ Анимированная сканлайн линия

## 🔧 Если видео не работает

### Проблема 1: 404 Not Found

**Решение**: Скопировать видео в правильную папку
```bash
cd DispatcherTraining
cp game/Truck_loop.mp4 adventure/public/
```

### Проблема 2: CORS ошибка

**Решение**: Убедиться что сервер разрешает локальные запросы
```bash
# Перезапустить dev server
cd adventure
npm start -- --reset-cache
```

### Проблема 3: Видео не воспроизводится автоматически

**Причина**: Браузеры блокируют autoplay без взаимодействия пользователя

**Решение**: Добавить кнопку для запуска видео
```typescript
const [videoPlaying, setVideoPlaying] = useState(false);

<video 
  ref={(el) => {
    if (el && videoPlaying) el.play();
  }}
  onClick={() => {
    setVideoPlaying(true);
  }}
/>
```

### Проблема 4: Видео слишком большое

**Решение**: Сжать видео
```bash
# Установить ffmpeg (если нет)
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Сжать видео
ffmpeg -i Truck_loop.mp4 -vcodec h264 -b:v 1M Truck_loop_compressed.mp4
```

### Проблема 5: Чёрный экран вместо видео

**Причина**: Видео файл повреждён или неправильный формат

**Решение**: Проверить видео в медиаплеере
```bash
# Windows
start Truck_loop.mp4

# Mac
open Truck_loop.mp4
```

## 📊 Ожидаемый результат

### Desktop
```
┌─────────────────────────────────────┐
│  🎥 Видео-фон (движущийся трак)    │
│  ┌───────────────────────────────┐ │
│  │  🚛 DISPATCH OFFICE            │ │
│  │  ▶ Продолжить                  │ │
│  │  ⚡ Начать игру                 │ │
│  │  ◉ Профиль                     │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Mobile
```
┌───────────────────┐
│ 🎥 Видео-фон      │
│ ┌───────────────┐ │
│ │ 🚛 DISPATCH   │ │
│ │    OFFICE     │ │
│ │               │ │
│ │ ▶ Продолжить  │ │
│ │ ⚡ Начать игру │ │
│ │ ◉ Профиль     │ │
│ └───────────────┘ │
└───────────────────┘
```

## 🎬 Характеристики видео

- **Формат**: MP4 (H.264)
- **Скорость**: 0.5x (замедленное)
- **Зацикливание**: Да (loop)
- **Звук**: Отключён (muted)
- **Автозапуск**: Да (autoPlay)
- **Прозрачность**: 60% (opacity: 0.6)

## 📝 Чеклист

- [ ] Видео загружается без ошибок
- [ ] Видео воспроизводится автоматически
- [ ] Видео зациклено (начинается заново после окончания)
- [ ] Видео замедлено (0.5x скорость)
- [ ] Видео полупрозрачное (60% opacity)
- [ ] Градиентный оверлей виден
- [ ] Сканлайн анимация работает
- [ ] Меню читаемо поверх видео
- [ ] Видео адаптируется под размер экрана
- [ ] Нет ошибок в Console
- [ ] Нет 404 в Network Tab

---

**Дата**: 2 мая 2026  
**Статус**: Готово к тестированию
