# Remove broken footer and add correct one

$correctFooter = @'
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

$files = Get-ChildItem "pages/doc-module-*.html"

foreach ($file in $files) {
    Write-Host "Fixing: $($file.Name)"
    
    # Read as UTF8
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Remove old footer if exists
    $content = $content -replace '(?s)<!-- Footer -->.*?</footer>', ''
    
    # Add new footer before </body>
    $content = $content -replace '</body>', ($correctFooter + "`n</body>")
    
    # Save as UTF8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    
    Write-Host "  Fixed!" -ForegroundColor Green
}

Write-Host "`nDone! Fixed $($files.Count) files" -ForegroundColor Cyan
