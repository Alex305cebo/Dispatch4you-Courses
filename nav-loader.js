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

    // Inline fallback — используется когда fetch недоступен (file://, CORS)
    const NAV_INLINE = `<!-- ЕДИНОЕ МЕНЮ САЙТА -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-content">
            <a href="{{BASE}}index.html" class="logo">
                <span class="logo-icon">🎓</span>
                <span class="logo-text">Курсы Диспетчера</span>
            </a>
            <div class="nav-links">
                <a href="{{BASE}}index.html" class="nav-link" data-short="Главная">Главная</a>
                <div class="nav-dropdown has-mega">
                    <a href="{{BASE}}courses.html" class="nav-link" data-short="Курсы">Курсы</a>
                    <div class="dropdown-content">
                        <a href="{{BASE}}pages/documentation.html" style="background:rgba(99,102,241,0.15);border-left:3px solid #6366f1;font-weight:700;color:#ffffff;">🎓 База знаний</a>
                        <a href="{{BASE}}course.html">📖 Обзор курса</a>
                        <a href="{{BASE}}pages/modules-index.html">📚 12 Модулей обучения</a>
                        <a href="{{BASE}}pages/simulator.html">🎯 Симулятор переговоров</a>
                        <a href="{{BASE}}pages/cases.html">💼 Практические кейсы</a>
                        <a href="{{BASE}}pages/testing.html">✍️ Тестирование</a>
                    </div>
                </div>
                <div class="nav-dropdown">
                    <span class="nav-link" data-short="Инстр.">Инструменты</span>
                    <div class="dropdown-content">
                        <a href="{{BASE}}pages/analytics.html">📊 Статистика рынка</a>
                        <a href="{{BASE}}pages/load-finder.html">🔍 Load Finder</a>
                        <a href="{{BASE}}pages/dispatcher-cards.html">🃏 Dispatcher Cards</a>
                        <a href="{{BASE}}pages/simulator.html">🎯 Dispatch Simulator</a>
                    </div>
                </div>
                <div class="nav-dropdown">
                    <span class="nav-link" data-short="Инфо">Информация</span>
                    <div class="dropdown-content">
                        <a href="{{BASE}}about.html">👥 О нас</a>
                        <a href="{{BASE}}career.html">💼 Карьера</a>
                        <a href="{{BASE}}faq.html">❓ FAQ</a>
                        <a href="{{BASE}}contacts.html">📬 Контакты</a>
                        <a href="{{BASE}}pricing.html">💰 Тарифы</a>
                    </div>
                </div>
            </div>
            <div class="nav-search">
                <input type="text" class="search-input" placeholder="Поиск... (Ctrl+K)" />
                <span class="search-icon">🔍</span>
            </div>
            <div class="nav-user-profile" style="display: none;" id="navUserProfile">
                <div class="user-avatar">👤</div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span class="user-name">Студент</span>
                    <span class="user-progress">Прогресс: 45%</span>
                </div>
                <div class="notification-badge">3</div>
            </div>
            <div class="nav-actions">
                <a href="{{BASE}}login.html" class="btn-login">Войти</a>
                <a href="{{BASE}}register.html" class="btn-signup">Регистрация</a>
            </div>
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</nav>
<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
<div class="mobile-menu" id="mobileMenu">
    <div class="mobile-menu-header">
        <span class="mobile-menu-title">📚 Меню</span>
        <button class="mobile-menu-close" onclick="document.getElementById('mobileMenu').classList.remove('active'); document.getElementById('mobileMenuOverlay').classList.remove('active'); document.body.style.overflow = '';">✕</button>
    </div>
    <div class="mobile-nav-links">
        <div class="mobile-nav-actions">
            <a href="{{BASE}}login.html" class="btn-login">Войти</a>
            <a href="{{BASE}}register.html" class="btn-signup">Регистрация</a>
        </div>
        <div class="mobile-menu-divider"></div>
        <a href="{{BASE}}index.html" class="nav-link">🏠 Главная</a>
        <div class="mobile-nav-section">
            <div class="mobile-section-title">📚 КУРСЫ</div>
            <a href="{{BASE}}pages/documentation.html" class="nav-link nav-link-sub" style="color:#ffffff;border-left:3px solid #6366f1;padding-left:14px;background:rgba(99,102,241,0.1);border-radius:8px;margin-bottom:4px;">🎓 База знаний</a>
            <a href="{{BASE}}courses.html" class="nav-link nav-link-sub">Все курсы</a>
            <a href="{{BASE}}course.html" class="nav-link nav-link-sub">Обзор курса</a>
            <a href="{{BASE}}pages/modules-index.html" class="nav-link nav-link-sub">📚 12 Модулей обучения</a>
            <a href="{{BASE}}pages/simulator.html" class="nav-link nav-link-sub">🎯 Симулятор переговоров</a>
            <a href="{{BASE}}pages/cases.html" class="nav-link nav-link-sub">💼 Практические кейсы</a>
            <a href="{{BASE}}pages/testing.html" class="nav-link nav-link-sub">✍️ Тестирование</a>
        </div>
        <div class="mobile-nav-section">
            <div class="mobile-section-title">🛠️ ИНСТРУМЕНТЫ</div>
            <a href="{{BASE}}pages/analytics.html" class="nav-link nav-link-sub">📊 Статистика рынка</a>
            <a href="{{BASE}}pages/load-finder.html" class="nav-link nav-link-sub">🔍 Load Finder</a>
            <a href="{{BASE}}pages/dispatcher-cards.html" class="nav-link nav-link-sub">🃏 Dispatcher Cards</a>
            <a href="{{BASE}}pages/simulator.html" class="nav-link nav-link-sub">🎯 Dispatch Simulator</a>
        </div>
        <div class="mobile-nav-section">
            <div class="mobile-section-title">ℹ️ ИНФОРМАЦИЯ</div>
            <a href="{{BASE}}about.html" class="nav-link nav-link-sub">👥 О нас</a>
            <a href="{{BASE}}career.html" class="nav-link nav-link-sub">💼 Карьера</a>
            <a href="{{BASE}}faq.html" class="nav-link nav-link-sub">❓ FAQ</a>
            <a href="{{BASE}}contacts.html" class="nav-link nav-link-sub">📬 Контакты</a>
            <a href="{{BASE}}pricing.html" class="nav-link nav-link-sub">💰 Тарифы</a>
        </div>
    </div>
</div>`;

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

            // Загружаем улучшенный скрипт навигации
            loadEnhancedScript();

            // Загружаем breadcrumbs
            // loadBreadcrumbs();

        } catch (e) {
            console.warn('nav-loader: fetch не удался, используем inline fallback', e);
            let html = NAV_INLINE.replace(/\{\{BASE\}\}/g, BASE);
            const placeholder = document.getElementById('nav-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
            } else {
                document.body.insertAdjacentHTML('afterbegin', html);
            }
            highlightActive();
            initMobileMenu();
            document.dispatchEvent(new Event('navLoaded'));
            if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
            loadEnhancedScript();
            // loadBreadcrumbs();
        }
    }

    function loadEnhancedScript() {
        // Временно отключено для отладки
        return;

        // Проверяем, не загружен ли уже скрипт
        if (document.querySelector('script[src*="nav-enhanced.js"]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = BASE + 'nav-enhanced.js';
        script.async = true;
        document.head.appendChild(script);
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
