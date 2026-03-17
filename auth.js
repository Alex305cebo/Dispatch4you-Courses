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
      <div style="display:flex;align-items:center;gap:10px;">
        <a href="${dashHref}" style="display:flex;align-items:center;gap:8px;padding:8px 16px;background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2));border:1px solid rgba(99,102,241,0.4);border-radius:10px;color:#c4b5fd;font-weight:700;font-size:14px;text-decoration:none;transition:all 0.3s;" onmouseover="this.style.background='linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.35))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))'">
          <span style="font-size:16px;">👤</span> ${name}
        </a>
        <a href="#" class="btn-login" onclick="authLogout(event)" style="padding:8px 14px;border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#fca5a5;font-size:13px;font-weight:600;background:rgba(239,68,68,0.1);">Выйти</a>
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
  // Polling fallback — каждые 100мс до 5 секунд
  let n = 0;
  const t = setInterval(function () {
    if (document.querySelector('.nav-actions')) {
      clearInterval(t);
      window.updateAuthUI();
    }
    if (++n > 50) clearInterval(t);
  }, 100);
})();
