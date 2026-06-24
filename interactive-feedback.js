/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (Оптимизированная)
   Использует глобальное делегирование событий для O(1) производительности
   ============================================ */

(function() {
    'use strict';

    // Селекторы для интерактивных элементов
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
        // Настройка глобального делегирования событий
        setupDelegatedEvents();
        
        // Добавляем визуальный индикатор загрузки (уже использует делегирование)
        addLoadingIndicator();
    }

    /**
     * Настраивает делегирование событий на уровне документа.
     * Это устраняет необходимость обхода DOM и привязки тысяч слушателей.
     */
    function setupDelegatedEvents() {
        // Визуальный отклик (mousedown / touchstart)
        document.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });

        // Завершение взаимодействия (mouseup / touchend)
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('touchend', handleInteractionEnd);

        // Обработка ухода курсора (эмуляция mouseleave через делегирование mouseout)
        document.addEventListener('mouseout', handleInteractionLeave);

        // Тактильный отклик (вибрация)
        document.addEventListener('click', handleHapticFeedback, { passive: true });
    }

    function handleInteractionStart(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target || target.disabled || target.hasAttribute('disabled')) return;

        target.classList.add('clicking');
    }

    function handleInteractionEnd(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target) return;

        // Задержка для того, чтобы анимация была видна пользователю
        setTimeout(() => {
            target.classList.remove('clicking');
        }, 300);
    }

    function handleInteractionLeave(e) {
        const target = e.target.closest(CLICK_SELECTORS);
        if (!target) return;

        // Если указатель действительно покинул границы элемента
        if (!e.relatedTarget || !target.contains(e.relatedTarget)) {
            target.classList.remove('clicking');
        }
    }

    function handleHapticFeedback(e) {
        if (!('vibrate' in navigator)) return;

        const target = e.target.closest(HAPTIC_SELECTORS);
        if (target && !target.disabled && !target.hasAttribute('disabled')) {
            navigator.vibrate(20);
        }
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
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
        }, true); // Используем capture phase для перехвата до других обработчиков
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
        reinit: () => {} // Теперь no-op, так как делегирование работает автоматически
    };

})();
