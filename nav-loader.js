/**
 * nav-loader.js v11.0 — Unified compact logo for all screens
 * Loads nav.html, injects into #nav-placeholder, handles mobile menu
 * v10.2: + site-wide content protection (copy/right-click/screenshot deterrent)
 * v11.0: + language awareness (RU default at /, EN mirror at /en/). Detects lang
 *        from the URL prefix, loads the matching nav file, translates the shared
 *        footer + copyright modal via STR, injects an RU/EN switcher + hreflang.
 */
(function () {
    // ── Language detection ─────────────────────────────────────────
    // RU is the default at the site root; each additional language lives under
    // its own prefix (/en/, later /de/, …). Add new langs to LANGS only.
    var LANGS = ['ru', 'en'];
    // Pages that have an EN mirror (ru-path keys). Grows during rollout; the
    // switcher only offers EN where the page exists, otherwise it points to the
    // /en/ homepage — so no 404s while the translation is being rolled out.
    var EN_PAGES = ['/', '/about.html', '/career.html', '/checkout.html', '/contacts.html', '/dashboard.html', '/documentation.html', '/faq.html', '/index.html', '/login.html', '/pages/Trainer-Quiz.html', '/pages/admin.html', '/pages/ai-broker-chat.html', '/pages/all-loads.html', '/pages/analytics.html', '/pages/brokers.html', '/pages/career.html', '/pages/cases.html', '/pages/communication.html', '/pages/doc-module-1-complete.html', '/pages/doc-module-10-complete.html', '/pages/doc-module-11-complete.html', '/pages/doc-module-12-complete.html', '/pages/doc-module-2-complete.html', '/pages/doc-module-3-complete.html', '/pages/doc-module-4-complete.html', '/pages/doc-module-5-complete.html', '/pages/doc-module-6-complete.html', '/pages/doc-module-7-complete.html', '/pages/doc-module-8-complete.html', '/pages/doc-module-9-complete.html', '/pages/docs.html', '/pages/documentation.html', '/pages/equipment.html', '/pages/finances.html', '/pages/games.html', '/pages/glossary.html', '/pages/intro.html', '/pages/lesson-tracker.html', '/pages/load-finder.html', '/pages/loadboards.html', '/pages/messages.html', '/pages/modules-index.html', '/pages/negotiation.html', '/pages/problems.html', '/pages/regulations.html', '/pages/role.html', '/pages/routes.html', '/pages/technology.html', '/pages/testing.html', '/pages/users-stats.html', '/pricing.html', '/register.html'];
    var _path = window.location.pathname;
    var _m = _path.match(/^\/([a-z]{2})(\/|$)/);
    var LANG = (_m && _m[1] !== 'ru' && LANGS.indexOf(_m[1]) !== -1) ? _m[1] : 'ru';
    var LANG_ROOT = LANG === 'ru' ? '/' : '/' + LANG + '/';
    // Internal links resolve from the language root as ABSOLUTE paths, so the
    // same nav works at any depth (/, /pages/…, /en/, /en/pages/…).
    var BASE = LANG_ROOT;

    // ru-path = current path with the language prefix stripped (the canonical key)
    function ruPath() { return _path.replace(/^\/[a-z]{2}(?=\/|$)/, function (s) { return LANGS.indexOf(s.slice(1)) !== -1 && s.slice(1) !== 'ru' ? '' : s; }) || '/'; }
    // URL of the current page in a given language
    function urlFor(lang) {
        var rp = ruPath(); if (rp === '') rp = '/';
        var p = lang === 'ru' ? rp : '/' + lang + (rp === '/' ? '/' : rp);
        return p + window.location.search;
    }

    // ── Shared UI strings (footer + copyright modal) per language ──
    var STR = {
        ru: {
            footerDesc: 'Профессиональное обучение диспетчеров грузоперевозок США.',
            colLearn: '📚 Обучение', colTools: '🛠️ Инструменты', colInfo: 'ℹ️ Информация',
            lCourse: '📚 Курс - 15 Уроков', lModules: '✍️ Обучение - 12 Модулей', lGlossary: '📖 Термины и Сокращения',
            lTesting: '🎯 Тестирование диспетчера', lTrainer: '💡 Тренажер диспетчера',
            lGame: '🕹️ Мини-игры', lMap: '🗺️ USA Map Trainer', lAiChat: '🎙️ AI – Симулятор переговоров',
            lLoadFinder: '📦 Поиск грузов - Load Finder', lRating: '🎖️ Рейтинг пользователей', lAnalytics: '📊 Статистика рынка',
            lAbout: 'ℹ️ О нас', lPricing: '💎 Планы и цены', lFaq: '❓ Частые вопросы', lCareer: '🚀 Карьера', lContacts: '📩 Написать нам',
            copyright: '© 2025 Dispatch4You. Все права защищены.', status: 'Все системы работают',
            modalTitle: 'Материал защищён авторским правом',
            modalBody: 'Все материалы курса <b style="color:#06b6d4;">Dispatch4You</b> защищены авторским правом. Копирование, распространение и воспроизведение запрещены и преследуются по закону. Нарушение влечёт ответственность согласно действующему законодательству.',
            modalOk: 'Понятно'
        },
        en: {
            footerDesc: 'Professional training for U.S. freight dispatchers.',
            colLearn: '📚 Learning', colTools: '🛠️ Tools', colInfo: 'ℹ️ Information',
            lCourse: '📚 Course — 15 Lessons', lModules: '✍️ Training — 12 Modules', lGlossary: '📖 Terms & Abbreviations',
            lTesting: '🎯 Dispatcher Testing', lTrainer: '💡 Dispatcher Trainer',
            lGame: '🕹️ Mini-Games', lMap: '🗺️ USA Map Trainer', lAiChat: '🎙️ AI — Negotiation Simulator',
            lLoadFinder: '📦 Load Finder', lRating: '🎖️ User Ranking', lAnalytics: '📊 Market Analytics',
            lAbout: 'ℹ️ About Us', lPricing: '💎 Plans & Pricing', lFaq: '❓ FAQ', lCareer: '🚀 Careers', lContacts: '📩 Contact Us',
            copyright: '© 2025 Dispatch4You. All rights reserved.', status: 'All systems operational',
            modalTitle: 'This content is protected by copyright',
            modalBody: 'All <b style="color:#06b6d4;">Dispatch4You</b> course materials are protected by copyright. Copying, distribution and reproduction are prohibited and prosecuted by law. Violations carry liability under applicable law.',
            modalOk: 'Got it'
        }
    };
    var T = STR[LANG] || STR.ru;

    // ── Content protection ─────────────────────────────────────────
    // ponytail: inlined here instead of a separate site-protection.js — this
    // IIFE already runs on every public page, so one block covers the whole
    // static site with zero per-page edits. Moderate level: never touches form
    // fields. Screenshot part is best-effort only (browser can't truly block).
    function isEditable(el) {
        for (; el && el !== document; el = el.parentElement) {
            if (!el.tagName) continue;
            var t = el.tagName;
            if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return true;
            if (el.isContentEditable) return true;
            if (el.classList && el.classList.contains('allow-select')) return true;
        }
        return false;
    }

    var warnOpen = false;
    function showCopyrightWarning() {
        if (warnOpen) return;
        warnOpen = true;
        var ov = document.createElement('div');
        ov.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(3,6,14,.72);backdrop-filter:blur(6px);padding:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;');
        ov.innerHTML = '<div style="max-width:440px;width:100%;background:#0b0f1a;border:1px solid rgba(6,182,212,.4);border-radius:18px;padding:30px 26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);">' +
            '<div style="font-size:34px;margin-bottom:12px;">©️🔒</div>' +
            '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:12px;">' + T.modalTitle + '</div>' +
            '<div style="font-size:14px;line-height:1.6;color:rgba(255,255,255,.82);margin-bottom:22px;">' + T.modalBody + '</div>' +
            '<button id="d4y-warn-ok" style="padding:11px 30px;background:linear-gradient(135deg,#06b6d4,#0ea5e9);border:none;border-radius:100px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">' + T.modalOk + '</button>' +
            '</div>';
        function close() { warnOpen = false; if (ov.parentNode) ov.parentNode.removeChild(ov); }
        ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
        document.body.appendChild(ov);
        var ok = document.getElementById('d4y-warn-ok');
        if (ok) ok.onclick = close;
    }

    function initContentProtection() {
        // CSS: disable selection/drag site-wide, but keep form fields usable
        var st = document.createElement('style');
        st.textContent = 'body{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}' +
            'input,textarea,select,[contenteditable="true"],.allow-select,.allow-select *{-webkit-user-select:text!important;-moz-user-select:text!important;-ms-user-select:text!important;user-select:text!important;}' +
            'img{-webkit-user-drag:none;-khtml-user-drag:none;-moz-user-drag:none;-o-user-drag:none;user-drag:none;}';
        (document.head || document.documentElement).appendChild(st);

        // Right-click: block the menu silently (no modal — it would pop up on
        // every accidental click). Warning is reserved for actual copy attempts.
        document.addEventListener('contextmenu', function (e) {
            if (isEditable(e.target)) return;
            e.preventDefault();
        }, true);

        function blockCopy(e) {
            if (isEditable(e.target)) return;
            e.preventDefault();
            showCopyrightWarning();
        }
        document.addEventListener('copy', blockCopy, true);
        document.addEventListener('cut', blockCopy, true);

        document.addEventListener('selectstart', function (e) {
            if (!isEditable(e.target)) e.preventDefault();
        }, true);
        document.addEventListener('dragstart', function (e) {
            if (!isEditable(e.target)) e.preventDefault();
        }, true);

        document.addEventListener('keydown', function (e) {
            if (isEditable(e.target)) return;
            var k = (e.key || '').toLowerCase();
            if ((e.ctrlKey || e.metaKey) && (k === 'c' || k === 'x')) {
                e.preventDefault();
                showCopyrightWarning();
            }
        }, true);

        // Best-effort anti-screenshot.
        // ponytail: catches only the PrintScreen key; can't stop Snipping Tool,
        // phone shots, or a camera. Upgrade path: none client-side (platform limit).
        function onPrintScreen(e) {
            if (e.key !== 'PrintScreen') return;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText('').catch(function () {});
                }
            } catch (err) { /* clipboard API needs https / permission */ }
            showCopyrightWarning();
        }
        document.addEventListener('keydown', onPrintScreen, true);
        document.addEventListener('keyup', onPrintScreen, true);
    }

    initContentProtection();

    // ponytail: one check — forms breaking hinges entirely on isEditable().
    // Run with ?d4yselftest=1 in the URL; silent otherwise.
    if (window.location.search.indexOf('d4yselftest') !== -1) {
        var mk = function (tag, attrs) {
            var e = document.createElement(tag);
            if (attrs) for (var a in attrs) e.setAttribute(a, attrs[a]);
            return e;
        };
        var wrap = mk('div'), inp = mk('input'), ta = mk('textarea'),
            plain = mk('p'), ce = mk('div', { contenteditable: 'true' }),
            ceChild = mk('span'), allow = mk('div', { class: 'allow-select' });
        ce.appendChild(ceChild);
        [inp, ta, plain, ce, allow].forEach(function (n) { wrap.appendChild(n); });
        document.body.appendChild(wrap);
        console.assert(isEditable(inp) === true, 'input editable');
        console.assert(isEditable(ta) === true, 'textarea editable');
        console.assert(isEditable(ce) === true, 'contenteditable editable');
        console.assert(isEditable(ceChild) === true, 'child of contenteditable editable');
        console.assert(isEditable(allow) === true, 'allow-select passes');
        console.assert(isEditable(plain) === false, 'plain p NOT editable');
        document.body.removeChild(wrap);
        console.log('[d4y] isEditable self-check done');
    }

    // ── Load nav HTML ──────────────────────────────────────────────
    function loadNav() {
        // Language-specific nav file, absolute path (works from any depth).
        var navFile = (LANG === 'ru' ? '/nav.html' : '/nav.' + LANG + '.html') + '?v=11.2';
        fetch(navFile)
            .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
            .then(function (html) { inject(html.replace(/\{\{BASE\}\}/g, BASE)); })
            .catch(function () { inject(NAV_INLINE.replace(/\{\{BASE\}\}/g, BASE)); });
    }

    var NAV_INLINE = `<nav class="navbar"><div class="nav-container"><div class="nav-content">
<a href="{{BASE}}index.html" class="logo"><span class="logo-text-wrapper"><span class="logo-text">Dispatch4You</span></span></a>
<div class="nav-links">
  <div class="nav-item"><button class="nav-btn">Курс обучения <span class="arrow">▾</span></button><div class="dropdown mega-dropdown"><div class="dropdown-expandable"><a href="{{BASE}}pages/documentation.html" class="dropdown-main">📚 Курс - 15 Уроков</a><span class="dropdown-arrow">▼</span></div><div class="dropdown-nested"><div class="dropdown-nested-title">Разделы курса:</div><div class="dropdown-nested-grid"><a href="{{BASE}}pages/intro.html" class="dropdown-nested-item">1. Введение в профессию</a><a href="{{BASE}}pages/glossary.html" class="dropdown-nested-item">2. Глоссарий терминов</a><a href="{{BASE}}pages/role.html" class="dropdown-nested-item">3. Роль диспетчера</a><a href="{{BASE}}pages/equipment.html" class="dropdown-nested-item">4. Типы траков</a><a href="{{BASE}}pages/routes.html" class="dropdown-nested-item">5. Маршруты и география</a><a href="{{BASE}}pages/docs.html" class="dropdown-nested-item">6. Документы</a><a href="{{BASE}}pages/loadboards.html" class="dropdown-nested-item">7. Load Boards</a><a href="{{BASE}}pages/negotiation.html" class="dropdown-nested-item">8. Переговоры</a><a href="{{BASE}}pages/communication.html" class="dropdown-nested-item">9. Коммуникация</a><a href="{{BASE}}pages/problems.html" class="dropdown-nested-item">10. Проблемные ситуации</a><a href="{{BASE}}pages/finances.html" class="dropdown-nested-item">11. Финансы</a><a href="{{BASE}}pages/regulations.html" class="dropdown-nested-item">12. Compliance</a><a href="{{BASE}}pages/technology.html" class="dropdown-nested-item">13. Технологии</a><a href="{{BASE}}pages/cases.html" class="dropdown-nested-item">14. Практические кейсы</a><a href="{{BASE}}pages/career.html" class="dropdown-nested-item">15. Карьера и развитие</a></div></div><div class="dropdown-expandable"><a href="{{BASE}}pages/modules-index.html" class="dropdown-main">✍️ Обучение - 12 Модулей</a><span class="dropdown-arrow">▼</span></div><div class="dropdown-nested"><div class="dropdown-nested-title">Модули тестирования:</div><div class="dropdown-nested-grid"><a href="{{BASE}}pages/doc-module-1-complete.html" class="dropdown-nested-item">1. Основы профессии</a><a href="{{BASE}}pages/doc-module-2-complete.html" class="dropdown-nested-item">2. Типы грузоперевозок</a><a href="{{BASE}}pages/doc-module-3-complete.html" class="dropdown-nested-item">3. Документы диспетчера</a><a href="{{BASE}}pages/doc-module-4-complete.html" class="dropdown-nested-item">4. Load Boards</a><a href="{{BASE}}pages/doc-module-5-complete.html" class="dropdown-nested-item">5. Переговоры</a><a href="{{BASE}}pages/doc-module-6-complete.html" class="dropdown-nested-item">6. Маршруты</a><a href="{{BASE}}pages/doc-module-7-complete.html" class="dropdown-nested-item">7. Коммуникация</a><a href="{{BASE}}pages/doc-module-8-complete.html" class="dropdown-nested-item">8. Проблемы в пути</a><a href="{{BASE}}pages/doc-module-9-complete.html" class="dropdown-nested-item">9. Финансы</a><a href="{{BASE}}pages/doc-module-10-complete.html" class="dropdown-nested-item">10. Compliance</a><a href="{{BASE}}pages/doc-module-11-complete.html" class="dropdown-nested-item">11. Технологии</a><a href="{{BASE}}pages/doc-module-12-complete.html" class="dropdown-nested-item">12. Итоговый тест</a></div></div><a href="{{BASE}}pages/glossary.html">📖 Термины и Сокращения</a><a href="{{BASE}}pages/testing.html">🎯 Тестирование диспетчера</a><a href="{{BASE}}pages/Trainer-Quiz.html">💡 Тренажер диспетчера</a></div></div>
  <div class="nav-item"><button class="nav-btn">Инструменты <span class="arrow">▾</span></button><div class="dropdown"><a href="/map-trainer/">🗺️ USA Map Trainer</a><a href="{{BASE}}pages/ai-broker-chat.html">🎙️ AI – Симулятор переговоров</a><a href="/games/">🕹️ Мини-игры</a><a href="{{BASE}}pages/load-finder.html">📦 Поиск грузов - Load Finder</a><a href="{{BASE}}pages/users-stats.html">🎖️ Рейтинг пользователей</a><a href="{{BASE}}pages/analytics.html">📊 Статистика рынка</a></div></div>
  <div class="nav-item"><button class="nav-btn">Информация <span class="arrow">▾</span></button><div class="dropdown"><a href="{{BASE}}about.html">ℹ️ О нас</a><a href="{{BASE}}pricing.html">💎 Планы и цены</a><a href="{{BASE}}faq.html">❓ Частые вопросы</a><a href="{{BASE}}career.html">🚀 Карьера</a><a href="{{BASE}}contacts.html">📩 Написать нам</a></div></div>
  <a href="{{BASE}}pages/users-stats.html" class="nav-btn" style="text-decoration:none;display:none;">📊 Стат</a>
</div>
<a href="{{BASE}}pages/users-stats.html" class="nav-stats-icon" id="nav-stats-icon" style="display:none" title="Статистика пользователей"><i class="fa fa-chart-bar"></i></a>
<div class="nav-actions" id="nav-actions-desktop"><a href="{{BASE}}login.html" class="btn-login">Войти</a><a href="{{BASE}}register.html" class="btn-signup">Регистрация</a></div>
<div class="mob-xp-wrap" id="mob-xp-wrap" style="display:none"><a href="{{BASE}}dashboard.html" class="mob-xp-badge" id="mob-xp-badge"><span class="mob-xp-avatar" id="mob-xp-avatar">👤</span><span class="mob-xp-val" id="mob-xp-val">⚡ 0 XP</span></a></div>
<div id="topbar-lang-anchor"></div>
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
    <div class="mob-acc" data-section="course"><div class="mob-acc-title">📚 Курс обучения <span class="mob-arr">▼</span></div><div class="mob-acc-body"><div class="mob-sub-main-wrapper"><a href="{{BASE}}pages/documentation.html" class="mob-sub mob-sub-main">📚 Курс - 15 Уроков</a><span class="mob-sub-arrow">▼</span></div><div class="mob-sub-nested"><div class="mob-sub-nested-title">Разделы курса:</div><a href="{{BASE}}pages/intro.html" class="mob-sub-nested-item">1. Введение в профессию</a><a href="{{BASE}}pages/glossary.html" class="mob-sub-nested-item">2. Глоссарий терминов</a><a href="{{BASE}}pages/role.html" class="mob-sub-nested-item">3. Роль диспетчера</a><a href="{{BASE}}pages/equipment.html" class="mob-sub-nested-item">4. Типы траков</a><a href="{{BASE}}pages/routes.html" class="mob-sub-nested-item">5. Маршруты и география</a><a href="{{BASE}}pages/docs.html" class="mob-sub-nested-item">6. Документы</a><a href="{{BASE}}pages/loadboards.html" class="mob-sub-nested-item">7. Load Boards</a><a href="{{BASE}}pages/negotiation.html" class="mob-sub-nested-item">8. Переговоры</a><a href="{{BASE}}pages/communication.html" class="mob-sub-nested-item">9. Коммуникация</a><a href="{{BASE}}pages/problems.html" class="mob-sub-nested-item">10. Проблемные ситуации</a><a href="{{BASE}}pages/finances.html" class="mob-sub-nested-item">11. Финансы</a><a href="{{BASE}}pages/regulations.html" class="mob-sub-nested-item">12. Compliance</a><a href="{{BASE}}pages/technology.html" class="mob-sub-nested-item">13. Технологии</a><a href="{{BASE}}pages/cases.html" class="mob-sub-nested-item">14. Практические кейсы</a><a href="{{BASE}}pages/career.html" class="mob-sub-nested-item">15. Карьера и развитие</a></div><div class="mob-sub-main-wrapper"><a href="{{BASE}}pages/modules-index.html" class="mob-sub mob-sub-main">✍️ Обучение - 12 Модулей</a><span class="mob-sub-arrow">▼</span></div><div class="mob-sub-nested"><div class="mob-sub-nested-title">Модули тестирования:</div><a href="{{BASE}}pages/doc-module-1-complete.html" class="mob-sub-nested-item">1. Основы профессии</a><a href="{{BASE}}pages/doc-module-2-complete.html" class="mob-sub-nested-item">2. Типы грузоперевозок</a><a href="{{BASE}}pages/doc-module-3-complete.html" class="mob-sub-nested-item">3. Документы диспетчера</a><a href="{{BASE}}pages/doc-module-4-complete.html" class="mob-sub-nested-item">4. Load Boards</a><a href="{{BASE}}pages/doc-module-5-complete.html" class="mob-sub-nested-item">5. Переговоры</a><a href="{{BASE}}pages/doc-module-6-complete.html" class="mob-sub-nested-item">6. Маршруты</a><a href="{{BASE}}pages/doc-module-7-complete.html" class="mob-sub-nested-item">7. Коммуникация</a><a href="{{BASE}}pages/doc-module-8-complete.html" class="mob-sub-nested-item">8. Проблемы в пути</a><a href="{{BASE}}pages/doc-module-9-complete.html" class="mob-sub-nested-item">9. Финансы</a><a href="{{BASE}}pages/doc-module-10-complete.html" class="mob-sub-nested-item">10. Compliance</a><a href="{{BASE}}pages/doc-module-11-complete.html" class="mob-sub-nested-item">11. Технологии</a><a href="{{BASE}}pages/doc-module-12-complete.html" class="mob-sub-nested-item">12. Итоговый тест</a></div></div><a href="{{BASE}}pages/glossary.html" class="mob-sub">📖 Термины и Сокращения</a><a href="{{BASE}}pages/testing.html" class="mob-sub">🎯 Тестирование диспетчера</a><a href="{{BASE}}pages/Trainer-Quiz.html" class="mob-sub">💡 Тренажер диспетчера</a></div></div>
    <div class="mob-acc" data-section="tools"><div class="mob-acc-title">🛠️ Инструменты <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="/map-trainer/" class="mob-sub" style="color:#06b6d4;font-weight:700;">🗺️ USA Map Trainer</a><a href="{{BASE}}pages/ai-broker-chat.html" class="mob-sub">🎙️ AI – Симулятор переговоров</a><a href="/games/" class="mob-sub">🕹️ Мини-игры</a><a href="{{BASE}}pages/load-finder.html" class="mob-sub">📦 Поиск грузов - Load Finder</a><a href="{{BASE}}pages/users-stats.html" class="mob-sub">🎖️ Рейтинг пользователей</a><a href="{{BASE}}pages/analytics.html" class="mob-sub">📊 Статистика рынка</a></div></div>
    <div class="mob-acc" data-section="info"><div class="mob-acc-title">ℹ️ Информация <span class="mob-arr">▼</span></div><div class="mob-acc-body"><a href="{{BASE}}about.html" class="mob-sub">ℹ️ О нас</a><a href="{{BASE}}pricing.html" class="mob-sub">💎 Планы и цены</a><a href="{{BASE}}faq.html" class="mob-sub">❓ Частые вопросы</a><a href="{{BASE}}career.html" class="mob-sub">🚀 Карьера</a><a href="{{BASE}}contacts.html" class="mob-sub">📩 Написать нам</a></div></div>
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
        injectLangSwitcher();
        injectSeoAlternates();

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
        
        // Автоматически раскрываем секцию "Инструменты"
        setTimeout(function() {
            var toolsAccordion = document.querySelector('.mob-acc[data-section="tools"]');
            if (toolsAccordion && !toolsAccordion.classList.contains('open')) {
                toolsAccordion.classList.add('open');
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
          <p class="footer-brand-desc">${T.footerDesc}</p>
          <a href="mailto:info@dispatch4you.com" class="footer-link" style="margin-top:8px">✉️ info@dispatch4you.com</a>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">${T.colLearn}</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_pages/documentation.html" class="footer-link">${T.lCourse}</a>
            <a href="BASE_pages/modules-index.html" class="footer-link">${T.lModules}</a>
            <a href="BASE_pages/glossary.html" class="footer-link">${T.lGlossary}</a>
            <a href="BASE_pages/testing.html" class="footer-link">${T.lTesting}</a>
            <a href="BASE_pages/Trainer-Quiz.html" class="footer-link">${T.lTrainer}</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">${T.colTools}</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="/games/" class="footer-link">${T.lGame}</a>
            <a href="/map-trainer/" class="footer-link">${T.lMap}</a>
            <a href="BASE_pages/ai-broker-chat.html" class="footer-link">${T.lAiChat}</a>
            <a href="BASE_pages/load-finder.html" class="footer-link">${T.lLoadFinder}</a>
            <a href="BASE_pages/users-stats.html" class="footer-link">${T.lRating}</a>
            <a href="BASE_pages/analytics.html" class="footer-link">${T.lAnalytics}</a>
          </div>
        </div>
        <div class="footer-acc-col">
          <button class="footer-acc-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span class="footer-col-title">${T.colInfo}</span><span class="acc-arrow">▼</span></button>
          <div class="footer-acc-body">
            <a href="BASE_about.html" class="footer-link">${T.lAbout}</a>
            <a href="BASE_pricing.html" class="footer-link">${T.lPricing}</a>
            <a href="BASE_faq.html" class="footer-link">${T.lFaq}</a>
            <a href="BASE_career.html" class="footer-link">${T.lCareer}</a>
            <a href="BASE_contacts.html" class="footer-link">${T.lContacts}</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">${T.copyright}</span>
        <div class="footer-status"><span class="footer-status-dot"></span><span class="footer-status-text">${T.status}</span></div>
      </div>
    </div>
  </div>
</footer>`;
        html = html.replace(/BASE_/g, BASE);
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ── Language switcher (RU/EN) ─────────────────────────────────
    // EN link: the page's EN mirror if it exists, else the EN homepage (no 404s
    // mid-rollout). RU is the complete default, so its link is always direct.
    function enHref() {
        return EN_PAGES.indexOf(ruPath()) !== -1 ? urlFor('en') : '/en/';
    }
    function langSwitchHTML(extraClass) {
        return '<div class="d4y-lang-switch ' + (extraClass || '') + '">' +
            '<a href="' + urlFor('ru') + '" class="d4y-lang' + (LANG === 'ru' ? ' active' : '') + '">RU</a>' +
            '<span class="d4y-lang-sep">/</span>' +
            '<a href="' + enHref() + '" class="d4y-lang' + (LANG === 'en' ? ' active' : '') + '">EN</a></div>';
    }
    function injectLangSwitcher() {
        if (!document.getElementById('d4y-lang-style')) {
            var st = document.createElement('style'); st.id = 'd4y-lang-style';
            st.textContent =
                '.d4y-lang-switch{align-items:center;gap:3px}' +
                '.d4y-lang{font-size:12px;font-weight:700;color:#94a3b8;text-decoration:none;padding:4px 7px;border-radius:8px;transition:color .2s,background .2s}' +
                '.d4y-lang:hover{color:#e2e8f0}' +
                '.d4y-lang.active{color:#06b6d4;background:rgba(6,182,212,.12)}' +
                '.d4y-lang-sep{color:#475569;font-size:11px}' +
                '.desk-lang{display:none;margin-right:4px}' +
                '@media(min-width:1024px){.desk-lang{display:inline-flex}}' +
                /* topbar-lang: постоянно видимый переключатель рядом с бургером —
                   виден на ЛЮБОЙ ширине <1024px, не только когда открыто мобильное меню */
                '.topbar-lang{display:none;flex-shrink:0;background:rgba(255,255,255,.05);border-radius:10px;padding:2px;margin-right:2px}' +
                '@media(max-width:1023px){.topbar-lang{display:inline-flex}}' +
                '.topbar-lang .d4y-lang{font-size:11px;padding:5px 6px}';
            (document.head || document.documentElement).appendChild(st);
        }
        var desk = document.getElementById('nav-actions-desktop');
        if (desk && !document.querySelector('.desk-lang')) desk.insertAdjacentHTML('beforebegin', langSwitchHTML('desk-lang'));
        var topbar = document.getElementById('topbar-lang-anchor');
        if (topbar && !document.querySelector('.topbar-lang')) topbar.insertAdjacentHTML('beforeend', langSwitchHTML('topbar-lang'));
    }

    // ── SEO: hreflang alternates for this page ────────────────────
    function injectSeoAlternates() {
        if (document.getElementById('d4y-hreflang')) return;
        var head = document.head; if (!head) return;
        var marker = document.createElement('meta'); marker.id = 'd4y-hreflang'; marker.name = 'd4y-hreflang'; head.appendChild(marker);
        var origin = window.location.origin;
        [['ru', urlFor('ru')], ['en', urlFor('en')], ['x-default', urlFor('ru')]].forEach(function (p) {
            var l = document.createElement('link'); l.rel = 'alternate';
            l.setAttribute('hreflang', p[0]); l.href = origin + p[1]; head.appendChild(l);
        });
    }

    // ── Start ─────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNav);
    } else {
        loadNav();
    }
})();
