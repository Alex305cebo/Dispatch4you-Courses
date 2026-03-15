// Общий скрипт для проверки авторизации на всех страницах
// ⚠️ ВРЕМЕННО ОТКЛЮЧЕНА ПРОВЕРКА АВТОРИЗАЦИИ - ДОСТУП ОТКРЫТ ВСЕМ

// Проверка авторизации
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');

  if (token && user) {
    return JSON.parse(user);
  }
  return null;
}

// Обновление UI для авторизованного пользователя
function updateAuthUI() {
  const user = checkAuth();
  const navActions = document.querySelector('.nav-actions');

  if (user && navActions) {
    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <a href="dashboard.html" style="color: var(--text-secondary); font-size: 14px; text-decoration: none; font-weight: 600; transition: color 0.3s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-secondary)'">
          👤 ${user.firstName}
        </a>
        <a href="#" class="btn-login" onclick="logout(event)">Выйти</a>
      </div>
    `;
  }
}

// Выход из системы
function logout(event) {
  if (event) event.preventDefault();

  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  alert('Вы вышли из системы');
  window.location.href = 'index.html';
}

// Базовый URL API (Hostinger)
const API_BASE = 'https://dispatch4you.com/api';

// Проверка токена на сервере
async function verifyToken() {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE}/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.success) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch (error) {
    // Если сервер недоступен — доверяем localStorage
    return !!localStorage.getItem('authToken');
  }
}

// Проверка доступа к защищённым страницам
function requireAuth() {
  const user = checkAuth();
  if (!user) {
    // Сохраняем текущий URL чтобы вернуться после логина
    const returnUrl = window.location.pathname + window.location.search;
    localStorage.setItem('returnUrl', returnUrl);
    window.location.href = getLoginPath();
    return false;
  }
  return true;
}

// Определяем путь к login.html относительно текущей страницы
function getLoginPath() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../login.html';
  return 'login.html';
}

// Страницы, доступные БЕЗ авторизации
const PUBLIC_PAGES = [
  'index.html', 'login.html', 'register.html',
  'about.html', 'pricing.html', 'faq.html',
  'contacts.html', 'help.html', 'career.html'
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  updateAuthUI();

  // Показываем ссылку на личный кабинет для авторизованных
  const user = checkAuth();
  const dashboardLink = document.getElementById('dashboardLink');
  if (user && dashboardLink) {
    dashboardLink.style.display = 'block';
  }

  // Проверяем нужна ли авторизация для текущей страницы
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isPublic = PUBLIC_PAGES.includes(currentPage) || currentPage === '';
  if (!isPublic) {
    requireAuth();
  }

  // Фоновая проверка токена
  verifyToken();
});
