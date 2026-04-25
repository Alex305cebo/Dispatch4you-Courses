# План реализации: Game Onboarding Popups

## Обзор

Замена чат-системы онбординга на 12 пошаговых блокирующих попапов в glassmorphism-стиле. Реализация включает Zustand-стор, конфигурацию шагов, три новых компонента (OnboardingOverlay, OnboardingPopup, OnboardingActionButton), интеграцию в game.tsx и добавление `data-onboarding` атрибутов в существующие компоненты.

## Задачи

- [x] 1. Создать Zustand-стор онбординга и конфигурацию шагов
  - [x] 1.1 Создать `adventure/store/onboardingStore.ts` — Zustand-стор
    - Определить интерфейс `OnboardingState` с полями: `step`, `isActive`, `popupVisible`, `isCompleted`, `reappearTimerId`
    - Реализовать действия: `init()`, `nextStep()`, `hidePopup()`, `showPopup()`, `skip()`, `complete()`, `checkCompleted(nickname)`
    - `nextStep()` должен очищать `reappearTimerId` при переходе, устанавливать `popupVisible=true`
    - `hidePopup()` устанавливает `popupVisible=false`, запускает `setTimeout` на 3 секунды для `showPopup()`
    - `skip()` и `complete()` сохраняют `onboarding-complete-{nickname}` в localStorage (совместимость со старым ключом)
    - `nextStep()` при `step=12` вызывает `complete()`
    - Guard в `nextStep()` для защиты от двойных кликов
    - `try/catch` для всех обращений к localStorage
    - _Требования: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.1, 8.2, 8.3, 8.4, 10.4_

  - [ ]* 1.2 Написать property-тест: переход шага с очисткой таймера
    - **Property 1: Переход шага с очисткой таймера**
    - Генерация случайного step ∈ [1..11] и случайного reappearTimerId → `nextStep()` → проверка step+1, popupVisible=true, reappearTimerId=null
    - **Validates: Требования 1.2, 8.4**

  - [ ]* 1.3 Написать property-тест: скрытие попапа сохраняет активное состояние
    - **Property 2: Скрытие попапа сохраняет активное состояние**
    - Генерация случайного step ∈ [1..12] → `hidePopup()` → проверка popupVisible=false, isActive=true, step не изменился
    - **Validates: Требования 1.3, 3.5, 8.3**

  - [ ]* 1.4 Написать property-тест: пропуск завершает онбординг из любого шага
    - **Property 3: Пропуск завершает онбординг из любого шага**
    - Генерация случайного step ∈ [1..12] → `skip()` → проверка isCompleted=true, isActive=false
    - **Validates: Требования 1.5**

  - [x] 1.5 Создать `adventure/data/onboardingConfig.ts` — конфигурация 12 шагов
    - Определить интерфейс `OnboardingStepConfig` с полями: `id`, `icon`, `title`, `text`, `actionButtonText`, `targetSelector`, `popupPosition`, `autoSwitch`
    - Заполнить массив `ONBOARDING_STEPS` из 12 шагов согласно таблице в дизайн-документе
    - Шаг 2: текст о полном игровом цикле (1 трак → грузы → деньги → 5 траков)
    - Шаг 4: `autoSwitch.openModal = 'truckShop'`
    - Шаг 5: `autoSwitch.closeTruckShop = true`
    - Шаг 6: `autoSwitch.tab = 'loadboard'`
    - Шаг 9: `autoSwitch.tab = 'map'`
    - Реализовать функцию `calcPopupPosition(targetRect, popupSize, viewport, preferredPosition)` с логикой: центр для null target, мобильная позиция (width < 900), десктопная позиция, коррекция границ viewport с отступом 12px
    - _Требования: 6.1, 6.2, 6.3, 6.4, 2.3, 2.4, 9.1, 9.2, 9.3_

  - [ ]* 1.6 Написать property-тест: полнота конфигурации шагов
    - **Property 4: Полнота конфигурации шагов**
    - Для каждого элемента ONBOARDING_STEPS → проверка наличия непустых полей: id (1–12), icon, title, text, actionButtonText, popupPosition
    - **Validates: Требования 6.1, 6.2**

  - [ ]* 1.7 Написать property-тест: попап остаётся в пределах viewport
    - **Property 5: Попап остаётся в пределах viewport**
    - Генерация случайных DOMRect и viewport → `calcPopupPosition()` → проверка что попап полностью внутри viewport
    - **Validates: Требования 2.3, 2.4, 9.1, 9.2, 9.5**

- [x] 2. Checkpoint — Убедиться что стор и конфигурация работают корректно
  - Убедиться что все тесты проходят, задать вопросы пользователю если возникнут.

- [x] 3. Создать компоненты онбординга
  - [x] 3.1 Создать `adventure/components/OnboardingPopup.tsx`
    - Glassmorphism-карточка: полупрозрачный фон, `backdrop-filter: blur`, светящаяся рамка `rgba(6,182,212,...)`
    - Содержимое: иконка + заголовок, текст инструкции, Step_Indicator "N/12", кнопка "Пропустить"
    - Анимация появления (scale + opacity, 200–300мс) и исчезновения (150–200мс)
    - Минимальный шрифт 13px для текста, 12px для подписей, цвет не темнее `#94a3b8`
    - Props: `step`, `currentStep`, `totalSteps`, `onSkip`, `visible`, `position`
    - _Требования: 2.1, 2.2, 2.5, 11.1, 11.2, 11.4_

  - [x] 3.2 Создать `adventure/components/OnboardingActionButton.tsx`
    - Яркая пульсирующая кнопка с фоном `#06b6d4`, крупный шрифт
    - Позиционирование рядом с целевым элементом (через `targetRect`)
    - Для шагов без target (1, 12) — рендер внутри попапа по центру (`targetRect === null`)
    - Остаётся видимой когда попап скрыт
    - Анимация пульсации для привлечения внимания
    - Props: `text`, `onClick`, `targetRect`, `visible`
    - _Требования: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.5_

  - [x] 3.3 Создать `adventure/components/OnboardingOverlay.tsx`
    - Полноэкранный затемняющий слой `rgba(0,0,0,0.6)` с вырезом (spotlight cutout) через CSS `clip-path` или SVG mask
    - Клик по оверлею вызывает `hidePopup()` (скрытие попапа, НЕ продвижение шага)
    - Spotlight_Highlight: пульсирующая рамка и свечение вокруг целевого элемента
    - `useEffect` cleanup для `clearTimeout(reappearTimerId)` при размонтировании
    - Координирует рендер OnboardingPopup и OnboardingActionButton
    - Читает текущий шаг из `onboardingConfig`, находит целевой элемент через `querySelector('[data-onboarding="..."]')`
    - Fallback: если элемент не найден — попап по центру, spotlight не отображается
    - Props: `targetRect`, `onOverlayClick`, `visible`
    - _Требования: 4.1, 4.2, 4.3, 4.4, 2.6, 8.1, 8.2, 8.3, 11.3_

  - [ ]* 3.4 Написать property-тест: отрендеренный контент соответствует конфигурации
    - **Property 6: Отрендеренный контент соответствует конфигурации**
    - Генерация случайных OnboardingStepConfig → рендер OnboardingPopup → проверка наличия icon, title, text в output
    - **Validates: Требования 2.2, 3.3**

- [x] 4. Checkpoint — Убедиться что компоненты рендерятся корректно
  - Убедиться что все тесты проходят, задать вопросы пользователю если возникнут.

- [x] 5. Интеграция в game.tsx и добавление data-onboarding атрибутов
  - [ ] 5.1 Добавить `data-onboarding` атрибуты в существующие компоненты
    - `data-onboarding="balance"` — элемент баланса в TopBar (game.tsx)
    - `data-onboarding="truck-strip"` — компонент TruckStripComponent
    - `data-onboarding="truck-shop"` — TruckShopModal
    - `data-onboarding="loadboard-tab"` — вкладка Load Board в панели вкладок
    - `data-onboarding="call-broker"` — кнопка "Позвонить брокеру" в LoadBoardPanel
    - `data-onboarding="assign-area"` — область назначения груза в AssignModal или LoadBoardPanel
    - `data-onboarding="map"` — компонент GoogleMapView
    - `data-onboarding="time-controls"` — контролы скорости времени в TopBar
    - `data-onboarding="notification-bell"` — компонент NotificationBell
    - _Требования: 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 5.2 Интегрировать онбординг в `adventure/app/game.tsx`
    - Импортировать `useOnboardingStore` из `store/onboardingStore`
    - При монтировании: `checkCompleted(nickname)` → если нет, `init()`
    - Пока `isActive`: `setTimeSpeed(0)` (пауза игрового времени)
    - При `complete` / `skip`: восстановление `setTimeSpeed(1)`
    - Выполнение `autoSwitch` при смене шага: `switchTab()`, `setTruckShopOpen(true/false)`
    - Рендер `<OnboardingOverlay>` поверх всего контента когда `isActive`
    - Удалить `require('../data/onboardingSteps')` и связанную логику `isOnboardingComplete`
    - Auto_Switch выполняется ДО появления попапа
    - _Требования: 7.1, 7.2, 7.3, 7.4, 5.6, 10.1, 10.2_

  - [ ] 5.3 Сохранить существующие GuideSpotlight и GuideBubble
    - Убедиться что компоненты GuideSpotlight и GuideBubble остаются в game.tsx для контекстных подсказок во время игры
    - Не удалять guideStore и связанные импорты
    - _Требования: 10.3_

- [ ] 6. Адаптивность и финальная полировка
  - [ ] 6.1 Обеспечить адаптивность для мобильных устройств
    - При ширине < 900px: попап по центру нижней/верхней части экрана в зависимости от позиции целевого элемента
    - При ширине >= 900px: попап рядом с целевым элементом
    - Action_Button адаптирует позицию, не выходя за границы экрана
    - Корректное отображение при смене ориентации без потери шага
    - _Требования: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7. Финальный checkpoint — Убедиться что всё работает
  - Убедиться что все тесты проходят, задать вопросы пользователю если возникнут.

## Примечания

- Задачи с `*` — опциональные (property-тесты), можно пропустить для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассировки
- Checkpoints обеспечивают инкрементальную валидацию
- Property-тесты используют библиотеку `fast-check` (TypeScript)
- Ключ localStorage `onboarding-complete-{nickname}` совместим со старой системой
