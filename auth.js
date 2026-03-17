// auth.js — вспомогательные функции UI
// Редирект НЕ делаем здесь — это задача Firebase onAuthStateChanged на каждой странице

function checkAuth() {
  const user = localStorage.getItem('user');
  if (user) {
    try { return JSON.parse(user); } catch (e) { return null; }
  }
  return null;
}

function updateAuthUI() {
  const user = checkAuth();
  const navActions = document.querySelector('.nav-actions');
  const mobileNavActions = document.querySelector('.mobile-nav-actions');

  if (user && navActions) {
    const html = `
      <div style="display:flex;align-items:center;gap:16px;">
        <a href="dashboard.html" style="color:var(--text-secondary);font-size:14px;text-decoration:none;font-weight:600;">
          👤 ${user.firstName}
        </a>
        <a href="#" class="btn-login" onclick="logout(event)">Выйти</a>
      </div>`;
    navActions.innerHTML = html;
    if (mobileNavActions) mobileNavActions.innerHTML = html;
  }

  const dashboardLink = document.getElementById('dashboardLink');
  const dashboardLinkMobile = document.getElementById('dashboardLinkMobile');
  if (user && dashboardLink) dashboardLink.style.display = 'block';
  if (user && dashboardLinkMobile) dashboardLinkMobile.style.display = 'block';
}

function logout(event) {
  if (event) event.preventDefault();
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Запускаем после загрузки навбара (nav-loader.js диспатчит 'navLoaded')
// или сразу если навбар уже есть (страницы без nav-loader)
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.nav-actions')) {
    updateAuthUI();
  } else {
    // Ждём загрузки навбара через nav-loader
    document.addEventListener('navLoaded', updateAuthUI, { once: true });
    // Fallback через 800ms
    setTimeout(updateAuthUI, 800);
  }
});
