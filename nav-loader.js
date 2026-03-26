/**
 * nav-loader.js v5.1 - Extra compact design
 * - Even smaller buttons (6px 12px padding)
 * - Smaller font (12px)
 * - Consistent navbar height (64px)
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
                        <a href="{{BASE}}pages/modules-index.html">🎓 Модули с тестами</a>
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
                <a href="{{BASE}}pages/modules-index.html" class="mob-sub">🎓 Модули с тестами</a>
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
        injectFooter();
        document.dispatchEvent(new Event('navLoaded'));
        if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
    }

    function injectFooter() {
        if (document.getElementById('site-footer-injected')) return;
        var FOOTER_HTML = `<style>
.site-footer{position:relative;z-index:1;margin-top:80px}
.site-footer .footer-gradient-line{height:1px;background:linear-gradient(90deg,transparent 0%,rgba(6,182,212,.6) 30%,rgba(249,115,22,.5) 70%,transparent 100%)}
.site-footer .footer-body{background:transparent;padding:72px 0 0}
.site-footer .footer-inner{max-width:1140px;margin:0 auto;padding:0 40px}
.site-footer .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:56px;padding-bottom:56px;border-bottom:1px solid rgba(255,255,255,.05)}
.site-footer .footer-brand-desc{font-size:14px;color:#475569;line-height:1.75;margin-bottom:28px;max-width:240px}
.site-footer .footer-email-btn{display:inline-flex;align-items:center;gap:10px;padding:11px 20px;background:rgba(6,182,212,.07);border:1px solid rgba(6,182,212,.18);border-radius:12px;text-decoration:none;transition:all .3s ease}
.site-footer .footer-email-btn:hover{background:rgba(6,182,212,.14);border-color:rgba(6,182,212,.4);transform:translateY(-2px);box-shadow:0 8px 24px rgba(6,182,212,.15)}
.site-footer .footer-email-btn span{font-size:13px;font-weight:600;color:#06b6d4}
.site-footer .footer-col-title{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.14em;margin-bottom:20px}
.site-footer .footer-link{display:flex;align-items:center;gap:9px;font-size:14px;color:#64748b;text-decoration:none;margin-bottom:13px;transition:all .22s ease;padding-left:0}
.site-footer .footer-link:hover{color:#e2e8f0;padding-left:5px}
.site-footer .footer-link:last-child{margin-bottom:0}
.site-footer .footer-link .link-icon{font-size:14px;opacity:.7}
.site-footer .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding:22px 0;flex-wrap:wrap;gap:14px}
.site-footer .footer-copy{font-size:13px;color:#94a3b8}
.site-footer .footer-status{display:flex;align-items:center;gap:7px}
.site-footer .footer-status-dot{width:7px;height:7px;background:#10b981;border-radius:50%;box-shadow:0 0 8px rgba(16,185,129,.7);animation:footerPulse 2.5s ease infinite}
.site-footer .footer-status-text{font-size:12px;color:#94a3b8}
@keyframes footerPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
/* Desktop accordion hidden */
.site-footer .footer-acc-toggle{display:none}
@media(max-width:1024px){
  .site-footer .footer-grid{grid-template-columns:1fr 1fr 1fr;gap:36px}
  .site-footer .footer-grid>div:first-child{grid-column:1/-1;display:flex;align-items:flex-start;gap:40px;flex-wrap:wrap}
  .site-footer .footer-brand-desc{margin-bottom:0}
}
@media(max-width:768px){
  .site-footer .footer-body{padding:40px 0 0}
  .site-footer .footer-inner{padding:0 20px}
  .site-footer .footer-grid{grid-template-columns:1fr;gap:0;padding-bottom:0;border-bottom:none}
  /* Brand block */
  .site-footer .footer-brand-block{padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:8px}
  .site-footer .footer-brand-desc{max-width:100%;margin-bottom:20px}
  /* Accordion */
  .site-footer .footer-acc-col{border-bottom:1px solid rgba(255,255,255,.06)}
  .site-footer .footer-acc-toggle{display:flex;justify-content:space-between;align-items:center;width:100%;background:none;border:none;padding:16px 0;cursor:pointer;color:#fff}
  .site-footer .footer-acc-toggle .footer-col-title{margin-bottom:0;font-size:12px;color:#94a3b8}
  .site-footer .footer-acc-toggle .acc-arrow{font-size:10px;color:#475569;transition:transform .25s ease}
  .site-footer .footer-acc-toggle.open .acc-arrow{transform:rotate(180deg)}
  .site-footer .footer-acc-body{max-height:0;overflow:hidden;transition:max-height .3s ease}
  .site-footer .footer-acc-body.open{max-height:300px}
  .site-footer .footer-acc-body .footer-link{padding:8px 0;margin-bottom:0;border-bottom:1px solid rgba(255,255,255,.03)}
  .site-footer .footer-acc-body .footer-link:last-child{border-bottom:none;padding-bottom:12px}
  .site-footer .footer-bottom{padding:20px 0;border-top:1px solid rgba(255,255,255,.06);margin-top:8px}
  .site-footer .footer-copy{font-size:12px}
}
@media(max-width:480px){
  .site-footer .footer-inner{padding:0 16px}
}
</style>
<footer class="site-footer" id="site-footer-injected">
  <div class="footer-gradient-line"></div>
  <div class="footer-body">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand-block">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <span style="font-size:28px">🚛</span>
            <span style="font-size:18px;font-weight:800;background:linear-gradient(135deg,#06b6d4,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Курсы Диспетчера</span>
          </div>
          <p class="footer-brand-desc">Профессиональное обучение диспетчеров грузоперевозок США. От новичка до эксперта за 3 месяца.</p>
          <a href="{{BASE}}mailto:info@dispatch4you.com" class="footer-email-btn" onclick="this.href='mailto:info@dispatch4you.com';return true;">
            <span style="font-size:16px">✉️</span>
            <span>info@dispatch4you.com</span>
          </a>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
            <span class="footer-col-title">📚 Обучение</span><span class="acc-arrow">▼</span>
          </button>
          <div class="footer-acc-body">
            <a href="{{BASE}}pages/modules-index.html" class="footer-link"><span class="link-icon">📚</span>12 Модулей</a>
            <a href="{{BASE}}pages/simulator.html" class="footer-link"><span class="link-icon">🎯</span>Симулятор</a>
            <a href="{{BASE}}pages/dispatcher-cards.html" class="footer-link"><span class="link-icon">🃏</span>Карточки</a>
            <a href="{{BASE}}pages/documentation.html" class="footer-link"><span class="link-icon">📖</span>Документация</a>
            <a href="{{BASE}}pages/testing.html" class="footer-link"><span class="link-icon">✍️</span>Тестирование</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
            <span class="footer-col-title">🛠️ Инструменты</span><span class="acc-arrow">▼</span>
          </button>
          <div class="footer-acc-body">
            <a href="{{BASE}}pages/loadboard.html" class="footer-link"><span class="link-icon">📦</span>Load Board</a>
            <a href="{{BASE}}pages/glossary.html" class="footer-link"><span class="link-icon">📝</span>Глоссарий</a>
            <a href="{{BASE}}pages/cases.html" class="footer-link"><span class="link-icon">💼</span>Кейсы</a>
            <a href="{{BASE}}pages/calls.html" class="footer-link"><span class="link-icon">📞</span>Звонки</a>
            <a href="{{BASE}}pages/analytics.html" class="footer-link"><span class="link-icon">📊</span>Аналитика</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
            <span class="footer-col-title">🏢 Компания</span><span class="acc-arrow">▼</span>
          </button>
          <div class="footer-acc-body">
            <a href="{{BASE}}about.html" class="footer-link"><span class="link-icon">ℹ️</span>О нас</a>
            <a href="{{BASE}}courses.html" class="footer-link"><span class="link-icon">🎓</span>Курсы</a>
            <a href="{{BASE}}dashboard.html" class="footer-link"><span class="link-icon">👤</span>Личный кабинет</a>
            <a href="mailto:info@dispatch4you.com" class="footer-link"><span class="link-icon">✉️</span>Контакты</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">© 2025 Dispatch4You. Все права защищены.</span>
        <div class="footer-status">
          <span class="footer-status-dot"></span>
          <span class="footer-status-text">Все системы работают</span>
        </div>
      </div>
    </div>
  </div>
</footer>`;
        document.body.insertAdjacentHTML('beforeend', FOOTER_HTML.replace(/\{\{BASE\}\}/g, BASE));
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
