---
inclusion: auto
priority: high
---

# UI UX Pro Max — Design Intelligence System

Этот навык предоставляет профессиональные рекомендации по дизайну для всех страниц проекта DispatcherTraining.

## Основные возможности

### 67 UI Стилей
Glassmorphism, Claymorphism, Minimalism, Brutalism, Neumorphism, Bento Grid, Dark Mode, AI-Native UI и другие.

### 161 Цветовая палитра
Специализированные палитры под каждую индустрию, включая:
- **Tech & SaaS** — современные градиенты, синие тона
- **Finance/Fintech** — доверие и безопасность (синий, зелёный)
- **Healthcare** — спокойствие и чистота (светло-голубой, белый)
- **Transportation & Logistics** — энергичность и надёжность (оранжевый, синий)

### 57 шрифтовых пар
Подобранные комбинации с прямыми ссылками на Google Fonts.

### 25 типов графиков
Для дашбордов и аналитики.

### 99 UX-правил
Best practices, anti-patterns, accessibility стандарты.

### 161 Reasoning Rules (NEW v2.0)
Автоматическая генерация полной дизайн-системы на основе типа продукта:
- Рекомендованный паттерн
- Стиль UI
- Цветовая палитра
- Типографика
- Эффекты и анимации
- Anti-patterns (что НЕ использовать)
- Pre-delivery чеклист

## Для проекта DispatcherTraining

### Тип продукта
**Transportation Management System / Dispatcher Training Platform**

### Рекомендации

#### UI Стиль
**Soft UI Evolution** + **Bento Grid** для дашбордов
- Мягкие тени
- Плавные переходы (200-300ms)
- Карточная структура
- Отличная читаемость

#### Цветовая схема
- **Primary**: `#06b6d4` (Cyan — доверие, технологичность)
- **Secondary**: `#0ea5e9` (Sky Blue — надёжность)
- **Accent/CTA**: `#f59e0b` (Amber — внимание, действие)
- **Background**: `#0f172a` (Slate 900 — dark mode)
- **Text Primary**: `#e2e8f0` (Slate 200 — читаемость)
- **Text Secondary**: `#94a3b8` (Slate 400 — вспомогательный текст)

#### Типографика
**Inter / Work Sans**
- Mood: Professional, modern, clear
- Best for: Dashboards, SaaS, tech platforms
- Google Fonts: `https://fonts.google.com/share?selection.family=Inter:wght@400;500;600;700|Work+Sans:wght@400;500;600`

#### Ключевые эффекты
- Soft shadows: `box-shadow: 0 2px 8px rgba(6,182,212,0.15)`
- Smooth transitions: `transition: all 0.2s ease`
- Hover states: легкое изменение цвета и shadow
- Focus states: видимая рамка для keyboard navigation

#### Anti-patterns для проекта
❌ Bright neon colors (мешают концентрации)
❌ Harsh animations (отвлекают от работы)
❌ Мелкий текст < 13px (плохая читаемость)
❌ Низкий контраст текста (нарушает WCAG)
❌ Emoji как иконки (использовать SVG: Heroicons/Lucide)

#### Pre-delivery Checklist
- [ ] Весь текст светлый (#e2e8f0 или #fff) на тёмном фоне
- [ ] Минимальный размер текста: 13px для контента, 12px для лейблов
- [ ] `cursor-pointer` на всех кликабельных элементах
- [ ] Hover states с плавными переходами (150-300ms)
- [ ] Контраст текста минимум 4.5:1 (WCAG AA)
- [ ] Focus states видимы для keyboard navigation
- [ ] `prefers-reduced-motion` учтён
- [ ] Responsive: 375px, 768px, 1024px, 1440px

## Правило текста (ЗАКОН для DispatcherTraining)

**Из dispatch-office-game-rules.md:**

- Основной текст: `#fff` или `#e2e8f0` — никогда не серый
- Вспомогательный текст: минимум `#94a3b8` — не темнее
- Минимальный размер шрифта: 13px — не мельче
- Лейблы и подписи: минимум 12px, цвет `#94a3b8`
- **Запрещено**: `#64748b`, `#475569` для читаемого текста
- **Запрещено**: `fontSize: 9` или `fontSize: 10` для контентного текста
- Тёмный фон = светлый текст, **всегда**

## Технические стеки

Проект использует:
- **HTML + Tailwind CSS** (основной)
- **Vanilla JavaScript** (интерактив)
- **CSS Custom Properties** (цветовая схема)

## Когда применять

Автоматически активируется при:
- Создании новых страниц
- Дизайне компонентов
- Работе над UI/UX
- Вопросах о стилях, цветах, типографике

## Интеграция с Magic MCP

Magic MCP (21st.dev) дополняет эту систему:
- **UI UX Pro Max** — рекомендации и правила (этот файл)
- **Magic MCP** — генерация компонентов с анимациями и glassmorphism эффектами

Используй оба вместе для достижения профессионального результата.

## Ссылки

- Репозиторий: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Документация: https://uupm.cc
- 161 Reasoning Rules: автоматическая генерация дизайн-систем
