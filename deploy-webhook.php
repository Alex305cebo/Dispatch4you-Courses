<?php
/**
 * 🚀 Git Deploy Webhook для Hostinger
 * 
 * Этот файл автоматически обновляет сайт при push в GitHub
 * 
 * Установка:
 * 1. Загрузи этот файл в /public_html/
 * 2. GitHub → Settings → Webhooks → Add webhook
 * 3. URL: https://dispatch4you.com/deploy-webhook.php
 * 4. Secret: придумай секретный ключ
 * 5. Events: Just the push event
 */

// 🔐 Секретный ключ (измени на свой!)
define('WEBHOOK_SECRET', 'твой_секретный_ключ_здесь');

// 📁 Путь к репозиторию
define('REPO_PATH', '/home/u123456789/public_html');

// 📝 Лог файл
define('LOG_FILE', REPO_PATH . '/deploy.log');

// Функция логирования
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents(LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

// Проверка GitHub signature
function verifySignature($payload, $signature) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, WEBHOOK_SECRET);
    return hash_equals($hash, $signature);
}

// Получаем данные от GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Проверяем подпись
if (!verifySignature($payload, $signature)) {
    logMessage('❌ Invalid signature');
    http_response_code(403);
    die('Invalid signature');
}

// Парсим payload
$data = json_decode($payload, true);

// Проверяем, что это push в main
if ($data['ref'] !== 'refs/heads/main') {
    logMessage('ℹ️ Not a main branch push, skipping');
    http_response_code(200);
    die('Not main branch');
}

logMessage('🚀 Deploy started by ' . $data['pusher']['name']);

// Выполняем git pull
chdir(REPO_PATH);

$output = [];
$return_var = 0;

// Git pull
exec('git pull origin main 2>&1', $output, $return_var);

if ($return_var === 0) {
    logMessage('✅ Deploy successful');
    logMessage('📝 Output: ' . implode("\n", $output));
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deploy completed',
        'output' => $output
    ]);
} else {
    logMessage('❌ Deploy failed');
    logMessage('📝 Error: ' . implode("\n", $output));
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deploy failed',
        'output' => $output
    ]);
}
