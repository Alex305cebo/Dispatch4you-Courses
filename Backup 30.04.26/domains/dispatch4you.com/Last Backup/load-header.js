// Load shared header across all pages
(function() {
  // Determine the correct path to shared-header.html based on current location
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes('/pages/');
  const headerPath = isInSubfolder ? '../shared-header.html' : 'shared-header.html';
  
  // Fetch and inject the header
  fetch(headerPath)
    .then(response => response.text())
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.innerHTML = html;
        
        // Initialize mobile menu after header is loaded
        initializeMobileMenu();
        
        // Set active link based on current page
        setActiveLink();
      }
    })
    .catch(error => console.error('Error loading header:', error));
  
  // Mobile menu functionality
  function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (mobileMenuToggle && mobileMenu && mobileMenuOverlay) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });
      
      mobileMenuOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  }
  
  // Set active link based on current page
  function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Remove leading slash for comparison
      const normalizedHref = href.replace(/^\//, '');
      const normalizedPath = currentPath.replace(/^\//, '');
      
      // Check if current page matches the link
      if (normalizedPath.includes(normalizedHref) || 
          (normalizedPath === '' && normalizedHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
})();
