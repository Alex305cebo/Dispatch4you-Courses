import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED CHAT STORE — Единая система диалогов для всех коммуникаций
// ═══════════════════════════════════════════════════════════════════════════

export type MessageType = 'sms' | 'email' | 'voicemail' | 'voice_call' | 'system';
export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';
export type SenderRole = 'driver' | 'broker' | 'system' | 'dispatcher';

// ═══ ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ ═══

export interface InteractiveButton {
  id: string;
  text: string;
  action: string;
  style?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  data?: any;
}

export interface QuickReply {
  text: string;
  action: string;
  value: string;
  icon?: string;
}

export interface LoadCard {
  loadId: string;
  from: string;
  to: string;
  pickup: string;
  delivery: string;
  rate: number;
  miles: number;
  weight?: string;
  commodity?: string;
}

export interface DocumentPreview {
  type: 'rate_con' | 'bol' | 'pod' | 'invoice';
  title: string;
  documentId: string;
  preview?: {
    [key: string]: string;
  };
}

export interface InteractiveContent {
  type: 'buttons' | 'load_card' | 'document' | 'alert' | 'call' | 'quick_replies';
  buttons?: InteractiveButton[];
  loadCard?: LoadCard;
  document?: DocumentPreview;
  quickReplies?: QuickReply[];
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  autoExpire?: number; // секунды
  data?: any;
}

export interface ActionStatus {
  completed: boolean;
  result?: string;
  timestamp?: number;
  selectedButton?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  type: MessageType;
  from: SenderRole;
  fromName: string;
  text: string;
  timestamp: number;
  read: boolean;
  priority?: MessagePriority;
  
  // Для email
  subject?: string;
  
  // Для voicemail
  audioUrl?: string;
  duration?: number;
  transcription?: string;
  
  // Для voice call
  callDuration?: number;
  callStatus?: 'missed' | 'answered' | 'declined';
  
  // НОВОЕ: Интерактивность
  interactive?: InteractiveContent;
  
  // НОВОЕ: Статус действия
  actionStatus?: ActionStatus;
  
  // Метаданные
  metadata?: {
    truckId?: string;
    loadId?: string;
    eventId?: string;
    attachments?: string[];
  };
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantRole: SenderRole;
  participantAvatar: string;
  participantCompany?: string;
  
  messages: ChatMessage[];
  lastMessageTime: number;
  unreadCount: number;
  
  // Контекст треда
  context?: {
    truckId?: string;
    loadId?: string;
    relatedThreads?: string[];
  };
  
  // Статус
  isActive: boolean;
  isPinned: boolean;
  isMuted: boolean;
}

interface UnifiedChatStore {
  threads: Record<string, ChatThread>;
  
  // НОВОЕ: Онбординг
  onboardingActive: boolean;
  currentOnboardingStep: string | null;
  
  // Действия
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  markThreadAsRead: (threadId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  
  // НОВОЕ: Обработка действий
  handleButtonAction: (messageId: string, buttonId: string, action: string, data?: any) => void;
  handleQuickReply: (threadId: string, reply: QuickReply) => void;
  
  // НОВОЕ: Онбординг
  startOnboarding: () => void;
  nextOnboardingStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  
  // Создание треда
  createThread: (params: {
    participantName: string;
    participantRole: SenderRole;
    participantAvatar: string;
    participantCompany?: string;
    context?: ChatThread['context'];
  }) => string;
  
  // Получение данных
  getThread: (threadId: string) => ChatThread | null;
  getThreadByParticipant: (participantName: string) => ChatThread | null;
  getAllThreads: () => ChatThread[];
  getUnreadCount: () => number;
  getUnreadThreads: () => ChatThread[];
  
  // Управление тредами
  pinThread: (threadId: string) => void;
  unpinThread: (threadId: string) => void;
  muteThread: (threadId: string) => void;
  unmuteThread: (threadId: string) => void;
  archiveThread: (threadId: string) => void;
  
  // Сохранение/загрузка
  loadFromStorage: (nickname: string) => void;
  saveToStorage: (nickname: string) => void;
  
  // Миграция из старой системы
  migrateFromNotifications: (notifications: any[]) => void;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateThreadId(participantName: string, participantRole: SenderRole): string {
  const normalized = participantName.toLowerCase().replace(/\s+/g, '-');
  return `thread-${participantRole}-${normalized}`;
}

function getStorageKey(nickname: string): string {
  return `unified-chat-${nickname}`;
}

// Генерация аватара по имени и роли
function generateAvatar(name: string, role: SenderRole): string {
  const avatars = {
    driver: ['👨‍✈️', '👨‍🔧', '👨‍💼', '👨', '🧔', '👴'],
    broker: ['👔', '💼', '👨‍💻', '👩‍💻', '🤵', '👩‍💼'],
    system: ['🤖', '⚙️', '📢', '🔔'],
    dispatcher: ['👨‍💼', '👩‍💼', '📋'],
  };
  
  const options = avatars[role] || ['👤'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % options.length;
  return options[index];
}

export const useUnifiedChatStore = create<UnifiedChatStore>((set, get) => ({
  threads: {},
  onboardingActive: false,
  currentOnboardingStep: null,
  
  // ─── СОЗДАНИЕ ТРЕДА ─────────────────────────────────────────────────────
  createThread: (params) => {
    const threadId = generateThreadId(params.participantName, params.participantRole);
    
    // Если тред уже существует — обновляем аватар и возвращаем его ID
    if (get().threads[threadId]) {
      set(state => ({
        threads: {
          ...state.threads,
          [threadId]: {
            ...state.threads[threadId],
            participantAvatar: params.participantAvatar || state.threads[threadId].participantAvatar,
          }
        }
      }));
      return threadId;
    }
    
    const newThread: ChatThread = {
      id: threadId,
      participantName: params.participantName,
      participantRole: params.participantRole,
      participantAvatar: params.participantAvatar || generateAvatar(params.participantName, params.participantRole),
      participantCompany: params.participantCompany,
      messages: [],
      lastMessageTime: Date.now(),
      unreadCount: 0,
      context: params.context,
      isActive: true,
      isPinned: false,
      isMuted: false,
    };
    
    set(state => ({
      threads: { ...state.threads, [threadId]: newThread }
    }));
    
    return threadId;
  },
  
  // ─── ДОБАВЛЕНИЕ СООБЩЕНИЯ ───────────────────────────────────────────────
  addMessage: (message) => {
    const { threadId } = message;
    const thread = get().threads[threadId];
    
    if (!thread) {
      console.warn(`Thread ${threadId} not found. Message not added.`);
      return;
    }
    
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    set(state => {
      const updatedThread: ChatThread = {
        ...thread,
        messages: [...thread.messages, newMessage],
        lastMessageTime: newMessage.timestamp,
        unreadCount: message.from !== 'dispatcher' && !message.read 
          ? thread.unreadCount + 1 
          : thread.unreadCount,
      };
      
      return {
        threads: { ...state.threads, [threadId]: updatedThread }
      };
    });
  },
  
  // ─── ПОМЕТИТЬ ТРЕД КАК ПРОЧИТАННЫЙ ─────────────────────────────────────
  markThreadAsRead: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    set(state => {
      const updatedMessages = thread.messages.map(msg => ({ ...msg, read: true }));
      const updatedThread: ChatThread = {
        ...thread,
        messages: updatedMessages,
        unreadCount: 0,
      };
      
      return {
        threads: { ...state.threads, [threadId]: updatedThread }
      };
    });
  },
  
  // ─── ПОМЕТИТЬ СООБЩЕНИЕ КАК ПРОЧИТАННОЕ ────────────────────────────────
  markMessageAsRead: (messageId) => {
    const threads = get().threads;
    
    for (const threadId in threads) {
      const thread = threads[threadId];
      const messageIndex = thread.messages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1 && !thread.messages[messageIndex].read) {
        set(state => {
          const updatedMessages = [...thread.messages];
          updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], read: true };
          
          const updatedThread: ChatThread = {
            ...thread,
            messages: updatedMessages,
            unreadCount: Math.max(0, thread.unreadCount - 1),
          };
          
          return {
            threads: { ...state.threads, [threadId]: updatedThread }
          };
        });
        
        break;
      }
    }
  },
  
  // ─── ПОЛУЧЕНИЕ ДАННЫХ ───────────────────────────────────────────────────
  getThread: (threadId) => {
    return get().threads[threadId] || null;
  },
  
  getThreadByParticipant: (participantName) => {
    const threads = Object.values(get().threads);
    return threads.find(t => t.participantName === participantName) || null;
  },
  
  getAllThreads: () => {
    return Object.values(get().threads)
      .filter(t => t.isActive)
      .sort((a, b) => {
        // Закреплённые сверху
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Затем по времени последнего сообщения
        return b.lastMessageTime - a.lastMessageTime;
      });
  },
  
  getUnreadCount: () => {
    return Object.values(get().threads)
      .filter(t => t.isActive && !t.isMuted)
      .reduce((sum, t) => sum + t.unreadCount, 0);
  },
  
  getUnreadThreads: () => {
    return Object.values(get().threads)
      .filter(t => t.isActive && t.unreadCount > 0)
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  },
  
  // ─── УПРАВЛЕНИЕ ТРЕДАМИ ─────────────────────────────────────────────────
  pinThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    set(state => ({
      threads: { ...state.threads, [threadId]: { ...thread, isPinned: true } }
    }));
  },
  
  unpinThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    set(state => ({
      threads: { ...state.threads, [threadId]: { ...thread, isPinned: false } }
    }));
  },
  
  muteThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    set(state => ({
      threads: { ...state.threads, [threadId]: { ...thread, isMuted: true } }
    }));
  },
  
  unmuteThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    set(state => ({
      threads: { ...state.threads, [threadId]: { ...thread, isMuted: false } }
    }));
  },
  
  archiveThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    set(state => ({
      threads: { ...state.threads, [threadId]: { ...thread, isActive: false } }
    }));
  },
  
  // ─── ОБРАБОТКА ДЕЙСТВИЙ ────────────────────────────────────────────────
  handleButtonAction: (messageId, buttonId, action, data) => {
    const threads = get().threads;
    
    for (const threadId in threads) {
      const thread = threads[threadId];
      const messageIndex = thread.messages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        set(state => {
          const updatedMessages = [...thread.messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            actionStatus: {
              completed: true,
              result: action,
              timestamp: Date.now(),
              selectedButton: buttonId,
            },
          };
          
          const updatedThread: ChatThread = {
            ...thread,
            messages: updatedMessages,
          };
          
          return {
            threads: { ...state.threads, [threadId]: updatedThread }
          };
        });
        
        // Вызываем callback если есть
        if (data?.callback) {
          data.callback(action, data);
        }
        
        break;
      }
    }
  },
  
  handleQuickReply: (threadId, reply) => {
    const thread = get().threads[threadId];
    if (!thread) return;
    
    // Добавляем сообщение от диспетчера
    get().addMessage({
      threadId,
      type: 'sms',
      from: 'dispatcher',
      fromName: 'Вы',
      text: reply.value,
      read: true,
    });
  },
  
  // ─── СОХРАНЕНИЕ/ЗАГРУЗКА ────────────────────────────────────────────────
  loadFromStorage: (nickname) => {
    try {
      const key = getStorageKey(nickname);
      const AVATAR_VERSION = 'v4';
      // Глобальный ключ — не зависит от nickname
      const GLOBAL_VERSION_KEY = 'chat-avatar-version';

      if (localStorage.getItem(GLOBAL_VERSION_KEY) !== AVATAR_VERSION) {
        // Сбрасываем все chat-ключи для всех nickname
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('unified-chat-')) localStorage.removeItem(k);
        });
        localStorage.setItem(GLOBAL_VERSION_KEY, AVATAR_VERSION);
        set({ threads: {} });
        return;
      }
      
      const raw = localStorage.getItem(key);
      if (raw) {
        const threads = JSON.parse(raw) as Record<string, ChatThread>;

        // Патч аватаров — обновляем до актуальных URL
        const AVATAR_PATCH: Record<string, string> = {
          driver:     'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Office%20Worker%20Light%20Skin%20Tone.png',
          broker:     'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20Light%20Skin%20Tone%2C%20Curly%20Hair.png',
          system:     'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Telephone.webp',
          dispatcher: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium-Light%20Skin%20Tone.png',
        };
        // Имена → аватар (для owner/accountant которые role=system)
        const NAME_PATCH: Record<string, string> = {
          'Лиза':            'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Woman%20Curly%20Hair.png',
          'Майк':            'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20White%20Hair.png',
          'Dispatch Office': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Telephone.webp',
          'Dispatch Office System': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Telephone.webp',
        };

        Object.values(threads).forEach(t => {
          if (NAME_PATCH[t.participantName]) {
            t.participantAvatar = NAME_PATCH[t.participantName];
          } else if (AVATAR_PATCH[t.participantRole]) {
            t.participantAvatar = AVATAR_PATCH[t.participantRole];
          }
          // Принудительно патчим system роль — всегда телефон
          if (t.participantRole === 'system' && !NAME_PATCH[t.participantName]) {
            t.participantAvatar = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Telephone.webp';
          }
        });

        set({ threads });
      } else {
        set({ threads: {} });
      }
    } catch (error) {
      console.error('Failed to load chat from storage:', error);
      set({ threads: {} });
    }
  },
  
  saveToStorage: (nickname) => {
    try {
      const key = getStorageKey(nickname);
      const threads = get().threads;
      localStorage.setItem(key, JSON.stringify(threads));
    } catch (error) {
      console.error('Failed to save chat to storage:', error);
    }
  },
  
  // ─── МИГРАЦИЯ ИЗ СТАРОЙ СИСТЕМЫ ─────────────────────────────────────────
  migrateFromNotifications: (notifications) => {
    notifications.forEach(notif => {
      // Определяем роль отправителя
      let role: SenderRole = 'system';
      if (notif.from.includes('водитель') || notif.from.includes('driver')) {
        role = 'driver';
      } else if (notif.from.includes('LLC') || notif.from.includes('Inc') || notif.from.includes('Freight')) {
        role = 'broker';
      }
      
      // Создаём или получаем тред
      const threadId = get().createThread({
        participantName: notif.from,
        participantRole: role,
        participantAvatar: generateAvatar(notif.from, role),
      });
      
      // Добавляем сообщение
      get().addMessage({
        threadId,
        type: notif.type === 'text' ? 'sms' : notif.type,
        from: role,
        fromName: notif.from,
        text: notif.message,
        read: notif.read || false,
        priority: notif.priority,
        subject: notif.subject,
      });
    });
  },
  
  // ─── ОНБОРДИНГ ──────────────────────────────────────────────────────────
  startOnboarding: () => {
    const { ONBOARDING_STEPS } = require('../data/onboardingSteps');
    
    // Создаём системный тред
    const systemThreadId = get().createThread({
      participantName: '🎮 Dispatch Office',
      participantRole: 'system',
      participantAvatar: '🎮',
    });
    
    // Добавляем первое сообщение
    const firstStep = ONBOARDING_STEPS[0];
    get().addMessage({
      threadId: systemThreadId,
      type: 'system',
      from: 'system',
      fromName: firstStep.fromName,
      text: firstStep.text,
      read: false,
      interactive: {
        type: 'buttons',
        buttons: firstStep.buttons,
      },
    });
    
    set({ 
      onboardingActive: true, 
      currentOnboardingStep: firstStep.id 
    });
  },
  
  nextOnboardingStep: () => {
    const { getNextStep } = require('../data/onboardingSteps');
    const currentStep = get().currentOnboardingStep;
    const nextStep = getNextStep(currentStep);
    
    if (!nextStep) {
      get().completeOnboarding();
      return;
    }
    
    // Определяем тред в зависимости от отправителя
    let threadId: string;
    
    if (nextStep.from === 'system') {
      threadId = get().createThread({
        participantName: '🎮 Dispatch Office',
        participantRole: 'system',
        participantAvatar: '🎮',
      });
    } else if (nextStep.from === 'driver') {
      threadId = get().createThread({
        participantName: nextStep.fromName,
        participantRole: 'driver',
        participantAvatar: '👨‍✈️',
        participantCompany: 'Водитель T-001',
      });
    } else if (nextStep.from === 'broker') {
      threadId = get().createThread({
        participantName: nextStep.fromName,
        participantRole: 'broker',
        participantAvatar: '👔',
        participantCompany: 'QuickLoad Freight',
      });
    } else {
      threadId = get().createThread({
        participantName: nextStep.fromName,
        participantRole: 'system',
        participantAvatar: '👨‍💼',
      });
    }
    
    // Добавляем сообщение с задержкой
    setTimeout(() => {
      get().addMessage({
        threadId,
        type: nextStep.from === 'system' ? 'system' : nextStep.from === 'driver' ? 'sms' : 'email',
        from: nextStep.from,
        fromName: nextStep.fromName,
        text: nextStep.text,
        read: false,
        interactive: nextStep.buttons || nextStep.quickReplies ? {
          type: nextStep.buttons ? 'buttons' : 'quick_replies',
          buttons: nextStep.buttons,
          quickReplies: nextStep.quickReplies,
        } : undefined,
      });
    }, nextStep.delay || 0);
    
    set({ currentOnboardingStep: nextStep.id });
  },
  
  skipOnboarding: () => {
    set({ 
      onboardingActive: false, 
      currentOnboardingStep: null 
    });
  },
  
  completeOnboarding: () => {
    const { markOnboardingComplete } = require('../data/onboardingSteps');
    const { useAccountStore } = require('./accountStore');
    const nickname = useAccountStore.getState().currentNickname;
    
    if (nickname) {
      markOnboardingComplete(nickname);
    }
    
    set({ 
      onboardingActive: false, 
      currentOnboardingStep: null 
    });
  },
}));
