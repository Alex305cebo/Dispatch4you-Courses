// Dark Mode Toggle Script
(function() {
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('dispatcher-theme') || 'dark';
    
    // Apply theme on page load
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Create theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 24px;
            z-index: 1000;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: rgba(102,126,234,.75);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px;
            transition: all .3s ease;
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 14px rgba(102,126,234,.35);
            display: none;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(themeToggle);

        // Toggle theme on button click
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('dispatcher-theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        });

        // Hover effect
        themeToggle.addEventListener('mouseenter', function() {
            themeToggle.style.background = 'rgba(102,126,234,1)';
            themeToggle.style.transform = 'translateY(-3px)';
            themeToggle.style.boxShadow = '0 8px 24px rgba(102,126,234,.55)';
        });

        themeToggle.addEventListener('mouseleave', function() {
            themeToggle.style.background = 'rgba(102,126,234,.75)';
            themeToggle.style.transform = 'translateY(0)';
            themeToggle.style.boxShadow = '0 4px 14px rgba(102,126,234,.35)';
        });
    });
})();
