$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "Copying navigation from index.html to all modules and tests..." -ForegroundColor Cyan

# Read index.html with UTF8
$indexPath = "index.html"
$indexBytes = [System.IO.File]::ReadAllBytes($indexPath)
$indexContent = [System.Text.Encoding]::UTF8.GetString($indexBytes)

# Extract navigation (from <!-- Navigation --> to end of mobile menu)
$navStart = $indexContent.IndexOf('  <!-- Navigation -->')
$navEnd = $indexContent.IndexOf('  <!-- Hero Section -->')

if ($navStart -eq -1 -or $navEnd -eq -1) {
    Write-Host "ERROR: Could not find navigation markers" -ForegroundColor Red
    exit 1
}

$navBlock = $indexContent.Substring($navStart, $navEnd - $navStart).Trim()

# Adjust paths for pages subfolder
$navBlock = $navBlock -replace 'href="index\.html"', 'href="../index.html"'
$navBlock = $navBlock -replace 'href="courses\.html"', 'href="../courses.html"'
$navBlock = $navBlock -replace 'href="course\.html"', 'href="../course.html"'
$navBlock = $navBlock -replace 'href="pages/', 'href="'
$navBlock = $navBlock -replace 'href="about\.html"', 'href="../about.html"'
$navBlock = $navBlock -replace 'href="blog\.html"', 'href="../blog.html"'
$navBlock = $navBlock -replace 'href="career\.html"', 'href="../career.html"'
$navBlock = $navBlock -replace 'href="faq\.html"', 'href="../faq.html"'
$navBlock = $navBlock -replace 'href="help\.html"', 'href="../help.html"'
$navBlock = $navBlock -replace 'href="contacts\.html"', 'href="../contacts.html"'
$navBlock = $navBlock -replace 'href="pricing\.html"', 'href="../pricing.html"'
$navBlock = $navBlock -replace 'href="dashboard\.html"', 'href="../dashboard.html"'
$navBlock = $navBlock -replace 'href="login\.html"', 'href="../login.html"'
$navBlock = $navBlock -replace 'href="register\.html"', 'href="../register.html"'

Write-Host "Navigation extracted and paths adjusted" -ForegroundColor Green

# Mobile menu script
$mobileScript = @'

  <script>
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

# Process all files
$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

foreach ($file in $files) {
    Write-Host "`nProcessing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file with UTF8
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Add shared-nav.css if not present
    if ($content -notmatch 'shared-nav\.css') {
        $content = $content -replace '(<link href="https://fonts\.googleapis\.com/css2.*?rel="stylesheet">)', "`$1`n  <link rel=`"stylesheet`" href=`"../shared-nav.css`">"
        Write-Host "  + Added shared-nav.css" -ForegroundColor Gray
    }
    
    # Add navigation after <body>
    $content = $content -replace '(<body>\s*)', "`$1`n$navBlock`n`n  "
    Write-Host "  + Added navigation" -ForegroundColor Gray
    
    # Add mobile script before </body>
    $content = $content -replace '(\s*</body>)', "$mobileScript`n`$1"
    Write-Host "  + Added mobile menu script" -ForegroundColor Gray
    
    # Save with UTF8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    
    Write-Host "  SUCCESS" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All files updated successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
