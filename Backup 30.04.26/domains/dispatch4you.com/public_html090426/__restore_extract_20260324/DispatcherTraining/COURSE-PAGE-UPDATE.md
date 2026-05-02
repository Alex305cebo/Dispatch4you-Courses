# 📐 Обновление размеров course.html

**Дата:** 2026-03-01  
**Файл:** course.html  
**Статус:** ✅ Приведено к стандартам

---

## 🔧 Основные исправления

### 1. Удалён странный масштаб
**Было:**
```css
body {
  transform: scale(1.3);
  transform-origin: top center;
  width: 76.92%;
  margin: 0 auto;
}
```

**Стало:**
```css
body {
  /* Нормальный размер без масштабирования */
}
```

---

## 📏 Приведение размеров к стандартам

### Hero Section:

| Элемент | Было | Стало | Стандарт |
|---------|------|-------|----------|
| h1 | 62-94px | clamp(32px, 6vw, 56px) | ✅ |
| subtitle | 26px | clamp(14px, 2.5vw, 18px) | ✅ |
| subtitle max-width | 832px | 600px | ✅ |
| margin-bottom | 62px | 32px | ✅ |

### Stats:

| Элемент | Было | Стало | Стандарт |
|---------|------|-------|----------|
| stat-number | 48px | 32px | ✅ |
| stat-label | 14px | 13px | ✅ |
| font-weight | 800 | 900 | ✅ |

### Sections:

| Элемент | Было | Стало | Стандарт |
|---------|------|-------|----------|
| padding | 20px 0 | 80px 0 | ✅ |
| container max-width | 1000px | 1000px | ✅ (уже было) |

---

## 📱 Добавлены адаптивные breakpoints

### Было: 2 breakpoints
- 768px
- 480px

### Стало: 6 breakpoints
1. **1024px** - Tablets landscape
2. **900px** - Tablets portrait
3. **768px** - Mobile landscape (улучшен)
4. **600px** - Mobile portrait (новый)
5. **480px** - Small mobile (улучшен)
6. **360px** - Extra small mobile (новый)

---

## 🎯 Детали по breakpoints

### 1024px - Tablets landscape
```css
- Container padding: 0 24px
- Section padding: 70px 0
- Section title: clamp(28px, 5vw, 42px)
- Card padding: 28px
```

### 900px - Tablets portrait
```css
- Container padding: 0 20px
- Section padding: 65px 0
- Hero stats gap: 36px
```

### 768px - Mobile landscape
```css
- Hero padding: 80px 0 60px
- Hero h1: 40px
- Section padding: 60px 0 40px
- Section title: 36px
- Card padding: 24px
```

### 600px - Mobile portrait (новый)
```css
- Container padding: 0 16px
- Section padding: 50px 0 30px
- Hero padding: 70px 0 50px
- Card padding: 20px
- Card h3: 17px
```

### 480px - Small mobile
```css
- Container padding: 0 16px
- Hero h1: 32px
- Hero subtitle: 16px
- Section padding: 40px 0 20px
- Section title: 28px
- Stat number: 28px
```

### 360px - Extra small mobile (новый)
```css
- Container padding: 0 12px
- Hero h1: 28px
- Hero subtitle: 14px
- Section padding: 35px 0 18px
- Section title: 24px
- Card padding: 16px
- Card h3: 16px
- Stat number: 24px
```

---

## ✅ Результаты

### Исправлено:
- ❌ Удалён `transform: scale(1.3)` - страница больше не увеличена на 130%
- ✅ Hero заголовки приведены к стандартным размерам
- ✅ Subtitle использует адаптивный clamp()
- ✅ Stats уменьшены до стандартных размеров
- ✅ Section padding увеличен с 20px до 80px
- ✅ Добавлены 4 новых breakpoint (600px, 900px, 1024px, 360px)

### Сохранено:
- ✅ Container max-width: 1000px (уже был стандартным)
- ✅ Footer max-width: 1000px (обновлён ранее)
- ✅ Все существующие адаптивные стили для 768px и 480px

---

## 📊 Сравнение до/после

### До:
- Страница увеличена на 130% (transform: scale)
- Огромные заголовки (94px)
- Малые отступы секций (20px)
- Только 2 breakpoint
- Неадаптивные размеры шрифтов

### После:
- Нормальный размер (без scale)
- Стандартные заголовки (32-56px)
- Правильные отступы (80px)
- 6 полных breakpoints
- Адаптивные размеры с clamp()

---

## 🎨 Преимущества

1. **Читаемость** - нормальные размеры текста
2. **Консистентность** - соответствует другим страницам
3. **Адаптивность** - работает на всех устройствах
4. **Производительность** - нет лишних transform
5. **Поддержка** - легче обновлять и поддерживать

---

**Версия:** 1.0  
**Статус:** ✅ Готово
