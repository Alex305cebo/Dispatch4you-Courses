/**
 * TutorialStateMachine.js
 * 
 * Конечный автомат (State Machine) для управления прогрессом обучения.
 * Отвечает за переключение между шагами и валидацию действий игрока.
 * 
 * Архитектура: Чистый FSM без зависимостей от UI или данных.
 */

export class TutorialStateMachine {
  constructor() {
    this.currentState = null;
    this.states = new Map();
    this.history = [];
    this.listeners = new Set();
  }

  /**
   * Регистрация нового состояния
   * @param {string} stateName - Уникальное имя состояния (например: STEP_1_WELCOME)
   * @param {Object} config - Конфигурация состояния
   * @param {Function} config.onEnter - Callback при входе в состояние
   * @param {Function} config.onExit - Callback при выходе из состояния
   * @param {Function} config.canTransitionTo - Функция проверки возможности перехода
   * @param {Array<string>} config.allowedTransitions - Список разрешённых переходов
   */
  registerState(stateName, config = {}) {
    if (this.states.has(stateName)) {
      console.warn(`[StateMachine] State "${stateName}" already registered. Overwriting.`);
    }

    this.states.set(stateName, {
      name: stateName,
      onEnter: config.onEnter || (() => {}),
      onExit: config.onExit || (() => {}),
      canTransitionTo: config.canTransitionTo || (() => true),
      allowedTransitions: config.allowedTransitions || [],
      metadata: config.metadata || {}
    });

    console.log(`[StateMachine] Registered state: ${stateName}`);
  }

  /**
   * Переход к новому состоянию
   * @param {string} targetState - Имя целевого состояния
   * @param {Object} context - Контекст перехода (данные игрока, события и т.д.)
   * @returns {boolean} - Успешность перехода
   */
  transitionTo(targetState, context = {}) {
    // Проверка существования целевого состояния
    if (!this.states.has(targetState)) {
      console.error(`[StateMachine] Target state "${targetState}" does not exist.`);
      return false;
    }

    const target = this.states.get(targetState);

    // Если есть текущее состояние — проверяем разрешён ли переход
    if (this.currentState) {
      const current = this.states.get(this.currentState);
      
      // Проверка списка разрешённых переходов
      if (current.allowedTransitions.length > 0 && 
          !current.allowedTransitions.includes(targetState)) {
        console.warn(`[StateMachine] Transition from "${this.currentState}" to "${targetState}" is not allowed.`);
        return false;
      }

      // Проверка кастомной функции валидации
      if (!current.canTransitionTo(targetState, context)) {
        console.warn(`[StateMachine] Transition validation failed: ${this.currentState} → ${targetState}`);
        return false;
      }

      // Выход из текущего состояния
      console.log(`[StateMachine] Exiting state: ${this.currentState}`);
      current.onExit(context);
    }

    // Сохраняем историю
    if (this.currentState) {
      this.history.push({
        from: this.currentState,
        to: targetState,
        timestamp: Date.now(),
        context: { ...context }
      });
    }

    // Переход к новому состоянию
    const previousState = this.currentState;
    this.currentState = targetState;

    console.log(`[StateMachine] Entering state: ${targetState}`);
    target.onEnter(context);

    // Уведомляем слушателей
    this._notifyListeners({
      type: 'STATE_CHANGED',
      from: previousState,
      to: targetState,
      context
    });

    return true;
  }

  /**
   * Получить текущее состояние
   * @returns {string|null}
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Получить метаданные текущего состояния
   * @returns {Object}
   */
  getCurrentMetadata() {
    if (!this.currentState) return {};
    const state = this.states.get(this.currentState);
    return state ? state.metadata : {};
  }

  /**
   * Проверка возможности перехода к состоянию
   * @param {string} targetState
   * @param {Object} context
   * @returns {boolean}
   */
  canTransition(targetState, context = {}) {
    if (!this.currentState) return true;
    if (!this.states.has(targetState)) return false;

    const current = this.states.get(this.currentState);
    
    if (current.allowedTransitions.length > 0 && 
        !current.allowedTransitions.includes(targetState)) {
      return false;
    }

    return current.canTransitionTo(targetState, context);
  }

  /**
   * Получить историю переходов
   * @returns {Array}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Сброс машины состояний
   */
  reset() {
    if (this.currentState) {
      const current = this.states.get(this.currentState);
      current.onExit({});
    }

    this.currentState = null;
    this.history = [];
    
    this._notifyListeners({
      type: 'STATE_MACHINE_RESET'
    });

    console.log('[StateMachine] Reset complete.');
  }

  /**
   * Подписка на изменения состояния
   * @param {Function} callback
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Уведомление слушателей
   * @private
   */
  _notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[StateMachine] Listener error:', error);
      }
    });
  }

  /**
   * Сохранение состояния в localStorage
   * @param {string} key
   */
  saveToStorage(key = 'tutorial_state') {
    const data = {
      currentState: this.currentState,
      history: this.history,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[StateMachine] State saved to localStorage: ${key}`);
  }

  /**
   * Загрузка состояния из localStorage
   * @param {string} key
   * @returns {boolean}
   */
  loadFromStorage(key = 'tutorial_state') {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data) return false;

      this.history = data.history || [];
      
      if (data.currentState && this.states.has(data.currentState)) {
        this.transitionTo(data.currentState, { restored: true });
        console.log(`[StateMachine] State restored from localStorage: ${data.currentState}`);
        return true;
      }
    } catch (error) {
      console.error('[StateMachine] Failed to load from storage:', error);
    }
    return false;
  }
}

/**
 * ITutorialStep Interface (для TypeScript-подобной документации)
 * 
 * @interface ITutorialStep
 * @property {string} id - Уникальный идентификатор шага
 * @property {string} name - Человекочитаемое название
 * @property {Function} onEnter - Вызывается при входе в шаг
 * @property {Function} onExit - Вызывается при выходе из шага
 * @property {Function} validate - Проверка выполнения условий шага
 * @property {Array<string>} nextSteps - Возможные следующие шаги
 * @property {Object} metadata - Дополнительные данные (UI hints, требования и т.д.)
 */

export default TutorialStateMachine;
