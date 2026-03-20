# Quick Deploy Script - dispatch4you.com
# Быстрый деплой одной командой

param(
    [string]$message = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ДЕПЛОЙ НА dispatch4you.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка изменений
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "❌ Нет изменений для деплоя" -ForegroundColor Yellow
    exit 0
}

# Показать изменения
Write-Host "📝 Обнаружены изменения:" -ForegroundColor Green
git status --short
Write-Host ""

# Автоматическое сообщение коммита
if ([string]::IsNullOrWhiteSpace($message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $message = "Update: $timestamp"
}

Write-Host "💾 Добавление файлов..." -ForegroundColor Cyan
git add .

Write-Host "📝 Коммит: $message" -ForegroundColor Cyan
git commit -m $message

Write-Host "🚀 Отправка на GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ ДЕПЛОЙ ЗАПУЩЕН!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Статус: https://github.com/Alex305cebo/dispatch4you-site/actions" -ForegroundColor Yellow
Write-Host "⏱️  Сайт обновится через 1-3 минуты" -ForegroundColor Yellow
Write-Host "🌐 URL: https://dispatch4you.com" -ForegroundColor Cyan
Write-Host ""
