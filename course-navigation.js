// Универсальный скрипт для навигации по курсу с аккордеоном на мобильных

(function() {
    function initCourseNavigation() {
        // Аккордеон для секций только на мобильных
        if (window.innerWidth <= 640) {
            // Находим все секции навигации (разные классы на разных страницах)
            const navSections = document.querySelectorAll('.nav-section, .cnt-nav-section, .cnav-section');
            
            // Показываем стрелки
            document.querySelectorAll('.section-arrow').forEach(arrow => {
                arrow.style.display = 'inline-block';
            });
            
            // Закрываем секции 2 и 3 (Модули и Инструменты)
            navSections.forEach(function(section, index) {
                if (index > 0) {
                    section.classList.add('collapsed');
                }
                
                const header = section.querySelector('.section-header, .cnt-section-header, .cnav-header');
                if (header && !header.dataset.listenerAdded) {
                    header.addEventListener('click', function() {
                        section.classList.toggle('collapsed');
                    });
                    header.dataset.listenerAdded = 'true';
                }
            });
        } else {
            // Скрываем стрелки на десктопе
            document.querySelectorAll('.section-arrow').forEach(arrow => {
                arrow.style.display = 'none';
            });
            
            // Убираем класс collapsed на десктопе
            document.querySelectorAll('.nav-section, .cnt-nav-section, .cnav-section').forEach(section => {
                section.classList.remove('collapsed');
            });
        }
    }
    
    // Инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCourseNavigation);
    } else {
        initCourseNavigation();
    }
    
    // Переинициализация при изменении размера окна
    window.addEventListener('resize', initCourseNavigation);
})();
