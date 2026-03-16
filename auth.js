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
  if (user && navActions) {
    navActions.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;">
        <a href="dashboard.html" style="color:var(--text-secondary);font-size:14px;text-decoration:none;font-weight:600;">
          👤 ${user.firstName}
        </a>
        <a href="#" class="btn-login" onclick="logout(event)">Выйти</a>
      </div>`;
  }
}

function logout(event) {
  if (event) event.preventDefault();
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function () {
  updateAuthUI();
  const user = checkAuth();
  const dashboardLink = document.getElementById('dashboardLink');
  if (user && dashboardLink) dashboardLink.style.display = 'block';
});
