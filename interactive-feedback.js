/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Добавляет визуальные и звуковые эффекты при клике
   ============================================ */

(function() {
    'use strict';

    // === КОНФИГУРАЦИЯ ===
    const SELECTORS = [
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInteractiveFeedback);
    } else {
        initInteractiveFeedback();
    }

    function initInteractiveFeedback() {
        // Используем делегирование событий на уровне документа для O(1) инициализации
        // и автоматической поддержки динамических элементов без MutationObserver.
        addDelegatedFeedback();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();

        // Добавляем CSS анимации
        injectStyles();
    }

    // === ДЕЛЕГИРОВАННЫЙ FEEDBACK ===
    function addDelegatedFeedback() {
        // Mouse Events
        document.addEventListener('mousedown', function(e) {
            const target = e.target.closest(SELECTORS);
            if (target && !target.disabled && !target.hasAttribute('disabled')) {
                target.classList.add('clicking');
            }
        });

        document.addEventListener('mouseup', function(e) {
            const target = e.target.closest(SELECTORS);
            if (target) {
                setTimeout(() => {
                    target.classList.remove('clicking');
                }, 300);
            }
        });

        // Предотвращаем залипание при уходе мыши
        document.addEventListener('mouseout', function(e) {
            // Если мы действительно покинули элемент (а не перешли на дочерний)
            const target = e.target.closest(SELECTORS);
            if (target && e.relatedTarget && !target.contains(e.relatedTarget)) {
                target.classList.remove('clicking');
            }
        });

        // Touch Events
        document.addEventListener('touchstart', function(e) {
            const target = e.target.closest(SELECTORS);
            if (target && !target.disabled && !target.hasAttribute('disabled')) {
                target.classList.add('clicking');
            }
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            const target = e.target.closest(SELECTORS);
            if (target) {
                setTimeout(() => {
                    target.classList.remove('clicking');
                }, 300);
            }
        }, { passive: true });

        // Haptic Feedback (Vibration)
        document.addEventListener('click', function(e) {
            if (!('vibrate' in navigator)) return;

            const target = e.target.closest(HAPTIC_SELECTORS);
            if (target && !target.disabled && !target.hasAttribute('disabled')) {
                navigator.vibrate(20);
            }
        }, { passive: true });
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
    function addLoadingIndicator() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled || button.hasAttribute('disabled')) return;

            // Проверяем, есть ли действие
            const hasAction = button.hasAttribute('onclick') || 
                            button.getAttribute('href') ||
                            button.closest('form');

            if (hasAction) {
                showButtonLoading(button);
            }
        }, true); // Используем capture для приоритета
    }

    function showButtonLoading(button) {
        if (button.classList.contains('btn-loading')) return;

        // Сохраняем оригинальный контент
        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;

        // Добавляем класс загрузки
        button.classList.add('btn-loading');
        button.style.minWidth = originalWidth + 'px';
        button.disabled = true;

        // Показываем спиннер
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <svg style="animation: spin 0.8s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <span style="opacity: 0.7;">Загрузка...</span>
            </span>
        `;

        // Восстанавливаем через 2 секунды (если страница не перезагрузилась)
        setTimeout(() => {
            if (button.parentNode) { // Проверка, что элемент все еще в DOM
                button.innerHTML = originalContent;
                button.disabled = false;
                button.classList.remove('btn-loading');
                button.style.minWidth = '';
            }
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

            .btn-loading {
                pointer-events: none;
                opacity: 0.8;
            }

            /* Улучшенный feedback для карточек */
            .truck-card.clicking,
            [class*="truck-card"].clicking {
                transform: scale(0.97) !important;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25) !important;
                filter: brightness(0.95) !important;
            }

            /* Улучшенный feedback для кнопок */
            button.clicking,
            .btn.clicking {
                transform: scale(0.94) translateY(2px) !important;
                filter: brightness(0.9) !important;
            }

            /* Overflow для ripple эффекта */
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

    // === ЭКСПОРТ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {} // Теперь не требуется, оставлено для обратной совместимости
    };

})();
