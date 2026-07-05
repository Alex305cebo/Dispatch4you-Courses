/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Добавляет визуальные и звуковые эффекты при клике
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

    let activeFeedbackElement = null;

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Использование глобального делегирования событий (O(1) инициализация)
        // Это заменяет O(N) сканирование DOM и MutationObserver
        setupDelegatedFeedback();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();
    }

    function setupDelegatedFeedback() {
        // Визуальный feedback
        document.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('mouseout', handleMouseOut);

        // Touch события для мобильных
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });
        document.addEventListener('touchend', handleInteractionEnd, { passive: true });
        document.addEventListener('touchcancel', handleInteractionEnd, { passive: true });

        // Вибрация (Haptic)
        if ('vibrate' in navigator) {
            document.addEventListener('click', handleHaptic, { passive: true });
        }
    }

    function handleInteractionStart(e) {
        const el = e.target.closest?.(CLICK_SELECTORS);
        if (el && !el.disabled && !el.hasAttribute('disabled')) {
            el.classList.add('clicking');
            activeFeedbackElement = el;
        }
    }

    function handleInteractionEnd() {
        if (activeFeedbackElement) {
            const el = activeFeedbackElement;
            activeFeedbackElement = null;
            setTimeout(() => {
                el.classList.remove('clicking');
            }, 300);
        }
    }

    function handleMouseOut(e) {
        if (activeFeedbackElement && e.type === 'mouseout') {
            // Проверяем, действительно ли мы вышли за пределы элемента
            if (!activeFeedbackElement.contains(e.relatedTarget)) {
                activeFeedbackElement.classList.remove('clicking');
                activeFeedbackElement = null;
            }
        }
    }

    function handleHaptic(e) {
        const el = e.target.closest?.(HAPTIC_SELECTORS);
        if (el) {
            // Более заметная вибрация (20ms)
            navigator.vibrate(20);
        }
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
        reinit: function() { /* No-op: делегирование работает автоматически */ }
    };

})();
