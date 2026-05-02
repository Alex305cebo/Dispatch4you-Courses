# ⚡ Быстрая шпаргалка - Размеры и отступы

## 🎯 НАВИГАЦИЯ
```
Высота navbar: 16px padding (сверху/снизу)
Контейнер: max-width 1400px, padding 0 40px
Логотип: 20px текст, 28px иконка
Ссылки: 15px, gap 32px
Dropdown: min-width 220px, padding 12px 16px
Кнопки: 8px 20px, font 14px
```

## 📦 КОНТЕЙНЕРЫ
```
.container: max-width 1000px, padding 0 32px
.container-wide: max-width none, width 100%
```

## 🎯 HERO
```
min-height: 100vh
padding: 40px 0 20px
max-width: 800px (контент)

h1: clamp(32px, 6vw, 56px)
subtitle: clamp(14px, 2.5vw, 18px)
badge: 6px 16px, font 13px
buttons: 14px 28px, font 15px, gap 16px
stats: gap 40px, padding 24px
stat-number: 32px
quick-links: gap 12px, padding 10px 18px
```

## 📱 BREAKPOINTS
```
1400px+  → Extra large (nav-container: 1600px)
1400px   → Large desktop (nav-container: 1400px)
1200px   → Medium desktop (padding: 0 32px, gap: 24px)
1024px   → Tablet landscape (padding: 0 20px, gap: 16px)
900px    → Tablet portrait (gap: 12px)
768px    → Mobile (hamburger menu, padding: 0 16px)
600px    → Mobile portrait (width: 85%)
480px    → Small mobile (logo-text: none, width: 90%)
360px    → Extra small (width: 95%)
```

## 🎨 КАРТОЧКИ
```
padding: 32px
border-radius: 24px
border: 1px solid rgba(255,255,255,0.08)
background: rgba(255,255,255,0.03)
backdrop-filter: blur(10px)

title: 22px, weight 700
description: 15px, line-height 1.7
```

## 📏 СЕКЦИИ
```
padding: 80px 0 (вертикальные отступы)
header margin-bottom: 60px

title: clamp(32px, 5vw, 48px), weight 800
subtitle: 18px, max-width 700px
```

## 🔤 ТИПОГРАФИКА
```
h1: clamp(32px, 6vw, 56px)
h2: clamp(28px, 5vw, 42px)
h3: clamp(20px, 3vw, 28px)
h4: 18-22px
body: 16px
subtitle: clamp(14px, 2.5vw, 18px)
small: 14px
tiny: 12-13px
```

## 🎭 ЭФФЕКТЫ
```
Скругления:
- 8px (маленькое)
- 12px (среднее)
- 16px (большое)
- 20-24px (очень большое)
- 100px (полное)

Тени:
- Легкая: 0 4px 12px rgba(0,0,0,0.1)
- Средняя: 0 10px 40px rgba(99,102,241,0.3)
- Сильная: 0 20px 60px rgba(99,102,241,0.5)

Размытие:
- backdrop-filter: blur(10px) - легкое
- backdrop-filter: blur(20px) - среднее

Переходы:
- transition: all 0.3s ease
```

## 🎨 ЦВЕТА
```css
--primary: #6366f1
--secondary: #8b5cf6
--accent: #ec4899
--bg-dark: #0f172a
--bg-darker: #020617
--text-primary: #f1f5f9
--text-secondary: #94a3b8
--text-muted: #64748b
```

## ⚡ БЫСТРАЯ УСТАНОВКА

### 1. В `<head>`:
```html
<link rel="stylesheet" href="../shared-nav.css">
```

### 2. После `<body>`:
Скопировать из `pages/nav-template-subfolder.html`

### 3. Перед `</body>`:
```html
<script src="../auth.js"></script>
<script>
  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  
  if (mobileMenuToggle && mobileMenu && mobileMenuOverlay) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      mobileMenuOverlay.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    mobileMenuOverlay.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
</script>
```

## 📋 МОБИЛЬНАЯ АДАПТАЦИЯ

### Hero на мобильных:
```css
@media (max-width: 768px) {
  .hero { padding: 140px 0 60px; }
  h1 { font-size: clamp(26px, 7vw, 36px); }
  .subtitle { font-size: clamp(14px, 3.5vw, 16px); }
  .hero-stats { gap: 20px; padding: 20px 16px; }
  .stat-number { font-size: 28px; }
}
```

### Навигация на мобильных:
```css
@media (max-width: 768px) {
  .nav-links, .nav-actions { display: none; }
  .mobile-menu-toggle { display: flex; }
  .navbar { padding: 12px 0; }
}
```

---

**Используйте этот документ как быструю справку при создании новых страниц!**
