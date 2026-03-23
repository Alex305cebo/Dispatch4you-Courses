/**
 * nav-loader.js v2.1 - Fixed mobile menu display + cache bust
 */
(function () {
    var isSubfolder = window.location.pathname.includes('/pages/');
    var BASE = isSubfolder ? '../' : '';

    var NAV_INLINE = `<!-- ЕДИНОЕ МЕНЮ САЙТА -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-content">
            <a href="{{BASE}}index.html" class="logo">
                <span class="logo-icon">🎓</span>
                <span class="logo-text">Курсы Диспетчера</span>
            </a>
            <div class="nav-links">
                <a href="{{BASE}}index.html" class="nav-link">Главная</a>
                <div class="nav-item">
                    <button class="nav-btn">Курсы <span class="arrow">▾</span></button>
                    <div class="dropdown">
                        <a href="{{BASE}}pages/documentation.html">📖 База знаний</a>
                        <a href="{{BASE}}pages/doc-module-1-complete.html">🎓 Модули с тестами</a>
                        <a href="{{BASE}}pages/simulator.html">🎯 Симулятор</a>
                        <a href="{{BASE}}pages/testing.html">✍️ Тестирование</a>
                        <a href="{{BASE}}pages/cases.html">💼 Кейсы</a>
                    </div>
                </div>
                <div class="nav-item">
                    <button class="nav-btn">Инструменты <span class="arrow">▾</span></button>
                    <div class="dropdown">
                        <a href="{{BASE}}pages/analytics.html">📊 Статистика рынка</a>
                        <a href="{{BASE}}pages/load-finder.html">🔍 Load Finder</a>
                        <a href="{{BASE}}pages/dispatcher-cards.html">🃏 Dispatcher Cards</a>
                        <a href="{{BASE}}pages/simulator.html">🎯 Dispatch Simulator</a>
                    </div>
                </div>
                <div class="nav-item">
                    <button class="nav-btn">Информация <span class="arrow">▾</span></button>
                    <div class="dropdown">
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
            <button class="burger" id="burgerBtn"><span></span><span></span><span></span></button>
        </div>
    </div>
</nav>
<div class="mob-overlay" id="mobOverlay"></div>
<div class="mob-menu" id="mobMenu">
    <div class="mob-header"><span>📚 Меню</span><button id="mobClose">✕</button></div>
    <div class="mob-body">
        <div class="mob-actions">
            <a href="{{BASE}}login.html" class="btn-login">Войти</a>
            <a href="{{BASE}}register.html" class="btn-signup">Регистрация</a>
        </div>
        <a href="{{BASE}}index.html" class="mob-link">🏠 Главная</a>
        <div class="mob-acc">
            <div class="mob-acc-title">📚 Курсы <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}pages/documentation.html" class="mob-sub">📖 База знаний</a>
                <a href="{{BASE}}pages/doc-module-1-complete.html" class="mob-sub">🎓 Модули с тестами</a>
                <a href="{{BASE}}pages/simulator.html" class="mob-sub">🎯 Симулятор</a>
                <a href="{{BASE}}pages/testing.html" class="mob-sub">✍️ Тестирование</a>
                <a href="{{BASE}}pages/cases.html" class="mob-sub">💼 Кейсы</a>
            </div>
        </div>
        <div class="mob-acc">
            <div class="mob-acc-title">🛠️ Инструменты <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}pages/analytics.html" class="mob-sub">📊 Статистика рынка</a>
                <a href="{{BASE}}pages/load-finder.html" class="mob-sub">🔍 Load Finder</a>
                <a href="{{BASE}}pages/dispatcher-cards.html" class="mob-sub">🃏 Dispatcher Cards</a>
                <a href="{{BASE}}pages/simulator.html" class="mob-sub">🎯 Dispatch Simulator</a>
            </div>
        </div>
        <div class="mob-acc">
            <div class="mob-acc-title">ℹ️ Информация <span class="mob-arr">▼</span></div>
            <div class="mob-acc-body">
                <a href="{{BASE}}about.html" class="mob-sub">👥 О нас</a>
                <a href="{{BASE}}career.html" class="mob-sub">💼 Карьера</a>
                <a href="{{BASE}}faq.html" class="mob-sub">❓ FAQ</a>
                <a href="{{BASE}}contacts.html" class="mob-sub">📬 Контакты</a>
                <a href="{{BASE}}pricing.html" class="mob-sub">💰 Тарифы</a>
            </div>
        </div>
    </div>
</div>`;

    function loadNav() {
        fetch(BASE + 'nav.html')
            .then(function (r) { if (!r.ok) throw 0; return r.text(); })
            .then(function (html) { inject(html.replace(/\{\{BASE\}\}/g, BASE)); })
            .catch(function () { inject(NAV_INLINE.replace(/\{\{BASE\}\}/g, BASE)); });
    }

    function inject(html) {
        var ph = document.getElementById('nav-placeholder');
        if (ph) ph.innerHTML = html;
        else document.body.insertAdjacentHTML('afterbegin', html);
        initMenu();
        highlightActive();
        document.dispatchEvent(new Event('navLoaded'));
        if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
    }

    function highlightActive() {
        var cur = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar a').forEach(function (a) {
            var href = (a.getAttribute('href') || '').split('/').pop();
            if (href && href === cur) a.classList.add('active');
        });
    }

    function initMenu() {
        if (window._navInited) return;
        window._navInited = true;

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.nav-btn');
            var item = e.target.closest('.nav-item');
            if (btn && item) {
                e.preventDefault();
                var wasOpen = item.classList.contains('open');
                document.querySelectorAll('.nav-item.open').forEach(function (i) { i.classList.remove('open'); });
                if (!wasOpen) item.classList.add('open');
                return;
            }
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.nav-item.open').forEach(function (i) { i.classList.remove('open'); });
            }
        });

        var burger = document.getElementById('burgerBtn');
        var mobMenu = document.getElementById('mobMenu');
        var mobOverlay = document.getElementById('mobOverlay');
        var mobClose = document.getElementById('mobClose');

        function openMob() { mobMenu && mobMenu.classList.add('active'); mobOverlay && mobOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
        function closeMob() { mobMenu && mobMenu.classList.remove('active'); mobOverlay && mobOverlay.classList.remove('active'); document.body.style.overflow = ''; }

        if (burger) burger.addEventListener('click', openMob);
        if (mobClose) mobClose.addEventListener('click', closeMob);
        if (mobOverlay) mobOverlay.addEventListener('click', closeMob);

        document.querySelectorAll('.mob-acc-title').forEach(function (t) {
            t.addEventListener('click', function () { this.parentElement.classList.toggle('open'); });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNav);
    } else {
        loadNav();
    }
})();
