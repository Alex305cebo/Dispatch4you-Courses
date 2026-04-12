// Load shared footer across all pages
(function () {
  console.log('=== Footer Loading Script Started ===');
  console.log('Current URL:', window.location.href);
  console.log('Current Path:', window.location.pathname);

  // Determine the correct path to shared-footer.html based on current location
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes('/pages/');
  const footerPath = isInSubfolder ? '../shared-footer.html' : 'shared-footer.html';
  const footerCssPath = isInSubfolder ? '../shared-footer.css' : 'shared-footer.css';

  console.log('Is in subfolder:', isInSubfolder);
  console.log('Footer path:', footerPath);

  // Load footer CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = footerCssPath;
  document.head.appendChild(link);
  console.log('✓ Footer CSS loaded');

  // Check if placeholder exists before fetching
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) {
    console.error('❌ CRITICAL: footer-placeholder element not found in DOM!');
    return;
  }
  console.log('✓ footer-placeholder found');

  // Fetch and inject the footer
  fetch(footerPath)
    .then(response => {
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to load footer: ' + response.status);
      }
      return response.text();
    })
    .then(html => {
      console.log('Footer HTML loaded, length:', html.length);

      // If we're in a subfolder, adjust all relative paths
      if (isInSubfolder) {
        html = html.replace(/href="(?!http|#|\.\.\/)/g, 'href="../');
        console.log('Paths adjusted for subfolder');
      }

      placeholder.innerHTML = html;
      console.log('✓ Footer HTML injected into placeholder');
      console.log('✓✓✓ Footer loaded successfully ✓✓✓');
    })
    .catch(error => {
      console.error('❌ Error loading footer:', error);
      // Silently fail - footer is not critical
      if (placeholder) {
        placeholder.innerHTML = '';
      }
    });
})();
