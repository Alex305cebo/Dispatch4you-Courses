/**
 * Role Guard v1.0
 * Система контроля доступа по ролям
 * 
 * Роли:
 *   guest      — не залогинен
 *   registered — залогинен, бесплатный доступ
 *   student    — оплатил, полный доступ к контенту
 *   superuser  — всё + админка + особые привилегии
 *
 * Подключение: <script src="role-guard.js"></script> (или ../role-guard.js из /pages/)
 * 
 * Роль хранится в Firestore: users/{uid}.role
 * По умолчанию при регистрации: "registered"
 * Менять вручную в Firestore или через админку
 */

(function () {
  'use strict';

  // ============================================================
  // ЛОКАЛЬНЫЙ ДОСТУП: если открыто через file:// — пропускаем всё
  // ============================================================
  if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔓 Role Guard: локальный доступ — все страницы открыты');
    return;
  }

  // ============================================================
  // КОНФИГУРАЦИЯ: какие страницы доступны каждой роли
  // ============================================================

  // Страницы, доступные ВСЕМ (включая гостей)
  const PUBLIC_PAGES = [
    'index.html',
    'login.html',
    'register.html',
    'about.html',
    'career.html',
    'pricing.html',
    'checkout.html',
    'faq.html',
    'contacts.html',
    '404.html',
    '' // корень сайта
  ];

  // Страницы, доступные зарегистрированным (бесплатно) + student + superuser
  const REGISTERED_PAGES = [
    'pages/documentation.html',
    'pages/glossary.html',
    'pages/intro.html',
    'pages/home.html',
    'pages/modules-index.html',
    'pages/analytics.html',
    'pages/doc-module-1-complete.html', // Модуль 1 — бесплатный
    'dashboard.html'
  ];

  // Страницы, доступные ТОЛЬКО student + superuser (платный контент)
  const STUDENT_PAGES = [
    'pages/simulator.html',
    'pages/load-finder.html',
    'pages/loadboard.html',
    'pages/loadboards.html',
    'pages/dispatcher-cards.html',
    'pages/all-loads.html',
    'pages/testing.html',
    'pages/analytics.html',
    'pages/brokers.html',
    'pages/calls.html',
    'pages/cases.html',
    'pages/communication.html',
    'pages/equipment.html',
    'pages/finances.html',
    'pages/load-connect.html',
    'pages/load-examples.html',
    'pages/negotiation.html',
    'pages/problems.html',
    'pages/regulations.html',
    'pages/routes.html',
    'pages/technology.html',
    'pages/role.html',
    // Модули 2-12
    'pages/doc-module-2-complete.html',
    'pages/doc-module-3-complete.html',
    'pages/doc-module-4-complete.html',
    'pages/doc-module-5-complete.html',
    'pages/doc-module-6-complete.html',
    'pages/doc-module-7-complete.html',
    'pages/doc-module-8-complete.html',
    'pages/doc-module-9-complete.html',
    'pages/doc-module-10-complete.html',
    'pages/doc-module-11-complete.html',
    'pages/doc-module-12-complete.html'
  ];

  // Страницы ТОЛЬКО для superuser
  const SUPERUSER_PAGES = [
    'pages/admin.html'
  ];

  // ============================================================
  // ОПРЕДЕЛЕНИЕ ТЕКУЩЕЙ СТРАНИЦЫ
  // ============================================================

  function getCurrentPage() {
    let path = window.location.pathname;
    // Убираем начальный /
    path = path.replace(/^\//, '');
    // Если пустой путь — это главная
    if (!path || path === '/') return '';
    return path;
  }

  // ============================================================
  // ПОЛУЧЕНИЕ РОЛИ ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  function getUserFromStorage() {
    try {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function getRoleFromStorage() {
    try {
      const data = localStorage.getItem('user_role');
      return data || null;
    } catch (e) {
      return null;
    }
  }

  // ============================================================
  // ПРОВЕРКА ДОСТУПА
  // ============================================================

  function pageInList(page, list) {
    // Точное совпадение
    if (list.includes(page)) return true;
    // Проверяем без pages/ префикса (для страниц в /pages/)
    const withoutPages = page.replace(/^pages\//, '');
    if (list.includes('pages/' + withoutPages)) return true;
    // Проверяем только имя файла
    const filename = page.split('/').pop();
    return list.some(function (p) { return p.split('/').pop() === filename; });
  }

  function checkAccess(role, page) {
    // Публичные страницы — доступны всем
    if (pageInList(page, PUBLIC_PAGES)) return true;

    // Гость — только публичные
    if (!role || role === 'guest') return false;

    // Superuser — доступ ко всему
    if (role === 'superuser') return true;

    // Student — публичные + registered + student
    if (role === 'student') {
      return pageInList(page, REGISTERED_PAGES) || pageInList(page, STUDENT_PAGES);
    }

    // Registered — публичные + registered
    if (role === 'registered') {
      return pageInList(page, REGISTERED_PAGES);
    }

    return false;
  }

  // ============================================================
  // PAYWALL — встроенная форма входа/регистрации
  // ============================================================

  function showPaywall(role) {
    var isGuest = !role || role === 'guest';
    var base = getBasePath();

    document.body.style.overflow = 'hidden';

    var overlay = document.createElement('div');
    overlay.id = 'role-guard-paywall';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(2,6,23,0.96);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(12px);';

    if (isGuest) {
      // Гость — форма входа прямо в overlay
      overlay.innerHTML = ''
        + '<div style="max-width:420px;width:100%;background:linear-gradient(135deg,rgba(15,23,42,0.99),rgba(20,30,55,0.99));border:1.5px solid rgba(6,182,212,0.25);border-radius:24px;padding:40px 36px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.7);">'
        + '  <div style="font-size:48px;margin-bottom:16px;">🎓</div>'
        + '  <h2 style="font-size:24px;font-weight:800;color:#ffffff;margin-bottom:8px;">Войдите для доступа</h2>'
        + '  <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin-bottom:28px;">Бесплатная регистрация открывает доступ к материалам курса</p>'
        // Google
        + '  <button onclick="window.signInWithGoogle&&window.signInWithGoogle()" style="width:100%;padding:14px;background:#fff;border:none;border-radius:12px;color:#1f2937;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px;transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.25);font-family:inherit;"'
        + '    onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">'
        + '    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>'
        + '    Войти через Google'
        + '  </button>'
        // Divider
        + '  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">'
        + '    <div style="flex:1;height:1px;background:rgba(255,255,255,.08);"></div>'
        + '    <span style="font-size:12px;color:#475569;">или</span>'
        + '    <div style="flex:1;height:1px;background:rgba(255,255,255,.08);"></div>'
        + '  </div>'
        // Email buttons
        + '  <div style="display:flex;gap:10px;margin-bottom:20px;">'
        + '    <a href="' + base + 'login.html" style="flex:1;padding:12px;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.3);border-radius:12px;color:#67e8f9;font-size:14px;font-weight:600;text-decoration:none;text-align:center;transition:all .2s;"'
        + '      onmouseover="this.style.background=\'rgba(6,182,212,.2)\'" onmouseout="this.style.background=\'rgba(6,182,212,.1)\'">✉️ Войти</a>'
        + '    <a href="' + base + 'register.html" style="flex:1;padding:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#e2e8f0;font-size:14px;font-weight:600;text-decoration:none;text-align:center;transition:all .2s;"'
        + '      onmouseover="this.style.background=\'rgba(255,255,255,.1)\'" onmouseout="this.style.background=\'rgba(255,255,255,.05)\'">📝 Регистрация</a>'
        + '  </div>'
        // Security note
        + '  <p style="font-size:11px;color:#475569;line-height:1.5;">🔒 Мы не храним пароли. Авторизация через Google и Firebase.</p>'
        + '</div>';
    } else {
      // Зарегистрирован но нет доступа — апгрейд
      overlay.innerHTML = ''
        + '<div style="max-width:440px;width:100%;background:linear-gradient(135deg,rgba(15,23,42,0.99),rgba(20,30,55,0.99));border:1.5px solid rgba(245,158,11,0.3);border-radius:24px;padding:40px 36px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.7);">'
        + '  <div style="font-size:48px;margin-bottom:16px;">⭐</div>'
        + '  <h2 style="font-size:24px;font-weight:800;color:#ffffff;margin-bottom:8px;">Контент для студентов</h2>'
        + '  <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin-bottom:28px;">Этот материал доступен только студентам курса. Оформите подписку для полного доступа.</p>'
        + '  <a href="' + base + 'pricing.html" style="display:block;padding:16px;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;text-decoration:none;border-radius:14px;font-weight:700;font-size:16px;margin-bottom:12px;box-shadow:0 8px 24px rgba(245,158,11,.4);">🚀 Оформить подписку</a>'
        + '  <a href="' + base + 'index.html" style="display:block;padding:13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#94a3b8;text-decoration:none;border-radius:14px;font-size:14px;font-weight:600;">← На главную</a>'
        + '</div>';
    }

    document.body.appendChild(overlay);
  }

  function getBasePath() {
    // Если мы в /pages/, нужен ../
    return window.location.pathname.includes('/pages/') ? '../' : '';
  }

  // ============================================================
  // ЗАГРУЗКА РОЛИ ИЗ FIRESTORE
  // ============================================================

  function loadRoleFromFirestore(uid) {
    return import('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js')
      .then(function (appMod) {
        return import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js')
          .then(function (fsMod) {
            var app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp({
              apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
              authDomain: "dispatch4you-80e0f.firebaseapp.com",
              projectId: "dispatch4you-80e0f",
              storageBucket: "dispatch4you-80e0f.appspot.com",
              messagingSenderId: "349235354473",
              appId: "1:349235354473:web:488aeb29211b02bb153bf8"
            });
            var db = fsMod.getFirestore(app);
            return fsMod.getDoc(fsMod.doc(db, 'users', uid)).then(function (snap) {
              if (snap.exists()) {
                var role = snap.data().accessRole || 'registered';
                localStorage.setItem('user_role', role);
                return role;
              }
              return 'registered';
            });
          });
      })
      .catch(function (e) {
        console.warn('RoleGuard: Firestore error', e);
        return 'registered';
      });
  }

  // ============================================================
  // ГЛАВНАЯ ЛОГИКА
  // ============================================================

  // ============================================================
  // СУПЕРПОЛЬЗОВАТЕЛИ (хардкод — всегда полный доступ)
  // ============================================================
  var SUPER_EMAILS = ['dersire.der@gmail.com'];

  function init() {
    var page = getCurrentPage();
    var user = getUserFromStorage();

    // Публичные страницы — пропускаем всех, не ждём
    if (pageInList(page, PUBLIC_PAGES)) return;

    // Нет пользователя — гость
    if (!user || !user.uid) {
      showPaywall('guest');
      return;
    }

    // Хардкод суперпользователи — всегда пропускаем
    var userEmail = (user.email || '').toLowerCase().trim();
    for (var i = 0; i < SUPER_EMAILS.length; i++) {
      if (userEmail === SUPER_EMAILS[i].toLowerCase()) {
        localStorage.setItem('user_role', 'superuser');
        console.log('RoleGuard: superuser bypass for', userEmail);
        return;
      }
    }

    // Есть пользователь — проверяем кешированную роль
    var cachedRole = getRoleFromStorage();

    // Если кеш говорит "есть доступ" — пропускаем сразу
    if (cachedRole && checkAccess(cachedRole, page)) {
      // Всё ок, обновим роль в фоне
      loadRoleFromFirestore(user.uid);
      return;
    }

    // Кеша нет или кеш блокирует — ждём ответ от Firestore
    loadRoleFromFirestore(user.uid).then(function (freshRole) {
      localStorage.setItem('user_role', freshRole);
      if (!checkAccess(freshRole, page)) {
        showPaywall(freshRole);
      }
    });
  }

  // Запускаем как можно раньше
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспортируем для использования в других скриптах
  window.RoleGuard = {
    checkAccess: checkAccess,
    getCurrentRole: function () { return getRoleFromStorage() || 'guest'; },
    PUBLIC_PAGES: PUBLIC_PAGES,
    REGISTERED_PAGES: REGISTERED_PAGES,
    STUDENT_PAGES: STUDENT_PAGES,
    SUPERUSER_PAGES: SUPERUSER_PAGES
  };

})();
