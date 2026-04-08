/**
 * nav-enhanced.js — Улучшенная навигация с жестами и дополнительными фичами
 * 
 * Фичи:
 * - 📱 Свайп-жесты для мобильного меню
 * - 🎯 Индикатор прогресса скролла
 * - 🔍 Быстрый поиск
 * - 👤 Профиль пользователя
 * - ✨ Плавные анимации
 */

(function () {
    'use strict';

    // ========================================
    // 📱 SWIPE GESTURES FOR MOBILE MENU
    // ========================================

    let touchStartX = 0;
    let touchCurrentX = 0;
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isSwiping = false;
    let swipeThreshold = 50; // минимальное расстояние для свайпа
    let edgeThreshold = 30; // зона от края экрана для начала свайпа

    function initSwipeGestures() {
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');

        if (!mobileMenu || !overlay) return;

        // Открытие меню свайпом от правого края
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Закрытие меню свайпом
        mobileMenu.addEventListener('touchstart', handleMenuTouchStart, { passive: false });
        mobileMenu.addEventListener('touchmove', handleMenuTouchMove, { passive: false });
        mobileMenu.addEventListener('touchend', handleMenuTouchEnd, { passive: false });
    }

    function handleTouchStart(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        // Проверяем, начался ли свайп от правого края экрана
        if (touchStartX > window.innerWidth - edgeThreshold) {
            isSwiping = true;
        }
    }

    function handleTouchMove(e) {
        if (!isSwiping) return;

        const touch = e.touches[0];
        touchCurrentX = touch.clientX;
        touchCurrentY = touch.clientY;

        const deltaX = touchStartX - touchCurrentX;
        const deltaY = Math.abs(touchStartY - touchCurrentY);

        // Проверяем, что это горизонтальный свайп
        if (Math.abs(deltaX) > deltaY && deltaX > 0) {
            e.preventDefault();

            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                mobileMenu.classList.add('swiping');
                // Меню следует за пальцем
                const translateX = Math.min(0, -deltaX);
                mobileMenu.style.transform = `translateX(${translateX}px)`;
            }
        }
    }

    function handleTouchEnd(e) {
        if (!isSwiping) return;

        const deltaX = touchStartX - touchCurrentX;
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');

        if (mobileMenu) {
            mobileMenu.classList.remove('swiping');
            mobileMenu.style.transform = '';

            // Если свайп достаточно длинный, открываем меню
            if (deltaX > swipeThreshold) {
                mobileMenu.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Haptic feedback (вибрация)
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            }
        }

        isSwiping = false;
        touchStartX = 0;
        touchCurrentX = 0;
    }

    // Свайп для закрытия меню
    let menuTouchStartX = 0;
    let menuTouchCurrentX = 0;
    let isMenuSwiping = false;

    function handleMenuTouchStart(e) {
        const touch = e.touches[0];
        menuTouchStartX = touch.clientX;
        isMenuSwiping = true;
    }

    function handleMenuTouchMove(e) {
        if (!isMenuSwiping) return;

        const touch = e.touches[0];
        menuTouchCurrentX = touch.clientX;

        const deltaX = menuTouchCurrentX - menuTouchStartX;

        // Свайп вправо для закрытия
        if (deltaX < 0) {
            e.preventDefault();
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                const translateX = Math.max(-400, deltaX);
                mobileMenu.style.transform = `translateX(${translateX}px)`;
            }
        }
    }

    function handleMenuTouchEnd(e) {
        if (!isMenuSwiping) return;

        const deltaX = menuTouchCurrentX - menuTouchStartX;
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');

        if (mobileMenu) {
            mobileMenu.style.transform = '';

            // Если свайп достаточно длинный, закрываем меню
            if (deltaX < -swipeThreshold) {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';

                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            }
        }

        isMenuSwiping = false;
        menuTouchStartX = 0;
        menuTouchCurrentX = 0;
    }

    // ========================================
    // 🎯 SCROLL PROGRESS INDICATOR
    // ========================================

    function initScrollProgress() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Создаем индикатор прогресса
        let progressBar = navbar.querySelector('.nav-progress-indicator');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'nav-progress-indicator';
            navbar.appendChild(progressBar);
        }

        // Обновляем прогресс при скролле
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = `${Math.min(scrolled, 100)}%`;

            // Добавляем класс при скролле
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ========================================
    // 🔍 SEARCH FUNCTIONALITY
    // ========================================

    function initSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        // Поиск по нажатию Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });

        // Быстрый поиск с задержкой
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length >= 3) {
                searchTimeout = setTimeout(() => {
                    showSearchSuggestions(query);
                }, 300);
            }
        });
    }

    function performSearch(query) {
        console.log('Поиск:', query);
        // Здесь можно добавить реальную логику поиска
        // Например, перенаправление на страницу поиска
        // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }

    function showSearchSuggestions(query) {
        // Здесь можно показать выпадающий список с подсказками
        console.log('Подсказки для:', query);
    }

    // ========================================
    // 👤 USER PROFILE
    // ========================================

    function initUserProfile() {
        const userProfile = document.querySelector('.nav-user-profile');
        if (!userProfile) return;

        // Клик по профилю
        userProfile.addEventListener('click', () => {
            // Здесь можно открыть меню профиля
            console.log('Открыть профиль пользователя');
        });
    }

    // ========================================
    // ✨ ENHANCED ANIMATIONS
    // ========================================

    function initAnimations() {
        // Анимация появления dropdown меню
        const dropdowns = document.querySelectorAll('.nav-dropdown');

        dropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (!content) return;

            dropdown.addEventListener('mouseenter', () => {
                content.style.display = 'block';
                setTimeout(() => {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 10);
            });

            dropdown.addEventListener('mouseleave', () => {
                content.style.opacity = '0';
                content.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    content.style.display = 'none';
                }, 300);
            });
        });
    }

    // ========================================
    // 🎨 ACTIVE PAGE HIGHLIGHTING
    // ========================================

    function highlightActivePage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        // Подсвечиваем активную ссылку в навигации
        document.querySelectorAll('.nav-link, .dropdown-content a, .mobile-nav-links .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const linkPage = href.split('/').pop();
                if (linkPage === currentPage) {
                    link.classList.add('active');
                }
            }
        });
    }

    // ========================================
    // 🚀 KEYBOARD SHORTCUTS
    // ========================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K для открытия поиска
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // ESC для закрытия мобильного меню
            if (e.key === 'Escape') {
                const mobileMenu = document.getElementById('mobileMenu');
                const overlay = document.getElementById('mobileMenuOverlay');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // ========================================
    // 🎯 INITIALIZATION
    // ========================================

    function init() {
        // Ждем загрузки навигации
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }

        // Также слушаем событие navLoaded
        document.addEventListener('navLoaded', initAll);
    }

    function initAll() {
        initSwipeGestures();
        initScrollProgress();
        initSearch();
        initUserProfile();
        initAnimations();
        highlightActivePage();
        initKeyboardShortcuts();

        console.log('✨ Enhanced navigation initialized');
    }

    // Запускаем инициализацию
    init();

})();
