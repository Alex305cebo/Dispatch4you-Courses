/**
 * Tutorial State Machine
 * Управление состояниями обучения с валидацией переходов
 */

export enum TutorialState {
  // Начальные состояния
  IDLE = 'IDLE',
  NOT_STARTED = 'NOT_STARTED',
  
  // Приветствие и введение
  STEP_1_WELCOME = 'STEP_1_WELCOME',
  STEP_2_EXPLAIN_GOAL = 'STEP_2_EXPLAIN_GOAL',
  
  // Работа с Load Board
  STEP_3_SHOW_LOAD_BOARD = 'STEP_3_SHOW_LOAD_BOARD',
  STEP_4_SELECT_LOAD = 'STEP_4_SELECT_LOAD',
  
  // Работа с документами
  STEP_5_DOC_REVIEW_RATE_CON = 'STEP_5_DOC_REVIEW_RATE_CON',
  STEP_6_EXPLAIN_RATE_CON_FIELDS = 'STEP_6_EXPLAIN_RATE_CON_FIELDS',
  STEP_7_RATE_CON_FINALIZE = 'STEP_7_RATE_CON_FINALIZE',
  
  // Назначение на трак
  STEP_8_SELECT_TRUCK = 'STEP_8_SELECT_TRUCK',
  STEP_9_ASSIGN_LOAD = 'STEP_9_ASSIGN_LOAD',
  
  // Управление временем и мониторинг
  STEP_10_EXPLAIN_TIME_CONTROL = 'STEP_10_EXPLAIN_TIME_CONTROL',
  STEP_11_EXPLAIN_HOS = 'STEP_11_EXPLAIN_HOS',
  STEP_12_MONITOR_TRUCK = 'STEP_12_MONITOR_TRUCK',
  
  // Финансы и завершение
  STEP_13_EXPLAIN_BALANCE = 'STEP_13_EXPLAIN_BALANCE',
  STEP_14_FINAL_WORDS = 'STEP_14_FINAL_WORDS',
  
  // Завершающие состояния
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum TutorialAction {
  START = 'START',
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SKIP = 'SKIP',
  COMPLETE = 'COMPLETE',
  RESTART = 'RESTART',
  
  // Специфичные действия игрока
  LOAD_BOARD_OPENED = 'LOAD_BOARD_OPENED',
  LOAD_SELECTED = 'LOAD_SELECTED',
  RATE_CON_OPENED = 'RATE_CON_OPENED',
  RATE_CON_FIELD_CLICKED = 'RATE_CON_FIELD_CLICKED',
  RATE_CON_CONFIRMED = 'RATE_CON_CONFIRMED',
  TRUCK_SELECTED = 'TRUCK_SELECTED',
  LOAD_ASSIGNED = 'LOAD_ASSIGNED',
  TIME_SPEED_CHANGED = 'TIME_SPEED_CHANGED',
  HOS_CHECKED = 'HOS_CHECKED',
  BALANCE_VIEWED = 'BALANCE_VIEWED',
}

interface StateTransition {
  from: TutorialState;
  to: TutorialState;
  action: TutorialAction;
  condition?: () => boolean; // Опциональное условие для перехода
}

// Определяем все возможные переходы между состояниями
const stateTransitions: StateTransition[] = [
  // Начало обучения
  { from: TutorialState.NOT_STARTED, to: TutorialState.STEP_1_WELCOME, action: TutorialAction.START },
  { from: TutorialState.STEP_1_WELCOME, to: TutorialState.STEP_2_EXPLAIN_GOAL, action: TutorialAction.NEXT },
  
  // Load Board
  { from: TutorialState.STEP_2_EXPLAIN_GOAL, to: TutorialState.STEP_3_SHOW_LOAD_BOARD, action: TutorialAction.NEXT },
  { from: TutorialState.STEP_3_SHOW_LOAD_BOARD, to: TutorialState.STEP_4_SELECT_LOAD, action: TutorialAction.LOAD_BOARD_OPENED },
  { from: TutorialState.STEP_4_SELECT_LOAD, to: TutorialState.STEP_5_DOC_REVIEW_RATE_CON, action: TutorialAction.LOAD_SELECTED },
  
  // Rate Con документ
  { from: TutorialState.STEP_5_DOC_REVIEW_RATE_CON, to: TutorialState.STEP_6_EXPLAIN_RATE_CON_FIELDS, action: TutorialAction.RATE_CON_OPENED },
  { from: TutorialState.STEP_6_EXPLAIN_RATE_CON_FIELDS, to: TutorialState.STEP_7_RATE_CON_FINALIZE, action: TutorialAction.RATE_CON_FIELD_CLICKED },
  { from: TutorialState.STEP_7_RATE_CON_FINALIZE, to: TutorialState.STEP_8_SELECT_TRUCK, action: TutorialAction.RATE_CON_CONFIRMED },
  
  // Назначение на трак
  { from: TutorialState.STEP_8_SELECT_TRUCK, to: TutorialState.STEP_9_ASSIGN_LOAD, action: TutorialAction.TRUCK_SELECTED },
  { from: TutorialState.STEP_9_ASSIGN_LOAD, to: TutorialState.STEP_10_EXPLAIN_TIME_CONTROL, action: TutorialAction.LOAD_ASSIGNED },
  
  // Управление и мониторинг
  { from: TutorialState.STEP_10_EXPLAIN_TIME_CONTROL, to: TutorialState.STEP_11_EXPLAIN_HOS, action: TutorialAction.NEXT },
  { from: TutorialState.STEP_11_EXPLAIN_HOS, to: TutorialState.STEP_12_MONITOR_TRUCK, action: TutorialAction.NEXT },
  { from: TutorialState.STEP_12_MONITOR_TRUCK, to: TutorialState.STEP_13_EXPLAIN_BALANCE, action: TutorialAction.NEXT },
  
  // Завершение
  { from: TutorialState.STEP_13_EXPLAIN_BALANCE, to: TutorialState.STEP_14_FINAL_WORDS, action: TutorialAction.NEXT },
  { from: TutorialState.STEP_14_FINAL_WORDS, to: TutorialState.COMPLETED, action: TutorialAction.COMPLETE },
  
  // Пропуск обучения (из любого состояния)
  { from: TutorialState.STEP_1_WELCOME, to: TutorialState.SKIPPED, action: TutorialAction.SKIP },
  { from: TutorialState.STEP_2_EXPLAIN_GOAL, to: TutorialState.SKIPPED, action: TutorialAction.SKIP },
  { from: TutorialState.STEP_3_SHOW_LOAD_BOARD, to: TutorialState.SKIPPED, action: TutorialAction.SKIP },
  // ... (добавьте для всех состояний)
  
  // Перезапуск
  { from: TutorialState.COMPLETED, to: TutorialState.STEP_1_WELCOME, action: TutorialAction.RESTART },
  { from: TutorialState.SKIPPED, to: TutorialState.STEP_1_WELCOME, action: TutorialAction.RESTART },
];

export class TutorialStateMachine {
  private currentState: TutorialState;
  private previousState: TutorialState | null = null;
  private stateHistory: TutorialState[] = [];
  private listeners: Map<TutorialState, Set<(state: TutorialState) => void>> = new Map();

  constructor(initialState: TutorialState = TutorialState.NOT_STARTED) {
    this.currentState = initialState;
    this.stateHistory.push(initialState);
  }

  // Получить текущее состояние
  getCurrentState(): TutorialState {
    return this.currentState;
  }

  // Получить предыдущее состояние
  getPreviousState(): TutorialState | null {
    return this.previousState;
  }

  // Получить историю состояний
  getStateHistory(): TutorialState[] {
    return [...this.stateHistory];
  }

  // Проверить, можно ли выполнить действие
  canTransition(action: TutorialAction): boolean {
    const transition = stateTransitions.find(
      t => t.from === this.currentState && t.action === action
    );

    if (!transition) return false;
    if (transition.condition && !transition.condition()) return false;

    return true;
  }

  // Выполнить переход
  transition(action: TutorialAction): boolean {
    const transition = stateTransitions.find(
      t => t.from === this.currentState && t.action === action
    );

    if (!transition) {
      console.warn(`❌ Invalid transition: ${this.currentState} -> ${action}`);
      return false;
    }

    if (transition.condition && !transition.condition()) {
      console.warn(`❌ Transition condition not met: ${this.currentState} -> ${action}`);
      return false;
    }

    // Выполняем переход
    this.previousState = this.currentState;
    this.currentState = transition.to;
    this.stateHistory.push(this.currentState);

    console.log(`✅ State transition: ${this.previousState} -> ${this.currentState} (${action})`);

    // Уведомляем слушателей
    this.notifyListeners(this.currentState);

    // Сохраняем в localStorage
    this.saveState();

    return true;
  }

  // Подписаться на изменения состояния
  subscribe(state: TutorialState, callback: (state: TutorialState) => void): () => void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, new Set());
    }
    this.listeners.get(state)!.add(callback);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.get(state)?.delete(callback);
    };
  }

  // Подписаться на любое изменение состояния
  subscribeToAll(callback: (state: TutorialState) => void): () => void {
    const unsubscribers: (() => void)[] = [];
    
    Object.values(TutorialState).forEach(state => {
      unsubscribers.push(this.subscribe(state as TutorialState, callback));
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  // Уведомить слушателей
  private notifyListeners(state: TutorialState): void {
    this.listeners.get(state)?.forEach(callback => callback(state));
  }

  // Проверить, находимся ли мы в определенном состоянии
  isInState(state: TutorialState): boolean {
    return this.currentState === state;
  }

  // Проверить, завершено ли обучение
  isCompleted(): boolean {
    return this.currentState === TutorialState.COMPLETED;
  }

  // Проверить, пропущено ли обучение
  isSkipped(): boolean {
    return this.currentState === TutorialState.SKIPPED;
  }

  // Проверить, активно ли обучение
  isActive(): boolean {
    return this.currentState !== TutorialState.IDLE &&
           this.currentState !== TutorialState.NOT_STARTED &&
           this.currentState !== TutorialState.COMPLETED &&
           this.currentState !== TutorialState.SKIPPED;
  }

  // Сохранить состояние в localStorage
  private saveState(): void {
    try {
      localStorage.setItem('tutorial-state', this.currentState);
      localStorage.setItem('tutorial-history', JSON.stringify(this.stateHistory));
    } catch (error) {
      console.error('Failed to save tutorial state:', error);
    }
  }

  // Загрузить состояние из localStorage
  loadState(): void {
    try {
      const savedState = localStorage.getItem('tutorial-state') as TutorialState;
      const savedHistory = localStorage.getItem('tutorial-history');

      if (savedState) {
        this.currentState = savedState;
      }

      if (savedHistory) {
        this.stateHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Failed to load tutorial state:', error);
    }
  }

  // Сбросить состояние
  reset(): void {
    this.currentState = TutorialState.NOT_STARTED;
    this.previousState = null;
    this.stateHistory = [TutorialState.NOT_STARTED];
    localStorage.removeItem('tutorial-state');
    localStorage.removeItem('tutorial-history');
  }

  // Получить прогресс в процентах
  getProgress(): number {
    const allStates = Object.values(TutorialState);
    const completableStates = allStates.filter(
      s => s !== TutorialState.IDLE && 
           s !== TutorialState.NOT_STARTED && 
           s !== TutorialState.COMPLETED && 
           s !== TutorialState.SKIPPED
    );

    const currentIndex = completableStates.indexOf(this.currentState);
    if (currentIndex === -1) return 0;

    return Math.round((currentIndex / completableStates.length) * 100);
  }
}

// Singleton instance
let stateMachineInstance: TutorialStateMachine | null = null;

export const getTutorialStateMachine = (): TutorialStateMachine => {
  if (!stateMachineInstance) {
    stateMachineInstance = new TutorialStateMachine();
    stateMachineInstance.loadState();
  }
  return stateMachineInstance;
};
