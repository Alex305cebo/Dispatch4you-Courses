# Dispatch Academy — Сводка для следующей сессии

## 📍 Где мы остановились

Проект: **Dispatch Academy** — Duolingo-style обучающее приложение для русскоязычных диспетчеров грузоперевозок в США.

Папка проекта: `c:\DispatcherTraining\dispatch-academy-app\`

Spec: `c:\DispatcherTraining\.kiro\specs\dispatch-academy-app\` (requirements.md, design.md, tasks.md)

Dev сервер: `npm run dev` в папке проекта → http://localhost:5174/

---

## ✅ Что готово (48/88 задач спека)

**Архитектура:**
- React 18 + Vite + TypeScript + TailwindCSS
- React Router v6 (9 маршрутов с lazy loading)
- Zustand stores (progress + UI) с localStorage persist
- Firebase Auth + Firestore (заглушки для demo режима)
- AppLayout с глобальным header (←, логотип, streak, XP) + bottom nav (Карта/Карточки/Настройки)

**Страницы:**
- `/login` — Login/Register (email + Google)
- `/map` — **ProgressMapPage** ⚠️ требует доработки (см. ниже)
- `/day/:id` — DayPage с TaskRenderer
- `/exam/mini/:weekId`, `/exam/final` — ExamPage
- `/flashcards` — FlashcardPage с SM-2
- `/certificate` — CertificatePage с jsPDF
- `/settings` — заглушка

**11 типов заданий (все работают):**
Quiz, FillBlank, DragMatch, Audio, Email, Phone, Calculator, Map, Crisis, DocReview + Flashcard

**Бизнес-логика:**
- XP/Levels/Streaks с unit-тестами
- SM-2 flashcards
- Day unlock logic
- Exam scoring + cooldowns
- Calculator tolerance (±2%)
- Doc review penalty scoring
- Offline merge strategy
- 80+ unit тестов проходят

**Контент:**
- 20 day JSON файлов (`src/data/lessons/day-01.json` ... `day-20.json`) — 109 заданий
- 90 флеш-карточек (`flashcards.json`)
- 4 mini-exam pools + 1 final-exam pool

**Визуальный дизайн:**
- Tailwind с gradient/glow/animations
- Glass-morphism, particles bg
- Адаптивный (mobile + desktop)
- Custom scrollbar

---

## 🚧 АКТУАЛЬНАЯ ПРОБЛЕМА — ProgressMapPage

**Что есть сейчас:**
- Файл: `src/pages/ProgressMapPage.tsx`
- Фон: `public/maps/week-1.jpg` (сгенерированная картинка с дорожкой и 8 каменными платформами)
- 8 кнопок уровней позиционированы в % координатах

**Проблема:** Кнопки НЕ попадают точно на каменные платформы на изображении. Координаты в % смещаются на разных размерах экрана.

**Решение, которое попросил пользователь:**
> "Раздели картинку на сетку и реагируй на нажатие на определённом квадрате сетки, где находится остров. Сетка 3×8 (3 столбца, 8 строк). На десктопной версии тоже сделай нормально, всё растянуто и некрасиво."

**Что нужно сделать в новой сессии:**

1. **Создать сетку 3×8** поверх изображения (24 ячейки)
2. **Каждая каменная платформа = одна ячейка сетки** (всего 8 уровней)
3. Маппинг островов на ячейки сетки (от низа карты к верху):
   - Уровень 1: row 8 (низ), col 2 (центр)
   - Уровень 2: row 7, col 1 (лево)
   - Уровень 3: row 6, col 3 (право)
   - Уровень 4: row 5, col 1 (лево)
   - Уровень 5: row 4, col 2 (центр)
   - Уровень 6: row 3, col 1 (лево, у трака)
   - Уровень 7: row 2, col 3 (право, у трейлера)
   - Уровень 8: row 1 (верх), col 2 (центр)
4. **Кнопки рендерятся в центре своей ячейки** — тогда они автоматически выравнены с камнями (т.к. на изображении камни тоже расположены примерно по сетке)
5. **Desktop версия:** Ограничить максимальную ширину карты (например `max-w-md` ~448px) и центрировать. Сейчас изображение растягивается на весь широкий экран — это некрасиво.

**Псевдокод подхода:**
```tsx
const GRID_POSITIONS = [
  { id: 1, row: 8, col: 2 }, // bottom center
  { id: 2, row: 7, col: 1 },
  // ... etc
];

<div className="relative max-w-md mx-auto" style={{aspectRatio: '9/16'}}>
  <img src="/maps/week-1.jpg" className="absolute inset-0 w-full h-full" />
  <div className="absolute inset-0 grid grid-cols-3 grid-rows-8">
    {GRID_POSITIONS.map(({id, row, col}) => (
      <button 
        style={{gridRow: row, gridColumn: col}}
        className="flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-cyan-500">
          {id}
        </div>
      </button>
    ))}
  </div>
</div>
```

---

## 🎨 Дизайн-стандарты проекта

Из `.kiro/steering/`:
- Минимальный размер шрифта: 14px body, 12px labels
- Тёмный фон: bg-slate-950, цвета текста #fff/#e2e8f0/#94a3b8 (не темнее)
- Touch targets минимум 44×44px
- Контраст текста минимум 4.5:1
- Адаптивные breakpoints: 360, 480, 768, 1024, 1400px

---

## 📦 Что осталось (40 задач)

- ✏️ **ProgressMapPage** — переделать на grid систему (СРОЧНО)
- 🎨 Settings страница (звук вкл/выкл)
- ✨ Level-up modal/анимация
- 🔧 Service Worker (Workbox) для offline
- ⌨️ Keyboard navigation полировка
- 📦 Bundle size optimization
- 🧪 Property-based тесты с fast-check (опционально)
- 📚 Карты для weeks 2-4 (нужны новые изображения)

---

## 🔑 Ключевые файлы

```
dispatch-academy-app/
├── public/maps/week-1.jpg        ← Фон карты (есть только для week 1)
├── src/
│   ├── pages/
│   │   ├── ProgressMapPage.tsx   ← ⚠️ ПЕРЕДЕЛАТЬ на grid
│   │   ├── DayPage.tsx
│   │   ├── ExamPage.tsx
│   │   └── ...
│   ├── components/
│   │   ├── layout/AppLayout.tsx  ← Header + bottom nav
│   │   └── tasks/                ← 11 task types
│   ├── data/lessons/             ← 20 day JSON файлов
│   ├── store/                    ← Zustand
│   ├── logic/                    ← Бизнес-логика
│   └── services/                 ← Firebase, content-loader
└── tasks.md                      ← Список задач спека
```

---

## 💬 Последний контекст

Пользователь хочет:
1. **Карта работает через сетку 3×8** — кнопки автоматически на островах
2. **Desktop версия** — ограниченная ширина, не растянутая
3. Все остальное уже работает нормально

Когда сделаешь карту — спросить про следующий шаг (Settings, animations, Service Worker и т.д.)
