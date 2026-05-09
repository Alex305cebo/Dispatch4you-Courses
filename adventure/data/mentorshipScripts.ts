/**
 * Mentorship System - Data Layer
 * Конфигурация диалогов ментора с привязкой к состояниям State Machine
 */

import { TutorialState, TutorialAction } from '../store/tutorialStateMachine';

export interface MentorDialog {
  id: string;
  state: TutorialState; // Привязка к состоянию State Machine
  speakerName: string;
  avatar: string;
  dialogLines: string[]; // Массив строк для последовательного показа
  requiredAction: TutorialAction;
  highlightElements?: string[]; // Массив селекторов для подсветки
  highlightPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  taskId?: string; // ID задачи для Task Tracker
  taskTitle?: string;
  taskDescription?: string;
  audioUrl?: string;
  delay?: number;
  metadata?: {
    canSkip?: boolean;
    showProgress?: boolean;
    blockUI?: boolean;
    [key: string]: any;
  };
}

export const mentorshipScripts: MentorDialog[] = [
  // ============================================
  // ПРИВЕТСТВИЕ И ВВЕДЕНИЕ
  // ============================================
  {
    id: 'welcome',
    state: TutorialState.STEP_1_WELCOME,
    speakerName: 'Диспетчер Майк',
    avatar: '👨‍💼',
    dialogLines: [
      'Привет! Я Майк, твой наставник.',
      'Добро пожаловать в Dispatch Office!',
      'Сегодня ты начинаешь свою карьеру диспетчера грузоперевозок.',
      'Готов к первому дню?'
    ],
    requiredAction: TutorialAction.NEXT,
    highlightPosition: 'center',
    delay: 500,
    metadata: {
      canSkip: true,
      showProgress: true,
      blockUI: true,
    },
  },

  {
    id: 'explain_goal',
    state: TutorialState.STEP_2_EXPLAIN_GOAL,
    speakerName: 'Диспетчер Майк',
    avatar: '👨‍💼',
    dialogLines: [
      'Твоя задача — управлять флотом траков и зарабатывать деньги.',
      'Каждый трак должен везти груз, а ты следишь за всем процессом.',
      'От поиска грузов до доставки — всё в твоих руках!'
    ],
    requiredAction: TutorialAction.NEXT,
    highlightPosition: 'center',
    metadata: {
      canSkip: true,
      showProgress: true,
    },
  },

  // ============================================
  // РАБОТА С LOAD BOARD
  // ============================================
  {
    id: 'show_load_board',
    state: TutorialState.STEP_3_SHOW_LOAD_BOARD,
    speakerName: 'Диспетчер Майк',
    avatar: '📋',
    dialogLines: [
      'Начнём с Load Board — доски грузов.',
      'Здесь ты найдёшь все доступные грузы.',
      'Нажми на кнопку "Load Board" внизу экрана.'
    ],
    requiredAction: TutorialAction.LOAD_BOARD_OPENED,
    highlightElements: ['[data-onboarding="load-board"]'],
    highlightPosition: 'top',
    taskId: 'open_load_board',
    taskTitle: 'Открыть Load Board',
    taskDescription: 'Нажмите на кнопку Load Board',
    metadata: {
      canSkip: false,
      blockUI: true,
    },
  },

  {
    id: 'select_first_load',
    state: TutorialState.STEP_4_SELECT_LOAD,
    speakerName: 'Диспетчер Майк',
    avatar: '🚚',
    dialogLines: [
      'Отлично! Теперь выбери любой груз из списка.',
      'Обрати внимание на ставку (Rate) и расстояние.',
      'Чем выше ставка — тем больше заработаешь!'
    ],
    requiredAction: TutorialAction.LOAD_SELECTED,
    highlightElements: ['[data-onboarding="load-card"]'],
    highlightPosition: 'bottom',
    taskId: 'select_load',
    taskTitle: 'Выбрать груз',
    taskDescription: 'Кликните на любую карточку груза',
    metadata: {
      canSkip: false,
    },
  },

  // ============================================
  // РАБОТА С ДОКУМЕНТАМИ (RATE CON)
  // ============================================
  {
    id: 'doc_review_rate_con',
    state: TutorialState.STEP_5_DOC_REVIEW_RATE_CON,
    speakerName: 'Диспетчер Майк',
    avatar: '📄',
    dialogLines: [
      'Видишь Rate Con? Это контракт с брокером.',
      'Здесь указаны все детали: откуда, куда, сколько платят.',
      'В реальной жизни диспетчеры работают именно с такими документами.',
      'Давай изучим его подробнее!'
    ],
    requiredAction: TutorialAction.RATE_CON_OPENED,
    highlightElements: ['[data-onboarding="rate-con-document"]'],
    highlightPosition: 'center',
    taskId: 'review_rate_con',
    taskTitle: 'Изучить Rate Con',
    taskDescription: 'Откройте документ Rate Con',
    metadata: {
      canSkip: false,
      blockUI: true,
    },
  },

  {
    id: 'explain_rate_con_fields',
    state: TutorialState.STEP_6_EXPLAIN_RATE_CON_FIELDS,
    speakerName: 'Диспетчер Майк',
    avatar: '🔍',
    dialogLines: [
      'Обрати внимание на ключевые поля:',
      '• SHIPPER — откуда забираем груз',
      '• CONSIGNEE — куда везём',
      '• RATE — сколько платят за рейс',
      '• PICKUP DATE — когда забирать',
      'Кликни на любое поле, чтобы увидеть подсказку.'
    ],
    requiredAction: TutorialAction.RATE_CON_FIELD_CLICKED,
    highlightElements: [
      '[data-section="SHIPPER"]',
      '[data-section="CONSIGNEE"]',
      '[data-section="RATE"]',
      '[data-section="PICKUP DATE"]'
    ],
    highlightPosition: 'right',
    taskId: 'explore_fields',
    taskTitle: 'Изучить поля документа',
    taskDescription: 'Кликните на любое поле Rate Con',
    metadata: {
      canSkip: false,
    },
  },

  {
    id: 'rate_con_finalize',
    state: TutorialState.STEP_7_RATE_CON_FINALIZE,
    speakerName: 'Диспетчер Майк',
    avatar: '✅',
    dialogLines: [
      'Отлично! Теперь ты понимаешь структуру документа.',
      'В реальной работе ты будешь проверять каждый Rate Con перед назначением.',
      'Подтверди, что всё понятно, и двигаемся дальше!'
    ],
    requiredAction: TutorialAction.RATE_CON_CONFIRMED,
    highlightPosition: 'center',
    taskId: 'confirm_rate_con',
    taskTitle: 'Подтвердить понимание',
    taskDescription: 'Нажмите кнопку подтверждения',
    metadata: {
      canSkip: false,
    },
  },

  // ============================================
  // НАЗНАЧЕНИЕ НА ТРАК
  // ============================================
  {
    id: 'select_truck',
    state: TutorialState.STEP_8_SELECT_TRUCK,
    speakerName: 'Диспетчер Майк',
    avatar: '🎯',
    dialogLines: [
      'Теперь назначь этот груз на свободный трак.',
      'Нажми на карточку трака на карте или в списке.',
      'Выбирай трак, который находится ближе к точке погрузки!'
    ],
    requiredAction: TutorialAction.TRUCK_SELECTED,
    highlightElements: ['[data-onboarding="truck-card"]'],
    highlightPosition: 'left',
    taskId: 'select_truck',
    taskTitle: 'Выбрать трак',
    taskDescription: 'Кликните на карточку свободного трака',
    metadata: {
      canSkip: false,
    },
  },

  {
    id: 'assign_load',
    state: TutorialState.STEP_9_ASSIGN_LOAD,
    speakerName: 'Диспетчер Майк',
    avatar: '✅',
    dialogLines: [
      'Супер! Подтверди назначение груза.',
      'Трак поедет на погрузку, а ты будешь следить за его движением на карте.',
      'Это основа работы диспетчера!'
    ],
    requiredAction: TutorialAction.LOAD_ASSIGNED,
    highlightPosition: 'center',
    taskId: 'assign_load',
    taskTitle: 'Назначить груз',
    taskDescription: 'Подтвердите назначение груза на трак',
    metadata: {
      canSkip: false,
    },
  },

  // ============================================
  // УПРАВЛЕНИЕ ВРЕМЕНЕМ И МОНИТОРИНГ
  // ============================================
  {
    id: 'explain_time_control',
    state: TutorialState.STEP_10_EXPLAIN_TIME_CONTROL,
    speakerName: 'Диспетчер Майк',
    avatar: '⚡',
    dialogLines: [
      'Видишь кнопку скорости вверху?',
      'Она управляет временем в игре.',
      '×1 — реальное время, ×10 — ускоренное.',
      'Используй её, чтобы не ждать часами!'
    ],
    requiredAction: TutorialAction.NEXT,
    highlightElements: ['[data-onboarding="time-controls"]'],
    highlightPosition: 'bottom',
    metadata: {
      canSkip: true,
    },
  },

  {
    id: 'explain_hos',
    state: TutorialState.STEP_11_EXPLAIN_HOS,
    speakerName: 'Диспетчер Майк',
    avatar: '⏰',
    dialogLines: [
      'Важно! Водители не могут ездить бесконечно.',
      'У них есть HOS (Hours of Service) — лимит рабочих часов.',
      'Следи за этим, иначе получишь штрафы!',
      'Красный индикатор = водитель устал и должен отдохнуть.'
    ],
    requiredAction: TutorialAction.NEXT,
    highlightPosition: 'center',
    metadata: {
      canSkip: true,
    },
  },

  {
    id: 'monitor_truck',
    state: TutorialState.STEP_12_MONITOR_TRUCK,
    speakerName: 'Диспетчер Майк',
    avatar: '📍',
    dialogLines: [
      'Теперь следи за траком на карте.',
      'Он едет к точке погрузки.',
      'Ты можешь кликнуть на него, чтобы увидеть детали рейса.'
    ],
    requiredAction: TutorialAction.NEXT,
    highlightElements: ['[data-onboarding="map"]'],
    highlightPosition: 'center',
    metadata: {
      canSkip: true,
    },
  },

  // ============================================
  // ФИНАНСЫ И ЗАВЕРШЕНИЕ
  // ============================================
  {
    id: 'explain_balance',
    state: TutorialState.STEP_13_EXPLAIN_BALANCE,
    speakerName: 'Диспетчер Майк',
    avatar: '💰',
    dialogLines: [
      'Твой баланс показан справа вверху.',
      'Каждая доставка приносит деньги, но есть и расходы:',
      '• Топливо',
      '• Ремонт',
      '• Зарплата водителям',
      'Цель — заработать как можно больше!'
    ],
    requiredAction: TutorialAction.NEXT,
    highlightElements: ['[data-onboarding="balance"]'],
    highlightPosition: 'bottom',
    metadata: {
      canSkip: true,
    },
  },

  {
    id: 'final_words',
    state: TutorialState.STEP_14_FINAL_WORDS,
    speakerName: 'Диспетчер Майк',
    avatar: '🎉',
    dialogLines: [
      'Вот и всё! Теперь ты знаешь основы.',
      'Остальное придёт с опытом.',
      'Удачи на дорогах, диспетчер!',
      'Если что-то непонятно — я всегда на связи.'
    ],
    requiredAction: TutorialAction.COMPLETE,
    highlightPosition: 'center',
    metadata: {
      canSkip: false,
      showProgress: true,
    },
  },
];

// Хелперы для работы с диалогами
export const getDialogByState = (state: TutorialState): MentorDialog | undefined => {
  return mentorshipScripts.find(dialog => dialog.state === state);
};

export const getDialogById = (id: string): MentorDialog | undefined => {
  return mentorshipScripts.find(dialog => dialog.id === id);
};

export const getAllDialogs = (): MentorDialog[] => {
  return [...mentorshipScripts];
};

export const getDialogsByTaskId = (taskId: string): MentorDialog[] => {
  return mentorshipScripts.filter(dialog => dialog.taskId === taskId);
};
