/**
 * nav-loader.js v7.3 — Auto-open first mobile menu section + XP badge with auth state
 * Loads nav.html, injects into #nav-placeholder, handles mobile menu
 */
(function () {
    var isSubfolder = window.location.pathname.includes('/pages/');
    var BASE = isSubfolder ? '../' : '';

    // ── Load nav HTML ──────────────────────────────────────────────
    function loadNav() {
        fetch(BASE + 'nav.html?v=7.3')
            .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
            .then(function (html) { inject(html.replace(/\{\{BASE\}\}/g, BASE)); })
            .catch(function () { inject(NAV_INLINE.replace(/\{\{BASE\}\}/g, BASE)); });
    }

    var NAV_INLINE = `<nav class="navbar"><div class="nav-container"><div class="nav-content">
<a href="{{BASE}}index.html" class="logo"><span class="logo-icon">🎓</span><span class="logo-text">Курсы Диспетчера</span></a>
<div class="nav-links">
  <div class="nav-item"><button class="nav-btn">Курс обучения <span class="arrow">▾</span></button><div class="dropdown"><a href="{{BASE}}pages/documentation.html">📚 База знаний (15 Стр. Курсов)</a><a href="{{BASE}}pages/modules-index.html">✍️ Тесты знаний (12 Модулей)</a><a href="{{BASE}}pages/glossary.html">📖 Глоссарий</a></div></div>
  <div class="nav-item"><button class="nav-btn">Инструменты <span class="arrow">▾</span></button><div class="dropdown"><a href="{{BASE}}pages/simulator.html">🎯 Симулятор</a><a href="{{BASE}}pages/testing.html">✍️ Тестирование</a><a href="{{BASE}}pages/Trainer-Quiz.html">⚡ Тренировка</a><a href="{{BASE}}pages/load-finder.html">🔍 Load Finder</a><a href="{{BASE}}pages/ai-broker-chat.html">🤖 AI Брокер</a></div></div>
  <div class="nav-item"><button class="nav-btn">Информация <span class="arrow">▾</span></button><div class="dropdown"><a href="{{BASE}}about.html">👥 О нас</a><a href="{{BASE}}faq.html">❓ Вопросы</a><a href="{{BASE}}contacts.html">📬 Контакты</a><a href="{{BASE}}pricing.html">💰 Цены</a></div></div>
</div>
<div class="nav-actions"><a href="{{BASE}}login.html" class="btn-login">Войти</a><a href="{{BASE}}register.html" class="btn-signup">Регистрация</a></div>
<div class="mob-xp-wrap" id="mob-xp-wrap" style="display:none"><a href="{{BASE}}dashboard.html" class="mob-xp-badge" id="mob-xp-badge"><span class="mob-xp-avatar" id="mob-xp-avatar">👤</span><span class="mob-xp-val" id="mob-xp-val">⚡ 0 XP</span></a></div>
<button class="burger" id="burgerBtn"><span></span><span></span><span></span></button>
</div></div></nav>
<div class="mob-overlay" id="mobOverlay"></div>
<div class="mob-menu" id="mobMenu">
  <div class="mob-header"><span>📚 Меню</span><button id="mobClose">✕</button></div>
  <div class="mob-body">
    <div class="mob-actions"><a href="{{BASE}}login.html" class="btn-login">Войти</a><a href="{{BASE}}register.html" class="btn-signup">Регистрация</a></div>
    <div class="mob-acc"><div class="mob-acc-title">📚 Курс обучения <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="{{BASE}}pages/documentation.html" class="mob-sub">📚 База знаний (15 Стр. Курсов)</a><a href="{{BASE}}pages/modules-index.html" class="mob-sub">✍️ Тесты знаний (12 Модулей)</a><a href="{{BASE}}pages/glossary.html" class="mob-sub">📖 Глоссарий</a></div></div>
    <div class="mob-acc"><div class="mob-acc-title">🛠️ Инструменты <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="{{BASE}}pages/simulator.html" class="mob-sub">🎯 Симулятор</a><a href="{{BASE}}pages/testing.html" class="mob-sub">✍️ Тестирование</a><a href="{{BASE}}pages/Trainer-Quiz.html" class="mob-sub">⚡ Тренировка</a><a href="{{BASE}}pages/load-finder.html" class="mob-sub">🔍 Load Finder</a><a href="{{BASE}}pages/ai-broker-chat.html" class="mob-sub">🤖 AI Брокер</a></div></div>
    <div class="mob-acc"><div class="mob-acc-title">ℹ️ Информация <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="{{BASE}}about.html" class="mob-sub">👥 О нас</a><a href="{{BASE}}faq.html" class="mob-sub">❓ Вопросы</a><a href="{{BASE}}contacts.html" class="mob-sub">📬 Контакты</a><a href="{{BASE}}pricing.html" class="mob-sub">💰 Цены</a></div></div>
  </div>
</div>`;

    // ── Inject HTML and init ───────────────────────────────────────
    function inject(html) {
        var ph = document.getElementById('nav-placeholder');
        if (ph) {
            ph.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }

        // Move mob-menu and mob-overlay to body root
        // so position:fixed works correctly regardless of parent stacking context
        ['mobOverlay', 'mobMenu'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentElement !== document.body) {
                document.body.appendChild(el);
            }
        });

        initDesktopMenu();
        initMobileMenu();
        highlightActive();
        initXPBadge();
        injectFooter();

        document.dispatchEvent(new Event('navLoaded'));
        if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
    }

    // ── XP Badge for mobile ───────────────────────────────────────
    function initXPBadge() {
        // Check if user is logged in
        var user = null;
        try {
            user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        } catch (e) {}

        var wrap = document.getElementById('mob-xp-wrap');
        var avatar = document.getElementById('mob-xp-avatar');
        var xpVal = document.getElementById('mob-xp-val');
        var mobActions = document.querySelector('.mob-actions');

        if (!wrap) return;

        if (user) {
            // User is logged in - show XP badge, hide login/register buttons in mobile menu
            wrap.style.display = 'flex';
            if (mobActions) mobActions.style.display = 'none';

            // Set user initials or avatar
            if (avatar) {
                var initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();
                avatar.textContent = initials;
            }

            // Set XP value
            if (xpVal) {
                var xp = user.xp || 0;
                xpVal.textContent = '⚡ ' + xp + ' XP';
            }
        } else {
            // User is not logged in - hide XP badge, show login/register buttons
            wrap.style.display = 'none';
            if (mobActions) mobActions.style.display = 'flex';
        }
    }

    // ── Desktop dropdown ──────────────────────────────────────────
    function initDesktopMenu() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.nav-btn');
            var item = e.target.closest('.nav-item');

            if (btn && item) {
                e.preventDefault();
                var isOpen = item.classList.contains('open');
                // Close all
                document.querySelectorAll('.nav-item.open').forEach(function (i) {
                    i.classList.remove('open');
                });
                if (!isOpen) {
                    item.classList.add('open');
                    positionDropdown(btn, item.querySelector('.dropdown'));
                }
                return;
            }
            // Click outside — close all
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.nav-item.open').forEach(function (i) {
                    i.classList.remove('open');
                });
            }
        });
    }

    function positionDropdown(btn, dd) {
        if (!dd) return;
        var r = btn.getBoundingClientRect();
        dd.style.position = 'fixed';
        dd.style.top = (r.bottom + 6) + 'px';
        dd.style.left = r.left + 'px';
        dd.style.right = 'auto';
        var w = dd.getBoundingClientRect().width || 200;
        if (r.left + w > window.innerWidth - 10) {
            dd.style.left = (r.right - w) + 'px';
        }
    }

    // ── Mobile menu ───────────────────────────────────────────────
    function initMobileMenu() {
        var burger = document.getElementById('burgerBtn');
        var mobClose = document.getElementById('mobClose');
        var overlay = document.getElementById('mobOverlay');

        if (burger) burger.onclick = openMenu;
        if (mobClose) mobClose.onclick = closeMenu;
        if (overlay) overlay.onclick = closeMenu;

        // Accordion
        document.querySelectorAll('.mob-acc-title').forEach(function (t) {
            t.onclick = function () {
                this.parentElement.classList.toggle('open');
            };
        });
    }

    function openMenu() {
        var menu = document.getElementById('mobMenu');
        var overlay = document.getElementById('mobOverlay');
        if (menu) menu.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Автоматически раскрываем первую секцию "Курс обучения"
        setTimeout(function() {
            var firstAccordion = document.querySelector('.mob-acc');
            if (firstAccordion && !firstAccordion.classList.contains('open')) {
                firstAccordion.classList.add('open');
            }
        }, 100);
    }

    function closeMenu() {
        var menu = document.getElementById('mobMenu');
        var overlay = document.getElementById('mobOverlay');
        if (menu) menu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Highlight active link ─────────────────────────────────────
    function highlightActive() {
        var cur = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar a').forEach(function (a) {
            var href = (a.getAttribute('href') || '').split('/').pop();
            if (href && href === cur) a.classList.add('active');
        });
    }

    // ── Footer ────────────────────────────────────────────────────
    function injectFooter() {
        if (document.getElementById('site-footer-injected')) return;
        var html = `<style>
.site-footer{position:relative;z-index:1;margin-top:80px}
.site-footer .footer-gradient-line{height:1px;background:linear-gradient(90deg,transparent,rgba(6,182,212,.6) 30%,rgba(249,115,22,.5) 70%,transparent)}
.site-footer .footer-body{padding:72px 0 0}
.site-footer .footer-inner{max-width:1000px;margin:0 auto;padding:0 40px}
.site-footer .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:56px;padding-bottom:56px;border-bottom:1px solid rgba(255,255,255,.05)}
.site-footer .footer-brand-desc{font-size:14px;color:#475569;line-height:1.75;margin-bottom:28px;max-width:240px}
.site-footer .footer-col-title{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.14em;margin-bottom:20px}
.site-footer .footer-link{display:flex;align-items:center;gap:9px;font-size:14px;color:#64748b;text-decoration:none;margin-bottom:13px;transition:all .22s}
.site-footer .footer-link:hover{color:#e2e8f0;padding-left:5px}
.site-footer .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding:22px 0;flex-wrap:wrap;gap:14px}
.site-footer .footer-copy{font-size:13px;color:#94a3b8}
.site-footer .footer-status{display:flex;align-items:center;gap:7px}
.site-footer .footer-status-dot{width:7px;height:7px;background:#10b981;border-radius:50%;animation:fpulse 2.5s ease infinite}
.site-footer .footer-status-text{font-size:12px;color:#94a3b8}
@keyframes fpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
.site-footer .footer-acc-toggle{display:none}
@media(max-width:1024px){.site-footer .footer-grid{grid-template-columns:1fr 1fr 1fr;gap:36px}.site-footer .footer-grid>div:first-child{grid-column:1/-1}}
@media(max-width:768px){
  .site-footer .footer-body{padding:40px 0 0}
  .site-footer .footer-inner{padding:0 20px}
  .site-footer .footer-grid{grid-template-columns:1fr;gap:0;padding-bottom:0;border-bottom:none}
  .site-footer .footer-brand-block{padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:8px}
  .site-footer .footer-acc-col{border-bottom:1px solid rgba(255,255,255,.06)}
  .site-footer .footer-acc-toggle{display:flex;justify-content:space-between;align-items:center;width:100%;background:none;border:none;padding:16px 0;cursor:pointer;color:#fff}
  .site-footer .footer-acc-toggle .footer-col-title{margin-bottom:0;font-size:12px;color:#94a3b8}
  .site-footer .footer-acc-toggle .acc-arrow{font-size:10px;color:#475569;transition:transform .25s}
  .site-footer .footer-acc-toggle.open .acc-arrow{transform:rotate(180deg)}
  .site-footer .footer-acc-body{max-height:0;overflow:hidden;transition:max-height .3s}
  .site-footer .footer-acc-body.open{max-height:300px}
  .site-footer .footer-bottom{padding:20px 0;border-top:1px solid rgba(255,255,255,.06);margin-top:8px}
}
</style>
<footer class="site-footer" id="site-footer-injected">
  <div class="footer-gradient-line"></div>
  <div class="footer-body">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand-block">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span style="font-size:28px">🚛</span><span style="font-size:18px;font-weight:800;background:linear-gradient(135deg,#06b6d4,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Курсы Диспетчера</span></div>
          <p class="footer-brand-desc">Профессиональное обучение диспетчеров грузоперевозок США.</p>
          <a href="mailto:info@dispatch4you.com" class="footer-link" style="margin-top:8px">✉️ info@dispatch4you.com</a>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">📚 Обучение</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_pages/documentation.html" class="footer-link">📚 База знаний</a>
            <a href="BASE_pages/modules-index.html" class="footer-link">✍️ Тесты знаний</a>
            <a href="BASE_pages/simulator.html" class="footer-link">🎯 Симулятор</a>
            <a href="BASE_pages/testing.html" class="footer-link">✍️ Тестирование</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">🛠️ Инструменты</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_pages/glossary.html" class="footer-link">📝 Глоссарий</a>
            <a href="BASE_pages/cases.html" class="footer-link">💼 Кейсы</a>
            <a href="BASE_pages/ai-broker-chat.html" class="footer-link">🤖 AI Брокер</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">🏢 Компания</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_about.html" class="footer-link">ℹ️ О нас</a>
            <a href="BASE_dashboard.html" class="footer-link">👤 Личный кабинет</a>
            <a href="mailto:info@dispatch4you.com" class="footer-link">✉️ Контакты</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">© 2025 Dispatch4You. Все права защищены.</span>
        <div class="footer-status"><span class="footer-status-dot"></span><span class="footer-status-text">Все системы работают</span></div>
      </div>
    </div>
  </div>
</footer>`;
        html = html.replace(/BASE_/g, BASE);
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ── Start ─────────────────────────────────────────────────────
    // Load Firebase Auth first — on ALL pages via nav-loader
    (function loadFirebaseAuth() {
        // Avoid double-loading
        if (document.querySelector('script[src*="firebase-auth-init"]')) return;
        var s = document.createElement('script');
        s.type = 'module';
        s.src = BASE + 'firebase-auth-init.js?v=3.0';
        document.head.appendChild(s);
    })();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNav);
    } else {
        loadNav();
    }
})();
