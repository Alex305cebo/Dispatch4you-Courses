/**
 * 🔒 ЗАЩИТА САЙТА ОТ НЕСАНКЦИОНИРОВАННОГО ДОСТУПА
 * Подключается на всех страницах для проверки пароля
 * Version: 1.0
 */

(function () {
    'use strict';

    const ACCESS_KEY = 'site_access_granted';
    const PASSWORD_PAGE = 'password-gate.html';

    // Список страниц, которые НЕ требуют защиты
    const PUBLIC_PAGES = [
        'password-gate.html'
    ];

    /**
     * Проверяет, является ли текущая страница публичной
     */
    function isPublicPage() {
        const currentPage = window.location.pathname.split('/').pop();
        return PUBLIC_PAGES.includes(currentPage);
    }

    /**
     * Проверяет наличие доступа
     */
    function hasAccess() {
        return localStorage.getItem(ACCESS_KEY) === 'true';
    }

    /**
     * Перенаправляет на страницу ввода пароля
     */
    function redirectToPasswordPage() {
        // Определяем правильный путь к странице пароля
        const currentPath = window.location.pathname;
        let redirectPath = PASSWORD_PAGE;

        // Если мы в папке pages/, нужно подняться на уровень выше
        if (currentPath.includes('/pages/')) {
            redirectPath = '../' + PASSWORD_PAGE;
        }

        window.location.href = redirectPath;
    }

    /**
     * Основная проверка доступа
     */
    function checkAccess() {
        // Если это публичная страница - пропускаем
        if (isPublicPage()) {
            return;
        }

        // Если нет доступа - перенаправляем
        if (!hasAccess()) {
            redirectToPasswordPage();
        }
    }

    /**
     * Добавляет кнопку выхода (сброса пароля) в консоль
     */
    function addDevTools() {
        window.resetSiteAccess = function () {
            localStorage.removeItem(ACCESS_KEY);
            console.log('✅ Доступ сброшен. Перезагрузите страницу.');
            window.location.reload();
        };

        console.log('%c🔒 Защита сайта активна', 'color: #667eea; font-size: 16px; font-weight: bold;');
        console.log('%cДля сброса доступа введите: resetSiteAccess()', 'color: #94a3b8; font-size: 12px;');
    }

    // Запускаем проверку при загрузке
    checkAccess();
    addDevTools();

    // Дополнительная проверка при изменении localStorage (защита от обхода)
    window.addEventListener('storage', function (e) {
        if (e.key === ACCESS_KEY && e.newValue !== 'true') {
            checkAccess();
        }
    });

})();
