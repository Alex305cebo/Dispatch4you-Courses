<?php
/**
 * GitHub Webhook для автоматического деплоя на Hostinger
 * 
 * Инструкция:
 * 1. Загрузите этот файл на Hostinger в папку public_html
 * 2. Измените SECRET_KEY на свой секретный ключ
 * 3. Измените путь к репозиторию
 * 4. В GitHub Settings → Webhooks добавьте URL: https://yourdomain.com/webhook.php
 */

// Ваш секретный ключ (создайте случайную строку)
define('SECRET_KEY', 'CHANGE_THIS_TO_YOUR_SECRET_KEY');

// Путь к вашему репозиторию на сервере
define('REPO_PATH', '/home/u123456789/public_html');

// Логирование
define('LOG_FILE', REPO_PATH . '/deploy.log');

function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents(LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

// Получаем payload от GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Проверяем подпись
$expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, SECRET_KEY);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(403);
    logMessage('ERROR: Invalid signature');
    die('Invalid signature');
}

// Декодируем payload
$data = json_decode($payload, true);

// Проверяем, что это push в main ветку
if ($data['ref'] !== 'refs/heads/main') {
    logMessage('INFO: Not a push to main branch, skipping');
    die('Not a push to main branch');
}

logMessage('INFO: Starting deployment...');

// Выполняем git pull
$output = [];
$returnCode = 0;

// Переходим в директорию репозитория и обновляем
chdir(REPO_PATH);
exec('git pull origin main 2>&1', $output, $returnCode);

if ($returnCode === 0) {
    logMessage('SUCCESS: Deployment completed successfully');
    logMessage('OUTPUT: ' . implode("\n", $output));
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployed successfully',
        'output' => $output
    ]);
} else {
    logMessage('ERROR: Deployment failed with code ' . $returnCode);
    logMessage('OUTPUT: ' . implode("\n", $output));
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deployment failed',
        'output' => $output
    ]);
}
?>
