/**
 * nav-loader.js — единый загрузчик меню для всего сайта
 * Подключай на каждой странице: <script src="nav-loader.js"></script>
 * или из pages/: <script src="../nav-loader.js"></script>
 *
 * Как работает:
 * 1. Определяет глубину страницы (корень или pages/)
 * 2. Загружает nav.html из корня сайта
 * 3. Заменяет {{BASE}} на правильный относительный путь
 * 4. Вставляет меню в <div id="nav-placeholder">
 * 5. Инициализирует мобильное меню и Firebase auth
 */

(function () {
    // Определяем BASE — путь до корня сайта
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // Если страница в подпапке (pages/) — BASE = '../', иначе ''
    const isSubfolder = window.location.pathname.includes('/pages/');
    const BASE = isSubfolder ? '../' : '';

    // Путь до nav.html всегда от корня
    const navUrl = BASE + 'nav.html';

    async function loadNav() {
        try {
            const res = await fetch(navUrl);
            if (!res.ok) throw new Error('nav.html not found');
            let html = await res.text();

            // Подставляем правильный BASE во все ссылки
            html = html.replace(/\{\{BASE\}\}/g, BASE);

            // Вставляем в placeholder
            const placeholder = document.getElementById('nav-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
            } else {
                document.body.insertAdjacentHTML('afterbegin', html);
            }

            // Подсвечиваем активную ссылку
            highlightActive();

            // Инициализируем мобильное меню
            initMobileMenu();

            // Сообщаем что навбар загружен
            document.dispatchEvent(new Event('navLoaded'));

            // Вызываем updateAuthUI напрямую если уже загружен
            if (typeof window.updateAuthUI === 'function') {
                window.updateAuthUI();
            }

            // Если auth уже ждал — вызываем его callback
            if (window._pendingNavAuthUpdate) {
                window._pendingNavAuthUpdate();
                window._pendingNavAuthUpdate = null;
            }

        } catch (e) {
            console.warn('nav-loader: не удалось загрузить nav.html', e);
        }
    }

    function highlightActive() {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar .nav-link, .navbar .dropdown-content a').forEach(a => {
            const href = (a.getAttribute('href') || '').split('/').pop();
            if (href && href === current) {
                a.classList.add('active');
            }
        });
    }

    function initMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');
        if (!toggle || !menu || !overlay) return;

        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        });

        overlay.addEventListener('click', () => {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Запускаем сразу или после DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNav);
    } else {
        loadNav();
    }
})();
