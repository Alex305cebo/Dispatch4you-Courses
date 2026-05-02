# 📐 Стандарты дизайна и размеров для всех страниц

## 🎨 Цветовая палитра

```css
:root {
  --primary: #6366f1;           /* Основной фиолетовый */
  --primary-dark: #4f46e5;      /* Темный фиолетовый */
  --secondary: #8b5cf6;         /* Вторичный фиолетовый */
  --accent: #ec4899;            /* Розовый акцент */
  --bg-dark: #0f172a;           /* Темный фон */
  --bg-darker: #020617;         /* Очень темный фон */
  --text-primary: #f1f5f9;      /* Основной текст */
  --text-secondary: #94a3b8;    /* Вторичный текст */
  --text-muted: #64748b;        /* Приглушенный текст */
}
```

---

## 📏 НАВИГАЦИЯ (Navbar)

### Размеры навигации
```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 16px 0;                    /* Вертикальные отступы */
  background: rgba(15, 23, 42, 0.8);  /* Полупрозрачный фон */
  backdrop-filter: blur(20px);        /* Размытие фона */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
  max-width: 1400px;                  /* Максимальная ширина */
  margin: 0 auto;
  padding: 0 40px;                    /* Боковые отступы */
  width: 100%;
  box-sizing: border-box;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;                          /* Расстояние между элементами */
}
```

### Логотип
```css
.logo {
  font-size: 20px;                    /* Размер текста */
  font-weight: 700;                   /* Жирность */
  gap: 12px;                          /* Расстояние между иконкой и текстом */
}

.logo-icon {
  font-size: 28px;                    /* Размер иконки */
}
```

### Навигационные ссылки
```css
.nav-links {
  gap: 32px;                          /* Расстояние между ссылками */
}

.nav-link {
  font-size: 15px;                    /* Размер текста */
  font-weight: 500;                   /* Жирность */
  color: #94a3b8;                     /* Цвет текста */
}
```

### Выпадающее меню
```css
.dropdown-content {
  min-width: 220px;                   /* Минимальная ширина */
  padding: 8px;                       /* Внутренние отступы */
  padding-top: 12px;                  /* Верхний отступ */
  border-radius: 12px;                /* Скругление углов */
  background: rgba(15, 23, 42, 0.98); /* Фон */
  backdrop-filter: blur(20px);        /* Размытие */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dropdown-content a {
  padding: 12px 16px;                 /* Отступы пунктов */
  font-size: 14px;                    /* Размер текста */
  border-radius: 8px;                 /* Скругление */
}
```

### Кнопки действий
```css
.btn-login, .btn-signup {
  padding: 8px 20px;                  /* Отступы */
  font-size: 14px;                    /* Размер текста */
  font-weight: 600;                   /* Жирность */
  border-radius: 8px;                 /* Скругление */
}

.nav-actions {
  gap: 12px;                          /* Расстояние между кнопками */
}
```

### Мобильное меню
```css
.mobile-menu {
  width: 80%;                         /* Ширина меню */
  max-width: 400px;                   /* Максимальная ширина */
  padding: 80px 32px 32px;            /* Отступы */
}

.mobile-nav-links {
  gap: 8px;                           /* Расстояние между ссылками */
}

.mobile-nav-links .nav-link {
  font-size: 16px;                    /* Размер текста */
  padding: 12px 16px;                 /* Отступы */
  border-radius: 8px;                 /* Скругление */
}

.mobile-section-title {
  font-size: 12px;                    /* Размер заголовка секции */
  font-weight: 700;                   /* Жирность */
  padding: 8px 16px;                  /* Отступы */
  letter-spacing: 0.1em;              /* Межбуквенное расстояние */
}
```

---

## 📦 КОНТЕЙНЕРЫ

### Основной контейнер
```css
.container {
  max-width: 1000px;                  /* Максимальная ширина */
  margin: 0 auto;                     /* Центрирование */
  padding: 0 32px;                    /* Боковые отступы */
}

.container-wide {
  max-width: none;                    /* Без ограничения ширины */
  width: 100%;
}
```

---

## 🎯 HERO СЕКЦИЯ

### Размеры Hero
```css
.hero {
  min-height: 100vh;                  /* Минимальная высота */
  padding: 40px 0 20px;               /* Вертикальные отступы */
}

.hero-content {
  max-width: 800px;                   /* Максимальная ширина контента */
  margin: 0 auto;
  padding: 0 20px;                    /* Боковые отступы */
}
```

### Заголовки
```css
h1 {
  font-size: clamp(32px, 6vw, 56px);  /* Адаптивный размер */
  font-weight: 900;                   /* Жирность */
  line-height: 1.1;                   /* Межстрочный интервал */
  letter-spacing: -0.03em;            /* Межбуквенное расстояние */
  margin-bottom: 20px;                /* Нижний отступ */
}

.subtitle {
  font-size: clamp(14px, 2.5vw, 18px); /* Адаптивный размер */
  max-width: 600px;                   /* Максимальная ширина */
  margin: 0 auto 32px;                /* Отступы */
  line-height: 1.6;                   /* Межстрочный интервал */
}
```

### Бейджи
```css
.badge {
  padding: 6px 16px;                  /* Отступы */
  font-size: 13px;                    /* Размер текста */
  font-weight: 600;                   /* Жирность */
  border-radius: 100px;               /* Полное скругление */
  margin-bottom: 24px;                /* Нижний отступ */
  gap: 6px;                           /* Расстояние между элементами */
}

.badge-dot {
  width: 8px;                         /* Ширина точки */
  height: 8px;                        /* Высота точки */
  border-radius: 50%;                 /* Круглая форма */
}
```

### Кнопки CTA
```css
.cta-buttons {
  gap: 16px;                          /* Расстояние между кнопками */
  margin-bottom: 32px;                /* Нижний отступ */
}

.btn {
  padding: 14px 28px;                 /* Отступы */
  font-size: 15px;                    /* Размер текста */
  font-weight: 600;                   /* Жирность */
  border-radius: 16px;                /* Скругление */
  gap: 12px;                          /* Расстояние между элементами */
}

.btn-large {
  padding: 16px 32px;                 /* Увеличенные отступы */
  font-size: 16px;                    /* Увеличенный размер */
  font-weight: 700;                   /* Жирность */
}
```

### Статистика Hero
```css
.hero-stats {
  gap: 40px;                          /* Расстояние между элементами */
  padding: 24px;                      /* Внутренние отступы */
  margin: 32px 0;                     /* Вертикальные отступы */
  border-radius: 20px;                /* Скругление */
  border: 1px solid rgba(99, 102, 241, 0.15);
  background: rgba(99, 102, 241, 0.05);
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 32px;                    /* Размер числа */
  font-weight: 900;                   /* Жирность */
  line-height: 1.2;                   /* Межстрочный интервал */
  margin-bottom: 4px;                 /* Нижний отступ */
}

.stat-label {
  font-size: 13px;                    /* Размер подписи */
  font-weight: 500;                   /* Жирность */
}
```

### Быстрые ссылки
```css
.hero-quick-links {
  gap: 12px;                          /* Расстояние между ссылками */
  margin-top: 24px;                   /* Верхний отступ */
}

.quick-link {
  padding: 10px 18px;                 /* Отступы */
  font-size: 14px;                    /* Размер текста */
  font-weight: 500;                   /* Жирность */
  border-radius: 12px;                /* Скругление */
  gap: 8px;                           /* Расстояние между элементами */
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

.link-icon {
  font-size: 16px;                    /* Размер иконки */
}
```

---

## 📱 АДАПТИВНЫЕ BREAKPOINTS

### Desktop
```css
/* Extra large screens */
@media (min-width: 1400px) {
  .nav-container { max-width: 1600px; }
}

/* Large desktops */
@media (max-width: 1400px) {
  .nav-container { max-width: 1400px; }
}

/* Medium desktops */
@media (max-width: 1200px) {
  .nav-container { padding: 0 32px; }
  .nav-links { gap: 24px; }
  .nav-link { font-size: 14px; }
}
```

### Tablets
```css
/* Tablets landscape */
@media (max-width: 1024px) {
  .nav-container { padding: 0 20px; }
  .nav-links { gap: 16px; }
  .nav-link { font-size: 13px; }
  .logo { font-size: 18px; }
  .logo-icon { font-size: 24px; }
}

/* Tablets portrait */
@media (max-width: 900px) {
  .nav-links { gap: 12px; }
  .nav-link { font-size: 12px; }
  .btn-login, .btn-signup { 
    padding: 6px 10px; 
    font-size: 12px; 
  }
}
```

### Mobile
```css
/* Mobile landscape */
@media (max-width: 768px) {
  .nav-container { padding: 0 16px; }
  .navbar { padding: 12px 0; }
  .container { padding: 0 20px; }
  
  /* Hero */
  .hero { padding: 140px 0 60px; }
  h1 { font-size: clamp(26px, 7vw, 36px); }
  .subtitle { font-size: clamp(14px, 3.5vw, 16px); }
  .hero-stats { gap: 20px; padding: 20px 16px; }
  .stat-number { font-size: 28px; }
}

/* Mobile portrait */
@media (max-width: 600px) {
  .nav-container { padding: 0 16px; }
  .mobile-menu { width: 85%; padding: 70px 24px 24px; }
}

/* Small mobile */
@media (max-width: 480px) {
  .nav-container { padding: 0 12px; }
  .container { padding: 0 16px; }
  .logo-text { display: none; }
  .mobile-menu { width: 90%; max-width: 320px; }
  .mobile-nav-links .nav-link { font-size: 15px; }
}

/* Extra small mobile */
@media (max-width: 360px) {
  .nav-container { padding: 0 10px; }
  .container { padding: 0 12px; }
  .mobile-menu { width: 95%; max-width: 300px; }
  .mobile-nav-links .nav-link { font-size: 14px; }
}
```

---

## 🎨 КАРТОЧКИ И СЕКЦИИ

### Карточки
```css
.card {
  padding: 32px;                      /* Внутренние отступы */
  border-radius: 24px;                /* Скругление */
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

.card-title {
  font-size: 22px;                    /* Размер заголовка */
  font-weight: 700;                   /* Жирность */
  margin-bottom: 12px;                /* Нижний отступ */
}

.card-description {
  font-size: 15px;                    /* Размер текста */
  line-height: 1.7;                   /* Межстрочный интервал */
  color: var(--text-secondary);
}
```

### Секции
```css
.section {
  padding: 80px 0;                    /* Вертикальные отступы */
}

.section-header {
  text-align: center;
  margin-bottom: 60px;                /* Нижний отступ */
}

.section-title {
  font-size: clamp(32px, 5vw, 48px);  /* Адаптивный размер */
  font-weight: 800;                   /* Жирность */
  margin-bottom: 16px;                /* Нижний отступ */
}

.section-subtitle {
  font-size: 18px;                    /* Размер текста */
  color: var(--text-secondary);
  max-width: 700px;                   /* Максимальная ширина */
  margin: 0 auto;                     /* Центрирование */
}
```

---

## 🔤 ТИПОГРАФИКА

### Размеры шрифтов
```css
/* Заголовки */
h1: clamp(32px, 6vw, 56px)           /* Главный заголовок */
h2: clamp(28px, 5vw, 42px)           /* Заголовок секции */
h3: clamp(20px, 3vw, 28px)           /* Подзаголовок */
h4: 18-22px                          /* Заголовок карточки */

/* Текст */
body: 16px                           /* Основной текст */
.subtitle: clamp(14px, 2.5vw, 18px) /* Подзаголовок */
.small: 14px                         /* Мелкий текст */
.tiny: 12-13px                       /* Очень мелкий текст */
```

### Жирность шрифтов
```css
font-weight: 300;  /* Light */
font-weight: 400;  /* Regular */
font-weight: 500;  /* Medium */
font-weight: 600;  /* Semibold */
font-weight: 700;  /* Bold */
font-weight: 800;  /* Extrabold */
font-weight: 900;  /* Black */
```

---

## 🎭 ЭФФЕКТЫ И АНИМАЦИИ

### Тени
```css
/* Легкая тень */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

/* Средняя тень */
box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);

/* Сильная тень */
box-shadow: 0 20px 60px rgba(99, 102, 241, 0.5);

/* Тень для выпадающего меню */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
```

### Размытие
```css
backdrop-filter: blur(10px);         /* Легкое размытие */
backdrop-filter: blur(20px);         /* Среднее размытие */
```

### Переходы
```css
transition: all 0.3s ease;           /* Стандартный переход */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Плавный переход */
```

### Скругления
```css
border-radius: 8px;                  /* Маленькое */
border-radius: 12px;                 /* Среднее */
border-radius: 16px;                 /* Большое */
border-radius: 20-24px;              /* Очень большое */
border-radius: 100px;                /* Полное (для бейджей) */
```

---

## 📋 ЧЕКЛИСТ ДЛЯ НОВЫХ СТРАНИЦ

### ✅ Обязательные элементы:
- [ ] Навигация с правильными размерами
- [ ] Мобильное меню
- [ ] Контейнер с max-width: 1000px
- [ ] Адаптивные breakpoints (8 уровней)
- [ ] Правильные цвета из палитры
- [ ] Backdrop-filter для стеклянных эффектов
- [ ] Анимации fadeIn для контента
- [ ] Правильные отступы padding/margin
- [ ] Адаптивная типографика с clamp()
- [ ] Мобильный скрипт для меню

### ✅ Проверка адаптивности:
- [ ] 1920px+ (Extra large)
- [ ] 1400px (Large desktop)
- [ ] 1200px (Medium desktop)
- [ ] 1024px (Tablet landscape)
- [ ] 900px (Tablet portrait)
- [ ] 768px (Mobile landscape)
- [ ] 600px (Mobile portrait)
- [ ] 480px (Small mobile)
- [ ] 360px (Extra small mobile)
- [ ] 280px (Minimum)

---

## 🎯 ПРИМЕНЕНИЕ СТАНДАРТОВ

Для применения этих стандартов к новой странице:

1. Скопируйте CSS переменные из `:root`
2. Добавьте `<link rel="stylesheet" href="../shared-nav.css">` (для pages/)
3. Вставьте навигацию из `pages/nav-template-subfolder.html`
4. Используйте `.container` для контента (max-width: 1000px)
5. Применяйте размеры из этого документа
6. Добавьте мобильный скрипт перед `</body>`
7. Проверьте на всех breakpoints

---

**Последнее обновление:** 2026-03-01
**Версия:** 1.0
