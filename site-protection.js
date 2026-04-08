// 🔒 Site Protection Script
// Этот файл предотвращает несанкционированный доступ к защищенным страницам

// ⚠️ ВРЕМЕННО ОТКЛЮЧЕНО - Все страницы доступны без авторизации
// Раскомментируй код ниже, чтобы включить защиту обратно

/*
(function() {
    'use strict';
    
    // Проверка авторизации пользователя
    function checkAuth() {
        // Получаем текущий путь страницы
        const currentPath = window.location.pathname;
        
        // Список защищенных страниц (требуют авторизации)
        const protectedPages = [
            '/dashboard.html',
            '/courses.html',
            '/course.html',
            '/pages/admin.html',
            '/pages/doc-module-',
            '/pages/documentation.html'
        ];
        
        // Проверяем, является ли текущая страница защищенной
        const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
        
        if (isProtectedPage) {
            // Проверяем наличие токена авторизации в localStorage
            const userToken = localStorage.getItem('userToken');
            const userData = localStorage.getItem('userData');
            
            // Если пользователь не авторизован - редирект на страницу входа
            if (!userToken || !userData) {
                // Сохраняем URL для возврата после авторизации
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                
                // Редирект на страницу входа
                window.location.href = '/login.html';
                return false;
            }
            
            // Проверяем срок действия токена (опционально)
            try {
                const user = JSON.parse(userData);
                const tokenExpiry = localStorage.getItem('tokenExpiry');
                
                if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                    // Токен истек - очищаем данные и редирект
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('tokenExpiry');
                    
                    sessionStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = '/login.html';
                    return false;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        
        return true;
    }
    
    // Запускаем проверку при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }
    
    // Дополнительная защита: проверка при изменении видимости страницы
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkAuth();
        }
    });
    
})();
*/

console.log('🔓 Site protection temporarily disabled - all pages are accessible');
