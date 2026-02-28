# PowerShell скрипт быстрого деплоя на Hostinger

Write-Host "🚀 Деплой на dispatch4you.com через Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка изменений
$status = git status -s
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "❌ Нет изменений для деплоя" -ForegroundColor Yellow
    exit 0
}

# Показать изменения
Write-Host "📝 Измененные файлы:" -ForegroundColor Green
git status -s
Write-Host ""

# Запрос сообщения коммита
$commitMessage = Read-Host "💬 Введите описание изменений"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Git операции
Write-Host ""
Write-Host "📦 Добавление файлов..." -ForegroundColor Yellow
git add .

Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host "🌐 Отправка на Hostinger..." -ForegroundColor Yellow
git push hostinger main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Деплой успешно завершен!" -ForegroundColor Green
    Write-Host "🔗 Проверьте: https://dispatch4you.com/" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при деплое. Проверьте подключение к Hostinger." -ForegroundColor Red
    exit 1
}
