/**
 * Narrative-Driven Onboarding System
 * ЭТАЛОННАЯ СИСТЕМА #3 — DialogBubbleInline + OnboardingWrapper
 * 
 * Все шаги manual_next — стабильно работают.
 * highlightElement — рамка вокруг элемента через fixed div.
 * position — где показывать карточку диалога.
 */

export type OnboardingActionType = 
  | 'click_load_board'
  | 'select_load'
  | 'click_truck'
  | 'assign_load'
  | 'click_play'
  | 'open_chat'
  | 'check_hos'
  | 'manual_next';

export interface OnboardingStep {
  id: string;
  title: string;
  speakerName: string;
  avatar: string;
  text: string;
  requiredAction: OnboardingActionType;
  highlightElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  delay?: number;
}

export const onboardingSteps: OnboardingStep[] = [

  // ШАГ 1 — Приветствие (центр, нет highlight)
  {
    id: 'welcome',
    title: '👋 Добро пожаловать!',
    speakerName: 'Диспетчер Майк',
    avatar: '👨‍💼',
    text: 'Привет! Я Майк, твой наставник. Добро пожаловать в Dispatch Office! Ты — диспетчер грузоперевозок США. Готов к первому дню?',
    requiredAction: 'manual_next',
    position: 'center',
    delay: 800,
  },

  // ШАГ 2 — Цель (центр, нет highlight)
  {
    id: 'explain_goal',
    title: '🎯 Твоя задача',
    speakerName: 'Диспетчер Майк',
    avatar: '🎯',
    text: 'Управляй флотом траков и зарабатывай деньги. Находи грузы → договаривайся о ставке → назначай трак → следи за доставкой. Чем больше рейсов — тем больше прибыль!',
    requiredAction: 'manual_next',
    position: 'center',
  },

  // ШАГ 3 — Баланс (снизу от баланса, highlight на balance)
  {
    id: 'explain_balance',
    title: '💰 Баланс и финансы',
    speakerName: 'Диспетчер Майк',
    avatar: '💰',
    text: 'Вот твой баланс — $15,000 стартовый капитал. Каждая доставка приносит деньги, но есть расходы: топливо, ремонт, зарплата водителям. Следи за балансом!',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="balance"]',
    position: 'bottom',
  },

  // ШАГ 4 — Управление временем (highlight на time-controls, manual_next)
  {
    id: 'explain_time',
    title: '⚡ Управление временем',
    speakerName: 'Диспетчер Майк',
    avatar: '⚡',
    text: 'Кнопка ×1/×3/×5/×10 управляет скоростью времени. Ускоряй когда всё идёт по плану. Замедляй когда нужно принять решение или пришло важное сообщение.',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="time-controls"]',
    position: 'bottom',
  },

  // ШАГ 5 — Карточки траков (справа, highlight на truck-card, кликабельна)
  {
    id: 'show_trucks',
    title: '🚛 Карточки траков',
    speakerName: 'Диспетчер Майк',
    avatar: '🚛',
    text: 'Это карточка твоего трака. Показывает водителя, статус, HOS и текущий рейс. Нажми на неё!',
    requiredAction: 'click_truck',
    highlightElement: '[data-onboarding="truck-card"]',
    position: 'right',
  },

  // ШАГ 6 — Load Board: нажми кнопку (highlight, click_load_board)
  {
    id: 'show_load_board',
    title: '📋 Найди груз',
    speakerName: 'Диспетчер Майк',
    avatar: '📋',
    text: 'Нажми кнопку 📦 справа снизу — откроется Load Board с доступными грузами. Попробуй!',
    requiredAction: 'click_load_board',
    highlightElement: '#loadboard-tab-btn',
    position: 'bottom',
  },

  // ШАГ 7 — Load Board объяснение (manual_next, после открытия, сверху)
  {
    id: 'explain_load_board',
    title: '📋 Load Board — доска грузов',
    speakerName: 'Диспетчер Майк',
    avatar: '📦',
    text: 'Вот Load Board. Смотри на ставку, расстояние и Rate Per Mile — чем выше, тем выгоднее. ⚠️ Важно: если грузов нет — нажми кнопку 🔄 Refresh внизу списка. Грузы обновляются вручную!',
    requiredAction: 'manual_next',
    position: 'top',
  },

  // ШАГ 8 — Переговоры (слева, highlight на call-broker)
  {
    id: 'explain_negotiation',
    title: '📞 Переговоры с брокером',
    speakerName: 'Диспетчер Майк',
    avatar: '📞',
    text: 'Нашёл груз? Нажми «Позвонить брокеру». Брокер всегда называет цену ниже рыночной — торгуйся! Хороший диспетчер выбивает на 10-15% больше. Каждый доллар важен.',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="call-broker"]',
    position: 'left',
  },

  // ШАГ 9 — Финал (центр, нет highlight)
  {
    id: 'final_words',
    title: '🚀 Поехали!',
    speakerName: 'Диспетчер Майк',
    avatar: '🚀',
    text: 'Ты готов! Найди груз на Load Board → позвони брокеру → назначь трак → следи за доставкой. Цель смены: заработать $2,500 на каждый трак. Удачи, диспетчер!',
    requiredAction: 'manual_next',
    position: 'center',
  },

  // TODO: Шаг «Уведомления» — нереализован, добавить позже
  // {
  //   id: 'explain_notifications',
  //   title: '🔔 Уведомления',
  //   text: 'Колокольчик — твой главный инструмент...',
  //   highlightElement: '[data-onboarding="notification-bell"]',
  // },

];

export const getStepById = (id: string): OnboardingStep | undefined => {
  return onboardingSteps.find(step => step.id === id);
};

export const isLastStep = (stepId: string): boolean => {
  const index = onboardingSteps.findIndex(step => step.id === stepId);
  return index === onboardingSteps.length - 1;
};
