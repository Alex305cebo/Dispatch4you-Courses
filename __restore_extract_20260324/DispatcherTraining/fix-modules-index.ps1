$path = "pages\modules-index.html"
$content = Get-Content $path -Raw -Encoding UTF8

# Список CSS правил которые нужно удалить (конфликтуют с shared-nav.css)
$patterns = @(
    # .navbar { ... }
    '(?s)\s*\.navbar\s*\{[^}]*\}',
    # .nav-content { ... }
    '(?s)\s*\.nav-content\s*\{[^}]*\}',
    # .nav-link { ... } и все вариации
    '(?s)\s*\.nav-link\s*\{[^}]*\}',
    '(?s)\s*\.nav-link::after\s*\{[^}]*\}',
    '(?s)\s*\.nav-link:hover\s*\{[^}]*\}',
    '(?s)\s*\.nav-link:hover::after\s*\{[^}]*\}',
    # .nav-dropdown { ... }
    '(?s)\s*\.nav-dropdown\s*\{[^}]*\}',
    '(?s)\s*\.nav-dropdown\s+\.nav-link\s*\{[^}]*\}',
    '(?s)\s*\.nav-dropdown\s+\.nav-link::before\s*\{[^}]*\}',
    '(?s)\s*\.nav-dropdown\s+\.nav-link::after\s*\{[^}]*\}',
    '(?s)\s*\.nav-dropdown:hover\s+\.nav-link::before\s*\{[^}]*\}',
    '(?s)\s*\.nav-dropdown:hover\s+\.dropdown-content\s*\{[^}]*\}',
    '(?s)\s*\.nav-dropdown\.active\s+\.dropdown-content\s*\{[^}]*\}',
    # .nav-actions { ... }
    '(?s)\s*\.nav-actions\s*\{[^}]*\}',
    # .mobile-menu { ... } и вариации
    '(?s)\s*\.mobile-menu\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu\.active\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-toggle\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-toggle:hover\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-toggle\s+span\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-toggle\.active\s+span:nth-child\(1\)\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-toggle\.active\s+span:nth-child\(2\)\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-toggle\.active\s+span:nth-child\(3\)\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-close\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-close:hover\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-overlay\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-overlay\.active\s*\{[^}]*\}',
    '(?s)\s*\.mobile-nav-actions\s*\{[^}]*\}',
    '(?s)\s*\.mobile-nav-links\s*\{[^}]*\}',
    '(?s)\s*\.mobile-nav-links\s+\.nav-link\s*\{[^}]*\}',
    '(?s)\s*\.mobile-nav-links\s+\.nav-link:hover\s*\{[^}]*\}',
    '(?s)\s*\.mobile-nav-section\s*\{[^}]*\}',
    '(?s)\s*\.mobile-section-title\s*\{[^}]*\}',
    '(?s)\s*\.mobile-menu-divider\s*\{[^}]*\}',
    '(?s)\s*\.dropdown-content\s*\{[^}]*\}',
    '(?s)\s*\.dropdown-content\s+a\s*\{[^}]*\}',
    '(?s)\s*\.dropdown-content\s+a:hover\s*\{[^}]*\}'
)

$original = $content
foreach ($p in $patterns) {
    $content = [regex]::Replace($content, $p, '')
}

if ($content -ne $original) {
    Set-Content $path -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Fixed: $path"
} else {
    Write-Host "No changes: $path"
}
