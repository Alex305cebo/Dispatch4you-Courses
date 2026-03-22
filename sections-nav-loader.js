/**
 * sections-nav-loader.js
 * Загружает навигацию по разделам курса
 */
(function () {
    const isSubfolder = window.location.pathname.includes('/pages/');
    const BASE = isSubfolder ? '../' : '';

    function loadSectionsNav() {
        fetch(BASE + 'sections-nav.html')
            .then(r => r.ok ? r.text() : Promise.reject())
            .then(html => {
                const placeholder = document.getElementById('sections-nav-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = html.replace(/\.\.\//g, BASE);
                    highlightCurrentSection();
                }
            })
            .catch(() => console.log('Sections nav not loaded'));
    }

    function highlightCurrentSection() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.section-link');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.split('#')[0].split('/').pop())) {
                link.classList.add('active');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSectionsNav);
    } else {
        loadSectionsNav();
    }
})();
