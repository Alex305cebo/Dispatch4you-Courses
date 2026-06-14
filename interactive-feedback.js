/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (ОПТИМИЗИРОВАННАЯ)
   Добавляет визуальные и звуковые эффекты при клике
   Bolt Optimization: Global Event Delegation (O(1) initialization)
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
        '[role="tab"]',
        '[onclick]', // Bolt: Добавляем элементы с onclick (например, .benefit-card)
        '.benefit-card' // Bolt: Явный селектор для карточек
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
        // Bolt: Использование делегирования событий вместо перебора всех элементов
        // Это убирает необходимость в MutationObserver и ускоряет инициализацию в O(N) раз
        setupEventDelegation();
        
        // Добавляем визуальный индикатор загрузки (уже делегирован)
        addLoadingIndicator();
    }

    function setupEventDelegation() {
        // Визуальный feedback (mousedown/touchstart)
        document.addEventListener('mousedown', handleDown);
        document.addEventListener('touchstart', handleDown, { passive: true });

        // Снятие feedback (mouseup/touchend)
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchend', handleUp, { passive: true });

        // Отмена feedback если ушли с элемента (mouseout/touchcancel)
        document.addEventListener('mouseout', handleOut);
        document.addEventListener('touchcancel', handleOut, { passive: true });

        // Вибрация (click)
        document.addEventListener('click', handleHaptic, { passive: true });
    }

    function handleDown(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (target && !target.disabled && !target.hasAttribute('disabled')) {
            target.classList.add('clicking');
        }
    }

    function handleUp(e) {
        // Bolt: Ищем любой элемент с классом clicking и убираем его
        // Это надежнее чем искать ближайший к target в mouseup
        const elements = document.querySelectorAll('.clicking');
        elements.forEach(el => {
            setTimeout(() => {
                el.classList.remove('clicking');
            }, 300);
        });
    }

    function handleOut(e) {
        // Bolt: Если мы выходим за пределы элемента .clicking
        if (e.target && e.target.classList.contains('clicking')) {
             if (!e.relatedTarget || !e.target.contains(e.relatedTarget)) {
                e.target.classList.remove('clicking');
            }
            return;
        }

        const target = e.target.closest('.clicking');
        if (target) {
            if (!e.relatedTarget || !target.contains(e.relatedTarget)) {
                target.classList.remove('clicking');
            }
        }
    }

    function handleHaptic(e) {
        if (!('vibrate' in navigator)) return;

        const target = e.target.closest(HAPTIC_SELECTORS);
        if (target) {
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
        });
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
        [class*="truck-card"].clicking,
        .benefit-card.clicking {
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
        reinit: function() { /* Bolt: Больше не требуется благодаря делегированию */ }
    };

})();
