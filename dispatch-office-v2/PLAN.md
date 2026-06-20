# Dispatch Office V2 — План разработки и UI/UX дизайн

## Текущий статус

✅ Готово: стек (Vite + React 19 + Zustand), типы, gameStore, TickEngine, карта Google Maps,
генерация грузов, переговоры, P&L расчёт, события, погода, базовые компоненты (Header, Map, TruckCard, LoadBoard, SideButtons, SpeedControl).

❌ Не готово: главное меню, чат/почта, финансовая панель, popup переговоров, popup доставки,
shift end, сохранение, мобильная адаптация, онбординг.

---

## Архитектура UI — Desktop vs Mobile

### Референсы и лучшие практики

Основано на анализе:
- **911 Operator** (Jutsu Games) — карта на весь экран, панели по краям, события в углу
- **Google Maps (2025 redesign)** — bottom sheet на мобильных, карта всегда видна за панелями
- **Fleet Management dashboards** (Dribbble: Fleetku, Verizon Connect) — карта + sidebar + timeline
- **Responsive web map layout** (Chris Wong pattern) — desktop: sidebar + map, mobile: map сверху 60% + панель снизу

### Принцип: "Карта — главный герой"

Карта всегда занимает максимум экрана. Все панели — overlay поверх карты (glassmorphism).
На мобильных — bottom sheet pattern (как Google Maps 2025).

---

## Layout: Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo · SpeedControl · Balance · Day · Time · Icons │  48px
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│ TRUCKS │              GOOGLE MAP (fullscreen)               │
│  LIST  │                                                    │
│  (left │    [truck markers, routes, weather zones]          │
│  strip │                                                    │
│  64px) │                                                    │
│        │                                                    │
│        │         ┌──────────────────────┐                   │
│        │         │   ACTIVE PANEL       │                   │
│        │         │   (LoadBoard /       │  Right panel      │
│        │         │    Chat / Finance)   │  380px wide       │
│        │         │                      │  overlay          │
│        │         └──────────────────────┘                   │
│        │                                                    │
│        │  ┌─────────────┐                                   │
│        │  │ TruckCard   │  Bottom-left overlay              │
│        │  │ (selected)  │  320px wide                       │
│        │  └─────────────┘                                   │
├────────┴────────────────────────────────────────────────────┤
│  (no footer — all space for map)                            │
└─────────────────────────────────────────────────────────────┘
```

**Ключевые решения Desktop:**
- Header: тонкий (48px), тёмный, полупрозрачный
- Левая полоска: вертикальный список траков (иконки + статус-точка), 64px
- Правая панель: LoadBoard / Chat / Finance — 380px, overlay с backdrop-blur
- TruckCard: при клике на трак — появляется внизу слева (320px)
- Все панели — glassmorphism (rgba + blur), не блокируют карту

---

## Layout: Mobile (<768px)

```
┌─────────────────────────────┐
│  HEADER (compact): Logo ·   │  44px
│  Time · Balance · ☰ menu    │
├─────────────────────────────┤
│                             │
│      GOOGLE MAP             │  ~55% viewport
│      (fullscreen)           │
│                             │
│  [truck markers, routes]    │
│                             │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │   BOTTOM SHEET      │   │  ~45% viewport
│  │   (draggable)       │   │  (expandable to 85%)
│  │                     │   │
│  │   Content depends   │   │
│  │   on active tab:    │   │
│  │   - Trucks list     │   │
│  │   - Load Board      │   │
│  │   - Chat/Messages   │   │
│  │   - Finance         │   │
│  │                     │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│  TAB BAR: 🚛 📦 💬 📊 ⚙️   │  56px (safe-area)
└─────────────────────────────┘
```

**Ключевые решения Mobile:**
- Bottom Sheet pattern (как Google Maps 2025) — карта всегда видна сверху
- Sheet можно тянуть вверх (85% экрана) или вниз (peek 45%)
- Tab Bar внизу: Trucks / Loads / Chat / Finance / Menu
- Header компактный: только время, баланс, гамбургер
- SpeedControl — внутри sheet или в header при свайпе

---

## Layout: Tablet (768px–1024px)

Гибрид: карта на весь экран + правая панель 340px (как desktop, но уже).
Truck strip слева скрыт — траки в правой панели как список.

---

## Фазы разработки

### Фаза 1 — Главное меню и навигация (1-2 дня)
1. **MainMenu** — экран старта: New Game / Continue / Settings
2. **Router** — простой state-based (menu → playing → shift_end)
3. **Responsive shell** — определение breakpoint, условный рендер layout
4. **Mobile TabBar** — нижняя навигация для мобильных
5. **Bottom Sheet** — компонент для мобильного контента

### Фаза 2 — Доработка игрового экрана Desktop (2-3 дня)
6. **NegotiationPanel** — UI торга с брокером (чат-стиль)
7. **DeliveryPopup** — результат доставки (P&L breakdown)
8. **ChatPanel** — входящие сообщения от водителей/брокеров
9. **FinancePanel** — текущий P&L, история транзакций
10. **EventToast** — уведомления о событиях (breakdown, weather)
11. **WeatherOverlay** — индикатор погоды на карте

### Фаза 3 — Мобильная адаптация (2-3 дня)
12. **MobileHeader** — компактный header
13. **BottomSheet** — draggable sheet с snap points
14. **MobileTruckList** — список траков в sheet
15. **MobileLoadBoard** — адаптированный load board
16. **MobileNegotiation** — fullscreen modal для торга
17. **Touch gestures** — свайпы, тапы, long press

### Фаза 4 — Сохранение и прогресс (1-2 дня)
18. **LocalStorage save** — автосохранение каждые 60 сек
19. **Firebase sync** — облачные сохранения (Google Auth)
20. **Save slots** — 3 слота как в Game One
21. **Shift End screen** — оценка S/A/B/C/D, статистика

### Фаза 5 — Полировка (2-3 дня)
22. **Онбординг** — пошаговый туториал для новичков
23. **Анимации** — transitions, micro-interactions
24. **Звуки** — уведомления, клики, события
25. **PWA** — manifest, service worker, offline support
26. **Performance** — lazy loading панелей, memo, виртуализация списков

---

## Компоненты — детальная спецификация

### Header (Desktop)
- Высота: 48px
- Background: rgba(5, 8, 16, 0.9) + backdrop-blur(12px)
- Содержимое: Logo | SpeedControl | Balance | Day | GameTime | Mail badge | Menu
- Border-bottom: 1px solid rgba(255,255,255,0.06)

### Header (Mobile)
- Высота: 44px
- Содержимое: Logo (мини) | GameTime | Balance | Hamburger ☰
- SpeedControl скрыт (доступен через меню или жест)

### Truck Strip (Desktop, left)
- Ширина: 64px
- Background: rgba(5, 8, 16, 0.85) + blur
- Каждый трак: 48×48 кнопка с инициалами водителя + цветная точка статуса
- Hover: подсветка + tooltip с именем и статусом
- Клик: выделяет трак на карте + открывает TruckCard

### TruckCard (Desktop)
- Позиция: absolute, bottom-left (left: 80px, bottom: 16px)
- Ширина: 320px
- Background: glassmorphism card
- Содержимое: avatar + имя + статус + HOS bar + город + кнопки действий
- Анимация: slide-up при появлении

### Right Panel (Desktop)
- Позиция: absolute, right: 0, top: 48px, bottom: 0
- Ширина: 380px
- Background: rgba(10, 15, 30, 0.92) + blur
- Содержимое зависит от activePanel: LoadBoard / Chat / Finance
- Анимация: slide-in from right

### Bottom Sheet (Mobile)
- Snap points: peek (45vh), half (60vh), full (85vh)
- Handle bar сверху (40×4px, серый)
- Background: rgba(10, 15, 30, 0.95) + blur
- Border-radius: 20px 20px 0 0
- Drag gesture: touch + mouse
- Содержимое: зависит от активного таба

### Tab Bar (Mobile)
- Позиция: fixed bottom
- Высота: 56px + safe-area-inset-bottom
- Background: rgba(5, 8, 16, 0.95) + blur
- 5 табов: Trucks 🚛 | Loads 📦 | Chat 💬 | Finance 📊 | Menu ⚙️
- Active tab: cyan accent + label

### NegotiationPanel
- Desktop: внутри Right Panel (заменяет LoadBoard)
- Mobile: fullscreen modal с backdrop
- Стиль: чат-пузыри (broker слева, player справа)
- Input: предложение ставки + кнопка "Send Offer"
- Индикатор настроения брокера (emoji + цвет)

### DeliveryPopup
- Центральный modal (max-width: 420px)
- Содержимое: маршрут, P&L таблица, итог (profit/loss), кнопка "OK"
- Анимация: scale-in + confetti при хорошем результате

### EventToast
- Позиция: top-right (desktop) / top-center (mobile)
- Auto-dismiss через 5 сек
- Цвет по urgency: info=cyan, warning=orange, critical=red
- Клик → открывает детали события

---

## Цветовая система (уже определена в global.css)

| Переменная | Значение | Использование |
|---|---|---|
| --text-primary | #ffffff | Основной текст |
| --text-secondary | #e2e8f0 | Вторичный текст |
| --text-muted | #94a3b8 | Подписи, лейблы |
| --bg-primary | #050810 | Фон приложения |
| --bg-card | rgba(15,23,42,0.85) | Карточки, панели |
| --accent-cyan | #06b6d4 | Акцент, активные элементы |
| --accent-purple | #8b5cf6 | Вторичный акцент |
| --success | #10b981 | Доход, позитив |
| --danger | #ef4444 | Расход, ошибки |
| --warning | #f59e0b | Предупреждения |

---

## Breakpoints

```css
/* Mobile first */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Wide desktop */ }
```

---

## Приоритет реализации (что делать ПЕРВЫМ)

1. ✅ Responsive shell + breakpoint detection
2. ✅ MainMenu (простой, без Firebase пока)
3. ✅ Desktop layout polish (truck strip + right panel animation)
4. ✅ NegotiationPanel (ключевая механика)
5. ✅ Mobile BottomSheet + TabBar
6. ✅ DeliveryPopup
7. ✅ ChatPanel (сообщения)
8. ✅ FinancePanel
9. ✅ Save/Load (localStorage)
10. ✅ Shift End

---

## Источники и референсы

- [Google Maps 2025 redesign — bottom sheet pattern](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/)
- [Fleet Management Dashboard UI — Dribbble](https://dribbble.com/tags/fleet-management)
- [Responsive web map layout pattern](https://github.com/chriswhong/responsive-web-map-layout)
- [Game UI Database — map screens](https://www.gameuidatabase.com/)
- [Mobile-First Design — Figma](https://www.figma.com/resource-library/mobile-first-design/)
- [911 Operator — map + overlay panels](https://store.steampowered.com/app/503560/)
- [Verizon Connect Dispatch UI — map + sidebar + timeline](https://fleet-help.verizonconnect.com/hc/en-us/articles/360010829799)
- [Fleet Manager: Logistics Simulator — Steam](https://store.steampowered.com/app/4636670/)

Content was rephrased for compliance with licensing restrictions.
