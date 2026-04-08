/**
 * Автоматическая загрузка эталонной навигации
 * 
 * Использование:
 * 1. Подключите этот скрипт в <head>: <script src="../includes/load-navigation.js"></script>
 * 2. Добавьте в начало <body>: <div id="navigation-placeholder"></div>
 * 3. Навигация загрузится автоматически
 */

(function () {
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavigation);
    } else {
        loadNavigation();
    }

    function loadNavigation() {
        const placeholder = document.getElementById('navigation-placeholder');

        if (!placeholder) {
            console.warn('Navigation placeholder not found. Add <div id="navigation-placeholder"></div> to your page.');
            return;
        }

        // Определяем путь к navigation.html в зависимости от текущей страницы
        const currentPath = window.location.pathname;
        let navPath = '../includes/navigation.html';

        // Если мы в корне сайта
        if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
            navPath = 'includes/navigation.html';
        }

        // Загружаем навигацию
        fetch(navPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Navigation file not found');
                }
                return response.text();
            })
            .then(data => {
                placeholder.innerHTML = data;
                console.log('✅ Navigation loaded successfully');
            })
            .catch(error => {
                console.error('❌ Failed to load navigation:', error);
                placeholder.innerHTML = '<p style="color: red; padding: 20px;">Failed to load navigation</p>';
            });
    }
})();
