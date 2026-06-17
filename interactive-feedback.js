/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (ОПТИМИЗИРОВАНО BOLT ⚡)
   Использует глобальное делегирование событий для O(1) инициализации
   ============================================ */

(function() {
    'use strict';

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
        setupGlobalListeners();
        addLoadingIndicator();
    }

    function setupGlobalListeners() {
        // Добавление класса при взаимодействии
        const handleStart = (e) => {
            const el = e.target.closest(CLICK_SELECTORS);
            if (el && !el.disabled && !el.hasAttribute('disabled')) {
                el.classList.add('clicking');
            }
        };

        // Удаление класса с задержкой
        const handleEnd = (e) => {
            const el = e.target.closest(CLICK_SELECTORS);
            if (el) {
                setTimeout(() => el.classList.remove('clicking'), 300);
            }
        };

        // Немедленное удаление при уходе курсора
        const handleMoveOut = (e) => {
            const el = e.target.closest(CLICK_SELECTORS);
            if (el && !el.contains(e.relatedTarget)) {
                el.classList.remove('clicking');
            }
        };

        // Мышь
        document.addEventListener('mousedown', handleStart);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('mouseout', handleMoveOut);

        // Touch
        document.addEventListener('touchstart', handleStart, { passive: true });
        document.addEventListener('touchend', handleEnd, { passive: true });

        // Вибрация (Haptic)
        if ('vibrate' in navigator) {
            document.addEventListener('click', (e) => {
                const el = e.target.closest(HAPTIC_SELECTORS);
                if (el) {
                    navigator.vibrate(20);
                }
            }, { passive: true });
        }
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
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

    // === ЭКСПОРТ ===
    // reinit теперь пустая функция, так как делегирование работает автоматически
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {}
    };

})();
