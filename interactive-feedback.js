/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (ОПТИМИЗИРОВАНО: Bolt ⚡)
   Использует глобальное делегирование событий (O(1) initialization)
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
        '.benefit-card',
        '.profession-card',
        '.feature-card',
        'a[href]',
        '.tab',
        '[role="tab"]',
        '[onclick*="assignLoad"]',
        '[onclick*="selectLoad"]',
        '[onclick*="viewTruck"]'
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
    // Глобальное делегирование избавляет от необходимости MutationObserver и индивидуальных слушателей
    document.addEventListener('mousedown', handleInteractionStart);
    document.addEventListener('touchstart', handleInteractionStart, { passive: true });

    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchend', handleInteractionEnd);

    // Предотвращаем залипание состояния при уводе курсора
    document.addEventListener('mouseout', handleMouseOut);

    // Вибрация и индикатор загрузки
    document.addEventListener('click', handleGlobalClick, { capture: true, passive: true });

    function handleInteractionStart(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (target && !target.disabled && !target.hasAttribute('disabled')) {
            target.classList.add('clicking');
        }
    }

    function handleInteractionEnd(e) {
        const target = e.target.closest('.clicking');
        if (target) {
            // Небольшая задержка для визуального подтверждения клика
            setTimeout(() => {
                target.classList.remove('clicking');
            }, 300);
        }
    }

    function handleMouseOut(e) {
        const target = e.target.closest('.clicking');
        // Если мы действительно вышли за пределы элемента (а не перешли на дочерний)
        if (target && !target.contains(e.relatedTarget)) {
            target.classList.remove('clicking');
        }
    }

    function handleGlobalClick(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target || target.disabled) return;

        // 1. Haptic Feedback
        if ('vibrate' in navigator && target.matches(HAPTIC_SELECTORS)) {
            navigator.vibrate(20);
        }

        // 2. Loading Indicator (только для кнопок с действием)
        const isButton = target.matches('button, .btn, [role="button"]');
        const hasAction = target.hasAttribute('onclick') ||
                         target.getAttribute('href') ||
                         target.closest('form');

        if (isButton && hasAction && !target.classList.contains('btn-loading')) {
            showButtonLoading(target);
        }
    }

    function showButtonLoading(button) {
        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;

        button.classList.add('btn-loading');
        button.style.minWidth = originalWidth + 'px';
        const originalDisabled = button.disabled;
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

        // Восстанавливаем через 2 секунды (если страница не перезагрузилась)
        setTimeout(() => {
            if (button.classList.contains('btn-loading')) {
                button.innerHTML = originalContent;
                button.disabled = originalDisabled;
                button.classList.remove('btn-loading');
                button.style.minWidth = '';
            }
        }, 2000);
    }

    // === CSS СТИЛИ ===
    if (!document.getElementById('interactive-feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'interactive-feedback-styles';
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
            @keyframes pulse-click {
                0% { transform: scale(1); }
                50% { transform: scale(0.96); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // === ЭКСПОРТ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: function() { /* No-op: Delegation handles new elements automatically */ }
    };

})();
