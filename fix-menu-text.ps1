# Script to fix Russian text encoding in navigation menus

$files = Get-ChildItem pages/module-*.html, pages/test-*.html -Exclude test-nav-subfolder.html, module-5-fixed.html

$replacements = @{
    'РљСѓСЂСЃС‹ Р"РёСЃРїРµС‚С‡РµСЂР°' = 'Курсы Диспетчера'
    'Р"Р»Р°РІРЅР°СЏ' = 'Главная'
    'РљСѓСЂСЃС‹' = 'Курсы'
    'РћР±Р·РѕСЂ РєСѓСЂСЃР°' = 'Обзор курса'
    'РњРѕРґСѓР»РµР№ РѕР±СѓС‡РµРЅРёСЏ' = 'Модулей обучения'
    'РЎРёРјСѓР»СЏС‚РѕСЂ РїРµСЂРµРіРѕРІРѕСЂРѕРІ' = 'Симулятор переговоров'
    'РџСЂРёРјРµСЂС‹ Р·РІРѕРЅРєРѕРІ' = 'Примеры звонков'
    'РџСЂР°РєС‚РёС‡РµСЃРєРёРµ РєРµР№СЃС‹' = 'Практические кейсы'
    'РўРµСЃС‚РёСЂРѕРІР°РЅРёРµ' = 'Тестирование'
    'РРЅСЃС‚СЂСѓРјРµРЅС‚С‹' = 'Инструменты'
    'РРЅС„РѕСЂРјР°С†РёСЏ' = 'Информация'
    'Рћ РЅР°СЃ' = 'О нас'
    'Р'Р»РѕРі' = 'Блог'
    'РљР°СЂСЊРµСЂР°' = 'Карьера'
    'РџРѕРјРѕС‰СЊ' = 'Помощь'
    'РљРѕРЅС‚Р°РєС‚С‹' = 'Контакты'
    'Р"РѕРєСѓРјРµРЅС‚Р°С†РёСЏ' = 'Документация'
    'РўР°СЂРёС„С‹' = 'Тарифы'
    'Р›РёС‡РЅС‹Р№ РєР°Р±РёРЅРµС‚' = 'Личный кабинет'
    'Р'РѕР№С‚Рё' = 'Войти'
    'Р РµРіРёСЃС‚СЂР°С†РёСЏ' = 'Регистрация'
    'Р'СЃРµ РєСѓСЂСЃС‹' = 'Все курсы'
    'рџЋ"' = '🎓'
    'рџЏ ' = '🏠'
    'рџ"љ' = '📚'
    'рџ› пёЏ' = '🛠️'
    'в„№пёЏ' = 'ℹ️'
    'рџ"„' = '📄'
    'рџ'°' = '💰'
    'рџ'¤' = '👤'
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file as bytes and convert to UTF8 string
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Replace all broken text with correct Russian text
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    
    # Save with UTF8 encoding without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    
    Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
}

Write-Host "`nAll menu text fixed!" -ForegroundColor Cyan
