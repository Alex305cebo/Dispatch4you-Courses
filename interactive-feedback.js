/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (ОПТИМИЗИРОВАНО)
   Добавляет визуальные и звуковые эффекты при клике через делегирование событий
   ============================================ */

(function() {
    'use strict';

    // Константы селекторов
    const CLICK_SELECTORS = 'button, .btn, [role="button"], .clickable, .truck-card, [onclick*="assignLoad"], [onclick*="selectLoad"], [onclick*="viewTruck"], a[href], .tab, [role="tab"]';
    const HAPTIC_SELECTORS = 'button, .btn, [role="button"], .truck-card, [onclick*="assignLoad"], [onclick*="selectLoad"]';

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Использование делегирования событий на уровне документа (O(1) инициализация)
        setupGlobalFeedbackListeners();
        
        // Индикатор загрузки уже использует делегирование
        addLoadingIndicator();
    }

    // === ЦЕНТРАЛИЗОВАННОЕ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===
    function setupGlobalFeedbackListeners() {
        // Mousedown / Touchstart: Добавление класса 'clicking'
        const handleDown = (e) => {
            const el = e.target.closest(CLICK_SELECTORS);
            if (el && !el.disabled && !el.hasAttribute('disabled')) {
                el.classList.add('clicking');
            }
        };

        // Mouseup / Touchend: Удаление класса 'clicking' с задержкой
        const handleUp = (e) => {
            const el = e.target.closest(CLICK_SELECTORS);
            if (el) {
                setTimeout(() => {
                    el.classList.remove('clicking');
                }, 300);
            }
        };

        // Mouseleave: Удаление класса 'clicking' при уходе курсора
        const handleLeave = (e) => {
            const el = e.target.closest(CLICK_SELECTORS);
            if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) {
                el.classList.remove('clicking');
            }
        };

        // Клик: Вибрация на мобильных
        const handleClick = (e) => {
            if (!('vibrate' in navigator)) return;
            const el = e.target.closest(HAPTIC_SELECTORS);
            if (el) {
                navigator.vibrate(20);
            }
        };

        // Слушатели на уровне документа
        document.addEventListener('mousedown', handleDown, true);
        document.addEventListener('mouseup', handleUp, true);
        document.addEventListener('mouseout', handleLeave, true);

        document.addEventListener('touchstart', handleDown, { passive: true, capture: true });
        document.addEventListener('touchend', handleUp, { passive: true, capture: true });

        document.addEventListener('click', handleClick, { passive: true, capture: true });
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
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .clicking {
            animation: pulse-click 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .btn-loading {
            pointer-events: none;
            opacity: 0.8;
        }

        .truck-card.clicking,
        [class*="truck-card"].clicking {
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

    // Экспорт для совместимости: MutationObserver больше не нужен,
    // так как делегирование автоматически обрабатывает новые элементы.
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {} // Теперь это no-op
    };

})();
