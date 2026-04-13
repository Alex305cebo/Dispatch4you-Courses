/**
 * Role Guard v4.0
 * Самодостаточный — сам загружает Firebase Auth и читает роль из Firestore.
 */
(function () {
  "use strict";
  if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

  var FB_PROJECT = "dispatch4you-80e0f";
  var SUPER_EMAILS = ["dersire.der@gmail.com","cebotarigg@gmail.com","mihail.ce89@gmail.com","твой-email@gmail.com"];
  var PUBLIC_PAGES = ["index.html","login.html","register.html","about.html","career.html","pricing.html","checkout.html","faq.html","contacts.html","404.html",""];
  var REGISTERED_PAGES = ["pages/documentation.html","pages/glossary.html","pages/intro.html","pages/modules-index.html","pages/analytics.html","pages/users-stats.html","pages/doc-module-1-complete.html","dashboard.html"];
  var STUDENT_PAGES = ["pages/simulator.html","pages/load-finder.html","pages/loadboard.html","pages/loadboards.html","pages/dispatcher-cards.html","pages/all-loads.html","pages/testing.html","pages/brokers.html","pages/calls.html","pages/cases.html","pages/communication.html","pages/equipment.html","pages/finances.html","pages/load-connect.html","pages/load-examples.html","pages/negotiation.html","pages/problems.html","pages/regulations.html","pages/routes.html","pages/technology.html","pages/role.html","pages/ai-broker-chat.html","pages/Trainer-Quiz.html","pages/lesson-tracker.html","pages/cargo-stats.html","pages/docs.html","pages/doc-module-2-complete.html","pages/doc-module-3-complete.html","pages/doc-module-4-complete.html","pages/doc-module-5-complete.html","pages/doc-module-6-complete.html","pages/doc-module-7-complete.html","pages/doc-module-8-complete.html","pages/doc-module-9-complete.html","pages/doc-module-10-complete.html","pages/doc-module-11-complete.html","pages/doc-module-12-complete.html"];
  var SUPERUSER_PAGES = ["pages/admin.html"];

  function getPage() { return window.location.pathname.replace(/^\//, "") || ""; }
  function inList(page, list) {
    if (list.indexOf(page) !== -1) return true;
    var f = page.split("/").pop();
    for (var i = 0; i < list.length; i++) if (list[i].split("/").pop() === f) return true;
    return false;
  }
  function canAccess(role, page) {
    if (inList(page, PUBLIC_PAGES)) return true;
    if (!role || role === "guest") return false;
    if (role === "superuser") return true;
    if (role === "student") return inList(page, REGISTERED_PAGES) || inList(page, STUDENT_PAGES);
    if (role === "registered") return inList(page, REGISTERED_PAGES);
    return false;
  }
  function getBase() { return window.location.pathname.indexOf("/pages/") !== -1 ? "../" : ""; }

  var page = getPage();
  if (inList(page, PUBLIC_PAGES)) {
    window.RoleGuard = { canAccess: canAccess, getRole: function() { return localStorage.getItem("user_role") || "guest"; } };
    return;
  }

  var done = false;

  function showSpinner() {
    if (document.getElementById("rg-spin")) return;
    var el = document.createElement("div");
    el.id = "rg-spin";
    el.style.cssText = "position:fixed;inset:0;z-index:999998;background:#050a12;display:flex;align-items:center;justify-content:center;";
    el.innerHTML = "<div style='width:36px;height:36px;border:3px solid rgba(6,182,212,0.2);border-top-color:#06b6d4;border-radius:50%;animation:rg-s 0.8s linear infinite'></div><style>@keyframes rg-s{to{transform:rotate(360deg)}}</style>";
    document.body.appendChild(el);
  }
  function hideSpinner() { var el = document.getElementById("rg-spin"); if (el) el.remove(); }

  function showPaywall(role) {
    hideSpinner();
    var isGuest = !role || role === "guest";
    var b = getBase();
    document.body.style.overflow = "hidden";
    var d = document.createElement("div");
    d.id = "rg-wall";
    d.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(2,6,23,.96);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(12px)";
    if (isGuest) {
      d.innerHTML = "<div style='max-width:420px;width:100%;background:linear-gradient(135deg,rgba(15,23,42,.99),rgba(20,30,55,.99));border:1.5px solid rgba(6,182,212,.25);border-radius:24px;padding:36px 32px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,.7)'><div style='font-size:44px;margin-bottom:12px'>🔐</div><h2 style='font-size:22px;font-weight:800;color:#fff;margin-bottom:6px'>Войдите для доступа</h2><p style='font-size:13px;color:#64748b;margin-bottom:20px'>Бесплатная регистрация — один клик</p><button onclick='window.signInWithGoogle&&window.signInWithGoogle()' style='width:100%;padding:13px;background:#fff;border:none;border-radius:12px;color:#1f2937;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px;font-family:inherit'><svg width='18' height='18' viewBox='0 0 48 48'><path fill='#EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/><path fill='#4285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/><path fill='#FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'/><path fill='#34A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/></svg>Войти через Google</button><a href='" + b + "login.html' style='display:block;padding:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#94a3b8;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:16px'>✉️ Войти через Email</a><a href='" + b + "index.html' style='font-size:12px;color:#475569;text-decoration:none'>🏠 На главную</a></div>";
    } else {
      d.innerHTML = "<div style='max-width:440px;width:100%;background:linear-gradient(135deg,rgba(15,23,42,.99),rgba(20,30,55,.99));border:1.5px solid rgba(245,158,11,.3);border-radius:24px;padding:36px 32px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,.7)'><div style='font-size:44px;margin-bottom:12px'>⭐</div><h2 style='font-size:22px;font-weight:800;color:#fff;margin-bottom:6px'>Контент для студентов</h2><p style='font-size:13px;color:#94a3b8;margin-bottom:20px'>Этот материал доступен только студентам курса.</p><a href='" + b + "pricing.html' style='display:block;padding:14px;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;margin-bottom:10px'>🚀 Оформить подписку</a><a href='" + b + "index.html' style='display:block;padding:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#94a3b8;font-size:13px;font-weight:600;text-decoration:none'>🏠 На главную</a></div>";
    }
    document.body.appendChild(d);
  }

  function decide(role) {
    if (done) return;
    done = true;
    localStorage.setItem("user_role", role);
    if (canAccess(role, page)) { hideSpinner(); } else { showPaywall(role); }
  }

  // Слушаем roleReady от firebase-auth-init.js (если он есть на странице)
  document.addEventListener("roleReady", function(e) {
    if (done) return;
    decide((e.detail && e.detail.role) ? e.detail.role : (localStorage.getItem("user_role") || "guest"));
  });

  // Инжектируем ES module который загружает Firebase Auth и диспатчит _rgUserReady
  function startAuth() {
    var s = document.createElement("script");
    s.type = "module";
    s.textContent = [
      "import{initializeApp,getApps}from'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';",
      "import{getAuth,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';",
      "var cfg={apiKey:'AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI',authDomain:'dispatch4you.com',projectId:'dispatch4you-80e0f'};",
      "var app=getApps().length?getApps()[0]:initializeApp(cfg);",
      "var auth=getAuth(app);",
      "window._fbAuth=auth;",
      "onAuthStateChanged(auth,function(u){",
      "  if(u){window._rgFbUser=u;document.dispatchEvent(new CustomEvent('_rgUserReady',{detail:{uid:u.uid,email:u.email}}))}",
      "  else{setTimeout(function(){if(!auth.currentUser)document.dispatchEvent(new CustomEvent('_rgUserReady',{detail:null}))},3000)}",
      "});"
    ].join("");
    document.head.appendChild(s);
  }

  document.addEventListener("_rgUserReady", function(e) {
    if (done) return;
    if (!e.detail) { decide("guest"); return; }
    var email = (e.detail.email || "").toLowerCase();
    for (var i = 0; i < SUPER_EMAILS.length; i++) {
      if (email === SUPER_EMAILS[i]) { decide("superuser"); return; }
    }
    var fbUser = window._rgFbUser;
    if (!fbUser) { decide("registered"); return; }
    fbUser.getIdToken().then(function(token) {
      fetch("https://firestore.googleapis.com/v1/projects/" + FB_PROJECT + "/databases/(default)/documents/users/" + e.detail.uid,
        { headers: { "Authorization": "Bearer " + token } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var role = (data && data.fields && data.fields.accessRole && data.fields.accessRole.stringValue) || "registered";
          decide(role);
        })
        .catch(function() { decide("registered"); });
    }).catch(function() { decide("registered"); });
  });

  showSpinner();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAuth);
  } else {
    startAuth();
  }
  setTimeout(function() { if (!done) decide(localStorage.getItem("user_role") || "guest"); }, 8000);

  window.RoleGuard = {
    canAccess: canAccess,
    getRole: function() { return localStorage.getItem("user_role") || "guest"; },
    PUBLIC_PAGES: PUBLIC_PAGES, REGISTERED_PAGES: REGISTERED_PAGES,
    STUDENT_PAGES: STUDENT_PAGES, SUPERUSER_PAGES: SUPERUSER_PAGES
  };
})();