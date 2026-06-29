/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Добавляет визуальные и звуковые эффекты при клике
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
    ];

    const HAPTIC_SELECTORS = [
        'button',
        '.btn',
        '[role="button"]',
        '.truck-card',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]'
    ];

    // Глобальное состояние для отслеживания активного элемента
    let activeFeedbackElement = null;

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Добавляем глобальные обработчики (Event Delegation)
        setupVisualFeedback();
        
        // Добавляем вибрацию на мобильных устройствах
        setupHapticFeedback();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();
    }

    // === ВИЗУАЛЬНЫЙ FEEDBACK ПРИ КЛИКЕ (DELEGATED) ===
    function setupVisualFeedback() {
        const selectorStr = CLICK_SELECTORS.join(', ');

        const clearFeedback = (el, withDelay) => {
            if (!el) return;
            if (withDelay) {
                const target = el;
                setTimeout(() => {
                    target.classList.remove('clicking');
                }, 300);
            } else {
                el.classList.remove('clicking');
            }
            if (activeFeedbackElement === el) activeFeedbackElement = null;
        };

        // Обработка начала нажатия
        const startInteraction = (e) => {
            const target = e.target.closest(selectorStr);
            if (!target || target.disabled || target.hasAttribute('disabled')) return;

            // Если есть другой активный элемент, сбрасываем его
            if (activeFeedbackElement && activeFeedbackElement !== target) {
                clearFeedback(activeFeedbackElement, false);
            }

            target.classList.add('clicking');
            activeFeedbackElement = target;
        };

        // Обработка завершения нажатия
        const endInteraction = (e) => {
            if (activeFeedbackElement) {
                clearFeedback(activeFeedbackElement, true);
            }
        };

        // Обработка ухода курсора (эмуляция mouseleave через delegation)
        const handleMouseOut = (e) => {
            if (!activeFeedbackElement) return;

            // Проверяем, действительно ли мы вышли за пределы активного элемента
            if (!activeFeedbackElement.contains(e.relatedTarget)) {
                clearFeedback(activeFeedbackElement, false);
            }
        };

        // Mouse events
        document.addEventListener('mousedown', startInteraction);
        document.addEventListener('mouseup', endInteraction);
        document.addEventListener('mouseout', handleMouseOut);

        // Touch events
        document.addEventListener('touchstart', startInteraction, { passive: true });
        document.addEventListener('touchend', endInteraction);
        document.addEventListener('touchcancel', endInteraction);
    }

    // === ВИБРАЦИЯ НА МОБИЛЬНЫХ (DELEGATED) ===
    function setupHapticFeedback() {
        if (!('vibrate' in navigator)) return;

        const selectorStr = HAPTIC_SELECTORS.join(', ');

        document.addEventListener('click', function(e) {
            const target = e.target.closest(selectorStr);
            if (target && !target.disabled && !target.hasAttribute('disabled')) {
                navigator.vibrate(20);
            }
        }, { passive: true });
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
    function addLoadingIndicator() {
        // Перехватываем клики на кнопках с onclick
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled) return;

            // Проверяем, есть ли onclick или это навигация
            const hasAction = button.hasAttribute('onclick') || 
                            button.getAttribute('href') ||
                            button.closest('form');

            if (hasAction) {
                showButtonLoading(button);
            }
        }, true);
    }

    function showButtonLoading(button) {
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
            to {
                transform: rotate(360deg);
            }
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

        /* Overflow для ripple эффекта — не трогаем индикаторы карусели */
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
        reinit: function() { /* No-op: delegation handles dynamic elements */ }
    };

})();
