# Script to add data-short attributes to navigation links across all HTML files

$files = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*backup*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Add data-short to "Инструменты"
    if ($content -match '<span class="nav-link">Инструменты</span>' -and $content -notmatch 'data-short="Инстр\."') {
        $content = $content -replace '<span class="nav-link">Инструменты</span>', '<span class="nav-link" data-short="Инстр.">Инструменты</span>'
        $modified = $true
    }
    
    # Add data-short to "Информация"
    if ($content -match '<span class="nav-link">Информация</span>' -and $content -notmatch 'data-short="Инфо"') {
        $content = $content -replace '<span class="nav-link">Информация</span>', '<span class="nav-link" data-short="Инфо">Информация</span>'
        $modified = $true
    }
    
    # Add data-short to "Документация" link
    if ($content -match '<a href="[^"]*documentation\.html" class="nav-link">Документация</a>' -and $content -notmatch 'data-short="Докум\."') {
        $content = $content -replace '(<a href="[^"]*documentation\.html" class="nav-link")>Документация</a>', '$1 data-short="Докум.">Документация</a>'
        $modified = $true
    }
    
    # Add data-short to "Личный кабинет"
    if ($content -match 'class="nav-link"[^>]*>Личный кабинет</a>' -and $content -notmatch 'data-short="Кабинет"') {
        $content = $content -replace '(class="nav-link"[^>]*)>Личный кабинет</a>', '$1 data-short="Кабинет">Личный кабинет</a>'
        $modified = $true
    }
    
    # Add data-short to "Курсы" link
    if ($content -match '<a href="[^"]*courses\.html" class="nav-link">Курсы</a>' -and $content -notmatch 'data-short="Курсы"') {
        $content = $content -replace '(<a href="[^"]*courses\.html" class="nav-link")>Курсы</a>', '$1 data-short="Курсы">Курсы</a>'
        $modified = $true
    }
    
    # Add data-short to "Тарифы" link
    if ($content -match '<a href="[^"]*pricing\.html" class="nav-link">Тарифы</a>' -and $content -notmatch 'data-short="Тарифы"') {
        $content = $content -replace '(<a href="[^"]*pricing\.html" class="nav-link")>Тарифы</a>', '$1 data-short="Тарифы">Тарифы</a>'
        $modified = $true
    }
    
    # Add data-short to "Главная" link
    if ($content -match '<a href="[^"]*index\.html" class="nav-link[^"]*">Главная</a>' -and $content -notmatch 'data-short="Главная"') {
        $content = $content -replace '(<a href="[^"]*index\.html" class="nav-link[^"]*")>Главная</a>', '$1 data-short="Главная">Главная</a>'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone! All navigation links updated with data-short attributes."
