# Script to remove duplicate navigation styles from HTML files

$files = @(
    "about.html",
    "career.html",
    "contacts.html",
    "faq.html",
    "help.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remove navbar and related navigation styles but keep container
        $pattern = '    \.navbar \{[^}]+\}[\r\n\s]+\[data-theme="light"\] \.navbar \{[^}]+\}[\r\n\s]+\.nav-content \{[^}]+\}[\r\n\s]+\.logo \{[^}]+\}[\r\n\s]+\.logo-icon \{[^}]+\}[\r\n\s]+\.nav-links \{[^}]+\}[\r\n\s]+\.nav-link \{[^}]+\}[\r\n\s]+\.nav-link:hover \{[^}]+\}[\r\n\s]+\.btn-login,[\r\n\s]+\.btn-signup \{[^}]+\}[\r\n\s]+\.btn-login \{[^}]+\}[\r\n\s]+\.btn-signup \{[^}]+\}'
        
        $content = $content -replace $pattern, ''
        
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "Done!"
