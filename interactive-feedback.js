/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (ОПТИМИЗИРОВАННАЯ)
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
        setupEventDelegation();
        addLoadingIndicator();
        injectStyles();
    }

    // === ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===
    function setupEventDelegation() {
        // Для отслеживания текущего активного элемента
        let activeFeedbackElement = null;

        const startFeedback = (e) => {
            const target = e.target.closest?.(CLICK_SELECTORS);
            if (!target || target.disabled || target.hasAttribute('disabled')) return;

            activeFeedbackElement = target;
            target.classList.add('clicking');
        };

        const endFeedback = () => {
            if (!activeFeedbackElement) return;
            const el = activeFeedbackElement;
            activeFeedbackElement = null;

            setTimeout(() => {
                el.classList.remove('clicking');
            }, 300);
        };

        // Начало взаимодействия
        document.addEventListener('mousedown', startFeedback, { passive: true });
        document.addEventListener('touchstart', startFeedback, { passive: true });

        // Конец взаимодействия
        document.addEventListener('mouseup', endFeedback, { passive: true });
        document.addEventListener('touchend', endFeedback, { passive: true });
        document.addEventListener('touchcancel', endFeedback, { passive: true });

        // Уход курсора
        document.addEventListener('mouseout', (e) => {
            if (!activeFeedbackElement) return;
            // Проверяем, действительно ли ушли за границы элемента
            if (!activeFeedbackElement.contains(e.relatedTarget)) {
                activeFeedbackElement.classList.remove('clicking');
                activeFeedbackElement = null;
            }
        }, { passive: true });

        // Вибрация
        document.addEventListener('click', (e) => {
            if (!('vibrate' in navigator)) return;
            const target = e.target.closest?.(HAPTIC_SELECTORS);
            if (target) {
                navigator.vibrate(20);
            }
        }, { passive: true });
    }

    // === ИНДИКАТОР ЗАГРУЗКИ (УЖЕ ИСПОЛЬЗУЕТ ДЕЛЕГИРОВАНИЕ) ===
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

    function injectStyles() {
        if (document.getElementById('interactive-feedback-styles')) return;
        const style = document.createElement('style');
        style.id = 'interactive-feedback-styles';
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
    }

    // === ЭКСПОРТ И СОВМЕСТИМОСТЬ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {} // Теперь не требуется благодаря делегированию
    };
})();
