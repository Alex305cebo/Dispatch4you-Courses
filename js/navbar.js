// ========================================
// NAVBAR FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        body.style.overflow = '';
      });
    });
  }

  // Navbar scroll effect — throttled through rAF (same ticking pattern as
  // stats-animation.js / features-carousel.js) so scroll never triggers
  // synchronous class churn on every event.
  if (navbar) {
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function() {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        ticking = false;
      });
    }, { passive: true });
  }
});
