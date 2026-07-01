/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ (Optimized)
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
        // Используем делегирование событий вместо индивидуальных обработчиков
        // Это O(1) инициализация вместо O(N) и решает проблему утечки памяти
        setupDelegatedFeedback();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();
    }

    // === ГЛОБАЛЬНОЕ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===
    function setupDelegatedFeedback() {
        // Состояние для предотвращения залипания класса при быстром клике
        let activeFeedbackElement = null;

        const clearFeedback = () => {
            if (activeFeedbackElement) {
                const el = activeFeedbackElement;
                setTimeout(() => {
                    el.classList.remove('clicking');
                }, 300);
                activeFeedbackElement = null;
            }
        };

        // Начало взаимодействия
        const handleInteractionStart = (e) => {
            const target = e.target.closest(CLICK_SELECTORS);
            if (!target || target.disabled || target.hasAttribute('disabled')) return;

            activeFeedbackElement = target;
            target.classList.add('clicking');
        };

        // Конец взаимодействия
        const handleInteractionEnd = () => {
            clearFeedback();
        };

        // Глобальный слушатель клика для haptic feedback (вибрация)
        document.addEventListener('click', (e) => {
            if (!('vibrate' in navigator)) return;
            const target = e.target.closest(HAPTIC_SELECTORS);
            if (target && !target.disabled && !target.hasAttribute('disabled')) {
                navigator.vibrate(20);
            }
        }, { passive: true });

        // Слушатели на документ
        document.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('mouseleave', (e) => {
             // Если мышь покинула документ
             if (e.relatedTarget === null) clearFeedback();
        });

        // Touch события
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });
        document.addEventListener('touchend', handleInteractionEnd);
        document.addEventListener('touchcancel', clearFeedback);
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
            if (button.classList.contains('btn-loading')) {
                button.innerHTML = originalContent;
                button.disabled = false;
                button.classList.remove('btn-loading');
                button.style.minWidth = '';
            }
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

        @keyframes pulse-click {
            0% { transform: scale(1); }
            50% { transform: scale(0.96); }
            100% { transform: scale(1); }
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
        reinit: () => {} // Теперь no-op, так как делегирование обрабатывает новые элементы автоматически
    };

})();
