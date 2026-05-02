/**
 * TutorialUIController.js
 * 
 * Event-Driven UI система для визуализации обучения.
 * Отвечает за подсветку элементов, показ диалогов наставника и анимации.
 * 
 * Архитектура: Observer pattern + Event Bus для связи с State Machine.
 */

export class TutorialUIController {
  constructor() {
    this.activeHighlights = new Set();
    this.mentorDialog = null;
    this.tooltip = null;
    this.overlay = null;
    this.eventBus = new Map();
    
    this._initializeUI();
  }

  /**
   * Инициализация UI элементов
   * @private
   */
  _initializeUI() {
    // Создаём overlay для затемнения фона
    this.overlay = document.createElement('div');
    this.overlay.id = 'tutorial-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999990;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      display: none;
    `;

    // Создаём диалоговое окно наставника
    this.mentorDialog = document.createElement('div');
    this.mentorDialog.id = 'mentor-dialog';
    this.mentorDialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      max-width: 600px;
      width: 90%;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
      border: 2px solid rgba(6, 182, 212, 0.4);
      border-radius: 24px;
      padding: 32px;
      z-index: 999995;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: none;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(20px);
    `;

    // Создаём tooltip для подсказок
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'tutorial-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: rgba(15, 23, 42, 0.97);
      border: 1px solid rgba(6, 182, 212, 0.35);
      border-radius: 12px;
      padding: 12px 16px;
      max-width: 280px;
      z-index: 999996;
      opacity: 0;
      transition: opacity 0.25s ease;
      display: none;
      pointer-events: none;
      font-size: 13px;
      color: #e2e8f0;
      line-height: 1.5;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.mentorDialog);
    document.body.appendChild(this.tooltip);

    console.log('[TutorialUI] UI elements initialized.');
  }

  /**
   * Показать диалог наставника
   * @param {Object} config
   * @param {string} config.title - Заголовок
   * @param {string} config.message - Текст наставника
   * @param {string} config.task - Задача для игрока
   * @param {Array} config.actions - Кнопки действий
   */
  showMentorDialog({ title, message, task, actions = [] }) {
    // Показываем overlay
    this.overlay.style.display = 'block';
    setTimeout(() => {
      this.overlay.style.opacity = '1';
    }, 10);

    // Формируем HTML диалога
    const actionsHTML = actions.map(action => `
      <button 
        class="mentor-action-btn" 
        data-action="${action.id}"
        style="
          padding: 12px 24px;
          background: ${action.primary ? 'linear-gradient(135deg, #06b6d4, #0ea5e9)' : 'rgba(255, 255, 255, 0.05)'};
          border: ${action.primary ? 'none' : '1px solid rgba(255, 255, 255, 0.15)'};
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: ${action.primary ? '700' : '600'};
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        "
      >
        ${action.label}
      </button>
    `).join('');

    this.mentorDialog.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div style="font-size: 48px; line-height: 1;">👨‍💼</div>
        <div>
          <div style="font-size: 12px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
            Майк · Старший диспетчер
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #fff;">
            ${title}
          </div>
        </div>
      </div>
      
      <div style="font-size: 15px; color: #e2e8f0; line-height: 1.7; margin-bottom: 20px; white-space: pre-line;">
        ${message}
      </div>
      
      ${task ? `
        <div style="
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.1));
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 24px;
        ">
          <div style="font-size: 11px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            📋 Твоя задача
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #fff;">
            ${task}
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        ${actionsHTML}
      </div>
    `;

    // Показываем диалог с анимацией
    this.mentorDialog.style.display = 'block';
    setTimeout(() => {
      this.mentorDialog.style.opacity = '1';
      this.mentorDialog.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    // Подписываемся на клики по кнопкам
    this.mentorDialog.querySelectorAll('.mentor-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actionId = e.target.dataset.action;
        this._emit('mentor_action', { actionId });
      });
    });

    console.log('[TutorialUI] Mentor dialog shown:', title);
  }

  /**
   * Скрыть диалог наставника
   */
  hideMentorDialog() {
    this.mentorDialog.style.opacity = '0';
    this.mentorDialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
    this.overlay.style.opacity = '0';

    setTimeout(() => {
      this.mentorDialog.style.display = 'none';
      this.overlay.style.display = 'none';
    }, 300);

    console.log('[TutorialUI] Mentor dialog hidden.');
  }

  /**
   * Подсветить элемент на странице
   * @param {string} selector - CSS селектор элемента
   * @param {Object} options
   * @param {string} options.position - Позиция tooltip (top/bottom/left/right)
   * @param {boolean} options.pulse - Пульсирующая анимация
   * @param {boolean} options.arrow - Показать стрелку
   * @param {string} options.message - Текст подсказки
   */
  highlightElement(selector, options = {}) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`[TutorialUI] Element not found: ${selector}`);
      return;
    }

    // Создаём highlight wrapper
    const highlight = document.createElement('div');
    highlight.className = 'tutorial-highlight';
    highlight.dataset.selector = selector;

    const rect = element.getBoundingClientRect();
    const padding = 8;

    highlight.style.cssText = `
      position: fixed;
      top: ${rect.top - padding}px;
      left: ${rect.left - padding}px;
      width: ${rect.width + padding * 2}px;
      height: ${rect.height + padding * 2}px;
      border: 3px solid #06b6d4;
      border-radius: 12px;
      z-index: 999993;
      pointer-events: none;
      box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.2), 0 0 0 9999px rgba(0, 0, 0, 0.6);
      transition: all 0.3s ease;
      ${options.pulse ? 'animation: tutorial-pulse 2s infinite;' : ''}
    `;

    // Добавляем стрелку если нужно
    if (options.arrow) {
      const arrow = document.createElement('div');
      arrow.style.cssText = `
        position: absolute;
        ${options.position === 'bottom' ? 'top: -20px;' : 'bottom: -20px;'}
        left: 50%;
        transform: translateX(-50%) ${options.position === 'bottom' ? 'rotate(180deg)' : ''};
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 15px solid #06b6d4;
      `;
      highlight.appendChild(arrow);
    }

    document.body.appendChild(highlight);
    this.activeHighlights.add(highlight);

    // Показываем tooltip если есть сообщение
    if (options.message) {
      this.showTooltip(element, options.message, options.position || 'top');
    }

    // Делаем элемент кликабельным
    element.style.position = 'relative';
    element.style.zIndex = '999994';
    element.style.pointerEvents = 'auto';

    console.log('[TutorialUI] Element highlighted:', selector);
  }

  /**
   * Убрать подсветку с элемента
   * @param {string} selector
   */
  removeHighlight(selector) {
    this.activeHighlights.forEach(highlight => {
      if (highlight.dataset.selector === selector) {
        highlight.remove();
        this.activeHighlights.delete(highlight);
      }
    });

    const element = document.querySelector(selector);
    if (element) {
      element.style.zIndex = '';
      element.style.pointerEvents = '';
    }

    this.hideTooltip();
    console.log('[TutorialUI] Highlight removed:', selector);
  }

  /**
   * Убрать все подсветки
   */
  clearAllHighlights() {
    this.activeHighlights.forEach(highlight => highlight.remove());
    this.activeHighlights.clear();
    this.hideTooltip();
    console.log('[TutorialUI] All highlights cleared.');
  }

  /**
   * Показать tooltip возле элемента
   * @param {HTMLElement} element
   * @param {string} message
   * @param {string} position
   */
  showTooltip(element, message, position = 'top') {
    const rect = element.getBoundingClientRect();
    this.tooltip.textContent = message;
    this.tooltip.style.display = 'block';

    // Позиционируем tooltip
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let top, left;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 12;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 12;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 12;
        break;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;

    setTimeout(() => {
      this.tooltip.style.opacity = '1';
    }, 10);
  }

  /**
   * Скрыть tooltip
   */
  hideTooltip() {
    this.tooltip.style.opacity = '0';
    setTimeout(() => {
      this.tooltip.style.display = 'none';
    }, 250);
  }

  /**
   * Подписка на события UI
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (!this.eventBus.has(eventName)) {
      this.eventBus.set(eventName, new Set());
    }
    this.eventBus.get(eventName).add(callback);

    return () => {
      this.eventBus.get(eventName).delete(callback);
    };
  }

  /**
   * Отправка события
   * @private
   */
  _emit(eventName, data) {
    if (this.eventBus.has(eventName)) {
      this.eventBus.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[TutorialUI] Event handler error (${eventName}):`, error);
        }
      });
    }
  }

  /**
   * Очистка всех UI элементов
   */
  cleanup() {
    this.hideMentorDialog();
    this.clearAllHighlights();
    this.hideTooltip();
    console.log('[TutorialUI] Cleanup complete.');
  }
}

// CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes tutorial-pulse {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.2), 0 0 0 9999px rgba(0, 0, 0, 0.6);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(6, 182, 212, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.6);
    }
  }

  .mentor-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
  }

  @media (max-width: 768px) {
    #mentor-dialog {
      max-width: 90%;
      padding: 24px;
    }
  }
`;
document.head.appendChild(style);

export default TutorialUIController;
