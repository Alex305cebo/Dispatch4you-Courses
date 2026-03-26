# 🚀 Настройка нового репозитория с автодеплоем на Hostinger
# Скрипт для быстрой настройки Git + GitHub Actions + Hostinger

param(
    [string]$repoName = "",
    [string]$siteUrl = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   НАСТРОЙКА НОВОГО РЕПОЗИТОРИЯ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Информация о репозитории
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = Read-Host "📝 Введите имя нового репозитория (например: my-new-site)"
}

if ([string]::IsNullOrWhiteSpace($siteUrl)) {
    $siteUrl = Read-Host "🌐 Введите URL сайта (например: mynewsite.com)"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ШАГ 1: СОЗДАНИЕ РЕПОЗИТОРИЯ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣  Откройте: https://github.com/new" -ForegroundColor Yellow
Write-Host "2️⃣  Repository name: $repoName" -ForegroundColor White
Write-Host "3️⃣  Выберите Public или Private" -ForegroundColor White
Write-Host "4️⃣  НЕ добавляйте README, .gitignore, license" -ForegroundColor White
Write-Host "5️⃣  Нажмите 'Create repository'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Репозиторий создан? (y/n)"
if ($continue -ne "y") {
    Write-Host "Создайте репозиторий и запустите скрипт снова" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ШАГ 2: ИНИЦИАЛИЗАЦИЯ GIT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Проверяем, есть ли уже git
if (Test-Path ".git") {
    Write-Host "⚠️  Git уже инициализирован" -ForegroundColor Yellow
    $reinit = Read-Host "Переключить на новый репозиторий? (y/n)"
    if ($reinit -eq "y") {
        Write-Host "🔄 Меняем remote..." -ForegroundColor Cyan
        git remote remove origin 2>$null
        git remote add origin "https://github.com/Alex305cebo/$repoName.git"
    }
} else {
    Write-Host "🔧 Инициализация Git..." -ForegroundColor Cyan
    git init
    git branch -M main
    git remote add origin "https://github.com/Alex305cebo/$repoName.git"
}

Write-Host "✅ Git настроен" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "   ШАГ 3: СОЗДАНИЕ GITHUB ACTIONS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Создаем папку workflows если нет
if (!(Test-Path ".github/workflows")) {
    New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null
}

# Создаем deploy.yml
$deployYml = @"
name: 🚀 Deploy to Hostinger

on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - '**.txt'
      - '**.py'
      - '**.ps1'
  workflow_dispatch:

jobs:
  deploy:
    name: 📦 Deploy to $siteUrl
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
      
    - name: 🔐 Setup SSH Key
      run: |
        mkdir -p ~/.ssh
        echo "`${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -p `${{ secrets.SSH_PORT }} -H `${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts 2>/dev/null || true
      
    - name: 🚀 Deploy via SSH Git Pull
      run: |
        ssh -o StrictHostKeyChecking=no -p `${{ secrets.SSH_PORT }} `${{ secrets.SSH_USERNAME }}@`${{ secrets.SSH_HOST }} << 'ENDSSH'
          echo "📂 Переход в директорию..."
          cd /home/`${{ secrets.SSH_USERNAME }}/public_html || exit 1
          
          echo "🔄 Обновление репозитория..."
          git fetch origin main
          git reset --hard origin/main
          
          echo "✅ Деплой завершен!"
          echo "📊 Последний коммит:"
          git log -1 --oneline
        ENDSSH
        
    - name: ✅ Deploy Complete
      run: |
        echo "========================================="
        echo "✅ Деплой успешно завершен!"
        echo "🌐 Сайт: https://$siteUrl"
        echo "⏰ Время: `$(date)"
        echo "========================================="
"@

Set-Content ".github/workflows/deploy.yml" -Value $deployYml
Write-Host "✅ GitHub Actions создан" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "   ШАГ 4: ПЕРВЫЙ КОММИТ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Добавление файлов..." -ForegroundColor Cyan
git add .

Write-Host "💾 Первый коммит..." -ForegroundColor Cyan
git commit -m "Initial commit: Setup project with auto-deploy"

Write-Host "🚀 Отправка на GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "✅ Код загружен на GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ШАГ 5: НАСТРОЙКА HOSTINGER SSH" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "📋 ИНСТРУКЦИЯ ДЛЯ HOSTINGER:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Войдите в панель Hostinger" -ForegroundColor White
Write-Host "2️⃣  Перейдите в раздел 'SSH Access'" -ForegroundColor White
Write-Host "3️⃣  Включите SSH если выключен" -ForegroundColor White
Write-Host "4️⃣  Запишите данные:" -ForegroundColor White
Write-Host "     - SSH Host (например: srv123.hostinger.com)" -ForegroundColor Gray
Write-Host "     - SSH Port (обычно: 65002)" -ForegroundColor Gray
Write-Host "     - SSH Username (например: u123456789)" -ForegroundColor Gray
Write-Host ""

$sshHost = Read-Host "Введите SSH Host"
$sshPort = Read-Host "Введите SSH Port (обычно 65002)"
$sshUsername = Read-Host "Введите SSH Username"

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ШАГ 6: ГЕНЕРАЦИЯ SSH КЛЮЧА" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "🔑 Генерация SSH ключа..." -ForegroundColor Cyan
$sshKeyPath = "$env:USERPROFILE\.ssh\hostinger_$repoName"

if (Test-Path $sshKeyPath) {
    Write-Host "⚠️  Ключ уже существует: $sshKeyPath" -ForegroundColor Yellow
    $useExisting = Read-Host "Использовать существующий? (y/n)"
    if ($useExisting -ne "y") {
        ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""' -C "deploy-$repoName"
    }
} else {
    ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""' -C "deploy-$repoName"
}

Write-Host "✅ SSH ключ создан" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ШАГ 7: ДОБАВЛЕНИЕ КЛЮЧА НА HOSTINGER" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "📋 Скопируйте публичный ключ:" -ForegroundColor Yellow
Write-Host ""
Get-Content "$sshKeyPath.pub"
Write-Host ""
Write-Host "1️⃣  Подключитесь к Hostinger через SSH:" -ForegroundColor White
Write-Host "     ssh -p $sshPort $sshUsername@$sshHost" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Выполните на сервере:" -ForegroundColor White
Write-Host "     mkdir -p ~/.ssh" -ForegroundColor Gray
Write-Host "     nano ~/.ssh/authorized_keys" -ForegroundColor Gray
Write-Host "     (вставьте публичный ключ выше, сохраните)" -ForegroundColor Gray
Write-Host "     chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Gray
Write-Host "     exit" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Ключ добавлен на сервер? (y/n)"
if ($continue -ne "y") {
    Write-Host "Добавьте ключ и запустите скрипт снова" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ШАГ 8: КЛОНИРОВАНИЕ НА HOSTINGER" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "📋 Выполните на сервере Hostinger:" -ForegroundColor Yellow
Write-Host ""
Write-Host "ssh -p $sshPort $sshUsername@$sshHost" -ForegroundColor White
Write-Host ""
Write-Host "# На сервере выполните:" -ForegroundColor Gray
Write-Host "cd ~/public_html" -ForegroundColor White
Write-Host "rm -rf * .??*  # ВНИМАНИЕ: Удалит все файлы!" -ForegroundColor Red
Write-Host "git clone https://github.com/Alex305cebo/$repoName.git ." -ForegroundColor White
Write-Host "git config --global --add safe.directory /home/$sshUsername/public_html" -ForegroundColor White
Write-Host "exit" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Репозиторий клонирован на сервер? (y/n)"
if ($continue -ne "y") {
    Write-Host "Клонируйте репозиторий и запустите скрипт снова" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ШАГ 9: НАСТРОЙКА GITHUB SECRETS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "📋 Добавьте секреты в GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Откройте: https://github.com/Alex305cebo/$repoName/settings/secrets/actions" -ForegroundColor White
Write-Host "2️⃣  Нажмите 'New repository secret'" -ForegroundColor White
Write-Host "3️⃣  Добавьте 4 секрета:" -ForegroundColor White
Write-Host ""

Write-Host "   Секрет #1:" -ForegroundColor Cyan
Write-Host "   Name: SSH_HOST" -ForegroundColor White
Write-Host "   Value: $sshHost" -ForegroundColor Gray
Write-Host ""

Write-Host "   Секрет #2:" -ForegroundColor Cyan
Write-Host "   Name: SSH_PORT" -ForegroundColor White
Write-Host "   Value: $sshPort" -ForegroundColor Gray
Write-Host ""

Write-Host "   Секрет #3:" -ForegroundColor Cyan
Write-Host "   Name: SSH_USERNAME" -ForegroundColor White
Write-Host "   Value: $sshUsername" -ForegroundColor Gray
Write-Host ""

Write-Host "   Секрет #4:" -ForegroundColor Cyan
Write-Host "   Name: SSH_PRIVATE_KEY" -ForegroundColor White
Write-Host "   Value: [содержимое приватного ключа ниже]" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 ПРИВАТНЫЙ КЛЮЧ (скопируйте полностью):" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor DarkGray
Get-Content $sshKeyPath
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host ""

$continue = Read-Host "Секреты добавлены в GitHub? (y/n)"
if ($continue -ne "y") {
    Write-Host "Добавьте секреты и запустите скрипт снова" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ШАГ 10: ТЕСТОВЫЙ ДЕПЛОЙ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 Создаем тестовый файл..." -ForegroundColor Cyan
$testContent = @"
# Тест автодеплоя

Репозиторий: $repoName
Сайт: https://$siteUrl
Дата: $(Get-Date -Format "yyyy-MM-dd HH:mm")

Если вы видите этот файл на сайте - деплой работает! ✅
"@

Set-Content "test-deploy.txt" -Value $testContent

Write-Host "📝 Коммит тестового файла..." -ForegroundColor Cyan
git add test-deploy.txt
git commit -m "Test: Auto-deploy setup"

Write-Host "🚀 Отправка на GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ НАСТРОЙКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Проверьте деплой:" -ForegroundColor Yellow
Write-Host "   GitHub Actions: https://github.com/Alex305cebo/$repoName/actions" -ForegroundColor Cyan
Write-Host "   Сайт: https://$siteUrl/test-deploy.txt" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Теперь при каждом push код автоматически загрузится на сайт!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Быстрый деплой: .\quick-deploy.ps1" -ForegroundColor Gray
Write-Host ""

