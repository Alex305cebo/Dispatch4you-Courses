/**
 * Event Bus System
 * Централизованная система событий для коммуникации между компонентами
 */

export enum TutorialEvent {
  // UI Events
  HIGHLIGHT_ELEMENT = 'HIGHLIGHT_ELEMENT',
  UNHIGHLIGHT_ELEMENT = 'UNHIGHLIGHT_ELEMENT',
  HIGHLIGHT_ALL = 'HIGHLIGHT_ALL',
  CLEAR_HIGHLIGHTS = 'CLEAR_HIGHLIGHTS',
  
  // Dialog Events
  SHOW_DIALOG = 'SHOW_DIALOG',
  HIDE_DIALOG = 'HIDE_DIALOG',
  DIALOG_NEXT = 'DIALOG_NEXT',
  DIALOG_SKIP = 'DIALOG_SKIP',
  
  // Task Events
  TASK_ADDED = 'TASK_ADDED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_FAILED = 'TASK_FAILED',
  
  // State Events
  STATE_CHANGED = 'STATE_CHANGED',
  TUTORIAL_STARTED = 'TUTORIAL_STARTED',
  TUTORIAL_COMPLETED = 'TUTORIAL_COMPLETED',
  TUTORIAL_SKIPPED = 'TUTORIAL_SKIPPED',
  
  // Player Actions
  PLAYER_ACTION = 'PLAYER_ACTION',
  LOAD_BOARD_OPENED = 'LOAD_BOARD_OPENED',
  LOAD_SELECTED = 'LOAD_SELECTED',
  DOCUMENT_OPENED = 'DOCUMENT_OPENED',
  DOCUMENT_FIELD_CLICKED = 'DOCUMENT_FIELD_CLICKED',
  TRUCK_SELECTED = 'TRUCK_SELECTED',
  LOAD_ASSIGNED = 'LOAD_ASSIGNED',
  
  // System Events
  TUTORIAL_ERROR = 'TUTORIAL_ERROR',
  TUTORIAL_WARNING = 'TUTORIAL_WARNING',
}

export interface EventPayload {
  [key: string]: any;
}

export interface HighlightPayload extends EventPayload {
  selector: string;
  message?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  pulse?: boolean;
}

export interface TaskPayload extends EventPayload {
  taskId: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress?: number;
}

export interface StateChangePayload extends EventPayload {
  previousState: string;
  currentState: string;
  action: string;
}

type EventCallback<T = EventPayload> = (payload: T) => void;

class EventBus {
  private listeners: Map<TutorialEvent, Set<EventCallback>> = new Map();
  private eventHistory: Array<{ event: TutorialEvent; payload: EventPayload; timestamp: number }> = [];
  private maxHistorySize = 100;

  // Подписаться на событие
  on<T extends EventPayload = EventPayload>(
    event: TutorialEvent,
    callback: EventCallback<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback as EventCallback);

    // Возвращаем функцию отписки
    return () => {
      this.off(event, callback);
    };
  }

  // Подписаться на событие один раз
  once<T extends EventPayload = EventPayload>(
    event: TutorialEvent,
    callback: EventCallback<T>
  ): void {
    const wrappedCallback = (payload: T) => {
      callback(payload);
      this.off(event, wrappedCallback as EventCallback);
    };

    this.on(event, wrappedCallback as EventCallback<T>);
  }

  // Отписаться от события
  off<T extends EventPayload = EventPayload>(
    event: TutorialEvent,
    callback: EventCallback<T>
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
    }
  }

  // Отправить событие
  emit<T extends EventPayload = EventPayload>(
    event: TutorialEvent,
    payload: T = {} as T
  ): void {
    console.log(`📡 Event emitted: ${event}`, payload);

    // Сохраняем в историю
    this.eventHistory.push({
      event,
      payload,
      timestamp: Date.now(),
    });

    // Ограничиваем размер истории
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Уведомляем всех слушателей
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Получить историю событий
  getHistory(event?: TutorialEvent): Array<{ event: TutorialEvent; payload: EventPayload; timestamp: number }> {
    if (event) {
      return this.eventHistory.filter(item => item.event === event);
    }
    return [...this.eventHistory];
  }

  // Очистить историю
  clearHistory(): void {
    this.eventHistory = [];
  }

  // Очистить все подписки
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }

  // Получить количество слушателей для события
  getListenerCount(event: TutorialEvent): number {
    return this.listeners.get(event)?.size || 0;
  }

  // Проверить, есть ли слушатели для события
  hasListeners(event: TutorialEvent): boolean {
    return this.getListenerCount(event) > 0;
  }

  // Отладочная информация
  debug(): void {
    console.group('🔍 Event Bus Debug Info');
    console.log('Active listeners:', this.listeners.size);
    this.listeners.forEach((callbacks, event) => {
      console.log(`  ${event}: ${callbacks.size} listeners`);
    });
    console.log('Event history:', this.eventHistory.length, 'events');
    console.groupEnd();
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export const getEventBus = (): EventBus => {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
};

// Хелперы для частых операций
export const tutorialEvents = {
  // Подсветка элементов
  highlightElement: (selector: string, message?: string, position?: 'top' | 'bottom' | 'left' | 'right') => {
    getEventBus().emit<HighlightPayload>(TutorialEvent.HIGHLIGHT_ELEMENT, {
      selector,
      message,
      position,
      pulse: true,
    });
  },

  unhighlightElement: (selector: string) => {
    getEventBus().emit<HighlightPayload>(TutorialEvent.UNHIGHLIGHT_ELEMENT, {
      selector,
    });
  },

  clearAllHighlights: () => {
    getEventBus().emit(TutorialEvent.CLEAR_HIGHLIGHTS);
  },

  // Задачи
  addTask: (taskId: string, title: string, description?: string) => {
    getEventBus().emit<TaskPayload>(TutorialEvent.TASK_ADDED, {
      taskId,
      title,
      description,
      status: 'pending',
    });
  },

  updateTask: (taskId: string, progress: number) => {
    getEventBus().emit<TaskPayload>(TutorialEvent.TASK_UPDATED, {
      taskId,
      status: 'active',
      progress,
      title: '', // Будет заполнено из TaskTracker
    });
  },

  completeTask: (taskId: string) => {
    getEventBus().emit<TaskPayload>(TutorialEvent.TASK_COMPLETED, {
      taskId,
      status: 'completed',
      progress: 100,
      title: '',
    });
  },

  // Диалоги
  showDialog: (dialogId: string, data?: any) => {
    getEventBus().emit(TutorialEvent.SHOW_DIALOG, { dialogId, data });
  },

  hideDialog: () => {
    getEventBus().emit(TutorialEvent.HIDE_DIALOG);
  },

  // Действия игрока
  playerAction: (action: string, data?: any) => {
    getEventBus().emit(TutorialEvent.PLAYER_ACTION, { action, data });
  },
};
