// auth.js — отображение пользователя в навбаре на всех страницах
// Version 2.0 - Enhanced user profile display with avatar and full name

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
    const name = user.lastName || user.firstName || user.email || 'Пользователь';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || name;
    const initials = (firstName[0] || '') + (lastName[0] || '');

    // Получаем реальный XP из xp-system
    let xp = 0;
    try {
      const xpData = JSON.parse(localStorage.getItem('xp_data') || '{}');
      xp = xpData.totalXP || 0;
    } catch (e) {
      xp = user.xp || 0;
    }

    const dashHref = isPages() ? '../dashboard.html' : 'dashboard.html';

    const html = `
      <div style="display:flex;align-items:center;gap:8px;">
        <a href="${dashHref}" style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:1px solid rgba(99,102,241,0.35);border-radius:12px;text-decoration:none;transition:all 0.3s;box-shadow:0 4px 12px rgba(99,102,241,0.2);backdrop-filter:blur(10px);" onmouseover="this.style.background='linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))';this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(99,102,241,0.35)'" onmouseout="this.style.background='linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))';this.style.transform='';this.style.boxShadow='0 4px 12px rgba(99,102,241,0.2)'">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:white;box-shadow:0 2px 8px rgba(99,102,241,0.4);">${initials || '👤'}</div>
          <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-weight:700;font-size:12px;color:#e0e7ff;line-height:1;">${fullName}</span>
              <span style="font-size:9px;color:#fbbf24;font-weight:700;background:rgba(251,191,36,0.15);padding:1px 4px;border-radius:4px;border:1px solid rgba(251,191,36,0.3);">⚡ ${xp} XP</span>
            </div>
            <span style="font-size:10px;color:#a5b4fc;font-weight:500;">Личный кабинет</span>
          </div>
        </a>
        <a href="#" class="btn-login" onclick="authLogout(event)" style="display:flex;align-items:center;justify-content:center;padding:6px 12px;border:1px solid rgba(239,68,68,0.35);border-radius:12px;color:#fca5a5;font-size:12px;font-weight:600;background:rgba(239,68,68,0.12);transition:all 0.3s;backdrop-filter:blur(10px);" onmouseover="this.style.background='rgba(239,68,68,0.2)';this.style.borderColor='rgba(239,68,68,0.5)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(239,68,68,0.12)';this.style.borderColor='rgba(239,68,68,0.35)';this.style.transform=''">
          <span style="font-size:13px;">🚪</span> Выйти
        </a>
      </div>`;
    navActions.innerHTML = html;
    if (mobileNavActions) mobileNavActions.innerHTML = html;
  }

  // УБИРАЕМ ПОКАЗ ССЫЛКИ "Личный кабинет" В МЕНЮ - она дублируется с блоком справа
  const dl = document.getElementById('dashboardLink');
  const dlm = document.getElementById('dashboardLinkMobile');
  if (dl) dl.style.display = 'none'; // Всегда скрываем
  if (dlm) dlm.style.display = 'none'; // Всегда скрываем
};

window.authLogout = function (event) {
  if (event) event.preventDefault();
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('user_role');
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

// Слушаем события обновления XP
document.addEventListener('xpUpdated', function () {
  window.updateAuthUI();
});
