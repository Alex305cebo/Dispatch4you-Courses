/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Оптимизировано: Глобальное делегирование событий (O(1) вместо O(N))
   ============================================ */

(function() {
    'use strict';

    // Константы селекторов для быстрого поиска
    const CLICK_SELECTORS = 'button, .btn, [role="button"], .clickable, .truck-card, [onclick*="assignLoad"], [onclick*="selectLoad"], [onclick*="viewTruck"], a[href], .tab, [role="tab"]';
    const HAPTIC_SELECTORS = 'button, .btn, [role="button"], .truck-card, [onclick*="assignLoad"], [onclick*="selectLoad"]';

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Инициализируем глобальное делегирование событий
        initGlobalDelegation();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();

        // Внедряем стили
        injectStyles();
    }

    // === ГЛОБАЛЬНОЕ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===
    function initGlobalDelegation() {
        // Начало нажатия
        const handlePress = function(e) {
            const element = e.target.closest(CLICK_SELECTORS);
            if (element && !element.disabled && !element.hasAttribute('disabled')) {
                element.classList.add('clicking');
            }
        };

        // Конец нажатия (с небольшой задержкой для видимости анимации)
        const handleRelease = function() {
            const activeElements = document.querySelectorAll('.clicking');
            if (activeElements.length > 0) {
                setTimeout(() => {
                    activeElements.forEach(el => el.classList.remove('clicking'));
                }, 300);
            }
        };

        // Отмена при уходе курсора (mouseout для делегирования)
        const handleOut = function(e) {
            const element = e.target.closest('.clicking');
            if (element && !element.contains(e.relatedTarget)) {
                element.classList.remove('clicking');
            }
        };

        // Мышь
        document.addEventListener('mousedown', handlePress);
        document.addEventListener('mouseup', handleRelease);
        document.addEventListener('mouseout', handleOut);

        // Touch
        document.addEventListener('touchstart', handlePress, { passive: true });
        document.addEventListener('touchend', handleRelease, { passive: true });
        document.addEventListener('touchcancel', handleRelease, { passive: true });

        // Вибрация (Haptic Feedback)
        if ('vibrate' in navigator) {
            document.addEventListener('click', function(e) {
                const element = e.target.closest(HAPTIC_SELECTORS);
                if (element && !element.disabled && !element.hasAttribute('disabled')) {
                    navigator.vibrate(20);
                }
            }, { passive: true });
        }
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
    function addLoadingIndicator() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled || button.hasAttribute('disabled')) return;

            // Проверяем, есть ли действие (onclick, href, или кнопка формы)
            const hasAction = button.hasAttribute('onclick') || 
                            (button.tagName === 'A' && button.getAttribute('href') && !button.getAttribute('href').startsWith('#')) ||
                            (button.type === 'submit' && button.closest('form'));

            if (hasAction) {
                showButtonLoading(button);
            }
        }, true);
    }

    function showButtonLoading(button) {
        if (button.classList.contains('btn-loading')) return;

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

        // Восстанавливаем через 2 секунды (если навигация не произошла)
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.style.minWidth = '';
        }, 2000);
    }

    // === ВНЕДРЕНИЕ CSS ===
    function injectStyles() {
        if (document.getElementById('interactive-feedback-styles')) return;

        const style = document.createElement('style');
        style.id = 'interactive-feedback-styles';
        style.textContent = `
            @keyframes spin { to { transform: rotate(360deg); } }

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
    }

    // === ЭКСПОРТ И ОБРАТНАЯ СОВМЕСТИМОСТЬ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: function() { /* Больше не требуется благодаря делегированию */ }
    };

})();
