# Скрипт для обновления мобильного меню на всех страницах
# Перемещает кнопки Войти и Регистрация в начало меню

$files = @(
    "about.html",
    "blog.html",
    "career.html",
    "contacts.html",
    "course.html",
    "courses.html",
    "dashboard.html",
    "faq.html",
    "help.html",
    "pricing.html",
    "pages/calls.html",
    "pages/cases.html",
    "pages/dispatcher-cards.html",
    "pages/documentation.html",
    "pages/load-finder.html",
    "pages/loadboard.html",
    "pages/module-1.html",
    "pages/module-2.html",
    "pages/module-3.html",
    "pages/module-4.html",
    "pages/module-5.html",
    "pages/module-6.html",
    "pages/module-7.html",
    "pages/module-8.html",
    "pages/module-9.html",
    "pages/module-10.html",
    "pages/module-11.html",
    "pages/module-12.html",
    "pages/modules.html",
    "pages/simulator.html",
    "pages/test-1.html",
    "pages/test-2.html",
    "pages/test-3.html",
    "pages/test-4.html",
    "pages/test-5.html",
    "pages/test-6.html",
    "pages/test-7.html",
    "pages/test-8.html",
    "pages/test-9.html",
    "pages/test-10.html",
    "pages/test-11.html",
    "pages/test-12.html",
    "pages/testing.html"
)

$updatedCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Проверяем, не обновлен ли уже файл
        if ($content -match '<div class="mobile-nav-links">\s*<div class="mobile-nav-actions">') {
            Write-Host "  Already updated, skipping..." -ForegroundColor Yellow
            continue
        }
        
        # Определяем правильный путь к login.html и register.html
        $loginPath = if ($file -like "pages/*") { "../login.html" } else { "login.html" }
        $registerPath = if ($file -like "pages/*") { "../register.html" } else { "register.html" }
        
        # Паттерн 1: Ищем структуру с mobile-nav-links и первой ссылкой
        $pattern1 = '(<div class="mobile-menu" id="mobileMenu">)\s*(<div class="mobile-nav-links">)\s*(<a href="[^"]*" class="nav-link[^"]*">🏠 Главная</a>)'
        
        if ($content -match $pattern1) {
            $replacement = "`$1`n    `$2`n      <div class=`"mobile-nav-actions`">`n        <a href=`"$loginPath`" class=`"btn-login`">Войти</a>`n        <a href=`"$registerPath`" class=`"btn-signup`">Регистрация</a>`n      </div>`n`n      <div class=`"mobile-menu-divider`"></div>`n`n      `$3"
            
            $content = $content -replace $pattern1, $replacement
            
            # Удаляем старый блок mobile-nav-actions и разделитель перед ним (если есть)
            $content = $content -replace '\s*<div class="mobile-menu-divider"></div>\s*<div class="mobile-nav-actions">.*?</div>\s*</div>\s*(</div>\s*<!-- Mobile Menu -->|<!-- Hero)', '    </div>$1'
            
            # Удаляем старый блок mobile-nav-actions в конце (альтернативный вариант)
            $content = $content -replace '</div>\s*<div class="mobile-nav-actions">.*?</div>\s*</div>\s*<!-- Mobile Menu', '</div>  </div>  <!-- Mobile Menu'
            
            Set-Content $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  Updated successfully!" -ForegroundColor Green
            $updatedCount++
        } else {
            Write-Host "  Pattern not found, skipping..." -ForegroundColor Red
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n=== Update Complete ===" -ForegroundColor Green
Write-Host "Updated $updatedCount files" -ForegroundColor Green
