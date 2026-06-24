/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Добавляет визуальные и звуковые эффекты при клике
   ОПТИМИЗИРОВАНО: Использование делегирования событий (Bolt ⚡)
   ============================================ */

(function() {
    'use strict';

    // Селекторы интерактивных элементов
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

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Добавляем глобальное делегирование событий
        setupGlobalDelegation();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();
    }

    // === ГЛОБАЛЬНОЕ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ ===
    function setupGlobalDelegation() {
        // Начало нажатия
        document.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('touchstart', handleInteractionStart, { passive: true });

        // Конец нажатия или уход курсора
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('touchend', handleInteractionEnd);

        // Используем mouseout с проверкой relatedTarget для имитации mouseleave через делегирование
        document.addEventListener('mouseout', function(e) {
            const target = e.target.closest(INTERACTIVE_SELECTORS);
            if (!target) return;

            // Если мы переместились на дочерний элемент или остались внутри - игнорируем
            if (e.relatedTarget && target.contains(e.relatedTarget)) return;

            handleInteractionEnd();
        });

        // Клик для вибрации
        document.addEventListener('click', handleGlobalClick);
    }

    function handleInteractionStart(e) {
        const target = e.target.closest(INTERACTIVE_SELECTORS);
        if (target && !target.disabled && !target.hasAttribute('disabled')) {
            target.classList.add('clicking');
        }
    }

    function handleInteractionEnd(e) {
        // Находим все элементы с классом clicking и удаляем его
        // Это надежнее, чем искать ближайший к target, так как мышь могла уйти
        const clickingElements = document.querySelectorAll('.clicking');
        clickingElements.forEach(el => {
            // Небольшая задержка для визуального эффекта
            setTimeout(() => {
                el.classList.remove('clicking');
            }, 150);
        });
    }

    function handleGlobalClick(e) {
        const target = e.target.closest(INTERACTIVE_SELECTORS);
        if (target && 'vibrate' in navigator) {
            // Вибрация только для мобильных или тач-устройств
            if (e.pointerType === 'touch' || (e.detail === 0 && !e.pointerType)) {
                navigator.vibrate(20);
            }
        }
    }

    // === ИНДИКАТОР ЗАГРУЗКИ ДЛЯ КНОПОК ===
    function addLoadingIndicator() {
        // Перехватываем клики на кнопках с onclick
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button, .btn, [role="button"]');
            
            if (!button || button.disabled || button.classList.contains('btn-loading')) return;

            // Проверяем, есть ли onclick или это навигация
            const hasAction = button.hasAttribute('onclick') || 
                            button.getAttribute('href') ||
                            button.closest('form');

            // Не показываем загрузку для внутренних ссылок (якорей)
            const href = button.getAttribute('href');
            if (href && href.startsWith('#')) return;

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
        .benefit-card.clicking,
        .profession-card.clicking,
        .feature-card.clicking,
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
        reinit: () => {} // Больше не требуется благодаря делегированию
    };

})();
