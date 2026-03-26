// Load shared header across all pages
(function () {
  console.log('=== Header Loading Script Started ===');
  console.log('Current URL:', window.location.href);
  console.log('Current Path:', window.location.pathname);

  // Determine the correct path to shared-header.html based on current location
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes('/pages/');
  const headerPath = isInSubfolder ? '../shared-header.html' : 'shared-header.html';

  console.log('Is in subfolder:', isInSubfolder);
  console.log('Header path:', headerPath);

  // Check if placeholder exists before fetching
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) {
    console.error('❌ CRITICAL: header-placeholder element not found in DOM!');
    return;
  }
  console.log('✓ header-placeholder found');

  // Fetch and inject the header
  fetch(headerPath)
    .then(response => {
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to load header: ' + response.status);
      }
      return response.text();
    })
    .then(html => {
      console.log('Header HTML loaded, length:', html.length);

      // If we're in a subfolder, adjust all relative paths
      if (isInSubfolder) {
        html = html.replace(/href="(?!http|#|\.\.\/)/g, 'href="../');
        console.log('Paths adjusted for subfolder');
      }

      placeholder.innerHTML = html;
      console.log('✓ Header HTML injected into placeholder');

      // Initialize mobile menu after header is loaded
      initializeMobileMenu();

      // Set active link based on current page
      setActiveLink();

      console.log('✓✓✓ Header loaded successfully ✓✓✓');
    })
    .catch(error => {
      console.error('❌ Error loading header:', error);
      // Show user-friendly error message
      if (placeholder) {
        placeholder.innerHTML = `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px; margin: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">⚠️ Требуется веб-сервер</h2>
            <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">
              Браузер блокирует загрузку файлов через file:// протокол.<br>
              Это нормально для локальных файлов.
            </p>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
              <p style="margin: 0 0 10px 0; font-weight: bold; text-align: center;">✅ Решения:</p>
              <p style="margin: 8px 0; font-size: 14px;">1️⃣ Откройте <strong>test-nav-inline.html</strong> (работает без сервера)</p>
              <p style="margin: 8px 0; font-size: 14px;">2️⃣ Запустите <strong>start-server.ps1</strong> в PowerShell</p>
              <p style="margin: 8px 0; font-size: 14px;">3️⃣ Используйте VS Code Live Server</p>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
              <a href="test-nav-inline.html" style="display: inline-block; background: white; color: #667eea; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                🚀 Рабочая версия
              </a>
              <a href="РЕШЕНИЕ-ОШИБКИ-FETCH.txt" style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                📖 Инструкция
              </a>
            </div>
            <p style="margin: 20px 0 0 0; font-size: 13px; opacity: 0.7;">
              💡 На реальном веб-сервере всё будет работать автоматически
            </p>
          </div>
        `;
      }
    });

  // Mobile menu functionality
  function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    console.log('Initializing mobile menu...');
    console.log('Toggle:', mobileMenuToggle ? '✓' : '❌');
    console.log('Menu:', mobileMenu ? '✓' : '❌');
    console.log('Overlay:', mobileMenuOverlay ? '✓' : '❌');

    if (mobileMenuToggle && mobileMenu && mobileMenuOverlay) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        console.log('Mobile menu toggled');
      });

      mobileMenuOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Mobile menu closed via overlay');
      });

      console.log('✓ Mobile menu initialized successfully');
    } else {
      console.warn('⚠️ Mobile menu elements not found');
    }
  }

  // Set active link based on current page
  function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    console.log('Setting active links for', navLinks.length, 'links');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Remove leading slash and ../ for comparison
      const normalizedHref = href.replace(/^(\.\.\/|\/)/g, '');
      const normalizedPath = currentPath.replace(/^.*\//g, '');

      // Check if current page matches the link
      if (normalizedPath === normalizedHref ||
        (normalizedPath === '' && normalizedHref === 'index.html') ||
        (normalizedPath === 'index.html' && normalizedHref === 'index.html')) {
        link.classList.add('active');
        console.log('Active link set:', href);
      }
    });

    console.log('✓ Active links processed');
  }
})();
