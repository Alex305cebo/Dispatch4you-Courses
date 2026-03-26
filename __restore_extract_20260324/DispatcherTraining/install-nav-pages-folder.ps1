# Скрипт для установки навигации на страницы в папке pages
Write-Host "🚀 Установка навигации на страницы в папке pages..." -ForegroundColor Cyan
Write-Host ""

# Читаем шаблон навигации
$navTemplate = Get-Content "pages/nav-template-subfolder.html" -Raw -Encoding UTF8

# Мобильный скрипт
$mobileScript = @"

  <script src="../auth.js"></script>

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

</body>
"@

# Список страниц для обновления
$pages = @(
    "pages/calls.html",
    "pages/cases.html",
    "pages/testing.html",
    "pages/documentation.html",
    "pages/load-finder.html"
)

$successCount = 0
$skippedCount = 0

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Обработка $page..." -ForegroundColor Yellow
        
        $content = Get-Content $page -Raw -Encoding UTF8
        
        # Проверяем, есть ли уже navbar
        if ($content -match 'class="navbar"') {
            Write-Host "  ✓ $page уже имеет навигацию" -ForegroundColor Green
            $skippedCount++
        } else {
            # Добавляем навигацию после <body>
            $content = $content -replace '(<body[^>]*>)', "`$1`n$navTemplate"
            
            # Добавляем мобильный скрипт перед </body>
            $content = $content -replace '</body>', $mobileScript
            
            # Сохраняем с UTF-8 BOM
            $utf8WithBom = New-Object System.Text.UTF8Encoding $true
            [System.IO.File]::WriteAllText("$PWD/$page", $content, $utf8WithBom)
            
            Write-Host "  ✓ $page обновлен" -ForegroundColor Green
            $successCount++
        }
    } else {
        Write-Host "  ⚠ $page не найден" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Готово!" -ForegroundColor Green
Write-Host "Обновлено: $successCount страниц" -ForegroundColor Green
Write-Host "Пропущено: $skippedCount страниц (уже имеют навигацию)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Read-Host "Нажмите Enter для выхода"
