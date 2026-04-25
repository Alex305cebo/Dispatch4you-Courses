// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING CONFIG — 12 шагов пошагового онбординга (попапы)
// ═══════════════════════════════════════════════════════════════════════════

export interface OnboardingStepConfig {
  id: number;                          // 1–12
  icon: string;                        // эмодзи иконка
  title: string;                       // заголовок попапа
  text: string;                        // текст инструкции
  actionButtonText: string;            // текст кнопки действия
  targetSelector?: string;             // data-onboarding="..." для Spotlight
  popupPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  autoSwitch?: {
    tab?: 'map' | 'loadboard' | 'trucks' | 'chat';
    openModal?: 'truckShop';
    closeTruckShop?: boolean;
    scrollTo?: string;
  };
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  // ─── ШАГ 1: ПРИВЕТСТВИЕ ───────────────────────────────────────────────
  {
    id: 1,
    icon: '👋',
    title: 'Добро пожаловать!',
    text: 'Ты — диспетчер грузоперевозок США. Управляй флотом траков, находи грузы, зарабатывай деньги и расширяй бизнес!',
    actionButtonText: 'Начать',
    popupPosition: 'center',
  },

  // ─── ШАГ 2: ЦЕЛЬ ИГРЫ ────────────────────────────────────────────────
  {
    id: 2,
    icon: '🎯',
    title: 'Цель игры',
    text: 'Ты начинаешь с 1 старого трака. Находи грузы на Load Board → доставляй их → зарабатывай деньги → покупай новые траки в магазине. Больше траков = больше грузов = больше денег. Твоя цель — вырастить флот до 5 траков!',
    actionButtonText: 'Понятно ✓',
    targetSelector: '[data-onboarding="balance"]',
    popupPosition: 'bottom',
  },

  // ─── ШАГ 3: ПЕРВЫЙ ТРАК ──────────────────────────────────────────────
  {
    id: 3,
    icon: '🚛',
    title: 'Твой первый трак',
    text: 'Это карточка твоего трака. Здесь видно: имя водителя, откуда → куда едет, статус (В пути / Свободен), HOS (часы вождения) и стоимость груза. Нажми "Далее" чтобы продолжить.',
    actionButtonText: 'Далее →',
    targetSelector: '[data-onboarding="truck-card"]',
    popupPosition: 'bottom',
  },

  // ─── ШАГ 4: МАГАЗИН ТРАКОВ ────────────────────────────────────────────
  {
    id: 4,
    icon: '🏪',
    title: 'Магазин траков',
    text: 'Здесь ты можешь купить новые и б/у траки для расширения флота. Смотри на цену, состояние и характеристики каждого трака.',
    actionButtonText: 'Понятно ✓',
    targetSelector: '[data-onboarding="truck-shop"]',
    popupPosition: 'left',
    autoSwitch: { openModal: 'truckShop' },
  },

  // ─── ШАГ 5: СТАТУСЫ ТРАКОВ ────────────────────────────────────────────
  {
    id: 5,
    icon: '📊',
    title: 'Статусы траков',
    text: 'Каждый трак имеет статус: Свободен (ждёт груза), К погрузке (едет за грузом), В пути (везёт груз), Погрузка/Разгрузка. Следи за статусами чтобы не терять время!',
    actionButtonText: 'Далее →',
    targetSelector: '[data-onboarding="truck-strip"]',
    popupPosition: 'bottom',
    autoSwitch: { closeTruckShop: true },
  },

  // ─── ШАГ 6: LOAD BOARD ────────────────────────────────────────────────
  {
    id: 6,
    icon: '📋',
    title: 'Load Board',
    text: 'Load Board — доска с доступными грузами. Здесь ты находишь грузы для своих траков. Смотри на ставку, расстояние и направление.',
    actionButtonText: 'Понятно ✓',
    targetSelector: '[data-onboarding="loadboard-tab"]',
    popupPosition: 'left',
    autoSwitch: { tab: 'loadboard' },
  },

  // ─── ШАГ 7: ПЕРЕГОВОРЫ ────────────────────────────────────────────────
  {
    id: 7,
    icon: '📞',
    title: 'Переговоры',
    text: 'Нашёл подходящий груз? Позвони брокеру и договорись о ставке. Торгуйся — хорошая ставка = больше прибыли!',
    actionButtonText: 'Далее →',
    targetSelector: '[data-onboarding="call-broker"]',
    popupPosition: 'left',
  },

  // ─── ШАГ 8: НАЗНАЧЕНИЕ ГРУЗА ──────────────────────────────────────────
  {
    id: 8,
    icon: '📦',
    title: 'Назначение груза',
    text: 'После переговоров назначь груз на свободный трак. Выбирай ближайший трак чтобы сэкономить на deadhead (пустой пробег).',
    actionButtonText: 'Далее →',
    targetSelector: '[data-onboarding="assign-area"]',
    popupPosition: 'left',
  },

  // ─── ШАГ 9: КАРТА ─────────────────────────────────────────────────────
  {
    id: 9,
    icon: '🗺️',
    title: 'Карта',
    text: 'На карте ты видишь все свои траки в реальном времени. Они движутся по настоящим дорогам США. Следи за маршрутами и прогрессом доставок.',
    actionButtonText: 'Понятно ✓',
    targetSelector: '[data-onboarding="map"]',
    popupPosition: 'right',
    autoSwitch: { tab: 'map' },
  },

  // ─── ШАГ 10: ВРЕМЯ И СКОРОСТЬ ─────────────────────────────────────────
  {
    id: 10,
    icon: '⏰',
    title: 'Время и скорость',
    text: 'Время в игре идёт быстро. Ты можешь ускорить его (×1, ×2, ×5, ×10) или поставить на паузу. Водители пишут, брокеры предлагают грузы, случаются проблемы — будь готов!',
    actionButtonText: 'Понятно ✓',
    targetSelector: '[data-onboarding="time-controls"]',
    popupPosition: 'bottom',
  },

  // ─── ШАГ 11: УВЕДОМЛЕНИЯ ──────────────────────────────────────────────
  {
    id: 11,
    icon: '🔔',
    title: 'Уведомления',
    text: 'Колокольчик показывает входящие события: звонки водителей, письма брокеров, поломки, задержки. Не пропускай важные уведомления!',
    actionButtonText: 'Понятно ✓',
    targetSelector: '[data-onboarding="notification-bell"]',
    popupPosition: 'left',
  },

  // ─── ШАГ 12: ПОЕХАЛИ! ─────────────────────────────────────────────────
  {
    id: 12,
    icon: '🚀',
    title: 'Поехали!',
    text: 'Теперь ты знаешь основы! Управляй флотом, зарабатывай деньги, решай проблемы. Твоя первая цель — заработать на второй трак. Удачи!',
    actionButtonText: 'Начать игру 🚀',
    popupPosition: 'center',
  },
];

// ═══ РАСЧЁТ ПОЗИЦИИ ПОПАПА ═══

const VIEWPORT_PADDING = 12;

/**
 * Рассчитывает позицию попапа относительно целевого элемента.
 *
 * Логика:
 * 1. targetRect === null → центр экрана
 * 2. viewport.width < 900 (мобильный):
 *    - Цель в верхней половине → попап внизу по центру
 *    - Цель в нижней половине → попап вверху по центру
 * 3. viewport.width >= 900 (десктоп):
 *    - Позиционировать рядом с целевым элементом по preferredPosition
 * 4. Коррекция границ: попап не выходит за viewport (отступ 12px)
 */
export function calcPopupPosition(
  targetRect: DOMRect | null,
  popupSize: { width: number; height: number },
  viewport: { width: number; height: number },
  preferredPosition: 'center' | 'top' | 'bottom' | 'left' | 'right',
): { top: number; left: number } {
  let top: number;
  let left: number;

  // 1. Нет целевого элемента → центр экрана
  if (!targetRect) {
    top = (viewport.height - popupSize.height) / 2;
    left = (viewport.width - popupSize.width) / 2;
    return clampToViewport(top, left, popupSize, viewport);
  }

  // 2. Мобильный layout (< 900px)
  if (viewport.width < 900) {
    const targetCenterY = targetRect.top + targetRect.height / 2;
    left = (viewport.width - popupSize.width) / 2;

    if (targetCenterY < viewport.height / 2) {
      // Цель вверху → попап внизу
      top = viewport.height - popupSize.height - VIEWPORT_PADDING;
    } else {
      // Цель внизу → попап вверху
      top = VIEWPORT_PADDING;
    }

    return clampToViewport(top, left, popupSize, viewport);
  }

  // 3. Десктоп — позиционирование по preferredPosition
  switch (preferredPosition) {
    case 'top':
      top = targetRect.top - popupSize.height - VIEWPORT_PADDING;
      left = targetRect.left + (targetRect.width - popupSize.width) / 2;
      break;

    case 'bottom':
      top = targetRect.bottom + VIEWPORT_PADDING;
      left = targetRect.left + (targetRect.width - popupSize.width) / 2;
      // Если попап уходит влево за экран — выравниваем по левому краю элемента
      if (left < VIEWPORT_PADDING) {
        left = targetRect.left;
      }
      // Если попап уходит вправо — выравниваем по правому краю элемента
      if (left + popupSize.width > viewport.width - VIEWPORT_PADDING) {
        left = targetRect.right - popupSize.width;
      }
      break;

    case 'left':
      top = targetRect.top + (targetRect.height - popupSize.height) / 2;
      left = targetRect.left - popupSize.width - VIEWPORT_PADDING;
      // Если не влезает слева — ставим справа
      if (left < VIEWPORT_PADDING) {
        left = targetRect.right + VIEWPORT_PADDING;
      }
      break;

    case 'right':
      top = targetRect.top + (targetRect.height - popupSize.height) / 2;
      left = targetRect.right + VIEWPORT_PADDING;
      // Если не влезает справа — ставим слева
      if (left + popupSize.width > viewport.width - VIEWPORT_PADDING) {
        left = targetRect.left - popupSize.width - VIEWPORT_PADDING;
      }
      break;

    case 'center':
    default:
      top = (viewport.height - popupSize.height) / 2;
      left = (viewport.width - popupSize.width) / 2;
      break;
  }

  return clampToViewport(top, left, popupSize, viewport);
}

/** Коррекция границ — попап остаётся внутри viewport с отступом 12px */
function clampToViewport(
  top: number,
  left: number,
  popupSize: { width: number; height: number },
  viewport: { width: number; height: number },
): { top: number; left: number } {
  // Минимум
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

  // Максимум
  const maxTop = viewport.height - popupSize.height - VIEWPORT_PADDING;
  const maxLeft = viewport.width - popupSize.width - VIEWPORT_PADDING;

  if (top > maxTop) top = maxTop;
  if (left > maxLeft) left = maxLeft;

  // Финальная защита — если попап больше viewport, прижать к padding
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

  return { top, left };
}
