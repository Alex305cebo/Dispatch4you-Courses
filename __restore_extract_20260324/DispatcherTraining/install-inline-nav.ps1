# Скрипт для установки встроенной навигации на все страницы
# Это решает проблему "Failed to fetch" для локальных файлов

Write-Host "🔧 Установка встроенной навигации на все страницы..." -ForegroundColor Cyan
Write-Host ""

$pages = @(
    "blog.html",
    "career.html", 
    "contacts.html",
    "course.html",
    "courses.html",
    "dashboard.html",
    "faq.html",
    "help.html",
    "pricing.html"
)

$navHTML = @'
  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-content">
        <a href="index.html" class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">Курсы Диспетчера</span>
        </a>

        <div class="nav-links">
          <a href="index.html" class="nav-link">Главная</a>

          <div class="nav-dropdown">
            <a href="courses.html" class="nav-link">Курсы</a>
            <div class="dropdown-content">
              <a href="course.html">Обзор курса</a>
              <a href="pages/modules.html">12 Модулей обучения</a>
              <a href="pages/simulator.html">Симулятор переговоров</a>
              <a href="pages/calls.html">Примеры звонков</a>
              <a href="pages/cases.html">Практические кейсы</a>
              <a href="pages/testing.html">Тестирование</a>
            </div>
          </div>

          <div class="nav-dropdown">
            <span class="nav-link">Инструменты</span>
            <div class="dropdown-content">
              <a href="pages/loadboard.html">Load Board</a>
              <a href="pages/load-finder.html">Load Finder</a>
              <a href="pages/dispatcher-cards.html">Dispatcher Cards</a>
              <a href="pages/simulator.html">Dispatch Simulator</a>
            </div>
          </div>

          <div class="nav-dropdown">
            <span class="nav-link">Информация</span>
            <div class="dropdown-content">
              <a href="about.html">О нас</a>
              <a href="blog.html">Блог</a>
              <a href="career.html">Карьера</a>
              <a href="faq.html">FAQ</a>
              <a href="help.html">Помощь</a>
              <a href="contacts.html">Контакты</a>
            </div>
          </div>

          <a href="pages/documentation.html" class="nav-link">Документация</a>
          <a href="pricing.html" class="nav-link">Тарифы</a>
          <a href="dashboard.html" class="nav-link" id="dashboardLink" style="display: none;">Личный кабинет</a>
        </div>

        <div class="nav-actions">
          <a href="login.html" class="btn-login">Войти</a>
          <a href="register.html" class="btn-signup">Регистрация</a>
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
      <a href="index.html" class="nav-link">🏠 Главная</a>

      <div class="mobile-nav-section">
        <div class="mobile-section-title">📚 КУРСЫ</div>
        <a href="courses.html" class="nav-link nav-link-sub">Все курсы</a>
        <a href="course.html" class="nav-link nav-link-sub">Обзор курса</a>
        <a href="pages/modules.html" class="nav-link nav-link-sub">12 Модулей обучения</a>
        <a href="pages/simulator.html" class="nav-link nav-link-sub">Симулятор переговоров</a>
        <a href="pages/calls.html" class="nav-link nav-link-sub">Примеры звонков</a>
        <a href="pages/cases.html" class="nav-link nav-link-sub">Практические кейсы</a>
        <a href="pages/testing.html" class="nav-link nav-link-sub">Тестирование</a>
      </div>

      <div class="mobile-nav-section">
        <div class="mobile-section-title">🛠️ ИНСТРУМЕНТЫ</div>
        <a href="pages/loadboard.html" class="nav-link nav-link-sub">Load Board</a>
        <a href="pages/load-finder.html" class="nav-link nav-link-sub">Load Finder</a>
        <a href="pages/dispatcher-cards.html" class="nav-link nav-link-sub">Dispatcher Cards</a>
        <a href="pages/simulator.html" class="nav-link nav-link-sub">Dispatch Simulator</a>
      </div>

      <div class="mobile-nav-section">
        <div class="mobile-section-title">ℹ️ ИНФОРМАЦИЯ</div>
        <a href="about.html" class="nav-link nav-link-sub">О нас</a>
        <a href="blog.html" class="nav-link nav-link-sub">Блог</a>
        <a href="career.html" class="nav-link nav-link-sub">Карьера</a>
        <a href="faq.html" class="nav-link nav-link-sub">FAQ</a>
        <a href="help.html" class="nav-link nav-link-sub">Помощь</a>
        <a href="contacts.html" class="nav-link nav-link-sub">Контакты</a>
      </div>

      <div class="mobile-menu-divider"></div>

      <a href="pages/documentation.html" class="nav-link">📄 Документация</a>
      <a href="pricing.html" class="nav-link">💰 Тарифы</a>
      <a href="dashboard.html" class="nav-link" id="dashboardLinkMobile" style="display: none;">👤 Личный кабинет</a>
    </div>
    <div class="mobile-nav-actions">
      <a href="login.html" class="btn-login" style="width: 100%; text-align: center;">Войти</a>
      <a href="register.html" class="btn-signup" style="width: 100%; text-align: center;">Регистрация</a>
    </div>
  </div>
'@

$mobileScript = @'
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

$successCount = 0
$errorCount = 0

foreach ($page in $pages) {
    if (Test-Path $page) {
        try {
            Write-Host "Обработка $page..." -ForegroundColor Yellow
            
            $content = Get-Content $page -Raw -Encoding UTF8
            
            # Заменяем header-placeholder на встроенную навигацию
            $content = $content -replace '(?s)<!-- Header Placeholder -->.*?<div id="header-placeholder"></div>', $navHTML
            
            # Заменяем load-header.js на mobile script
            $content = $content -replace '(?s)<!-- Load shared header -->.*?<script src="load-header\.js"></script>', $mobileScript
            
            # Сохраняем
            $content | Out-File -FilePath $page -Encoding UTF8 -NoNewline
            
            Write-Host "  ✓ $page обновлен" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "  ✗ Ошибка при обработке $page : $_" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "  ⚠ $page не найден" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Готово!" -ForegroundColor Green
Write-Host "Успешно обновлено: $successCount страниц" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Ошибок: $errorCount" -ForegroundColor Red
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Теперь все страницы работают БЕЗ веб-сервера!" -ForegroundColor Green
Write-Host "Откройте любую страницу в браузере для проверки." -ForegroundColor Cyan
Write-Host ""

Read-Host "Нажмите Enter для выхода"
