# Setup Hostinger Auto Deploy
# Этот скрипт поможет настроить автоматический деплой

Write-Host "=== Настройка автоматического деплоя на Hostinger ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Выберите способ деплоя:" -ForegroundColor Yellow
Write-Host "1. GitHub Actions (FTP) - Рекомендуется, проще настроить"
Write-Host "2. Git Webhook (SSH) - Требует SSH доступ"
Write-Host ""

$choice = Read-Host "Введите номер (1 или 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "=== Настройка GitHub Actions ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Шаг 1: Получите FTP данные от Hostinger" -ForegroundColor Yellow
    Write-Host "  - Войдите в панель Hostinger"
    Write-Host "  - Перейдите в 'FTP Accounts'"
    Write-Host "  - Запишите: FTP Server, Username, Password"
    Write-Host ""
    
    $ftpServer = Read-Host "Введите FTP Server (например: ftp.yourdomain.com)"
    $ftpUsername = Read-Host "Введите FTP Username"
    $ftpPassword = Read-Host "Введите FTP Password" -AsSecureString
    
    Write-Host ""
    Write-Host "Шаг 2: Добавьте секреты в GitHub" -ForegroundColor Yellow
    Write-Host "  1. Откройте: https://github.com/Alex305cebo/dispatch4you-site/settings/secrets/actions"
    Write-Host "  2. Нажмите 'New repository secret'"
    Write-Host "  3. Добавьте следующие секреты:"
    Write-Host ""
    Write-Host "     Name: FTP_SERVER" -ForegroundColor Cyan
    Write-Host "     Value: $ftpServer" -ForegroundColor White
    Write-Host ""
    Write-Host "     Name: FTP_USERNAME" -ForegroundColor Cyan
    Write-Host "     Value: $ftpUsername" -ForegroundColor White
    Write-Host ""
    Write-Host "     Name: FTP_PASSWORD" -ForegroundColor Cyan
    Write-Host "     Value: [ваш пароль]" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Шаг 3: Проверьте путь к папке" -ForegroundColor Yellow
    $serverDir = Read-Host "Введите путь на сервере (по умолчанию: /public_html/)"
    if ([string]::IsNullOrWhiteSpace($serverDir)) {
        $serverDir = "/public_html/"
    }
    
    # Обновляем deploy.yml с правильным путем
    $deployYml = Get-Content ".github/workflows/deploy.yml" -Raw
    $deployYml = $deployYml -replace 'server-dir: /public_html/', "server-dir: $serverDir"
    Set-Content ".github/workflows/deploy.yml" -Value $deployYml
    
    Write-Host ""
    Write-Host "Шаг 4: Коммитим и пушим изменения" -ForegroundColor Yellow
    git add .github/workflows/deploy.yml
    git commit -m "Configure GitHub Actions for Hostinger deploy"
    git push
    
    Write-Host ""
    Write-Host "=== Готово! ===" -ForegroundColor Green
    Write-Host "Теперь при каждом push в main файлы автоматически загрузятся на Hostinger"
    Write-Host "Проверьте статус деплоя: https://github.com/Alex305cebo/dispatch4you-site/actions"
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "=== Настройка Git Webhook ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Для этого способа вам нужен SSH доступ к Hostinger" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Шаг 1: Подключитесь к Hostinger через SSH" -ForegroundColor Yellow
    $sshUser = Read-Host "Введите SSH username (например: u123456789)"
    $sshHost = Read-Host "Введите SSH host (например: yourdomain.com)"
    
    Write-Host ""
    Write-Host "Выполните следующие команды на сервере:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ssh $sshUser@$sshHost" -ForegroundColor White
    Write-Host "cd public_html" -ForegroundColor White
    Write-Host "git clone https://github.com/Alex305cebo/dispatch4you-site.git ." -ForegroundColor White
    Write-Host ""
    
    Write-Host "Шаг 2: Загрузите webhook.php на сервер" -ForegroundColor Yellow
    Write-Host "  - Откройте webhook.php"
    Write-Host "  - Измените SECRET_KEY на случайную строку"
    Write-Host "  - Измените REPO_PATH на путь к вашей папке"
    Write-Host "  - Загрузите файл на сервер"
    Write-Host ""
    
    Write-Host "Шаг 3: Настройте webhook в GitHub" -ForegroundColor Yellow
    Write-Host "  1. Откройте: https://github.com/Alex305cebo/dispatch4you-site/settings/hooks"
    Write-Host "  2. Нажмите 'Add webhook'"
    Write-Host "  3. Payload URL: https://yourdomain.com/webhook.php"
    Write-Host "  4. Content type: application/json"
    Write-Host "  5. Secret: [ваш SECRET_KEY из webhook.php]"
    Write-Host ""
    
    Write-Host "=== Готово! ===" -ForegroundColor Green
    Write-Host "Подробная инструкция в файле DEPLOY-SETUP.md"
    
} else {
    Write-Host "Неверный выбор" -ForegroundColor Red
}

Write-Host ""
Write-Host "Для получения дополнительной помощи откройте DEPLOY-SETUP.md" -ForegroundColor Cyan
