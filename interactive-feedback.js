/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (Оптимизировано: Event Delegation)
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
        // Добавляем глобальную делегацию событий
        setupGlobalDelegation();
        
        // Добавляем визуальный индикатор загрузки (уже использует делегацию)
        addLoadingIndicator();
    }

    // === ГЛОБАЛЬНАЯ ДЕЛЕГАЦИЯ СОБЫТИЙ ===
    function setupGlobalDelegation() {
        // Визуальный feedback (mousedown/touchstart)
        document.addEventListener('mousedown', handleInteractionStart, { passive: true });
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });

        // Удаление feedback (mouseup/mouseleave/touchend)
        document.addEventListener('mouseup', handleInteractionEnd, { passive: true });
        document.addEventListener('touchend', handleInteractionEnd, { passive: true });
        document.addEventListener('touchcancel', handleInteractionEnd, { passive: true });

        // Для mouseleave на конкретном элементе при делегации используем mouseout с проверкой relatedTarget
        document.addEventListener('mouseout', function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (!element) return;

            // Если мы вышли за пределы элемента
            if (!e.relatedTarget || !element.contains(e.relatedTarget)) {
                element.classList.remove('clicking');
            }
        }, { passive: true });

        // Вибрация (click)
        document.addEventListener('click', handleHapticFeedback, { passive: true });
    }

    function handleInteractionStart(e) {
        const element = e.target.closest(CLICK_SELECTORS);
        if (!element || element.disabled || element.hasAttribute('disabled')) return;

        element.classList.add('clicking');
    }

    function handleInteractionEnd(e) {
        const element = e.target.closest(CLICK_SELECTORS);
        if (!element) return;

        setTimeout(() => {
            element.classList.remove('clicking');
        }, 300);
    }

    function handleHapticFeedback(e) {
        if (!('vibrate' in navigator)) return;

        const element = e.target.closest(HAPTIC_SELECTORS);
        if (!element || element.disabled || element.hasAttribute('disabled')) return;

        navigator.vibrate(20);
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
        reinit: function() { /* Теперь не требуется благодаря делегации */ }
    };

})();
