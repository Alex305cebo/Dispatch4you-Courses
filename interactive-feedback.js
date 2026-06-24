/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Добавляет визуальные и звуковые эффекты при клике
   ============================================ */

(function() {
    'use strict';

    // === КОНСТАНТЫ СЕЛЕКТОРОВ ===
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

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Добавляем глобальные обработчики (делегирование)
        addClickFeedback();
        addHapticFeedback();
        addLoadingIndicator();
    }

    // === ВИЗУАЛЬНЫЙ FEEDBACK ПРИ КЛИКЕ (Делегирование) ===
    function addClickFeedback() {
        // Нажатие (мышь)
        document.addEventListener('mousedown', function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (!element || element.disabled || element.hasAttribute('disabled')) return;
            element.classList.add('clicking');
        });

        // Отпускание (мышь)
        document.addEventListener('mouseup', function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (element) {
                setTimeout(() => {
                    element.classList.remove('clicking');
                }, 300);
            }
        });

        // Уход курсора
        document.addEventListener('mouseout', function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (element && !element.contains(e.relatedTarget)) {
                element.classList.remove('clicking');
            }
        });

        // Touch события для мобильных
        document.addEventListener('touchstart', function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (!element || element.disabled || element.hasAttribute('disabled')) return;
            element.classList.add('clicking');
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (element) {
                setTimeout(() => {
                    element.classList.remove('clicking');
                }, 300);
            }
        }, { passive: true });
    }

    // === ВИБРАЦИЯ НА МОБИЛЬНЫХ (Делегирование) ===
    function addHapticFeedback() {
        if (!('vibrate' in navigator)) return;

        document.addEventListener('click', function(e) {
            const element = e.target.closest(HAPTIC_SELECTORS);
            if (element) {
                // Более заметная вибрация (20ms)
                navigator.vibrate(20);
            }
        }, { passive: true });
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК (Уже использует делегирование) ===
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

    // === ДОБАВЛЯЕМ CSS АНИМАЦИИ ===
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

    // === ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ СКРИПТАХ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: function() { /* Делегирование работает автоматически */ }
    };

})();
