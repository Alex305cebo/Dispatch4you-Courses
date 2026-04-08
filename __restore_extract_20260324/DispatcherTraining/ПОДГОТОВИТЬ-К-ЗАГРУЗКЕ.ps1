# Скрипт для подготовки файлов к загрузке на сайт

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📤 ПОДГОТОВКА ФАЙЛОВ К ЗАГРУЗКЕ НА САЙТ                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Создаем папку для загрузки
$uploadFolder = "ГОТОВО-К-ЗАГРУЗКЕ"
if (Test-Path $uploadFolder) {
    Write-Host "🗑️  Удаляю старую папку..." -ForegroundColor Yellow
    Remove-Item $uploadFolder -Recurse -Force
}

Write-Host "📁 Создаю папку для загрузки..." -ForegroundColor Green
New-Item -ItemType Directory -Path $uploadFolder | Out-Null

# Список файлов для загрузки
$filesToUpload = @(
    ".htaccess",
    "БЫСТРЫЙ-ДОСТУП.html",
    "ОТКРЫТЬ-ДОКУМЕНТАЦИЮ.html",
    "test-local-navigation.html",
    "server-check.html"
)

Write-Host "`n📋 Копирую файлы:`n" -ForegroundColor Cyan

foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $uploadFolder
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file - НЕ НАЙДЕН" -ForegroundColor Yellow
    }
}

# Копируем папку pages
Write-Host "`n📂 Копирую папку pages/..." -ForegroundColor Cyan
if (Test-Path "pages") {
    Copy-Item "pages" -Destination $uploadFolder -Recurse
    Write-Host "   ✅ Папка pages скопирована" -ForegroundColor Green
} else {
    Write-Host "   ❌ Папка pages НЕ НАЙДЕНА" -ForegroundColor Red
}

# Создаем README в папке загрузки
$readmeContent = @"
═══════════════════════════════════════════════════════════════════
  📤 ИНСТРУКЦИЯ ПО ЗАГРУЗКЕ
═══════════════════════════════════════════════════════════════════

Эта папка содержит файлы, готовые к загрузке на сайт.

ШАГИ:

1. Подключитесь к серверу через FTP (FileZilla, WinSCP)
2. Перейдите в корневую папку сайта
3. Загрузите ВСЕ файлы из этой папки
4. Убедитесь, что .htaccess загружен
5. Проверьте права доступа (644 для файлов, 755 для папок)

ПРОВЕРКА:

После загрузки откройте:
- https://dispatch4you.com/documentation
- https://dispatch4you.com/modules
- https://dispatch4you.com/doc-module-1

Все должно работать!

═══════════════════════════════════════════════════════════════════
"@

Set-Content -Path "$uploadFolder/README.txt" -Value $readmeContent -Encoding UTF8

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ ГОТОВО!                                                      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📁 Все файлы подготовлены в папке: $uploadFolder" -ForegroundColor Cyan
Write-Host "`n🚀 Следующие шаги:" -ForegroundColor Yellow
Write-Host "   1. Откройте папку $uploadFolder" -ForegroundColor White
Write-Host "   2. Загрузите все файлы на сервер через FTP" -ForegroundColor White
Write-Host "   3. Проверьте работу Clean URLs на сайте`n" -ForegroundColor White

# Открываем папку
Write-Host "📂 Открываю папку..." -ForegroundColor Green
Start-Process $uploadFolder

Write-Host "`n✅ Готово к загрузке!`n" -ForegroundColor Green
Read-Host "Нажмите Enter для выхода"
