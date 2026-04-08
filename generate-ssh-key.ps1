# Generate SSH Key for GitHub Actions Deploy

Write-Host "=== Генерация SSH ключа для GitHub Actions ===" -ForegroundColor Cyan
Write-Host ""

# Создаем директорию для ключей если её нет
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir | Out-Null
}

# Генерируем ключ
$keyPath = "$sshDir\github_actions_hostinger"
Write-Host "Генерация SSH ключа..." -ForegroundColor Yellow

ssh-keygen -t ed25519 -C "github-actions-deploy" -f $keyPath -N '""'

Write-Host ""
Write-Host "=== SSH ключ создан! ===" -ForegroundColor Green
Write-Host ""

# Читаем публичный ключ
$publicKey = Get-Content "$keyPath.pub"
Write-Host "ПУБЛИЧНЫЙ КЛЮЧ (добавьте в Hostinger):" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host $publicKey -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Копируем в буфер обмена
$publicKey | Set-Clipboard
Write-Host "✓ Публичный ключ скопирован в буфер обмена" -ForegroundColor Green
Write-Host ""

Write-Host "Шаг 1: Добавьте публичный ключ в Hostinger" -ForegroundColor Yellow
Write-Host "  1. В окне 'Add SSH key' вставьте публичный ключ (Ctrl+V)" -ForegroundColor White
Write-Host "  2. Введите имя: github-actions" -ForegroundColor White
Write-Host "  3. Нажмите 'Add Record'" -ForegroundColor White
Write-Host ""

# Читаем приватный ключ
$privateKey = Get-Content $keyPath -Raw
Write-Host "Шаг 2: Добавьте приватный ключ в GitHub Secrets" -ForegroundColor Yellow
Write-Host "  1. Откройте: https://github.com/Alex305cebo/dispatch4you-site/settings/secrets/actions" -ForegroundColor White
Write-Host "  2. Нажмите 'New repository secret'" -ForegroundColor White
Write-Host "  3. Name: SSH_PRIVATE_KEY" -ForegroundColor White
Write-Host "  4. Secret: [нажмите Enter для копирования приватного ключа]" -ForegroundColor White
Write-Host ""

Read-Host "Нажмите Enter чтобы скопировать ПРИВАТНЫЙ ключ в буфер обмена"

$privateKey | Set-Clipboard
Write-Host "✓ Приватный ключ скопирован в буфер обмена" -ForegroundColor Green
Write-Host ""

Write-Host "ВАЖНО: Приватный ключ скопирован в буфер обмена!" -ForegroundColor Red
Write-Host "Вставьте его в GitHub Secrets как SSH_PRIVATE_KEY" -ForegroundColor Red
Write-Host ""

Write-Host "Шаг 3: Также добавьте эти секреты в GitHub:" -ForegroundColor Yellow
Write-Host "  SSH_HOST: 147.93.43.78" -ForegroundColor White
Write-Host "  SSH_PORT: 65002" -ForegroundColor White
Write-Host "  SSH_USERNAME: u724602277" -ForegroundColor White
Write-Host ""

Write-Host "=== Готово! ===" -ForegroundColor Green
Write-Host "После добавления ключей запустите workflow в GitHub Actions" -ForegroundColor Cyan
