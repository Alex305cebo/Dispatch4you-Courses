// Dark Theme Only - Light theme removed
(function() {
    // Detect page type and add data attribute
    const path = window.location.pathname;
    const body = document.body;
    
    if (path.includes('loadboard')) {
        body.setAttribute('data-page', 'loadboard');
    } else if (path.includes('module')) {
        body.setAttribute('data-page', 'modules');
    } else if (path.includes('simulator')) {
        body.setAttribute('data-page', 'simulator');
    } else if (path.includes('test')) {
        body.setAttribute('data-page', 'testing');
    } else if (path.includes('documentation')) {
        body.setAttribute('data-page', 'documentation');
    } else if (path.includes('cases')) {
        body.setAttribute('data-page', 'cases');
    } else {
        body.setAttribute('data-page', 'home');
    }

    // Add theme styles
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --bg: #070b14;
            --text: #f0f4ff;
            --text-secondary: #8892aa;
            --card-bg: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.1);
            --primary: #8b5cf6;
            --primary-dark: #7c3aed;
            --success: #22c55e;
        }
    `;
    document.head.appendChild(style);
})();
