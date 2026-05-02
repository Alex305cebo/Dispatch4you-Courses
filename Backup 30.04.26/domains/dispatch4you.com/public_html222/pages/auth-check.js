// Универсальная проверка авторизации для страниц курсов (ОТКЛЮЧЕНО - ДОСТУП ОТКРЫТ ВСЕМ)
// Этот скрипт должен быть подключен на всех страницах в папке pages

// Проверка авторизации
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return JSON.parse(user);
  }
  return null;
}

// Немедленная проверка при загрузке скрипта (ОТКЛЮЧЕНО - ДОСТУП ОТКРЫТ ВСЕМ)
(function() {
  // Авторизация отключена - доступ открыт всем
  console.log('Доступ к странице открыт для всех пользователей');
  
  /* СТАРЫЙ КОД - ЗАКОММЕНТИРОВАН
  const user = checkAuth();
  
  if (!user) {
    alert('Для доступа к курсам необходимо войти в систему или зарегистрироваться');
    window.location.href = '../login.html';
  }
  */
})();

// Дополнительная проверка при загрузке DOM (ОТКЛЮЧЕНО)
document.addEventListener('DOMContentLoaded', function() {
  // Авторизация отключена - доступ открыт всем
  console.log('DOM загружен, доступ открыт для всех');
  
  /* СТАРЫЙ КОД - ЗАКОММЕНТИРОВАН
  const user = checkAuth();
  
  if (!user) {
    window.location.href = '../login.html';
  }
  */
});

