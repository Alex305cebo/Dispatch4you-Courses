/**
 * TutorialManager.js
 * 
 * Главный оркестратор системы обучения.
 * Связывает State Machine, Data Layer и UI Controller.
 * 
 * Архитектура: Facade pattern — единая точка входа для всей системы.
 */

import { TutorialStateMachine } from './TutorialStateMachine.js';
import { TutorialUIController } from './TutorialUIController.js';
import { TUTORIAL_STEPS, MENTOR_CHARACTER, UI_HINTS } from './MentorshipData.js';

export class TutorialManager {
  constructor() {
    this.stateMachine = new TutorialStateMachine();
    this.uiController = new TutorialUIController();
    this.context = {
      clickedTrucks: new Set(),
      checkedFields: new Set(),
      loadAccepted: false,
      assignedTruck: null
    };
    this.isActive = false;

    this._initializeStates();
    this._setupEventListeners();

    console.log('[TutorialManager] Initialized.');
  }

  /**
   * Инициализация всех состояний из данных
   * @private
   */
  _initializeStates() {
    TUTORIAL_STEPS.forEach(step => {
      this.stateMachine.registerState(step.id, {
        onEnter: (context) => this._onStepEnter(step, context),
        onExit: (context) => this._onStepExit(step, context),
        canTransitionTo: (targetState, context) => {
          return this._validateStepCompletion(step, context);
        },
        allowedTransitions: step.nextSteps,
        metadata: {
          title: step.title,
          task: step.task,
          ui: step.ui
        }
      });
    });

    console.log(`[TutorialManager] Registered ${TUTORIAL_STEPS.length} tutorial steps.`);
  }

  /**
   * Настройка слушателей событий
   * @private
   */
  _setupEventListeners() {
    // Слушаем изменения состояния
    this.stateMachine.subscribe((event) => {
      if (event.type === 'STATE_CHANGED') {
        console.log(`[TutorialManager] State changed: ${event.from} → ${event.to}`);
        this._saveProgress();
      }
    });

    // Слушаем действия игрока в UI
    this.uiController.on('mentor_action', (data) => {
      this._handleMentorAction(data.actionId);
    });

    // Слушаем клики по элементам игры
    document.addEventListener('click', (e) => {
      if (!this.isActive) return;
      this._handleGameClick(e);
    });

    console.log('[TutorialManager] Event listeners set up.');
  }

  /**
   * Запуск обучения
   * @param {boolean} forceRestart - Принудительный перезапуск
   */
  start(forceRestart = false) {
    if (this.isActive) {
      console.warn('[TutorialManager] Tutorial already active.');
      return;
    }

    // Проверяем сохранённый прогресс
    if (!forceRestart && this.stateMachine.loadFromStorage('tutorial_progress')) {
      console.log('[TutorialManager] Resumed from saved progress.');
    } else {
      // Начинаем с первого шага
      this.stateMachine.transitionTo('STEP_1_WELCOME', this.context);
    }

    this.isActive = true;
    console.log('[TutorialManager] Tutorial started.');
  }

  /**
   * Остановка обучения
   */
  stop() {
    if (!this.isActive) return;

    this.uiController.cleanup();
    this.isActive = false;
    this._saveProgress();

    console.log('[TutorialManager] Tutorial stopped.');
  }

  /**
   * Сброс обучения
   */
  reset() {
    this.stateMachine.reset();
    this.uiController.cleanup();
    this.context = {
      clickedTrucks: new Set(),
      checkedFields: new Set(),
      loadAccepted: false,
      assignedTruck: null
    };
    localStorage.removeItem('tutorial_progress');
    this.isActive = false;

    console.log('[TutorialManager] Tutorial reset.');
  }

  /**
   * Пропустить обучение
   */
  skip() {
    this.stop();
    localStorage.setItem('tutorial_completed', 'true');
    console.log('[TutorialManager] Tutorial skipped.');
  }

  /**
   * Обработка входа в шаг
   * @private
   */
  _onStepEnter(step, context) {
    console.log(`[TutorialManager] Entering step: ${step.id}`);

    // Показываем диалог наставника
    this.uiController.showMentorDialog({
      title: step.title,
      message: step.mentorDialog,
      task: step.task,
      actions: this._getStepActions(step)
    });

    // Подсвечиваем UI элементы если нужно
    if (step.ui && step.ui.highlight) {
      setTimeout(() => {
        this.uiController.highlightElement(step.ui.highlight, {
          position: step.ui.position || 'top',
          pulse: step.ui.pulse || false,
          arrow: step.ui.arrow || false,
          message: step.ui.tooltip || ''
        });
      }, 500);
    }

    // Специальная логика для конкретных шагов
    this._executeStepLogic(step, context);
  }

  /**
   * Обработка выхода из шага
   * @private
   */
  _onStepExit(step, context) {
    console.log(`[TutorialManager] Exiting step: ${step.id}`);

    // Убираем подсветку
    if (step.ui && step.ui.highlight) {
      this.uiController.removeHighlight(step.ui.highlight);
    }

    // Скрываем диалог если переходим к следующему шагу
    this.uiController.hideMentorDialog();
  }

  /**
   * Валидация завершения шага
   * @private
   */
  _validateStepCompletion(step, context) {
    if (!step.validation) return true;

    switch (step.validation.type) {
      case 'button_click':
        // Проверяется в _handleGameClick
        return true;

      case 'element_click':
        // Проверяется в _handleGameClick
        return true;

      case 'custom':
        return step.validation.check(context);

      case 'time_based':
        // Автоматический переход через время
        setTimeout(() => {
          this._nextStep();
        }, step.validation.duration);
        return true;

      case 'choice':
        // Проверяется в _handleMentorAction
        return true;

      default:
        return true;
    }
  }

  /**
   * Получить кнопки действий для шага
   * @private
   */
  _getStepActions(step) {
    const actions = [];

    // Кнопка "Далее" для большинства шагов
    if (step.nextSteps.length > 0) {
      actions.push({
        id: 'next',
        label: step.id === 'STEP_1_WELCOME' ? 'Начать смену' : 'Продолжить',
        primary: true
      });
    }

    // Кнопка "Пропустить" для всех шагов кроме последнего
    if (step.id !== 'STEP_11_TUTORIAL_COMPLETE') {
      actions.push({
        id: 'skip',
        label: 'Пропустить обучение',
        primary: false
      });
    }

    // Специальные кнопки для шагов с выбором
    if (step.ui && step.ui.options) {
      return step.ui.options.map(opt => ({
        id: opt.id,
        label: opt.text,
        primary: false
      }));
    }

    return actions;
  }

  /**
   * Обработка действий в диалоге наставника
   * @private
   */
  _handleMentorAction(actionId) {
    console.log(`[TutorialManager] Mentor action: ${actionId}`);

    if (actionId === 'skip') {
      this.skip();
      return;
    }

    if (actionId === 'next') {
      this._nextStep();
      return;
    }

    // Обработка выбора в шагах с вариантами
    const currentStep = TUTORIAL_STEPS.find(s => s.id === this.stateMachine.getCurrentState());
    if (currentStep && currentStep.validation && currentStep.validation.type === 'choice') {
      if (actionId === currentStep.validation.correctChoice) {
        console.log('[TutorialManager] Correct choice!');
        setTimeout(() => this._nextStep(), 1000);
      } else {
        console.log('[TutorialManager] Wrong choice.');
        // Можно показать подсказку
      }
    }
  }

  /**
   * Обработка кликов по элементам игры
   * @private
   */
  _handleGameClick(event) {
    const currentStep = TUTORIAL_STEPS.find(s => s.id === this.stateMachine.getCurrentState());
    if (!currentStep || !currentStep.validation) return;

    const target = event.target.closest(currentStep.validation.target || '');
    if (!target) return;

    console.log('[TutorialManager] Game element clicked:', currentStep.validation.target);

    // Обработка специфичных кликов
    switch (currentStep.id) {
      case 'STEP_2_MORNING_BRIEFING':
        // Клик по траку
        if (target.classList.contains('truck-marker')) {
          const truckId = target.dataset.truck;
          this.context.clickedTrucks.add(truckId);
          console.log(`[TutorialManager] Truck clicked: ${truckId}`);
          
          if (this.context.clickedTrucks.size >= 3) {
            setTimeout(() => this._nextStep(), 1000);
          }
        }
        break;

      case 'STEP_4_RATE_CON_REVIEW':
        // Клик по полю документа
        if (target.classList.contains('rc-field')) {
          const fieldName = target.dataset.section;
          this.context.checkedFields.add(fieldName);
          console.log(`[TutorialManager] Field checked: ${fieldName}`);
          
          if (this.context.checkedFields.size >= 5) {
            setTimeout(() => this._nextStep(), 1000);
          }
        }
        break;

      default:
        // Обычный клик по кнопке
        if (currentStep.validation.type === 'button_click') {
          setTimeout(() => this._nextStep(), 500);
        }
    }
  }

  /**
   * Выполнение специфичной логики шага
   * @private
   */
  _executeStepLogic(step, context) {
    switch (step.id) {
      case 'STEP_7_MONITOR_PROGRESS':
        // Симуляция движения трака
        this._simulateTruckMovement();
        break;

      case 'STEP_8_DRIVER_QUESTION':
        // Показываем сообщение от водителя
        this._showDriverMessage();
        break;

      // Добавить другую специфичную логику здесь
    }
  }

  /**
   * Переход к следующему шагу
   * @private
   */
  _nextStep() {
    const currentStep = TUTORIAL_STEPS.find(s => s.id === this.stateMachine.getCurrentState());
    if (!currentStep || currentStep.nextSteps.length === 0) {
      console.log('[TutorialManager] Tutorial completed!');
      this.stop();
      localStorage.setItem('tutorial_completed', 'true');
      return;
    }

    const nextStepId = currentStep.nextSteps[0];
    this.stateMachine.transitionTo(nextStepId, this.context);
  }

  /**
   * Сохранение прогресса
   * @private
   */
  _saveProgress() {
    this.stateMachine.saveToStorage('tutorial_progress');
  }

  /**
   * Симуляция движения трака (для демонстрации)
   * @private
   */
  _simulateTruckMovement() {
    console.log('[TutorialManager] Simulating truck movement...');
    // Здесь будет интеграция с игровой логикой
  }

  /**
   * Показать сообщение от водителя
   * @private
   */
  _showDriverMessage() {
    console.log('[TutorialManager] Showing driver message...');
    // Здесь будет интеграция с системой сообщений
  }

  /**
   * Получить текущий прогресс
   * @returns {Object}
   */
  getProgress() {
    return {
      currentStep: this.stateMachine.getCurrentState(),
      totalSteps: TUTORIAL_STEPS.length,
      completedSteps: this.stateMachine.getHistory().length,
      context: { ...this.context }
    };
  }

  /**
   * Проверка завершения обучения
   * @returns {boolean}
   */
  isCompleted() {
    return localStorage.getItem('tutorial_completed') === 'true';
  }
}

export default TutorialManager;
