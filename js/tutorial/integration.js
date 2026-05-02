/**
 * integration.js
 * 
 * Интеграция системы обучения с существующей игрой.
 * Связывает TutorialManager с игровыми элементами и событиями.
 * 
 * Использование:
 * import { initTutorial } from './tutorial/integration.js';
 * initTutorial();
 */

import { TutorialManager } from './TutorialManager.js';

let tutorialManager = null;

/**
 * Инициализация системы обучения
 * @param {Object} gameContext - Контекст игры (опционально)
 */
export function initTutorial(gameContext = {}) {
  if (tutorialManager) {
    console.warn('[Integration] Tutorial already initialized.');
    return tutorialManager;
  }

  tutorialManager = new TutorialManager();

  // Проверяем нужно ли запускать обучение
  const shouldStartTutorial = checkTutorialConditions();

  if (shouldStartTutorial) {
    console.log('[Integration] Starting tutorial automatically.');
    tutorialManager.start();
  }

  // Экспортируем в глобальную область для отладки
  if (typeof window !== 'undefined') {
    window.tutorialManager = tutorialManager;
  }

  console.log('[Integration] Tutorial system initialized.');
  return tutorialManager;
}

/**
 * Проверка условий запуска обучения
 * @returns {boolean}
 */
function checkTutorialConditions() {
  // Не запускаем если обучение уже пройдено
  if (localStorage.getItem('tutorial_completed') === 'true') {
    console.log('[Integration] Tutorial already completed.');
    return false;
  }

  // Не запускаем если есть сохранённый прогресс игры
  const hasGameProgress = localStorage.getItem('game_session');
  if (hasGameProgress) {
    console.log('[Integration] Game progress detected, skipping tutorial.');
    return false;
  }

  // Проверяем что пользователь авторизован
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    console.log('[Integration] User not logged in, skipping tutorial.');
    return false;
  }

  // Проверяем что это первый запуск игры
  const isFirstLaunch = !localStorage.getItem('game_launched_before');
  if (isFirstLaunch) {
    localStorage.setItem('game_launched_before', 'true');
    return true;
  }

  return false;
}

/**
 * Интеграция с 2-колоночными документами
 * Добавляет интерактивность к полям документов для обучения
 */
export function integrateWithDocuments() {
  if (!tutorialManager) {
    console.warn('[Integration] Tutorial not initialized.');
    return;
  }

  // Находим все поля документов с классом .rc-field
  const docFields = document.querySelectorAll('.rc-field');
  
  docFields.forEach(field => {
    field.addEventListener('click', (e) => {
      const fieldName = field.dataset.section;
      const tooltip = field.dataset.tooltip;

      // Если обучение активно — регистрируем клик
      if (tutorialManager.isActive) {
        console.log(`[Integration] Document field clicked: ${fieldName}`);
      }

      // Показываем tooltip (работает и вне обучения)
      if (tooltip) {
        showDocumentTooltip(field, tooltip);
      }
    });
  });

  console.log(`[Integration] Integrated with ${docFields.length} document fields.`);
}

/**
 * Показать tooltip для поля документа
 * @param {HTMLElement} element
 * @param {string} text
 */
function showDocumentTooltip(element, text) {
  const tooltip = document.getElementById('rc-tooltip');
  if (!tooltip) return;

  tooltip.innerHTML = text;
  tooltip.style.display = 'block';

  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + 8}px`;
  tooltip.style.left = `${rect.left}px`;

  // Скрываем через 3 секунды
  setTimeout(() => {
    tooltip.style.display = 'none';
  }, 3000);
}

/**
 * Интеграция с игровыми кнопками
 * Добавляет обработчики для кнопок которые используются в обучении
 */
export function integrateWithGameButtons() {
  if (!tutorialManager) return;

  const buttonMappings = {
    '#start-shift-btn': 'start_shift',
    '#accept-load-btn': 'accept_load',
    '#send-dispatch-btn': 'send_dispatch',
    '#send-pod-btn': 'send_pod',
    '#start-game-btn': 'start_game'
  };

  Object.entries(buttonMappings).forEach(([selector, action]) => {
    const button = document.querySelector(selector);
    if (button) {
      button.addEventListener('click', () => {
        console.log(`[Integration] Game button clicked: ${action}`);
      });
    }
  });

  console.log('[Integration] Integrated with game buttons.');
}

/**
 * Интеграция с картой и траками
 * Добавляет обработчики для кликов по тракам на карте
 */
export function integrateWithMap() {
  if (!tutorialManager) return;

  // Слушаем клики по маркерам траков
  document.addEventListener('click', (e) => {
    const truckMarker = e.target.closest('.truck-marker');
    if (truckMarker && tutorialManager.isActive) {
      const truckId = truckMarker.dataset.truck;
      console.log(`[Integration] Truck marker clicked: ${truckId}`);
    }
  });

  console.log('[Integration] Integrated with map.');
}

/**
 * Создать кнопку управления обучением в UI
 */
export function createTutorialControls() {
  const controls = document.createElement('div');
  controls.id = 'tutorial-controls';
  controls.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    display: flex;
    gap: 8px;
    z-index: 999999;
  `;

  const startBtn = createControlButton('▶️ Начать обучение', () => {
    if (tutorialManager) {
      tutorialManager.start(true);
    }
  });

  const stopBtn = createControlButton('⏸️ Остановить', () => {
    if (tutorialManager) {
      tutorialManager.stop();
    }
  });

  const resetBtn = createControlButton('🔄 Сбросить', () => {
    if (tutorialManager && confirm('Сбросить прогресс обучения?')) {
      tutorialManager.reset();
    }
  });

  controls.appendChild(startBtn);
  controls.appendChild(stopBtn);
  controls.appendChild(resetBtn);

  document.body.appendChild(controls);

  console.log('[Integration] Tutorial controls created.');
}

/**
 * Создать кнопку управления
 * @param {string} label
 * @param {Function} onClick
 * @returns {HTMLElement}
 */
function createControlButton(label, onClick) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = `
    padding: 8px 16px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  `;

  btn.addEventListener('click', onClick);
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(6, 182, 212, 0.15)';
    btn.style.borderColor = 'rgba(6, 182, 212, 0.5)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(15, 23, 42, 0.95)';
    btn.style.borderColor = 'rgba(6, 182, 212, 0.3)';
  });

  return btn;
}

/**
 * Полная инициализация всех интеграций
 */
export function initializeAll() {
  const manager = initTutorial();
  
  // Ждём загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      integrateWithDocuments();
      integrateWithGameButtons();
      integrateWithMap();
      
      // Создаём контролы только в dev режиме
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        createTutorialControls();
      }
    });
  } else {
    integrateWithDocuments();
    integrateWithGameButtons();
    integrateWithMap();
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      createTutorialControls();
    }
  }

  return manager;
}

export default {
  initTutorial,
  integrateWithDocuments,
  integrateWithGameButtons,
  integrateWithMap,
  createTutorialControls,
  initializeAll
};
