/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (Оптимизировано Bolt ⚡)
   Использует глобальное делегирование событий для O(1) производительности.
   ============================================ */

(function() {
    'use strict';

    // Селекторы для различных типов обратной связи
    const CLICK_SELECTORS = 'button, .btn, [role="button"], .clickable, .truck-card, [onclick*="assignLoad"], [onclick*="selectLoad"], [onclick*="viewTruck"], a[href], .tab, [role="tab"]';
    const HAPTIC_SELECTORS = 'button, .btn, [role="button"], .truck-card, [onclick*="assignLoad"], [onclick*="selectLoad"]';
    const LOADING_SELECTORS = 'button, .btn, [role="button"]';

    // === ГЛОБАЛЬНОЕ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===

    // Визуальный отклик (нажатие)
    document.addEventListener('mousedown', handlePressStart, { passive: true });
    document.addEventListener('touchstart', handlePressStart, { passive: true });

    // Снятие визуального отклика
    document.addEventListener('mouseup', handlePressEnd, { passive: true });
    document.addEventListener('touchend', handlePressEnd, { passive: true });
    document.addEventListener('dragstart', handlePressEnd, { passive: true });

    // Обработка выхода курсора за пределы элемента
    document.addEventListener('mouseout', function(e) {
        const el = e.target.closest(CLICK_SELECTORS);
        if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) {
            el.classList.remove('clicking');
        }
    }, { passive: true });

    // Клики: вибрация и индикаторы загрузки
    document.addEventListener('click', function(e) {
        // 1. Вибрация на мобильных
        if ('vibrate' in navigator) {
            const hapticEl = e.target.closest(HAPTIC_SELECTORS);
            if (hapticEl) navigator.vibrate(20);
        }

        // 2. Индикатор загрузки
        const btn = e.target.closest(LOADING_SELECTORS);
        if (btn && !btn.disabled) {
            const hasAction = btn.hasAttribute('onclick') ||
                            btn.getAttribute('href') ||
                            btn.closest('form');
            if (hasAction) {
                showButtonLoading(btn);
            }
        }
    }, true);

    function handlePressStart(e) {
        const el = e.target.closest(CLICK_SELECTORS);
        if (el && !el.disabled && !el.hasAttribute('disabled')) {
            el.classList.add('clicking');
        }
    }

    function handlePressEnd(e) {
        const el = e.target.closest(CLICK_SELECTORS);
        if (el) {
            setTimeout(() => el.classList.remove('clicking'), 300);
        }
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
        .btn-loading { pointer-events: none !important; opacity: 0.8 !important; }
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
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {} // Больше не требуется благодаря делегированию
    };

})();
