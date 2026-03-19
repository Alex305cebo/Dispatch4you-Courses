<?php
/**
 * 🚀 Git Deploy Webhook для Hostinger (БЕЗОПАСНЫЙ МЕТОД)
 * 
 * Git репозиторий в отдельной папке ~/git-repo
 * Файлы копируются в ~/public_html
 * 
 * Установка:
 * 1. SSH на Hostinger: mkdir ~/git-repo && cd ~/git-repo
 * 2. Клонируй: git clone https://github.com/Alex305cebo/dispatch4you-site.git .
 * 3. Отредактируй этот файл (секрет + username)
 * 4. Загрузи этот файл в ~/public_html/
 * 5. GitHub → Settings → Webhooks → Add webhook
 * 6. URL: https://dispatch4you.com/deploy-webhook.php
 */

// 🔐 Секретный ключ (ИЗМЕНИ НА СВОЙ!)
// Придумай сложный пароль, например: my_secret_key_abc123xyz
define('WEBHOOK_SECRET', 'CHANGE_THIS_SECRET_KEY_NOW');

// 📁 Пути (ИЗМЕНИ u123456789 на свой username!)
define('GIT_REPO_PATH', '/home/u123456789/git-repo');
define('PUBLIC_HTML_PATH', '/home/u123456789/public_html');

// 📝 Лог файл
define('LOG_FILE', PUBLIC_HTML_PATH . '/deploy.log');

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

// Переходим в Git репозиторий
chdir(GIT_REPO_PATH);

$output = [];
$return_var = 0;

// Git pull в отдельной папке
exec('git pull origin main 2>&1', $output, $return_var);

if ($return_var !== 0) {
    logMessage('❌ Git pull failed: ' . implode("\n", $output));
    http_response_code(500);
    die('Git pull failed');
}

logMessage('✅ Git pull successful');

// Копируем файлы в public_html (исключая ненужные)
$rsyncCommand = sprintf(
    'rsync -av --delete ' .
    '--exclude=".git" ' .
    '--exclude="node_modules" ' .
    '--exclude=".kiro" ' .
    '--exclude="backup_*" ' .
    '--exclude="*.md" ' .
    '--exclude="SESSION-*.md" ' .
    '--exclude=".vscode" ' .
    '--exclude="audio-learning-platform" ' .
    '--exclude="dispatcher-cards-app" ' .
    '--exclude="dispatcher-training-v2" ' .
    '--exclude="dispatcher-training-v2-html" ' .
    '--exclude="hero-react-app" ' .
    '--exclude="hero-scroll-section" ' .
    '--exclude="__tests__" ' .
    '--exclude="test-*.html" ' .
    '--exclude="*.py" ' .
    '--exclude="*.ps1" ' .
    '--exclude="*.bat" ' .
    '--exclude="*.sh" ' .
    '--exclude="*.zip" ' .
    '--exclude="deploy-webhook.php" ' .
    '%s/ %s/',
    GIT_REPO_PATH,
    PUBLIC_HTML_PATH
);

exec($rsyncCommand . ' 2>&1', $output, $return_var);

if ($return_var === 0) {
    logMessage('✅ Files synced to public_html');
    logMessage('📝 Deploy completed successfully');
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deploy completed',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    logMessage('❌ Rsync failed: ' . implode("\n", $output));
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Rsync failed',
        'output' => $output
    ]);
}
