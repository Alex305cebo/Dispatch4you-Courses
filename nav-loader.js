/**
 * nav-loader.js — единый загрузчик меню для всего сайта
 */
(function () {
    const isSubfolder = window.location.pathname.includes('/pages/');
    const BASE = isSubfolder ? '../' : '';
    const navUrl = BASE + 'nav.html';

    const NAV_INLINE = `<!-- ЕДИНОЕ МЕНЮ САЙТА -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-content">
            <a href="{{BASE}}index.html" class="logo">
                <span class="logo-icon">🎓</span>
                <span class="logo-text">Курсы Диспетчера</span>
            </a>
            <div class="nav-links">
                <a href="{{BASE}}index.html" class="nav-link">Главная</a>
                <div class="nav-dropdown has-mega">
                    <span class="nav-link nav-toggle">Курсы</span>
                    <div class="flyout-panel">
                        <div class="flyout-cats">
                            <div class="flyout-cat" data-sub="sections"><span>📚 15 Разделов курса</span><span class="flyout-arrow">›</span></div>
                            <div class="flyout-cat" data-sub="modules"><span>🎓 12 Модулей с тестами</span><span class="flyout-arrow">›</span></div>
                            <div class="flyout-cat" data-sub="resources"><span>📁 Ресурсы</span><span class="flyout-arrow">›</span></div>
                        </div>
                        <div class="flyout-sub" id="sub-sections">
                            <a href="{{BASE}}pages/intro.html" class="flyout-item"><span class="mn">01</span>🚛 Введение в индустрию</a>
                            <a href="{{BASE}}pages/glossary.html" class="flyout-item"><span class="mn">02</span>📖 Глоссарий терминов</a>
                            <a href="{{BASE}}pages/role.html" class="flyout-item"><span class="mn">03</span>👔 Роль диспетчера</a>
                            <a href="{{BASE}}pages/equipment.html" class="flyout-item"><span class="mn">04</span>🚚 Оборудование и грузы</a>
                            <a href="{{BASE}}pages/routes.html" class="flyout-item"><span class="mn">05</span>🗺️ География и маршруты</a>
                            <a href="{{BASE}}pages/loadboards.html" class="flyout-item"><span class="mn">06</span>💻 Load Boards</a>
                            <a href="{{BASE}}pages/negotiation.html" class="flyout-item"><span class="mn">07</span>📞 Переговоры</a>
                            <a href="{{BASE}}pages/brokers.html" class="flyout-item"><span class="mn">08</span>🛡️ Проверка брокеров</a>
                            <a href="{{BASE}}pages/docs.html" class="flyout-item"><span class="mn">09</span>📄 Документация</a>
                            <a href="{{BASE}}pages/regulations.html" class="flyout-item"><span class="mn">10</span>⚖️ Законодательство</a>
                            <a href="{{BASE}}pages/technology.html" class="flyout-item"><span class="mn">11</span>💻 TMS и технологии</a>
                            <a href="{{BASE}}pages/communication.html" class="flyout-item"><span class="mn">12</span>📱 Коммуникация</a>
                            <a href="{{BASE}}pages/problems.html" class="flyout-item"><span class="mn">13</span>🚨 Решение проблем</a>
                            <a href="{{BASE}}pages/finances.html" class="flyout-item"><span class="mn">14</span>💰 Финансы и расчёты</a>
                            <a href="{{BASE}}pages/career.html" class="flyout-item"><span class="mn">15</span>💼 Карьера и практики</a>
                        </div>
                        <div class="flyout-sub" id="sub-modules" style="display:none">
                            <a href="{{BASE}}pages/doc-module-1-complete.html" class="flyout-item"><span class="mn">М1</span>Введение в диспетчерство</a>
                            <a href="{{BASE}}pages/doc-module-2-complete.html" class="flyout-item"><span class="mn">М2</span>Документы и термины</a>
                            <a href="{{BASE}}pages/doc-module-3-complete.html" class="flyout-item"><span class="mn">М3</span>Работа с водителями</a>
                            <a href="{{BASE}}pages/doc-module-4-complete.html" class="flyout-item"><span class="mn">М4</span>Работа с Load Boards</a>
                            <a href="{{BASE}}pages/doc-module-5-complete.html" class="flyout-item"><span class="mn">М5</span>Поиск грузов</a>
                            <a href="{{BASE}}pages/doc-module-6-complete.html" class="flyout-item"><span class="mn">М6</span>Переговоры с брокерами</a>
                            <a href="{{BASE}}pages/doc-module-7-complete.html" class="flyout-item"><span class="mn">М7</span>Rate Confirmation</a>
                            <a href="{{BASE}}pages/doc-module-8-complete.html" class="flyout-item"><span class="mn">М8</span>Проблемные ситуации</a>
                            <a href="{{BASE}}pages/doc-module-9-complete.html" class="flyout-item"><span class="mn">М9</span>Регуляции и безопасность</a>
                            <a href="{{BASE}}pages/doc-module-10-complete.html" class="flyout-item"><span class="mn">М10</span>Финансы диспетчера</a>
                            <a href="{{BASE}}pages/doc-module-11-complete.html" class="flyout-item"><span class="mn">М11</span>Карьера и бизнес</a>
                            <a href="{{BASE}}pages/doc-module-12-complete.html" class="flyout-item"><span class="mn">М12</span>Итоговый тест</a>
                        </div>
                        <div class="flyout-sub" id="sub-resources" style="display:none">
                            <a href="{{BASE}}pages/documentation.html" class="flyout-item featured"><span class="mn">📖</span>База знаний</a>
                            <a href="{{BASE}}pages/simulator.html" class="flyout-item"><span class="mn">🎯</span>Симулятор</a>
                            <a href="{{BASE}}pages/cases.html" class="flyout-item"><span class="mn">💼</span>Кейсы</a>
                            <a href="{{BASE}}pages/testing.html" class="flyout-item"><span class="mn">✍️</span>Тестирование</a>
                        </div>
                    </div>
                </div>
                <div class="nav-dropdown">
                    <span class="nav-link nav-toggle">Инструменты</span>
                    <div class="dropdown-content">
                        <a href="{{BASE}}pages/analytics.html">📊 Статистика рынка</a>
                        <a href="{{BASE}}pages/load-finder.html">🔍 Load Finder</a>
                        <a href="{{BASE}}pages/dispatcher-cards.html">🃏 Dispatcher Cards</a>
                        <a href="{{BASE}}pages/simulator.html">🎯 Dispatch Simulator</a>
                    </div>
                </div>
                <div class="nav-dropdown">
                    <span class="nav-link nav-toggle">Информация</span>
                    <div class="dropdown-content">
                        <a href="{{BASE}}about.html">👥 О нас</a>
                        <a href="{{BASE}}career.html">💼 Карьера</a>
                        <a href="{{BASE}}faq.html">❓ FAQ</a>
                        <a href="{{BASE}}contacts.html">📬 Контакты</a>
                        <a href="{{BASE}}pricing.html">💰 Тарифы</a>
                    </div>
                </div>
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
        <button class="mobile-menu-close" id="mobileMenuClose">✕</button>
    </div>
    <div class="mobile-nav-links">
        <div class="mobile-nav-actions">
            <a href="{{BASE}}login.html" class="btn-login">Войти</a>
            <a href="{{BASE}}register.html" class="btn-signup">Регистрация</a>
        </div>
        <div class="mobile-menu-divider"></div>
        <a href="{{BASE}}index.html" class="nav-link">🏠 Главная</a>
        <div class="mob-acc">
            <div class="mob-acc-title">📚 15 Разделов курса <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}pages/intro.html" class="nav-link nav-link-sub"><span class="m-num">01</span> Введение</a>
                <a href="{{BASE}}pages/glossary.html" class="nav-link nav-link-sub"><span class="m-num">02</span> Глоссарий</a>
                <a href="{{BASE}}pages/role.html" class="nav-link nav-link-sub"><span class="m-num">03</span> Роль диспетчера</a>
                <a href="{{BASE}}pages/equipment.html" class="nav-link nav-link-sub"><span class="m-num">04</span> Оборудование</a>
                <a href="{{BASE}}pages/routes.html" class="nav-link nav-link-sub"><span class="m-num">05</span> Маршруты</a>
                <a href="{{BASE}}pages/loadboards.html" class="nav-link nav-link-sub"><span class="m-num">06</span> Load Boards</a>
                <a href="{{BASE}}pages/negotiation.html" class="nav-link nav-link-sub"><span class="m-num">07</span> Переговоры</a>
                <a href="{{BASE}}pages/brokers.html" class="nav-link nav-link-sub"><span class="m-num">08</span> Брокеры</a>
                <a href="{{BASE}}pages/docs.html" class="nav-link nav-link-sub"><span class="m-num">09</span> Документация</a>
                <a href="{{BASE}}pages/regulations.html" class="nav-link nav-link-sub"><span class="m-num">10</span> Законодательство</a>
                <a href="{{BASE}}pages/technology.html" class="nav-link nav-link-sub"><span class="m-num">11</span> TMS и технологии</a>
                <a href="{{BASE}}pages/communication.html" class="nav-link nav-link-sub"><span class="m-num">12</span> Коммуникация</a>
                <a href="{{BASE}}pages/problems.html" class="nav-link nav-link-sub"><span class="m-num">13</span> Решение проблем</a>
                <a href="{{BASE}}pages/finances.html" class="nav-link nav-link-sub"><span class="m-num">14</span> Финансы</a>
                <a href="{{BASE}}pages/career.html" class="nav-link nav-link-sub"><span class="m-num">15</span> Карьера</a>
            </div>
        </div>
        <div class="mob-acc">
            <div class="mob-acc-title">🎓 12 Модулей с тестами <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}pages/doc-module-1-complete.html" class="nav-link nav-link-sub"><span class="m-num">М1</span> Введение в диспетчерство</a>
                <a href="{{BASE}}pages/doc-module-2-complete.html" class="nav-link nav-link-sub"><span class="m-num">М2</span> Документы и термины</a>
                <a href="{{BASE}}pages/doc-module-3-complete.html" class="nav-link nav-link-sub"><span class="m-num">М3</span> Работа с водителями</a>
                <a href="{{BASE}}pages/doc-module-4-complete.html" class="nav-link nav-link-sub"><span class="m-num">М4</span> Работа с Load Boards</a>
                <a href="{{BASE}}pages/doc-module-5-complete.html" class="nav-link nav-link-sub"><span class="m-num">М5</span> Поиск грузов</a>
                <a href="{{BASE}}pages/doc-module-6-complete.html" class="nav-link nav-link-sub"><span class="m-num">М6</span> Переговоры с брокерами</a>
                <a href="{{BASE}}pages/doc-module-7-complete.html" class="nav-link nav-link-sub"><span class="m-num">М7</span> Rate Confirmation</a>
                <a href="{{BASE}}pages/doc-module-8-complete.html" class="nav-link nav-link-sub"><span class="m-num">М8</span> Проблемные ситуации</a>
                <a href="{{BASE}}pages/doc-module-9-complete.html" class="nav-link nav-link-sub"><span class="m-num">М9</span> Регуляции и безопасность</a>
                <a href="{{BASE}}pages/doc-module-10-complete.html" class="nav-link nav-link-sub"><span class="m-num">М10</span> Финансы диспетчера</a>
                <a href="{{BASE}}pages/doc-module-11-complete.html" class="nav-link nav-link-sub"><span class="m-num">М11</span> Карьера и бизнес</a>
                <a href="{{BASE}}pages/doc-module-12-complete.html" class="nav-link nav-link-sub"><span class="m-num">М12</span> Итоговый тест</a>
            </div>
        </div>
        <div class="mob-acc">
            <div class="mob-acc-title">🛠️ Инструменты <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}pages/analytics.html" class="nav-link nav-link-sub">📊 Статистика рынка</a>
                <a href="{{BASE}}pages/load-finder.html" class="nav-link nav-link-sub">🔍 Load Finder</a>
                <a href="{{BASE}}pages/dispatcher-cards.html" class="nav-link nav-link-sub">🃏 Dispatcher Cards</a>
                <a href="{{BASE}}pages/simulator.html" class="nav-link nav-link-sub">🎯 Dispatch Simulator</a>
            </div>
        </div>
        <div class="mob-acc">
            <div class="mob-acc-title">ℹ️ Информация <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}about.html" class="nav-link nav-link-sub">👥 О нас</a>
                <a href="{{BASE}}career.html" class="nav-link nav-link-sub">💼 Карьера</a>
                <a href="{{BASE}}faq.html" class="nav-link nav-link-sub">❓ FAQ</a>
                <a href="{{BASE}}contacts.html" class="nav-link nav-link-sub">📬 Контакты</a>
                <a href="{{BASE}}pricing.html" class="nav-link nav-link-sub">💰 Тарифы</a>
            </div>
        </div>
    </div>
</div>`;

    async function loadNav() {
        try {
            const res = await fetch(navUrl);
            if (!res.ok) throw new Error('nav.html not found');
            let html = await res.text();
            html = html.replace(/\{\{BASE\}\}/g, BASE);
            inject(html);
        } catch (e) {
            console.warn('nav-loader: fetch failed, using inline fallback', e);
            inject(NAV_INLINE.replace(/\{\{BASE\}\}/g, BASE));
        }
    }

    function inject(html) {
        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }
        highlightActive();
        initMenu();
        document.dispatchEvent(new Event('navLoaded'));
        if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
        if (window._pendingNavAuthUpdate) {
            window._pendingNavAuthUpdate();
            window._pendingNavAuthUpdate = null;
        }
    }

    function highlightActive() {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar .nav-link, .navbar .dropdown-content a').forEach(function (a) {
            const href = (a.getAttribute('href') || '').split('/').pop();
            if (href && href === current) a.classList.add('active');
        });
    }

    function initMenu() {
        if (window._navMenuInited) return;
        window._navMenuInited = true;

        // Mobile open/close
        var toggle = document.getElementById('mobileMenuToggle');
        var menu = document.getElementById('mobileMenu');
        var overlay = document.getElementById('mobileMenuOverlay');
        var closeBtn = document.getElementById('mobileMenuClose');

        function openMobile() { menu && menu.classList.add('active'); overlay && overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
        function closeMobile() { menu && menu.classList.remove('active'); overlay && overlay.classList.remove('active'); document.body.style.overflow = ''; }

        if (toggle) toggle.addEventListener('click', openMobile);
        if (overlay) overlay.addEventListener('click', closeMobile);
        if (closeBtn) closeBtn.addEventListener('click', closeMobile);

        // Mobile accordions
        document.querySelectorAll('.mob-acc-title').forEach(function (t) {
            t.addEventListener('click', function () { this.parentElement.classList.toggle('open'); });
        });

        // Desktop mega-acc accordion headers
        document.querySelectorAll('.mega-acc-head').forEach(function (h) {
            h.addEventListener('click', function (e) {
                e.stopPropagation();
                this.parentElement.classList.toggle('open');
            });
        });

        // Flyout category switching (click)
        document.querySelectorAll('.flyout-cat').forEach(function (cat) {
            cat.addEventListener('click', function (e) {
                e.stopPropagation();
                var sub = this.dataset.sub;
                var alreadyActive = this.classList.contains('active');
                document.querySelectorAll('.flyout-cat').forEach(function (c) { c.classList.remove('active'); });
                document.querySelectorAll('.flyout-sub').forEach(function (s) { s.style.display = 'none'; });
                if (!alreadyActive) {
                    this.classList.add('active');
                    var el = document.getElementById('sub-' + sub);
                    if (el) el.style.display = 'block';
                }
            });
        });

        // Desktop dropdown toggle
        document.addEventListener('click', function (e) {
            var tog = e.target.closest('.nav-toggle');
            var dd = e.target.closest('.nav-dropdown');
            if (tog && dd) {
                e.preventDefault();
                e.stopPropagation();
                var wasOpen = dd.classList.contains('open');
                document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
                if (!wasOpen) {
                    dd.classList.add('open');
                    // При открытии flyout — скрыть все панели, убрать active
                    if (dd.classList.contains('has-mega')) {
                        dd.querySelectorAll('.flyout-cat').forEach(function (c) { c.classList.remove('active'); });
                        dd.querySelectorAll('.flyout-sub').forEach(function (s) { s.style.display = 'none'; });
                    }
                }
                return;
            }
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNav);
    } else {
        loadNav();
    }
})();
