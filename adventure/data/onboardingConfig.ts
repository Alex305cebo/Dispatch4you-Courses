// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING CONFIG — 12 шагов пошагового онбординга (попапы)
// ═══════════════════════════════════════════════════════════════════════════

export type OnboardingCharacter = 'Owner' | 'Driver' | 'Broker' | 'Accountant';

export interface OnboardingStepConfig {
  id: number;                          // 1–12
  icon: string;                        // эмодзи иконка
  title: string;                       // заголовок попапа
  text: string;                        // текст инструкции (прямая речь персонажа)
  actionButtonText: string;            // текст кнопки действия
  targetSelector?: string;             // data-onboarding="..." для Spotlight
  popupPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  character: OnboardingCharacter;      // роль персонажа
  characterName: string;               // имя персонажа
  autoSwitch?: {
    tab?: 'map' | 'loadboard' | 'trucks' | 'chat';
    openModal?: 'truckShop';
    closeTruckShop?: boolean;
    scrollTo?: string;
  };
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  // ─── ШАГ 1: ПРИВЕТСТВИЕ (Стив — Владелец) ────────────────────────────
  {
    id: 1,
    icon: '👋',
    title: 'Добро пожаловать в команду!',
    text: 'Привет! Я Стив, владелец этой компании. Я вложил всё что имел в этот бизнес. Теперь ты мой диспетчер — от тебя зависит всё. Найдёшь грузы, заработаем. Нет — пойдём ко дну. Готов?',
    actionButtonText: 'Готов, Стив!',
    popupPosition: 'center',
    character: 'Owner',
    characterName: 'Стив',
  },

  // ─── ШАГ 2: ЦЕЛЬ БИЗНЕСА (Стив — Владелец) ──────────────────────────
  {
    id: 2,
    icon: '🎯',
    title: 'Вот как работает наш бизнес',
    text: 'Слушай внимательно. Один трак — это $2,500 в день минимум. Пять траков — это уже $12,500. Твоя задача: найти груз → договориться о ставке → доставить → получить деньги. Начинаем с одного старого трака. Заработаем — купим второй. Понял схему?',
    actionButtonText: 'Понял, поехали!',
    targetSelector: '[data-onboarding="balance"]',
    popupPosition: 'bottom',
    character: 'Owner',
    characterName: 'Стив',
  },

  // ─── ШАГ 3: ПЕРВЫЙ ТРАК (Майк — Водитель) ────────────────────────────
  {
    id: 3,
    icon: '🚛',
    title: 'Это я, твой водитель',
    text: 'Привет, я Майк. Сижу в кабине и жду пока ты найдёшь мне груз. Видишь мою карточку? Там всё что тебе нужно знать: куда еду, сколько часов могу ещё ехать (HOS) и сколько стоит мой груз. Не дай мне простаивать — простой = потеря денег.',
    actionButtonText: 'Понял, Майк!',
    targetSelector: '[data-onboarding="truck-card"]',
    popupPosition: 'bottom',
    character: 'Driver',
    characterName: 'Майк',
  },

  // ─── ШАГ 4: МАГАЗИН ТРАКОВ (Стив — Владелец) ─────────────────────────
  {
    id: 4,
    icon: '🏪',
    title: 'Здесь растёт наш флот',
    text: 'Это магазин траков. Как только накопим достаточно — покупаем здесь новый трак. Смотри на состояние и цену. Б/у дешевле, но ломается чаще. Новый надёжнее, но дорого. Я доверяю твоему выбору.',
    actionButtonText: 'Ясно, Стив!',
    targetSelector: '[data-onboarding="truck-shop"]',
    popupPosition: 'left',
    character: 'Owner',
    characterName: 'Стив',
    autoSwitch: { openModal: 'truckShop' },
  },

  // ─── ШАГ 5: СТАТУСЫ ТРАКОВ (Майк — Водитель) ─────────────────────────
  {
    id: 5,
    icon: '📊',
    title: 'Следи за нашим статусом',
    text: 'Мы, водители, всегда в одном из статусов: Свободен (жду груза), К погрузке (еду за грузом), В пути (везу груз), Погрузка или Разгрузка. Если я "Свободен" слишком долго — это плохо. Найди мне работу!',
    actionButtonText: 'Слежу, Майк!',
    targetSelector: '[data-onboarding="truck-strip"]',
    popupPosition: 'bottom',
    character: 'Driver',
    characterName: 'Майк',
    autoSwitch: { closeTruckShop: true },
  },

  // ─── ШАГ 6: LOAD BOARD (Лео — Брокер) ───────────────────────────────
  {
    id: 6,
    icon: '📋',
    title: 'Добро пожаловать на Load Board',
    text: 'Привет, я Лео — брокер. Я соединяю грузы с траками. Здесь на Load Board я публикую доступные грузы. Смотри на ставку, расстояние и направление. Хороший диспетчер выбирает груз который везёт трак туда где много других грузов.',
    actionButtonText: 'Понял, Лео!',
    targetSelector: '[data-onboarding="loadboard-tab"]',
    popupPosition: 'left',
    character: 'Broker',
    characterName: 'Лео',
    autoSwitch: { tab: 'loadboard' },
  },

  // ─── ШАГ 7: ПЕРЕГОВОРЫ (Лео — Брокер) ───────────────────────────────
  {
    id: 7,
    icon: '📞',
    title: 'Позвони мне, поторгуемся',
    text: 'Нашёл подходящий груз? Жми "Позвонить" и торгуйся со мной. Я всегда называю цену ниже чем готов заплатить. Хороший диспетчер выбивает на 10–15% больше. Не стесняйся — это бизнес.',
    actionButtonText: 'Буду торговаться!',
    targetSelector: '[data-onboarding="call-broker"]',
    popupPosition: 'left',
    character: 'Broker',
    characterName: 'Лео',
  },

  // ─── ШАГ 8: НАЗНАЧЕНИЕ ГРУЗА (Сара — Бухгалтер) ─────────────────────
  {
    id: 8,
    icon: '📦',
    title: 'Считай деньги заранее',
    text: 'Привет, я Сара, бухгалтер. Прежде чем назначить груз — посчитай: ставка минус топливо минус пустой пробег (deadhead). Выбирай ближайший свободный трак. Каждая лишняя миля без груза — это наш убыток.',
    actionButtonText: 'Считаю, Сара!',
    targetSelector: '[data-onboarding="assign-area"]',
    popupPosition: 'left',
    character: 'Accountant',
    characterName: 'Сара',
  },

  // ─── ШАГ 9: КАРТА (Майк — Водитель) ─────────────────────────────────
  {
    id: 9,
    icon: '🗺️',
    title: 'Я на карте — следи за мной',
    text: 'Видишь точку на карте? Это я еду по настоящим дорогам США. Ты можешь нажать на меня и следить за маршрутом. Если я застрял или опаздываю — ты увидишь это здесь первым.',
    actionButtonText: 'Слежу, Майк!',
    targetSelector: '[data-onboarding="map"]',
    popupPosition: 'right',
    character: 'Driver',
    characterName: 'Майк',
    autoSwitch: { tab: 'map' },
  },

  // ─── ШАГ 10: ВРЕМЯ (Стив — Владелец) ────────────────────────────────
  {
    id: 10,
    icon: '⏰',
    title: 'Время — это деньги',
    text: 'Буквально. Ускоряй время когда всё идёт по плану (×5 или ×10). Замедляй когда нужно принять решение. Водители пишут, брокеры предлагают грузы, случаются поломки. Пропустишь важное сообщение — потеряешь деньги.',
    actionButtonText: 'Понял, Стив!',
    targetSelector: '[data-onboarding="time-controls"]',
    popupPosition: 'bottom',
    character: 'Owner',
    characterName: 'Стив',
  },

  // ─── ШАГ 11: УВЕДОМЛЕНИЯ (Сара — Бухгалтер) ─────────────────────────
  {
    id: 11,
    icon: '🔔',
    title: 'Не пропусти ни цента',
    text: 'Я слежу за каждым уведомлением. Звонок водителя — может быть поломка. Письмо от брокера — новый груз или detention claim. Каждое пропущенное уведомление может стоить нам денег. Проверяй колокольчик регулярно.',
    actionButtonText: 'Слежу, Сара!',
    targetSelector: '[data-onboarding="notification-bell"]',
    popupPosition: 'left',
    character: 'Accountant',
    characterName: 'Сара',
  },

  // ─── ШАГ 12: ПОЕХАЛИ (Стив — Владелец) ──────────────────────────────
  {
    id: 12,
    icon: '🚀',
    title: 'Теперь всё в твоих руках',
    text: 'Отлично. Ты знаешь всё что нужно. Майк ждёт груза. Лео готов торговаться. Сара считает каждый доллар. А я верю что ты вытащишь этот бизнес. Первая цель — заработать на второй трак. Не подведи нас.',
    actionButtonText: 'Не подведу! 🚀',
    popupPosition: 'center',
    character: 'Owner',
    characterName: 'Стив',
  },
];

// ═══ АВАТАРЫ ПЕРСОНАЖЕЙ ═══

export const CHARACTER_AVATARS: Record<string, { emoji: string; color: string }> = {
  'Стив':  { emoji: '👨‍💼', color: '#f59e0b' },  // Владелец — золотой
  'Майк':  { emoji: '👨‍✈️', color: '#38bdf8' },  // Водитель — голубой
  'Лео':   { emoji: '🤝', color: '#a78bfa' },    // Брокер — фиолетовый
  'Сара':  { emoji: '👩‍💻', color: '#34d399' },  // Бухгалтер — зелёный
};

export const CHARACTER_ROLE_LABEL: Record<OnboardingCharacter, string> = {
  Owner:      'Владелец',
  Driver:     'Водитель',
  Broker:     'Брокер',
  Accountant: 'Бухгалтер',
};

// ═══ РАСЧЁТ ПОЗИЦИИ ПОПАПА ═══

const VIEWPORT_PADDING = 12;

/**
 * Рассчитывает позицию попапа относительно целевого элемента.
 */
export function calcPopupPosition(
  targetRect: DOMRect | null,
  popupSize: { width: number; height: number },
  viewport: { width: number; height: number },
  preferredPosition: 'center' | 'top' | 'bottom' | 'left' | 'right',
): { top: number; left: number } {
  let top: number;
  let left: number;

  if (!targetRect) {
    top = (viewport.height - popupSize.height) / 2;
    left = (viewport.width - popupSize.width) / 2;
    return clampToViewport(top, left, popupSize, viewport);
  }

  if (viewport.width < 900) {
    const targetCenterY = targetRect.top + targetRect.height / 2;
    left = (viewport.width - popupSize.width) / 2;
    if (targetCenterY < viewport.height / 2) {
      top = viewport.height - popupSize.height - VIEWPORT_PADDING;
    } else {
      top = VIEWPORT_PADDING;
    }
    return clampToViewport(top, left, popupSize, viewport);
  }

  switch (preferredPosition) {
    case 'top':
      top = targetRect.top - popupSize.height - VIEWPORT_PADDING;
      left = targetRect.left + (targetRect.width - popupSize.width) / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + VIEWPORT_PADDING;
      left = targetRect.left + (targetRect.width - popupSize.width) / 2;
      if (left < VIEWPORT_PADDING) left = targetRect.left;
      if (left + popupSize.width > viewport.width - VIEWPORT_PADDING) left = targetRect.right - popupSize.width;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height - popupSize.height) / 2;
      left = targetRect.left - popupSize.width - VIEWPORT_PADDING;
      if (left < VIEWPORT_PADDING) left = targetRect.right + VIEWPORT_PADDING;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height - popupSize.height) / 2;
      left = targetRect.right + VIEWPORT_PADDING;
      if (left + popupSize.width > viewport.width - VIEWPORT_PADDING) left = targetRect.left - popupSize.width - VIEWPORT_PADDING;
      break;
    case 'center':
    default:
      top = (viewport.height - popupSize.height) / 2;
      left = (viewport.width - popupSize.width) / 2;
      break;
  }

  return clampToViewport(top, left, popupSize, viewport);
}

function clampToViewport(
  top: number,
  left: number,
  popupSize: { width: number; height: number },
  viewport: { width: number; height: number },
): { top: number; left: number } {
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
  const maxTop = viewport.height - popupSize.height - VIEWPORT_PADDING;
  const maxLeft = viewport.width - popupSize.width - VIEWPORT_PADDING;
  if (top > maxTop) top = maxTop;
  if (left > maxLeft) left = maxLeft;
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
  return { top, left };
}
