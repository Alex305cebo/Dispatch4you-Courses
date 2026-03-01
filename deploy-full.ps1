# PowerShell скрипт деплоя на GitHub и Hostinger

Write-Host "🚀 Деплой dispatch4you-site" -ForegroundColor Cyan
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

# Отправка на GitHub
Write-Host "🐙 Отправка на GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Ошибка при отправке на GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "✅ GitHub обновлен" -ForegroundColor Green

# Отправка на Hostinger (если настроен)
$hasHostinger = git remote | Select-String -Pattern "hostinger"

if ($hasHostinger) {
    Write-Host "🌐 Отправка на Hostinger..." -ForegroundColor Yellow
    git push hostinger main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Hostinger обновлен" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Деплой успешно завершен!" -ForegroundColor Green
        Write-Host "🔗 GitHub: https://github.com/Alex305cebo/dispatch4you-site" -ForegroundColor Cyan
        Write-Host "🔗 Сайт: https://dispatch4you.com/" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Ошибка при отправке на Hostinger" -ForegroundColor Yellow
        Write-Host "💡 GitHub обновлен, но Hostinger не обновился" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "✅ Деплой на GitHub завершен!" -ForegroundColor Green
    Write-Host "🔗 https://github.com/Alex305cebo/dispatch4you-site" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Hostinger remote не настроен" -ForegroundColor Yellow
    Write-Host "   Для настройки следуйте инструкции в DEPLOY-HOSTINGER.md" -ForegroundColor Gray
}
