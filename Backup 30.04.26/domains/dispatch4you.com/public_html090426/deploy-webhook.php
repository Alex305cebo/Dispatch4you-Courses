<?php
/**
 * Git Deploy Webhook for Hostinger (SAFE METHOD)
 * 
 * Git repository in separate folder ~/git-repo
 * Files are copied to ~/public_html
 * 
 * Setup:
 * 1. SSH to Hostinger: mkdir ~/git-repo && cd ~/git-repo
 * 2. Clone: git clone https://github.com/Alex305cebo/dispatch4you-site.git .
 * 3. Edit this file (secret + username)
 * 4. Copy to public_html: cp ~/git-repo/deploy-webhook.php ~/public_html/
 * 5. GitHub -> Settings -> Webhooks -> Add webhook
 * 6. URL: https://dispatch4you.com/deploy-webhook.php
 */

// SECRET KEY (CHANGE THIS!)
// Create a strong password, example: my_secret_key_abc123xyz
define('WEBHOOK_SECRET', 'CHANGE_THIS_SECRET_KEY_NOW');

// PATHS (CHANGE u123456789 to your username!)
define('GIT_REPO_PATH', '/home/u123456789/git-repo');
define('PUBLIC_HTML_PATH', '/home/u123456789/public_html');

// Log file
define('LOG_FILE', PUBLIC_HTML_PATH . '/deploy.log');

// Logging function
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents(LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

// Verify GitHub signature
function verifySignature($payload, $signature) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, WEBHOOK_SECRET);
    return hash_equals($hash, $signature);
}

// Get data from GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify signature
if (!verifySignature($payload, $signature)) {
    logMessage('[ERROR] Invalid signature');
    http_response_code(403);
    die('Invalid signature');
}

// Parse payload
$data = json_decode($payload, true);

// Check if this is a push to main
if ($data['ref'] !== 'refs/heads/main') {
    logMessage('[INFO] Not a main branch push, skipping');
    http_response_code(200);
    die('Not main branch');
}

logMessage('[START] Deploy started by ' . $data['pusher']['name']);

// Go to Git repository
chdir(GIT_REPO_PATH);

$output = [];
$return_var = 0;

// Git pull in separate folder
exec('git pull origin main 2>&1', $output, $return_var);

if ($return_var !== 0) {
    logMessage('[ERROR] Git pull failed: ' . implode("\n", $output));
    http_response_code(500);
    die('Git pull failed');
}

logMessage('[SUCCESS] Git pull completed');

// Copy files to public_html (excluding unnecessary files)
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
    logMessage('[SUCCESS] Files synced to public_html');
    logMessage('[COMPLETE] Deploy finished successfully');
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deploy completed',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    logMessage('[ERROR] Rsync failed: ' . implode("\n", $output));
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Rsync failed',
        'output' => $output
    ]);
}
