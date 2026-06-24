/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   ⚡ Bolt Optimized: Global Event Delegation
   ============================================ */

(function() {
    'use strict';

    const SELECTORS = [
        'button',
        '.btn',
        '[role="button"]',
        '.clickable',
        '.truck-card',
        '.benefit-card',
        '.profession-card',
        '.feature-card',
        'a[href]',
        '.tab',
        '[role="tab"]',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]',
        '[onclick*="viewTruck"]'
    ].join(', ');

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        setupGlobalListeners();
        addLoadingIndicator();
        injectStyles();
    }

    // === ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ (Event Delegation) ===
    function setupGlobalListeners() {
        // Обработка нажатия (Click feedback)
        document.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });

        // Обработка отпускания
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('touchend', handleInteractionEnd);

        // Снятие состояния при уходе курсора (аналог mouseleave через делегирование)
        document.addEventListener('mouseout', (e) => {
            const element = e.target.closest(SELECTORS);
            if (element && !element.contains(e.relatedTarget)) {
                element.classList.remove('clicking');
            }
        });

        // Haptic feedback (Vibration)
        if ('vibrate' in navigator) {
            document.addEventListener('click', (e) => {
                const element = e.target.closest(SELECTORS);
                if (element && !element.disabled) {
                    navigator.vibrate(20);
                }
            });
        }
    }

    function handleInteractionStart(e) {
        const element = e.target.closest(SELECTORS);
        if (element && !element.disabled && !element.hasAttribute('disabled')) {
            element.classList.add('clicking');
        }
    }

    function handleInteractionEnd(e) {
        const element = e.target.closest(SELECTORS);
        if (element) {
            setTimeout(() => {
                element.classList.remove('clicking');
            }, 300);
        }
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
    function addLoadingIndicator() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled || button.classList.contains('btn-loading')) return;

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

    // === ДОБАВЛЯЕМ CSS АНИМАЦИИ ===
    function injectStyles() {
        if (document.getElementById('interactive-feedback-styles')) return;

        const style = document.createElement('style');
        style.id = 'interactive-feedback-styles';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .clicking {
                animation: pulse-click 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            @keyframes pulse-click {
                0% { transform: scale(1); }
                50% { transform: scale(0.96); }
                100% { transform: scale(1); }
            }

            .btn-loading {
                pointer-events: none;
                opacity: 0.8;
            }

            .truck-card.clicking,
            .benefit-card.clicking,
            .profession-card.clicking,
            .feature-card.clicking {
                transform: scale(0.97) !important;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25) !important;
                filter: brightness(0.95) !important;
            }

            button.clicking,
            .btn.clicking {
                transform: scale(0.94) translateY(2px) !important;
                filter: brightness(0.9) !important;
            }

            button:not(.carousel-indicator),
            .btn,
            [role="button"],
            .clickable {
                overflow: hidden;
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }

    // === ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ СКРИПТАХ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => { /* No-op: now uses delegation */ }
    };

})();
