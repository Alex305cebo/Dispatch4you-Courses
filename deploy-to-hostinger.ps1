# 🚀 Быстрый деплой на Hostinger
# Использование: .\deploy-to-hostinger.ps1 "Описание изменений"

param(
    [string]$message = "Update site"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 ДЕПЛОЙ НА HOSTINGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка изменений
Write-Host "📋 Проверка изменений..." -ForegroundColor Yellow
$status = git status --porcelain
if (-not $status) {
    Write-Host "❌ Нет изменений для коммита" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Найдены изменения:" -ForegroundColor Green
git status --short
Write-Host ""

# Добавление файлов
Write-Host "📦 Добавление файлов..." -ForegroundColor Yellow
git add .
Write-Host "✅ Файлы добавлены" -ForegroundColor Green
Write-Host ""

# Коммит
Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m $message
Write-Host "✅ Коммит создан" -ForegroundColor Green
Write-Host ""

# Push в GitHub (Hostinger автоматически задеплоит)
Write-Host "🚀 Отправка в GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host "✅ Отправлено в GitHub" -ForegroundColor Green
Write-Host "⏱️  Hostinger автоматически начнет деплой..." -ForegroundColor Yellow
Write-Host ""

# Итог
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ДЕПЛОЙ ЗАВЕРШЕН!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Проверь статус:" -ForegroundColor Yellow
Write-Host "   Hostinger: https://hpanel.hostinger.com" -ForegroundColor Cyan
Write-Host "   GitHub: https://github.com/Alex305cebo/Dispatch4you-Courses/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Сайт обновится через 2-4 минуты" -ForegroundColor Yellow
Write-Host "🌐 URL: https://dispatch4you.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Clear browser cache: Ctrl+Shift+Delete" -ForegroundColor Yellow
Write-Host ""
