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
  // PAYWALL — показываем красивое окно "нет доступа"
  // ============================================================

  function showPaywall(role) {
    var isGuest = !role || role === 'guest';
    var isRegistered = role === 'registered';

    var title = isGuest
      ? 'Войдите для доступа'
      : 'Контент доступен студентам';

    var message = isGuest
      ? 'Эта страница доступна только зарегистрированным пользователям. Войдите или создайте аккаунт.'
      : 'Этот материал доступен только студентам курса. Оформите подписку для полного доступа ко всем материалам.';

    var btnPrimary = isGuest
      ? { text: 'Войти', href: getBasePath() + 'login.html' }
      : { text: 'Оформить подписку', href: getBasePath() + 'pricing.html' };

    var btnSecondary = isGuest
      ? { text: 'Регистрация', href: getBasePath() + 'register.html' }
      : { text: 'На главную', href: getBasePath() + 'index.html' };

    // Скрываем основной контент
    document.body.style.overflow = 'hidden';

    var overlay = document.createElement('div');
    overlay.id = 'role-guard-paywall';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(2,6,23,0.95);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px);';

    overlay.innerHTML = ''
      + '<div style="max-width:480px;width:100%;background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98));border:2px solid rgba(6,182,212,0.3);border-radius:24px;padding:48px 40px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.6);">'
      + '  <div style="font-size:64px;margin-bottom:24px;">' + (isGuest ? '🔒' : '⭐') + '</div>'
      + '  <h2 style="font-size:28px;font-weight:800;color:#f1f5f9;margin-bottom:16px;">' + title + '</h2>'
      + '  <p style="font-size:16px;color:#94a3b8;line-height:1.7;margin-bottom:32px;">' + message + '</p>'
      + '  <div style="display:flex;flex-direction:column;gap:12px;">'
      + '    <a href="' + btnPrimary.href + '" style="display:block;padding:16px 32px;background:linear-gradient(135deg,#06b6d4,#0ea5e9);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:16px;transition:all 0.3s;box-shadow:0 8px 24px rgba(6,182,212,0.4);">' + btnPrimary.text + '</a>'
      + '    <a href="' + btnSecondary.href + '" style="display:block;padding:14px 32px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;text-decoration:none;border-radius:14px;font-weight:600;font-size:15px;transition:all 0.3s;">' + btnSecondary.text + '</a>'
      + '  </div>'
      + '</div>';

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

    // Есть пользователь — проверяем кешированную роль
    var cachedRole = getRoleFromStorage();

    if (cachedRole) {
      // Быстрая проверка по кешу
      if (!checkAccess(cachedRole, page)) {
        showPaywall(cachedRole);
      }
    }

    // Параллельно обновляем роль из Firestore
    loadRoleFromFirestore(user.uid).then(function (freshRole) {
      localStorage.setItem('user_role', freshRole);

      // Если кеша не было — проверяем сейчас
      if (!cachedRole && !checkAccess(freshRole, page)) {
        showPaywall(freshRole);
      }

      // Если роль изменилась и доступ пропал — показываем paywall
      if (cachedRole && cachedRole !== freshRole && !checkAccess(freshRole, page)) {
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
