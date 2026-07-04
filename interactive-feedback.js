/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (Оптимизированная v2)
   Использует делегирование событий для O(1) производительности
   ============================================ */

(function() {
    'use strict';

    // === КОНФИГУРАЦИЯ СЕЛЕКТОРОВ ===
    const CLICK_SELECTORS = [
        'button',
        '.btn',
        '[role="button"]',
        '.clickable',
        '.truck-card',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]',
        '[onclick*="viewTruck"]',
        'a[href]',
        '.tab',
        '[role="tab"]'
    ].join(', ');

    const HAPTIC_SELECTORS = [
        'button',
        '.btn',
        '[role="button"]',
        '.truck-card',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]'
    ].join(', ');

    // === ИНИЦИАЛИЗАЦИЯ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Делегированный визуальный feedback
        setupDelegatedClickFeedback();
        
        // Делегированная вибрация
        setupDelegatedHapticFeedback();
        
        // Индикатор загрузки (уже был делегированным, оставляем как есть)
        addLoadingIndicator();
    }

    // Переменная для отслеживания активного элемента при нажатии
    let activeFeedbackElement = null;

    function setupDelegatedClickFeedback() {
        // Mousedown / Touchstart - начало взаимодействия
        const startInteraction = (e) => {
            const element = e.target.closest?.(CLICK_SELECTORS);
            if (!element || element.disabled || element.hasAttribute('disabled')) return;

            activeFeedbackElement = element;
            element.classList.add('clicking');
        };

        // Mouseup / Touchend - конец взаимодействия
        const endInteraction = () => {
            if (!activeFeedbackElement) return;

            const element = activeFeedbackElement;
            activeFeedbackElement = null;

            setTimeout(() => {
                element.classList.remove('clicking');
            }, 300);
        };

        // Mouseleave / Touchcancel - прерывание взаимодействия
        const cancelInteraction = () => {
            if (!activeFeedbackElement) return;
            activeFeedbackElement.classList.remove('clicking');
            activeFeedbackElement = null;
        };

        // Слушатели на документе для делегирования
        document.addEventListener('mousedown', startInteraction);
        document.addEventListener('mouseup', endInteraction);
        document.addEventListener('touchstart', startInteraction, { passive: true });
        document.addEventListener('touchend', endInteraction);
        document.addEventListener('touchcancel', cancelInteraction);

        // Важно: отслеживаем уход мыши с элемента
        document.addEventListener('mouseout', (e) => {
            if (activeFeedbackElement && !activeFeedbackElement.contains(e.relatedTarget)) {
                cancelInteraction();
            }
        });
    }

    function setupDelegatedHapticFeedback() {
        if (!('vibrate' in navigator)) return;

        document.addEventListener('click', (e) => {
            const element = e.target.closest?.(HAPTIC_SELECTORS);
            if (element && !element.disabled && !element.hasAttribute('disabled')) {
                navigator.vibrate(20);
            }
        }, { passive: true });
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК (БЕЗ ИЗМЕНЕНИЙ) ===
    function addLoadingIndicator() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled) return;

            const hasAction = button.hasAttribute('onclick') || 
                            button.getAttribute('href') ||
                            button.closest('form');

            if (hasAction) {
                showButtonLoading(button);
            }
        }, true);
    }

    function showButtonLoading(button) {
        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;

        button.classList.add('btn-loading');
        button.style.minWidth = originalWidth + 'px';
        button.disabled = true;

        button.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <svg style="animation: spin 0.8s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <span style="opacity: 0.7;">Загрузка...</span>
            </span>
        `;

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.style.minWidth = '';
        }, 2000);
    }

    // === CSS АНИМАЦИИ ===
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        .clicking { animation: pulse-click 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .btn-loading { pointer-events: none; opacity: 0.8; }
        .truck-card.clicking, [class*="truck-card"].clicking {
            transform: scale(0.97) !important;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25) !important;
            filter: brightness(0.95) !important;
        }
        button.clicking, .btn.clicking {
            transform: scale(0.94) translateY(2px) !important;
            filter: brightness(0.9) !important;
        }
        button:not(.carousel-indicator), .btn, [role="button"], .clickable {
            overflow: hidden;
            position: relative;
        }
    `;
    document.head.appendChild(style);

    // === ЭКСПОРТ (для совместимости) ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {} // Теперь no-op, так как делегирование работает автоматически
    };

})();
