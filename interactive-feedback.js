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

            // Уже обработан — выходим. Без этой отметки MutationObserver ниже
            // навешивал бы полный набор обработчиков заново при КАЖДОЙ вставке
            // в DOM (навигация, футер, клоны карусели, тосты), а анонимные
            // функции каждый раз новые — браузер их не дедуплицирует.
            if (element.dataset.ifInit) return;
            element.dataset.ifInit = '1';

            // Добавляем класс при клике
            element.addEventListener('mousedown', function(e) {
                this.classList.add('clicking');
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
            }, { passive: true });

            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('clicking');
                }, 300);
            });
        });
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

            // Спиннер — ТОЛЬКО для отправки формы (логин/регистрация/оплата,
            // где реально ждём Firebase). Ссылки-переходы (меню, кнопки-CTA)
            // грузятся мгновенно — спиннер «Загрузка…» там только мелькает и
            // раздражает, поэтому на <a> его не показываем вовсе.
            // ВАЖНО: у <button> без type он по умолчанию 'submit', поэтому проверять
            // type нельзя — иначе спиннер лезет на все кнопки. Смотрим только форму.
            const isRealAction =
                (button.tagName === 'BUTTON' && button.closest('form'));

            if (isRealAction) {
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

    // === ДОПОЛНИТЕЛЬНАЯ ОБРАБОТКА ДЛЯ ДИНАМИЧЕСКИХ ЭЛЕМЕНТОВ ===
    // Наблюдаем за добавлением новых элементов
    // Один таймер на всю пачку мутаций: раньше setTimeout ставился на КАЖДУЮ
    // запись, и одна вставка навигации порождала десятки полных проходов по DOM.
    let rescanTimer = null;
    const observer = new MutationObserver(function(mutations) {
        for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length) {
                clearTimeout(rescanTimer);
                rescanTimer = setTimeout(addClickFeedback, 100);
                return;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // === ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ СКРИПТАХ ===
    window.InteractiveFeedback = {
        showButtonLoading: showButtonLoading,
        reinit: addClickFeedback
    };

})();
