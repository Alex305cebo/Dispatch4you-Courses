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

// Проверка токена на сервере
async function verifyToken() {
  const token = localStorage.getItem('authToken');
  
  if (!token) return false;
  
  try {
    const response = await fetch('http://localhost:3000/api/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Токен недействителен, очищаем
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

// Проверка доступа к защищённым страницам (ОТКЛЮЧЕНО - ДОСТУП ОТКРЫТ ВСЕМ)
function requireAuth() {
  // Авторизация отключена - доступ открыт всем
  return true;
  
  /* СТАРЫЙ КОД - ЗАКОММЕНТИРОВАН
  const user = checkAuth();
  
  if (!user) {
    alert('Для доступа к курсам необходимо войти в систему или зарегистрироваться');
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
  */
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
  
  // Показываем ссылку на личный кабинет для авторизованных
  const user = checkAuth();
  const dashboardLink = document.getElementById('dashboardLink');
  if (user && dashboardLink) {
    dashboardLink.style.display = 'block';
  }
  
  // Проверяем токен при загрузке
  verifyToken();
});
