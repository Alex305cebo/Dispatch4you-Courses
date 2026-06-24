/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (ОПТИМИЗИРОВАНО)
   Добавляет визуальные и звуковые эффекты при клике
   Использует глобальное делегирование событий для O(1) производительности
   ============================================ */

(function() {
    'use strict';

    // === КОНФИГУРАЦИЯ СЕЛЕКТОРОВ ===
    const INTERACTIVE_SELECTORS = [
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

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Настройка глобального делегирования событий
        setupEventDelegation();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();

        // Инъекция необходимых CSS стилей
        injectStyles();
    }

    // === ГЛОБАЛЬНОЕ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===
    function setupEventDelegation() {
        // Мышь
        document.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('mouseout', handleMouseOut);

        // Тач (для мобильных)
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });
        document.addEventListener('touchend', handleInteractionEnd, { passive: true });

        // Вибрация
        document.addEventListener('click', handleHapticFeedback);
    }

    function handleInteractionStart(e) {
        const el = e.target.closest(INTERACTIVE_SELECTORS);
        if (el && !el.disabled && !el.hasAttribute('disabled')) {
            el.classList.add('clicking');
        }
    }

    function handleInteractionEnd(e) {
        const el = e.target.closest(INTERACTIVE_SELECTORS);
        if (el) {
            // Небольшая задержка для визуального эффекта
            setTimeout(() => {
                el.classList.remove('clicking');
            }, 300);
        }
    }

    function handleMouseOut(e) {
        const el = e.target.closest(INTERACTIVE_SELECTORS);
        if (el) {
            // Проверяем, действительно ли мы ушли с элемента, а не перешли на дочерний
            if (!e.relatedTarget || !el.contains(e.relatedTarget)) {
                el.classList.remove('clicking');
            }
        }
    }

    function handleHapticFeedback(e) {
        const el = e.target.closest(HAPTIC_SELECTORS);
        if (el && !el.disabled && !el.hasAttribute('disabled')) {
            if ('vibrate' in navigator) {
                navigator.vibrate(20);
            }
        }
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
    function addLoadingIndicator() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled || button.classList.contains('btn-loading')) return;

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

    // === ДИНАМИЧЕСКАЯ ИНЪЕКЦИЯ CSS ===
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

            /* Feedback для карточек */
            .truck-card.clicking,
            .benefit-card.clicking,
            .profession-card.clicking,
            .feature-card.clicking,
            [class*="truck-card"].clicking {
                transform: scale(0.97) !important;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25) !important;
                filter: brightness(0.95) !important;
            }

            /* Feedback для кнопок */
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

    // === ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ СКРИПТАХ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: () => {} // Теперь no-op, так как делегирование работает для всех элементов
    };

})();
