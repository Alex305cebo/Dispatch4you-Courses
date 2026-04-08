# Скрипт для добавления футера ко всем модулям

$footerHTML = @'
  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Курсы Диспетчера</h4>
          <p>Профессиональное обучение диспетчеров грузоперевозок</p>
        </div>

        <div class="footer-section">
          <h4>Обучение</h4>
          <a href="../courses.html">Курсы</a>
        </div>

        <div class="footer-section">
          <h4>Поддержка</h4>
          <a href="../faq.html">FAQ</a>
          <a href="../contacts.html">Контакты</a>
          <a href="../help.html">Помощь</a>
        </div>

        <div class="footer-section">
          <h4>Компания</h4>
          <a href="../about.html">О нас</a>
          <a href="../career.html">Карьера</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2024 Курсы Диспетчера. Все права защищены.</p>
      </div>
    </div>
  </footer>
'@

# Получаем все файлы модулей
$moduleFiles = Get-ChildItem "pages/doc-module-*.html"

foreach ($file in $moduleFiles) {
    Write-Host "Обработка: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Проверяем есть ли уже футер
    if ($content -match '<footer') {
        Write-Host "  Футер уже существует, пропускаем" -ForegroundColor Yellow
        continue
    }
    
    # Ищем закрывающий тег </body> и вставляем футер перед ним
    if ($content -match '</body>') {
        $content = $content -replace '</body>', "$footerHTML`n</body>"
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Футер добавлен успешно!" -ForegroundColor Green
    } else {
        Write-Host "  Не найден тег </body>" -ForegroundColor Red
    }
}

Write-Host "`nГотово! Обработано файлов: $($moduleFiles.Count)" -ForegroundColor Cyan
