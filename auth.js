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
              <span id="nav-xp-badge" style="font-size:9px;color:#fbbf24;font-weight:700;background:rgba(251,191,36,0.15);padding:1px 4px;border-radius:4px;border:1px solid rgba(251,191,36,0.3);transition:all 0.3s;">⚡ ${xp} XP</span>
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

    // Update mobile XP badge
    updateMobXP(xp, initials);
  }

  // УБИРАЕМ ПОКАЗ ССЫЛКИ "Личный кабинет" В МЕНЮ - она дублируется с блоком справа
  const dl = document.getElementById('dashboardLink');
  const dlm = document.getElementById('dashboardLinkMobile');
  if (dl) dl.style.display = 'none'; // Всегда скрываем
  if (dlm) dlm.style.display = 'none'; // Всегда скрываем
};

function updateMobXP(xp, initials, animate) {
  const wrap = document.getElementById('mob-xp-wrap');
  const avatar = document.getElementById('mob-xp-avatar');
  const val = document.getElementById('mob-xp-val');
  if (!wrap || !val) return;
  wrap.style.display = 'flex';
  if (avatar) avatar.textContent = initials || '⚡';
  if (animate) {
    val.style.transition = 'all 0.15s';
    val.style.transform = 'scale(1.3)';
    val.style.color = '#fff';
    setTimeout(() => { val.style.transform = 'scale(1)'; val.style.color = '#fbbf24'; }, 500);
  }
  val.textContent = '⚡ ' + xp + ' XP';
}

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

// Показываем мобильный XP бейдж всегда — даже без логина
function initMobXPBadge() {
  let xp = 0;
  let initials = '⚡';
  try {
    const xpData = JSON.parse(localStorage.getItem('xp_data') || '{}');
    xp = xpData.totalXP || 0;
  } catch(e) {}
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const f = user.firstName || '';
    const l = user.lastName || '';
    if (f || l) initials = (f[0]||'') + (l[0]||'');
  } catch(e) {}
  updateMobXP(xp, initials, false);
}

// Запускаем после загрузки nav
document.addEventListener('navLoaded', initMobXPBadge, { once: true });
// Polling fallback
let _mobN = 0;
const _mobT = setInterval(() => {
  if (document.getElementById('mob-xp-wrap')) {
    clearInterval(_mobT);
    initMobXPBadge();
  }
  if (++_mobN > 50) clearInterval(_mobT);
}, 100);

// Слушаем события обновления XP — обновляем только бейдж с анимацией
document.addEventListener('xpUpdated', function (e) {
  const badge = document.getElementById('nav-xp-badge');
  if (!badge) { window.updateAuthUI(); return; }

  let newXP = 0;
  try {
    if (e.detail && e.detail.totalXP) {
      newXP = e.detail.totalXP;
    } else {
      const xpData = JSON.parse(localStorage.getItem('xp_data') || '{}');
      newXP = xpData.totalXP || 0;
    }
  } catch(err) {}

  // Анимация: вспышка + счётчик
  badge.style.transition = 'all 0.15s ease';
  badge.style.transform = 'scale(1.4)';
  badge.style.background = 'rgba(251,191,36,0.4)';
  badge.style.borderColor = 'rgba(251,191,36,0.8)';
  badge.style.color = '#fff';
  badge.style.boxShadow = '0 0 12px rgba(251,191,36,0.6)';

  // Анимируем число
  const oldXP = parseInt(badge.textContent.replace(/\D/g,'')) || 0;
  const diff = newXP - oldXP;
  const steps = 20;
  const stepVal = diff / steps;
  let current = oldXP;
  let step = 0;
  const counter = setInterval(() => {
    step++;
    current += stepVal;
    badge.textContent = '⚡ ' + Math.round(current) + ' XP';
    if (step >= steps) {
      clearInterval(counter);
      badge.textContent = '⚡ ' + newXP + ' XP';
    }
  }, 30);

  // Возврат к нормальному виду
  setTimeout(() => {
    badge.style.transform = 'scale(1)';
    badge.style.background = 'rgba(251,191,36,0.15)';
    badge.style.borderColor = 'rgba(251,191,36,0.3)';
    badge.style.color = '#fbbf24';
    badge.style.boxShadow = 'none';
  }, 600);

  // Показать +XP всплывашку над бейджем
  if (e.detail && e.detail.totalXP) {
    const gained = e.detail.totalXP - oldXP;
    if (gained > 0) {
      const pop = document.createElement('div');
      pop.textContent = '+' + gained + ' XP';
      pop.style.cssText = 'position:fixed;font-size:13px;font-weight:800;color:#fbbf24;pointer-events:none;z-index:99999;text-shadow:0 0 8px rgba(251,191,36,0.8);animation:xpPop 1.2s ease forwards;';
      const rect = badge.getBoundingClientRect();
      pop.style.left = rect.left + 'px';
      pop.style.top = (rect.top - 10) + 'px';
      if (!document.getElementById('xp-pop-style')) {
        const s = document.createElement('style');
        s.id = 'xp-pop-style';
        s.textContent = '@keyframes xpPop{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-40px) scale(1.3)}}';
        document.head.appendChild(s);
      }
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 1200);
    }
  }

  // Update mobile badge too
  const initials = (() => {
    try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return (u.firstName||'')[0]+(u.lastName||'')[0]; } catch(e){return '';}
  })();
  updateMobXP(newXP, initials, true);
});
