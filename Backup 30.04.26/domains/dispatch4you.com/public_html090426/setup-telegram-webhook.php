<?php
/**
 * Автоматическая настройка Telegram Webhook
 * Запустите этот файл один раз: https://dispatch4you.com/setup-telegram-webhook.php
 */

define('BOT_TOKEN', '8798212626:AAFiycQvEpqxrB3QsEGP56cT2QlIXkzWnb0');
define('WEBHOOK_URL', 'https://dispatch4you.com/telegram-bot-handler.php');

echo "<!DOCTYPE html>
<html lang='ru'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Настройка Telegram Webhook</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #1e293b;
            margin-bottom: 20px;
            font-size: 28px;
        }
        .status {
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            font-size: 16px;
            line-height: 1.6;
        }
        .success {
            background: #d1fae5;
            color: #065f46;
            border: 2px solid #10b981;
        }
        .error {
            background: #fee2e2;
            color: #991b1b;
            border: 2px solid #ef4444;
        }
        .info {
            background: #dbeafe;
            color: #1e40af;
            border: 2px solid #3b82f6;
        }
        .code {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.3s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        li {
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🤖 Настройка Telegram Webhook</h1>";

// Установка webhook
$setWebhookUrl = "https://api.telegram.org/bot" . BOT_TOKEN . "/setWebhook?url=" . urlencode(WEBHOOK_URL);
$response = @file_get_contents($setWebhookUrl);
$result = json_decode($response, true);

if ($result && $result['ok']) {
    echo "<div class='status success'>
        <strong>✅ Webhook успешно установлен!</strong><br><br>
        Бот теперь будет автоматически отвечать на сообщения.
    </div>";
    
    echo "<div class='status info'>
        <strong>📋 Информация о webhook:</strong><br>
        <div class='code'>URL: " . WEBHOOK_URL . "</div>
    </div>";
} else {
    echo "<div class='status error'>
        <strong>❌ Ошибка установки webhook</strong><br><br>
        " . ($result['description'] ?? 'Неизвестная ошибка') . "
    </div>";
}

// Проверка webhook
$getWebhookUrl = "https://api.telegram.org/bot" . BOT_TOKEN . "/getWebhookInfo";
$webhookInfo = @file_get_contents($getWebhookUrl);
$webhookData = json_decode($webhookInfo, true);

if ($webhookData && $webhookData['ok']) {
    $info = $webhookData['result'];
    
    echo "<div class='status info'>
        <strong>🔍 Статус webhook:</strong><br><br>
        <ul>
            <li><strong>URL:</strong> " . ($info['url'] ?: 'Не установлен') . "</li>
            <li><strong>Ожидающих обновлений:</strong> " . ($info['pending_update_count'] ?? 0) . "</li>
            <li><strong>Последняя ошибка:</strong> " . ($info['last_error_message'] ?? 'Нет ошибок') . "</li>
        </ul>
    </div>";
}

echo "<div class='status success'>
    <strong>🎯 Следующие шаги:</strong><br><br>
    <ol>
        <li>Напишите боту @dispatch4you_bot любое сообщение</li>
        <li>Бот автоматически ответит</li>
        <li>Для получения уведомлений настройте Chat ID в telegram-bot-handler.php</li>
    </ol>
</div>";

echo "<div class='status info'>
    <strong>💡 Как получить Chat ID:</strong><br><br>
    <ol>
        <li>Напишите боту <strong>@userinfobot</strong> в Telegram</li>
        <li>Он пришлет ваш Chat ID (например: 123456789)</li>
        <li>Откройте файл <code>telegram-bot-handler.php</code></li>
        <li>Замените <code>'YOUR_ADMIN_CHAT_ID'</code> на ваш ID</li>
        <li>Раскомментируйте строку с <code>sendMessage</code></li>
    </ol>
</div>";

echo "
        <a href='https://t.me/dispatch4you_bot' class='btn' target='_blank'>
            🚀 Открыть бота
        </a>
        
        <a href='https://dispatch4you.com' class='btn'>
            🏠 На главную
        </a>
    </div>
</body>
</html>";

// Удаляем этот файл после выполнения (опционально)
// @unlink(__FILE__);
?>
