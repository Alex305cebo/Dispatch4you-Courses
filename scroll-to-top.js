// Универсальный компонент "Вернуться наверх"
(function() {
    // Проверяем, не добавлена ли уже кнопка
    if (document.getElementById('scrollToTop')) return;

    // Создаем кнопку
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollToTop';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Вернуться наверх');
    scrollBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    `;
    
    // Добавляем в body
    document.body.appendChild(scrollBtn);
    
    let inactivityTimer;
    
    // Показываем кнопку при скролле вниз
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
            resetInactivityTimer();
        } else {
            scrollBtn.classList.remove('visible');
            scrollBtn.classList.remove('inactive');
        }
    });
    
    // Сброс таймера при движении мыши или скролле
    function resetInactivityTimer() {
        scrollBtn.classList.remove('inactive');
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function() {
            scrollBtn.classList.add('inactive');
        }, 2000);
    }
    
    // Отслеживаем активность
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);
    
    // Скролл наверх при клике
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();
