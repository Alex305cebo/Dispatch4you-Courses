# Создание OG Image для соцсетей

## 📐 Технические требования

### Размеры
- **Рекомендуемый:** 1200×630 px (соотношение 1.91:1)
- **Минимальный:** 600×315 px
- **Максимальный:** 8 MB

### Форматы
- PNG (лучшее качество)
- JPG (меньший размер)
- WebP (современный формат)

### Где используется
- Facebook
- LinkedIn
- Twitter/X
- Telegram
- WhatsApp
- VK

## 🎨 Дизайн макет для Dispatch4You

### Структура изображения (1200×630px)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Логотип]                                          │
│                                                     │
│         КУРСЫ ДИСПЕТЧЕРА                            │
│      ГРУЗОПЕРЕВОЗОК США                             │
│                                                     │
│  • Обучение с нуля                                  │
│  • Заработок от $3,000/мес                          │
│  • Полностью онлайн                                 │
│                                                     │
│                              [Иконка грузовика]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Цветовая схема
- **Фон:** Тёмный градиент `#070b14` → `#0a1628`
- **Акценты:** Cyan `#06b6d4` и Orange `#f97316`
- **Текст:** Белый `#ffffff` и светло-серый `#e2e8f0`

### Шрифты
- **Заголовок:** Montserrat Bold (48-56px)
- **Подзаголовок:** Montserrat SemiBold (24-28px)
- **Список:** Montserrat Regular (18-20px)

## 🛠️ Способы создания

### Вариант 1: Figma (рекомендуется)

1. Создайте новый файл 1200×630px
2. Добавьте фон:
   ```
   Gradient: Linear
   Angle: 135°
   Color 1: #070b14
   Color 2: #0a1628
   ```
3. Добавьте радиальные блики:
   ```
   Radial gradient (15%, 25%):
   - Center: rgba(6,182,212,0.15)
   - Edge: transparent
   
   Radial gradient (85%, 75%):
   - Center: rgba(249,115,22,0.1)
   - Edge: transparent
   ```
4. Добавьте текст:
   ```
   "КУРСЫ ДИСПЕТЧЕРА"
   Font: Montserrat Bold
   Size: 52px
   Color: #ffffff
   
   "ГРУЗОПЕРЕВОЗОК США"
   Font: Montserrat Bold
   Size: 52px
   Gradient: #06b6d4 → #f97316
   ```
5. Добавьте список преимуществ
6. Экспортируйте как PNG

**Figma шаблон:** [Ссылка на готовый шаблон]

### Вариант 2: Canva

1. Перейдите на https://www.canva.com/
2. Создайте дизайн → Пользовательские размеры → 1200×630px
3. Выберите тёмный фон
4. Добавьте текст и элементы
5. Скачайте как PNG

**Canva шаблон:** [Ссылка на готовый шаблон]

### Вариант 3: Photoshop

1. Создайте документ 1200×630px, 72 DPI
2. Залейте фон градиентом
3. Добавьте текстовые слои
4. Добавьте иконки/графику
5. Сохраните для Web (PNG-24)

### Вариант 4: HTML + Screenshot (автоматизация)

Создайте файл `og-image-generator.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1200, height=630">
  <title>OG Image Generator</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      font-family: 'Montserrat', sans-serif;
      background: linear-gradient(135deg, #070b14, #0a1628);
      position: relative;
      overflow: hidden;
    }
    body::before {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6,182,212,0.15), transparent);
      top: -200px;
      left: -100px;
    }
    body::after {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(249,115,22,0.1), transparent);
      bottom: -150px;
      right: -100px;
    }
    .container {
      position: relative;
      z-index: 1;
      padding: 80px 100px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #06b6d4;
      letter-spacing: 1px;
    }
    .title {
      font-size: 56px;
      font-weight: 800;
      line-height: 1.1;
      color: #ffffff;
      margin-bottom: 40px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #06b6d4, #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 24px;
      color: #e2e8f0;
      font-weight: 600;
    }
    .feature::before {
      content: '✓';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(6,182,212,0.2);
      border: 2px solid #06b6d4;
      border-radius: 50%;
      color: #06b6d4;
      font-weight: 800;
      flex-shrink: 0;
    }
    .icon {
      position: absolute;
      bottom: 60px;
      right: 100px;
      font-size: 120px;
      opacity: 0.15;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">DISPATCH4YOU</div>
    
    <div>
      <h1 class="title">
        КУРСЫ ДИСПЕТЧЕРА<br>
        <span class="gradient-text">ГРУЗОПЕРЕВОЗОК США</span>
      </h1>
      
      <div class="features">
        <div class="feature">Обучение с нуля</div>
        <div class="feature">Заработок от $3,000/мес</div>
        <div class="feature">Полностью онлайн</div>
      </div>
    </div>
  </div>
  
  <div class="icon">🚛</div>
</body>
</html>
```

Откройте в браузере и сделайте скриншот (1200×630px).

**Инструменты для скриншота:**
- Chrome DevTools (F12 → Device Toolbar → Custom 1200×630)
- Firefox Screenshot Tool
- Расширение "Full Page Screen Capture"

## 📝 Варианты текста для OG Image

### Вариант 1 (текущий)
```
КУРСЫ ДИСПЕТЧЕРА
ГРУЗОПЕРЕВОЗОК США

• Обучение с нуля
• Заработок от $3,000/мес
• Полностью онлайн
```

### Вариант 2 (фокус на доход)
```
ЗАРАБАТЫВАЙ ОТ $3,000/МЕС
Удалённо из любой точки мира

Курсы диспетчера грузоперевозок США
✓ Обучение с нуля  ✓ 48+ выпускников
```

### Вариант 3 (фокус на профессию)
```
ПРОФЕССИЯ БУДУЩЕГО
Диспетчер грузоперевозок США

Удалённая работа • Гибкий график
Доход $3,000-8,000/мес
```

### Вариант 4 (социальное доказательство)
```
48+ ВЫПУСКНИКОВ УЖЕ РАБОТАЮТ

Курсы Диспетчера
Грузоперевозок США

Средний доход: $3,000+/мес
```

## 🎯 Разные OG Image для разных страниц

### Главная (index.html)
- Общий имидж курса
- Фокус на профессии и доходе

### Модули (modules-index.html)
```
15 МОДУЛЕЙ ОБУЧЕНИЯ
От новичка до профессионала

AI-симулятор • 300+ кейсов
Менторская поддержка 24/7
```

### Тарифы (pricing.html)
```
СКИДКА 20% ДО КОНЦА НЕДЕЛИ

Полный доступ: $800 $1,000
Премиум: $1,500 $1,750

Начни карьеру диспетчера →
```

### О проекте (about.html)
```
DISPATCH4YOU

48+ выпускников
12 модулей курса
$3,000+ средний доход
100% онлайн
```

## ✅ Чек-лист перед публикацией

- [ ] Размер: 1200×630 px
- [ ] Формат: PNG или JPG
- [ ] Размер файла: < 1 MB
- [ ] Текст читаем на мобильных (проверить в превью)
- [ ] Логотип/бренд присутствует
- [ ] Цвета соответствуют бренду
- [ ] Нет обрезанного текста по краям
- [ ] Протестировано в Facebook Debugger
- [ ] Протестировано в Twitter Card Validator

## 🔍 Тестирование OG Image

### Facebook Sharing Debugger
1. Перейти на https://developers.facebook.com/tools/debug/
2. Вставить URL: https://dispatch4you.com/
3. Нажать "Debug"
4. Проверить превью изображения
5. Если нужно обновить кеш: "Scrape Again"

### Twitter Card Validator
1. Перейти на https://cards-dev.twitter.com/validator
2. Вставить URL
3. Проверить превью

### LinkedIn Post Inspector
1. Перейти на https://www.linkedin.com/post-inspector/
2. Вставить URL
3. Проверить превью

### Telegram
Просто отправьте ссылку в любой чат и проверьте превью.

## 📦 Финальные файлы

После создания сохраните:
- `/og-image.png` - основное изображение (1200×630)
- `/og-image-square.png` - квадратное для Instagram (1080×1080)
- `/og-image-twitter.png` - для Twitter (1200×600)

Обновите мета-теги:
```html
<meta property="og:image" content="https://dispatch4you.com/og-image.png">
<meta name="twitter:image" content="https://dispatch4you.com/og-image.png">
```

## 🎨 Дополнительные элементы

### Иконки для добавления
- 🚛 Грузовик
- 📊 График роста
- 💰 Деньги/доллары
- 🌍 Глобус (удалённая работа)
- 📚 Книги (обучение)
- ⭐ Звёзды (рейтинг)

### Эффекты
- Тени для текста (для лучшей читаемости)
- Градиенты на заголовках
- Лёгкий blur на фоновых элементах
- Свечение вокруг акцентных элементов

## 💡 Советы

1. **Контраст:** Убедитесь что текст хорошо читается на фоне
2. **Простота:** Не перегружайте изображение элементами
3. **Брендинг:** Логотип должен быть виден но не доминировать
4. **Призыв к действию:** Добавьте мотивирующий текст
5. **Тестирование:** Проверьте как выглядит в разных соцсетях
6. **Мобильные:** Текст должен читаться даже на маленьких экранах
7. **Обновление:** Меняйте изображение при акциях/скидках

## 🔄 Автоматизация (продвинутый уровень)

Используйте сервисы для автоматической генерации:
- **Cloudinary:** Динамические OG images через URL
- **Vercel OG Image:** Генерация через API
- **Bannerbear:** API для создания изображений
- **Placid:** Шаблоны с динамическим контентом

Пример с Cloudinary:
```
https://res.cloudinary.com/demo/image/upload/
  l_text:Montserrat_56_bold:КУРСЫ%20ДИСПЕТЧЕРА,
  co_rgb:ffffff,g_north,y_150/
  l_text:Montserrat_24:Заработок%20от%20$3000,
  co_rgb:e2e8f0,g_center/
  og-template.png
```
