/**
 * nav-loader.js v10.0 — Updated logo cache busting
 * Loads nav.html, injects into #nav-placeholder, handles mobile menu
 */
(function () {
    var isSubfolder = window.location.pathname.includes('/pages/');
    var BASE = isSubfolder ? '../' : '';

    // ── Load nav HTML ──────────────────────────────────────────────
    function loadNav() {
        fetch(BASE + 'nav.html?v=10.0')
            .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
            .then(function (html) { inject(html.replace(/\{\{BASE\}\}/g, BASE)); })
            .catch(function () { inject(NAV_INLINE.replace(/\{\{BASE\}\}/g, BASE)); });
    }

    var NAV_INLINE = `<nav class="navbar"><div class="nav-container"><div class="nav-content">
<a href="{{BASE}}index.html" class="logo"><span class="logo-text"><span class="logo-full">Dispatch4You</span><span class="logo-short">D4Y</span><span class="logo-subtitle">Курсы Диспетчера</span></span></a>
<div class="nav-links">
  <div class="nav-item"><button class="nav-btn">Курс обучения <span class="arrow">▾</span></button><div class="dropdown mega-dropdown"><div class="dropdown-expandable"><a href="{{BASE}}pages/documentation.html" class="dropdown-main">📚 Курс - 15 Уроков</a><span class="dropdown-arrow">▼</span></div><div class="dropdown-nested"><div class="dropdown-nested-title">Разделы курса:</div><div class="dropdown-nested-grid"><a href="{{BASE}}pages/intro.html" class="dropdown-nested-item">1. Введение в профессию</a><a href="{{BASE}}pages/glossary.html" class="dropdown-nested-item">2. Глоссарий терминов</a><a href="{{BASE}}pages/role.html" class="dropdown-nested-item">3. Роль диспетчера</a><a href="{{BASE}}pages/equipment.html" class="dropdown-nested-item">4. Типы траков</a><a href="{{BASE}}pages/routes.html" class="dropdown-nested-item">5. Маршруты и география</a><a href="{{BASE}}pages/docs.html" class="dropdown-nested-item">6. Документы</a><a href="{{BASE}}pages/loadboards.html" class="dropdown-nested-item">7. Load Boards</a><a href="{{BASE}}pages/negotiation.html" class="dropdown-nested-item">8. Переговоры</a><a href="{{BASE}}pages/communication.html" class="dropdown-nested-item">9. Коммуникация</a><a href="{{BASE}}pages/problems.html" class="dropdown-nested-item">10. Проблемные ситуации</a><a href="{{BASE}}pages/finances.html" class="dropdown-nested-item">11. Финансы</a><a href="{{BASE}}pages/regulations.html" class="dropdown-nested-item">12. Compliance</a><a href="{{BASE}}pages/technology.html" class="dropdown-nested-item">13. Технологии</a><a href="{{BASE}}pages/cases.html" class="dropdown-nested-item">14. Практические кейсы</a><a href="{{BASE}}pages/career.html" class="dropdown-nested-item">15. Карьера и развитие</a></div></div><div class="dropdown-expandable"><a href="{{BASE}}pages/modules-index.html" class="dropdown-main">✍️ Обучение - 12 Модулей</a><span class="dropdown-arrow">▼</span></div><div class="dropdown-nested"><div class="dropdown-nested-title">Модули тестирования:</div><div class="dropdown-nested-grid"><a href="{{BASE}}pages/doc-module-1-complete.html" class="dropdown-nested-item">1. Основы профессии</a><a href="{{BASE}}pages/doc-module-2-complete.html" class="dropdown-nested-item">2. Типы грузоперевозок</a><a href="{{BASE}}pages/doc-module-3-complete.html" class="dropdown-nested-item">3. Документы диспетчера</a><a href="{{BASE}}pages/doc-module-4-complete.html" class="dropdown-nested-item">4. Load Boards</a><a href="{{BASE}}pages/doc-module-5-complete.html" class="dropdown-nested-item">5. Переговоры</a><a href="{{BASE}}pages/doc-module-6-complete.html" class="dropdown-nested-item">6. Маршруты</a><a href="{{BASE}}pages/doc-module-7-complete.html" class="dropdown-nested-item">7. Коммуникация</a><a href="{{BASE}}pages/doc-module-8-complete.html" class="dropdown-nested-item">8. Проблемы в пути</a><a href="{{BASE}}pages/doc-module-9-complete.html" class="dropdown-nested-item">9. Финансы</a><a href="{{BASE}}pages/doc-module-10-complete.html" class="dropdown-nested-item">10. Compliance</a><a href="{{BASE}}pages/doc-module-11-complete.html" class="dropdown-nested-item">11. Технологии</a><a href="{{BASE}}pages/doc-module-12-complete.html" class="dropdown-nested-item">12. Итоговый тест</a></div></div><a href="{{BASE}}pages/glossary.html">📖 Термины и Сокращения</a></div></div>
  <div class="nav-item"><button class="nav-btn">Инструменты <span class="arrow">▾</span></button><div class="dropdown"><a href="{{BASE}}pages/ai-broker-chat.html">🎙️ AI Переговоры</a><a href="{{BASE}}pages/testing.html">🎯 Проверить себя</a><a href="{{BASE}}pages/Trainer-Quiz.html">💡 Флеш-карточки</a><a href="{{BASE}}pages/load-finder.html">📦 Поиск грузов</a><a href="{{BASE}}pages/users-stats.html">🎖️ Рейтинг</a></div></div>
  <div class="nav-item"><button class="nav-btn">Информация <span class="arrow">▾</span></button><div class="dropdown"><a href="{{BASE}}about.html">ℹ️ О курсе</a><a href="{{BASE}}faq.html">❓ Частые вопросы</a><a href="{{BASE}}contacts.html">📩 Написать нам</a><a href="{{BASE}}pricing.html">💎 Планы и цены</a></div></div>
  <a href="{{BASE}}pages/users-stats.html" class="nav-btn" style="text-decoration:none;display:none;">📊 Стат</a>
</div>
<a href="{{BASE}}pages/users-stats.html" class="nav-stats-icon" id="nav-stats-icon" style="display:none" title="Статистика пользователей"><i class="fa fa-chart-bar"></i></a>
<div class="nav-actions" id="nav-actions-desktop"><a href="{{BASE}}login.html" class="btn-login">Войти</a><a href="{{BASE}}register.html" class="btn-signup">Регистрация</a></div>
<div class="mob-xp-wrap" id="mob-xp-wrap" style="display:none"><a href="{{BASE}}dashboard.html" class="mob-xp-badge" id="mob-xp-badge"><span class="mob-xp-avatar" id="mob-xp-avatar">👤</span><span class="mob-xp-val" id="mob-xp-val">⚡ 0 XP</span></a></div>
<button class="burger" id="burgerBtn"><span></span><span></span><span></span></button>
</div></div></nav>
<div class="mob-overlay" id="mobOverlay"></div>
<div class="mob-menu" id="mobMenu">
  <div class="mob-header"><span style="display:flex;flex-direction:column;align-items:center;line-height:1.2;">Dispatch4You<span style="font-size:9px;color:rgba(148,163,184,0.9);font-weight:500;margin-top:1px;">Курсы Диспетчера</span></span><button id="mobClose">✕</button></div>
  <div class="mob-body">
    <div id="mob-profile-card" style="display:none;margin-bottom:12px;padding:16px;background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.15));border:1px solid rgba(99,102,241,.3);border-radius:16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div id="mob-profile-avatar" style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0;">👤</div>
        <div style="flex:1;min-width:0;">
          <div id="mob-profile-name" style="font-size:15px;font-weight:700;color:#e0e7ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
          <div id="mob-profile-email" style="font-size:12px;color:#a5b4fc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
          <div id="mob-profile-xp" style="font-size:11px;color:#fbbf24;font-weight:700;margin-top:2px;">⚡ 0 XP</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <a id="mob-profile-dash" href="{{BASE}}dashboard.html" style="flex:1;padding:10px;background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.35);border-radius:10px;color:#a5b4fc;font-size:13px;font-weight:600;text-decoration:none;text-align:center;">👤 Кабинет</a>
        <button onclick="authLogout(event)" style="flex:1;padding:10px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:10px;color:#fca5a5;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🚪 Выйти</button>
      </div>
    </div>
    <div class="mob-actions" id="mob-actions"><a href="{{BASE}}login.html" class="btn-login">Войти</a><a href="{{BASE}}register.html" class="btn-signup">Регистрация</a></div>
    <div class="mob-acc"><div class="mob-acc-title">📚 Курс обучения <span class="mob-arr">▼</span></div><div class="mob-acc-body"><div class="mob-sub-main-wrapper"><a href="{{BASE}}pages/documentation.html" class="mob-sub mob-sub-main">📚 Курс - 15 Уроков</a><span class="mob-sub-arrow">▼</span></div><div class="mob-sub-nested"><div class="mob-sub-nested-title">Разделы курса:</div><a href="{{BASE}}pages/intro.html" class="mob-sub-nested-item">1. Введение в профессию</a><a href="{{BASE}}pages/glossary.html" class="mob-sub-nested-item">2. Глоссарий терминов</a><a href="{{BASE}}pages/role.html" class="mob-sub-nested-item">3. Роль диспетчера</a><a href="{{BASE}}pages/equipment.html" class="mob-sub-nested-item">4. Типы траков</a><a href="{{BASE}}pages/routes.html" class="mob-sub-nested-item">5. Маршруты и география</a><a href="{{BASE}}pages/docs.html" class="mob-sub-nested-item">6. Документы</a><a href="{{BASE}}pages/loadboards.html" class="mob-sub-nested-item">7. Load Boards</a><a href="{{BASE}}pages/negotiation.html" class="mob-sub-nested-item">8. Переговоры</a><a href="{{BASE}}pages/communication.html" class="mob-sub-nested-item">9. Коммуникация</a><a href="{{BASE}}pages/problems.html" class="mob-sub-nested-item">10. Проблемные ситуации</a><a href="{{BASE}}pages/finances.html" class="mob-sub-nested-item">11. Финансы</a><a href="{{BASE}}pages/regulations.html" class="mob-sub-nested-item">12. Compliance</a><a href="{{BASE}}pages/technology.html" class="mob-sub-nested-item">13. Технологии</a><a href="{{BASE}}pages/cases.html" class="mob-sub-nested-item">14. Практические кейсы</a><a href="{{BASE}}pages/career.html" class="mob-sub-nested-item">15. Карьера и развитие</a></div><div class="mob-sub-main-wrapper"><a href="{{BASE}}pages/modules-index.html" class="mob-sub mob-sub-main">✍️ Обучение - 12 Модулей</a><span class="mob-sub-arrow">▼</span></div><div class="mob-sub-nested"><div class="mob-sub-nested-title">Модули тестирования:</div><a href="{{BASE}}pages/doc-module-1-complete.html" class="mob-sub-nested-item">1. Основы профессии</a><a href="{{BASE}}pages/doc-module-2-complete.html" class="mob-sub-nested-item">2. Типы грузоперевозок</a><a href="{{BASE}}pages/doc-module-3-complete.html" class="mob-sub-nested-item">3. Документы диспетчера</a><a href="{{BASE}}pages/doc-module-4-complete.html" class="mob-sub-nested-item">4. Load Boards</a><a href="{{BASE}}pages/doc-module-5-complete.html" class="mob-sub-nested-item">5. Переговоры</a><a href="{{BASE}}pages/doc-module-6-complete.html" class="mob-sub-nested-item">6. Маршруты</a><a href="{{BASE}}pages/doc-module-7-complete.html" class="mob-sub-nested-item">7. Коммуникация</a><a href="{{BASE}}pages/doc-module-8-complete.html" class="mob-sub-nested-item">8. Проблемы в пути</a><a href="{{BASE}}pages/doc-module-9-complete.html" class="mob-sub-nested-item">9. Финансы</a><a href="{{BASE}}pages/doc-module-10-complete.html" class="mob-sub-nested-item">10. Compliance</a><a href="{{BASE}}pages/doc-module-11-complete.html" class="mob-sub-nested-item">11. Технологии</a><a href="{{BASE}}pages/doc-module-12-complete.html" class="mob-sub-nested-item">12. Итоговый тест</a></div></div></div>
    <div class="mob-acc"><div class="mob-acc-title">🛠️ Инструменты <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="{{BASE}}pages/ai-broker-chat.html" class="mob-sub">🎙️ AI Переговоры</a><a href="{{BASE}}pages/testing.html" class="mob-sub">🎯 Проверить себя</a><a href="{{BASE}}pages/Trainer-Quiz.html" class="mob-sub">💡 Флеш-карточки</a><a href="{{BASE}}pages/load-finder.html" class="mob-sub">📦 Поиск грузов</a><a href="{{BASE}}pages/users-stats.html" class="mob-sub">🎖️ Рейтинг</a></div></div>
    <div class="mob-acc"><div class="mob-acc-title">ℹ️ Информация <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="{{BASE}}about.html" class="mob-sub">ℹ️ О курсе</a><a href="{{BASE}}faq.html" class="mob-sub">❓ Частые вопросы</a><a href="{{BASE}}contacts.html" class="mob-sub">📩 Написать нам</a><a href="{{BASE}}pricing.html" class="mob-sub">💎 Планы и цены</a></div></div>
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
        injectFooter();

        document.dispatchEvent(new Event('navLoaded'));

        // Трекер прогресса тестов на страницах модулей
        (function() {
            var m = window.location.pathname.match(/doc-module-(\d+)/);
            if (!m) return;
            var mid = 'module-' + m[1];
            function gp() { try { return JSON.parse(localStorage.getItem('moduleProgress')||'{}'); } catch(e) { return {}; } }
            document.addEventListener('click', function(e) {
                var opt = e.target.closest('.quiz-option');
                if (!opt) return;
                var qb = opt.closest('.quick-check-block');
                if (!qb) return;
                var qid = qb.getAttribute('data-quiz-id') || qb.id;
                if (!qid) return;
                var ca = qb.getAttribute('data-correct-answer');
                var sa = opt.getAttribute('data-answer');
                var p = gp();
                if (!p[mid]) p[mid] = {};
                p[mid][qid] = { completed: true, correct: sa === ca, ts: Date.now() };
                localStorage.setItem('moduleProgress', JSON.stringify(p));
            }, true);
        })();
        // Применяем auth UI после загрузки nav
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
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

        // Desktop nested dropdown toggle - only on arrow click
        document.querySelectorAll('.dropdown-arrow').forEach(function (arrow) {
            arrow.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                
                var expandable = this.parentElement;
                var nextElement = expandable.nextElementSibling;
                
                if (nextElement && nextElement.classList.contains('dropdown-nested')) {
                    this.classList.toggle('expanded');
                    nextElement.classList.toggle('show');
                    
                    // Find parent .mega-dropdown and toggle expanded class
                    var megaDropdown = this.closest('.mega-dropdown');
                    if (megaDropdown) {
                        // Check if any nested sections are open
                        var hasOpenNested = megaDropdown.querySelectorAll('.dropdown-nested.show').length > 0;
                        if (hasOpenNested) {
                            megaDropdown.classList.add('expanded');
                        } else {
                            megaDropdown.classList.remove('expanded');
                        }
                    }
                }
            };
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

        // Nested submenu toggle - only on arrow click
        var arrows = document.querySelectorAll('.mob-sub-arrow');
        console.log('Found arrows:', arrows.length);
        arrows.forEach(function (arrow) {
            arrow.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                
                var wrapper = this.parentElement;
                var nextElement = wrapper.nextElementSibling;
                
                console.log('Arrow clicked, wrapper:', wrapper, 'next:', nextElement);
                
                if (nextElement && nextElement.classList.contains('mob-sub-nested')) {
                    this.classList.toggle('expanded');
                    nextElement.classList.toggle('show');
                }
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
.site-footer .footer-brand-desc{font-size:14px;color:#e2e8f0;line-height:1.75;margin-bottom:28px;max-width:240px}
.site-footer .footer-col-title{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.14em;margin-bottom:20px}
.site-footer .footer-link{display:flex;align-items:center;gap:9px;font-size:13px;color:#cbd5e1;text-decoration:none;margin-bottom:10px;transition:all .22s;white-space:nowrap}
.site-footer .footer-link:hover{color:#ffffff;padding-left:5px}
.site-footer .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding:22px 0;flex-wrap:wrap;gap:14px}
.site-footer .footer-copy{font-size:13px;color:#e2e8f0}
.site-footer .footer-status{display:flex;align-items:center;gap:7px}
.site-footer .footer-status-dot{width:7px;height:7px;background:#10b981;border-radius:50%;animation:fpulse 2.5s ease infinite}
.site-footer .footer-status-text{font-size:12px;color:#cbd5e1}
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
  .site-footer .footer-acc-toggle .footer-col-title{margin-bottom:0;font-size:12px;color:#e2e8f0}
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
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span style="font-size:28px">🚛</span><span style="font-size:18px;font-weight:800;background:linear-gradient(135deg,#06b6d4,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Dispatch4You.Com</span></div>
          <p class="footer-brand-desc">Профессиональное обучение диспетчеров грузоперевозок США.</p>
          <a href="mailto:info@dispatch4you.com" class="footer-link" style="margin-top:8px">✉️ info@dispatch4you.com</a>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">📚 Обучение</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_pages/documentation.html" class="footer-link">📚 Курс - 15 Уроков</a>
            <a href="BASE_pages/modules-index.html" class="footer-link">✍️ Обучение - 12 Модулей</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">🛠️ Инструменты</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_pages/ai-broker-chat.html" class="footer-link">🎙️ AI Переговоры</a>
            <a href="BASE_pages/testing.html" class="footer-link">🎯 Проверить себя</a>
            <a href="BASE_pages/Trainer-Quiz.html" class="footer-link">💡 Флеш-карточки</a>
            <a href="BASE_pages/load-finder.html" class="footer-link">📦 Поиск грузов</a>
            <a href="BASE_pages/users-stats.html" class="footer-link">🎖️ Рейтинг</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">ℹ️ Информация</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_about.html" class="footer-link">ℹ️ О курсе</a>
            <a href="BASE_faq.html" class="footer-link">❓ Частые вопросы</a>
            <a href="BASE_contacts.html" class="footer-link">📩 Написать нам</a>
            <a href="BASE_pricing.html" class="footer-link">💎 Планы и цены</a>
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNav);
    } else {
        loadNav();
    }
})();
