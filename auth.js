// auth.js — отображение пользователя в навбаре на всех страницах

function isPages() {
  return window.location.pathname.includes('/pages/');
}

// Глобальная функция — вызывается из nav-loader.js тоже
window.updateAuthUI = function () {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch (e) { }

  const navActions = document.querySelector('.nav-actions');
  const mobileNavActions = document.querySelector('.mobile-nav-actions');
  if (!navActions) return;

  if (user) {
    const name = user.firstName || user.email || 'Пользователь';
    const dashHref = isPages() ? '../dashboard.html' : 'dashboard.html';
    const html = `
      <div style="display:flex;align-items:center;gap:12px;">
        <a href="${dashHref}" style="color:#a5b4fc;font-weight:600;font-size:14px;text-decoration:none;">👤 ${name}</a>
        <a href="#" class="btn-login" onclick="authLogout(event)">Выйти</a>
      </div>`;
    navActions.innerHTML = html;
    if (mobileNavActions) mobileNavActions.innerHTML = html;
  }

  const dl = document.getElementById('dashboardLink');
  const dlm = document.getElementById('dashboardLinkMobile');
  if (user && dl) dl.style.display = 'block';
  if (user && dlm) dlm.style.display = 'block';
};

window.authLogout = function (event) {
  if (event) event.preventDefault();
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  if (window._fbAuth) {
    import("https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js")
      .then(m => m.signOut(window._fbAuth)).catch(() => { });
  }
  window.location.href = isPages() ? '../index.html' : 'index.html';
};

// Запускаем: если nav уже есть — сразу, иначе ждём navLoaded + polling
(function tryUpdate() {
  if (document.querySelector('.nav-actions')) {
    window.updateAuthUI();
    return;
  }
  // Слушаем событие от nav-loader
  document.addEventListener('navLoaded', window.updateAuthUI, { once: true });
  // Polling fallback — на случай если событие уже прошло
  let n = 0;
  const t = setInterval(function () {
    if (document.querySelector('.nav-actions')) {
      clearInterval(t);
      window.updateAuthUI();
    }
    if (++n > 30) clearInterval(t);
  }, 100);
})();
