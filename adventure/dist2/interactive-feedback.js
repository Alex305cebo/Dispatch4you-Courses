/* ============================================
   СИСТЕМА ТАКТИЛЬНОЙ ОБРАТНОЙ СВЯЗИ
   Добавляет визуальные и звуковые эффекты при клике
   ============================================ */

(function() {
    'use strict';

    // === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    document.addEventListener('DOMContentLoaded', initInteractiveFeedback);

    function initInteractiveFeedback() {
        // Добавляем обработчики на все кликабельные элементы
        addClickFeedback();
        
        // Добавляем вибрацию на мобильных устройствах
        addHapticFeedback();
        
        // Добавляем визуальный индикатор загрузки
        addLoadingIndicator();
    }

    // === ВИЗУАЛЬНЫЙ FEEDBACK ПРИ КЛИКЕ ===
    function addClickFeedback() {
        const selectors = [
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
        ];

        const elements = document.querySelectorAll(selectors.join(', '));

        elements.forEach(element => {
            // Пропускаем disabled элементы
            if (element.disabled || element.hasAttribute('disabled')) return;

            // Добавляем класс при клике
            element.addEventListener('mousedown', function(e) {
                this.classList.add('clicking');
                
                // Создаём ripple эффект
                createRipple(e, this);
            });

            element.addEventListener('mouseup', function() {
                setTimeout(() => {
                    this.classList.remove('clicking');
                }, 300);
            });

            element.addEventListener('mouseleave', function() {
                this.classList.remove('clicking');
            });

            // Touch события для мобильных
            element.addEventListener('touchstart', function(e) {
                this.classList.add('clicking');
                createRipple(e.touches[0], this);
            }, { passive: true });

            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('clicking');
                }, 300);
            });
        });
    }

    // === RIPPLE ЭФФЕКТ - УЛУЧШЕННЫЙ ===
    function createRipple(event, element) {
        // Проверяем, не создан ли уже ripple
        const existingRipple = element.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.5;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 1000;
        `;

        // Убеждаемся что элемент имеет position: relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(ripple);

        // Удаляем ripple после анимации
        setTimeout(() => {
            ripple.remove();
        }, 700);
    }

    // === ВИБРАЦИЯ НА МОБИЛЬНЫХ - УСИЛЕННАЯ ===
    function addHapticFeedback() {
        if (!('vibrate' in navigator)) return;

        const selectors = [
            'button',
            '.btn',
            '[role="button"]',
            '.truck-card',
            '[onclick*="assignLoad"]',
            '[onclick*="selectLoad"]'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));

        elements.forEach(element => {
            element.addEventListener('click', function() {
                // Более заметная вибрация (20ms)
                navigator.vibrate(20);
            }, { passive: true });
        });
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
        @keyframes ripple-animation {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            50% {
                opacity: 0.8;
            }
            100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }

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

        /* Overflow для ripple эффекта */
        button,
        .btn,
        [role="button"],
        .clickable {
            overflow: hidden;
            position: relative;
        }
    `;
    document.head.appendChild(style);

    // === ДОПОЛНИТЕЛЬНАЯ ОБРАБОТКА ДЛЯ ДИНАМИЧЕСКИХ ЭЛЕМЕНТОВ ===
    // Наблюдаем за добавлением новых элементов
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Переинициализируем feedback для новых элементов
                setTimeout(addClickFeedback, 100);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // === ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ СКРИПТАХ ===
    window.InteractiveFeedback = {
        createRipple: createRipple,
        showButtonLoading: showButtonLoading,
        reinit: addClickFeedback
    };

})();
