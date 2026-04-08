# Script to add navigation to all module and test files

$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

$headIncludes = @'
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../shared-styles.css">
  <script>!function () { var t = localStorage.getItem('dispatcher-theme') || 'dark'; 'dark' === t && document.documentElement.setAttribute('data-theme', 'dark') }();</script>
  <link rel="stylesheet" href="../dark-theme.css">
  <script src="../dark-mode.js"></script>
  <script src="auth-check.js"></script>
  <link rel="stylesheet" href="../shared-nav.css">
'@

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
'@

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Add head includes if not present
    if ($content -notmatch 'shared-nav\.css') {
        $content = $content -replace '(<title>.*?</title>)', "`$1`n$headIncludes"
    }
    
    # Add navigation after <body> tag if not present
    if ($content -notmatch '<nav class="navbar">') {
        $content = $content -replace '(<body>)', "`$1`n$navigation"
    }
    
    # Add mobile menu script before </body> if not present
    if ($content -notmatch 'mobileMenuToggle') {
        $content = $content -replace '(</body>)', "$mobileMenuScript`n`$1"
    }
    
    # Add auth.js script if not present
    if ($content -notmatch 'auth\.js') {
        $authScript = '  <script src="../auth.js"></script>'
        $content = $content -replace '(</body>)', "$authScript`n`$1"
    }
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated: $($file.Name)" -ForegroundColor Green
}

Write-Host "`nAll files updated with navigation!" -ForegroundColor Cyan
