/**
 * Narrative-Driven Onboarding System
 * Конфигурация шагов обучения для новых игроков
 * 
 * ЭТАЛОННАЯ СИСТЕМА #3 — DialogBubbleInline + OnboardingWrapper
 */

export type OnboardingActionType = 
  | 'click_load_board'
  | 'select_load'
  | 'click_truck'
  | 'assign_load'
  | 'click_play'
  | 'open_chat'
  | 'check_hos'
  | 'manual_next'; // Ручной переход по кнопке Next

export interface OnboardingStep {
  id: string;
  title: string;          // Заголовок шага — что это и для чего
  speakerName: string;
  avatar: string;
  text: string;
  requiredAction: OnboardingActionType;
  highlightElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  delay?: number;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '👋 Добро пожаловать!',
    speakerName: 'Диспетчер Майк',
    avatar: '👨‍💼',
    text: 'Привет! Я Майк, твой наставник. Добро пожаловать в Dispatch Office! Сегодня ты начинаешь свою карьеру диспетчера грузоперевозок. Готов к первому дню?',
    requiredAction: 'manual_next',
    position: 'center',
    delay: 800,
  },
  {
    id: 'explain_goal',
    title: '🎯 Твоя задача',
    speakerName: 'Диспетчер Майк',
    avatar: '🎯',
    text: 'Твоя задача — управлять флотом траков и зарабатывать деньги. Каждый трак должен везти груз, а ты следишь за всем процессом: от поиска грузов до доставки.',
    requiredAction: 'manual_next',
    position: 'center',
  },
  {
    id: 'explain_balance',
    title: '💰 Баланс и финансы',
    speakerName: 'Диспетчер Майк',
    avatar: '💰',
    text: 'Видишь баланс вверху? Каждая доставка приносит деньги, но есть и расходы: топливо, ремонт, зарплата водителям. Цель — заработать как можно больше!',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="balance"]',
    position: 'bottom',
  },
  {
    id: 'show_trucks',
    title: '🚛 Карточки траков',
    speakerName: 'Диспетчер Майк',
    avatar: '🚛',
    text: 'Вот твои траки слева вверху. Каждая карточка показывает водителя, статус, HOS и текущий груз. Следи за ними — простой трака = потеря денег!',
    requiredAction: 'manual_next',
    position: 'left',
  },
  {
    id: 'show_load_board',
    title: '📋 Load Board — доска грузов',
    speakerName: 'Диспетчер Майк',
    avatar: '📋',
    text: 'Теперь найдём груз. Нажми на вкладку «Грузы» внизу экрана — это Load Board. Здесь брокеры публикуют доступные рейсы.',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="loadboard-tab"]',
    position: 'top',
  },
  {
    id: 'select_first_load',
    title: '📦 Выбор груза',
    speakerName: 'Диспетчер Майк',
    avatar: '📦',
    text: 'В списке грузов нажми на любой — раскроются детали: маршрут, ставка, брокер. Обрати внимание на Rate Per Mile — чем выше, тем лучше!',
    requiredAction: 'manual_next',
    position: 'center',
  },
  {
    id: 'explain_negotiation',
    title: '📞 Переговоры с брокером',
    speakerName: 'Диспетчер Майк',
    avatar: '📞',
    text: 'Нашёл подходящий груз? Нажми «Позвонить брокеру» и начни переговоры. Брокер всегда называет цену ниже — торгуйся! Хороший диспетчер выбивает на 10-15% больше.',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="call-broker"]',
    position: 'left',
  },
  {
    id: 'explain_time_control',
    title: '⚡ Управление временем',
    speakerName: 'Диспетчер Майк',
    avatar: '⚡',
    text: 'Видишь кнопки скорости вверху? ×1 — реальное время, ×5 или ×10 — ускоренное. Ускоряй когда всё идёт по плану, замедляй когда нужно принять решение.',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="time-controls"]',
    position: 'bottom',
  },
  {
    id: 'explain_hos',
    title: '⏰ HOS — часы вождения',
    speakerName: 'Диспетчер Майк',
    avatar: '⏰',
    text: 'Важно! Водители не могут ездить бесконечно. HOS (Hours of Service) — максимум 11 часов вождения. Следи за этим на карточках траков, иначе штрафы!',
    requiredAction: 'manual_next',
    position: 'center',
  },
  {
    id: 'explain_notifications',
    title: '🔔 Уведомления',
    speakerName: 'Диспетчер Майк',
    avatar: '🔔',
    text: 'Колокольчик — твой лучший друг. Звонки водителей, письма от брокеров, поломки, detention — всё приходит сюда. Не пропускай уведомления!',
    requiredAction: 'manual_next',
    highlightElement: '[data-onboarding="notification-bell"]',
    position: 'left',
  },
  {
    id: 'final_words',
    title: '🚀 Поехали!',
    speakerName: 'Диспетчер Майк',
    avatar: '🚀',
    text: 'Вот и всё! Найди груз, договорись о ставке, назначь трак и следи за доставкой. Остальное придёт с опытом. Удачи на дорогах, диспетчер!',
    requiredAction: 'manual_next',
    position: 'center',
  },
];

export const getStepById = (id: string): OnboardingStep | undefined => {
  return onboardingSteps.find(step => step.id === id);
};

export const isLastStep = (stepId: string): boolean => {
  const index = onboardingSteps.findIndex(step => step.id === stepId);
  return index === onboardingSteps.length - 1;
};
