# Script to fix navigation encoding in all module and test files

$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file with UTF8 encoding
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Remove old navigation (from <!-- Navigation --> to closing </div> after mobile menu)
    $content = $content -replace '(?s)  <!-- Navigation -->.*?</div>\s*\n\s*\n', ''
    
    # Remove mobile menu script if exists
    $content = $content -replace '(?s)  <!-- Mobile menu script -->.*?</script>\s*\n\s*\n', ''
    
    # Remove auth.js if exists
    $content = $content -replace '\s*<script src="\.\./auth\.js"></script>\s*\n', ''
    
    Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
    
    # Save with UTF8 encoding
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
}

Write-Host "`nAll files cleaned. Now adding navigation with correct encoding..." -ForegroundColor Cyan

# Now add navigation with correct encoding
$navigation = @'

  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-content">
        <a href="../index.html" class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">Курсы Диспетчера</span>
        </a>

        <div class="nav-links">
          <a href="../index.html" class="nav-link">Главная</a>

          <div class="nav-dropdown">
            <a href="../courses.html" class="nav-link">Курсы</a>
            <div class="dropdown-content">
              <a href="../course.html">Обзор курса</a>
              <a href="modules.html">12 Модулей обучения</a>
              <a href="simulator.html">Симулятор переговоров</a>
              <a href="calls.html">Примеры звонков</a>
              <a href="cases.html">Практические кейсы</a>
              <a href="testing.html">Тестирование</a>
            </div>
          </div>

          <div class="nav-dropdown">
            <span class="nav-link">Инструменты</span>
            <div class="dropdown-content">
              <a href="loadboard.html">Load Board</a>
              <a href="load-finder.html">Load Finder</a>
              <a href="dispatcher-cards.html">Dispatcher Cards</a>
              <a href="simulator.html">Dispatch Simulator</a>
            </div>
          </div>

          <div class="nav-dropdown">
            <span class="nav-link">Информация</span>
            <div class="dropdown-content">
              <a href="../about.html">О нас</a>
              <a href="../blog.html">Блог</a>
              <a href="../career.html">Карьера</a>
              <a href="../faq.html">FAQ</a>
              <a href="../help.html">Помощь</a>
              <a href="../contacts.html">Контакты</a>
            </div>
          </div>

          <a href="documentation.html" class="nav-link">Документация</a>
          <a href="../pricing.html" class="nav-link">Тарифы</a>
          <a href="../dashboard.html" class="nav-link" id="dashboardLink" style="display: none;">Личный кабинет</a>
        </div>

        <div class="nav-actions">
          <a href="../login.html" class="btn-login">Войти</a>
          <a href="../register.html" class="btn-signup">Регистрация</a>
        </div>

        <button class="mobile-menu-toggle" id="mobileMenuToggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

  <!-- Mobile Menu -->
  <div class="mobile-menu" id="mobileMenu">
    <div class="mobile-nav-links">
      <a href="../index.html" class="nav-link">🏠 Главная</a>

      <div class="mobile-nav-section">
        <div class="mobile-section-title">📚 КУРСЫ</div>
        <a href="../courses.html" class="nav-link nav-link-sub">Все курсы</a>
        <a href="../course.html" class="nav-link nav-link-sub">Обзор курса</a>
        <a href="modules.html" class="nav-link nav-link-sub">12 Модулей обучения</a>
        <a href="simulator.html" class="nav-link nav-link-sub">Симулятор переговоров</a>
        <a href="calls.html" class="nav-link nav-link-sub">Примеры звонков</a>
        <a href="cases.html" class="nav-link nav-link-sub">Практические кейсы</a>
        <a href="testing.html" class="nav-link nav-link-sub">Тестирование</a>
      </div>

      <div class="mobile-nav-section">
        <div class="mobile-section-title">🛠️ ИНСТРУМЕНТЫ</div>
        <a href="loadboard.html" class="nav-link nav-link-sub">Load Board</a>
        <a href="load-finder.html" class="nav-link nav-link-sub">Load Finder</a>
        <a href="dispatcher-cards.html" class="nav-link nav-link-sub">Dispatcher Cards</a>
        <a href="simulator.html" class="nav-link nav-link-sub">Dispatch Simulator</a>
      </div>

      <div class="mobile-nav-section">
        <div class="mobile-section-title">ℹ️ ИНФОРМАЦИЯ</div>
        <a href="../about.html" class="nav-link nav-link-sub">О нас</a>
        <a href="../blog.html" class="nav-link nav-link-sub">Блог</a>
        <a href="../career.html" class="nav-link nav-link-sub">Карьера</a>
        <a href="../faq.html" class="nav-link nav-link-sub">FAQ</a>
        <a href="../help.html" class="nav-link nav-link-sub">Помощь</a>
        <a href="../contacts.html" class="nav-link nav-link-sub">Контакты</a>
      </div>

      <div class="mobile-menu-divider"></div>

      <a href="documentation.html" class="nav-link">📄 Документация</a>
      <a href="../pricing.html" class="nav-link">💰 Тарифы</a>
      <a href="../dashboard.html" class="nav-link" id="dashboardLinkMobile" style="display: none;">👤 Личный кабинет</a>
    </div>
    <div class="mobile-nav-actions">
      <a href="../login.html" class="btn-login">Войти</a>
      <a href="../register.html" class="btn-signup">Регистрация</a>
    </div>
  </div>

'@

$mobileMenuScript = @'

  <!-- Mobile menu script -->
  <script>
    // Mobile menu functionality
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
  </script>

  <script src="../auth.js"></script>
'@

foreach ($file in $files) {
    Write-Host "Adding navigation to: $($file.Name)" -ForegroundColor Yellow
    
    # Read file
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    
    # Add navigation after <body>
    $content = $content -replace '(<body>)', "`$1$navigation"
    
    # Add scripts before </body>
    $content = $content -replace '(</body>)', "$mobileMenuScript`$1"
    
    # Save with UTF8 encoding without BOM
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host "Updated: $($file.Name)" -ForegroundColor Green
}

Write-Host "`nAll files updated with correct encoding!" -ForegroundColor Cyan
