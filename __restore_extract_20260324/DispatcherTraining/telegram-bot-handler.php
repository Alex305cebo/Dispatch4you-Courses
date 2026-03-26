<?php
/**
 * Telegram Bot Webhook Handler
 * Обработка входящих сообщений от пользователей
 */

// Конфигурация
define('BOT_TOKEN', '8798212626:AAFiycQvEpqxrB3QsEGP56cT2QlIXkzWnb0');
define('API_URL', 'https://api.telegram.org/bot' . BOT_TOKEN . '/');

// Получение данных от Telegram
$content = file_get_contents('php://input');
$update = json_decode($content, true);

if (!$update) {
    exit;
}

// Логирование (опционально)
file_put_contents('telegram_log.txt', date('Y-m-d H:i:s') . ' - ' . $content . "\n", FILE_APPEND);

// Обработка сообщения
if (isset($update['message'])) {
    $message = $update['message'];
    $chat_id = $message['chat']['id'];
    $text = $message['text'] ?? '';
    $user_name = $message['from']['first_name'] ?? 'Пользователь';

    // Команда /start
    if ($text === '/start') {
        $welcome_message = "👋 Привет, {$user_name}!\n\n";
        $welcome_message .= "Добро пожаловать в поддержку Dispatch4You!\n\n";
        $welcome_message .= "🎓 Мы - платформа обучения диспетчеров грузоперевозок в США\n\n";
        $welcome_message .= "Чем могу помочь?\n";
        $welcome_message .= "• Информация о курсах\n";
        $welcome_message .= "• Регистрация на платформе\n";
        $welcome_message .= "• Техническая поддержка\n";
        $welcome_message .= "• Вопросы по обучению\n\n";
        $welcome_message .= "Просто напишите ваш вопрос, и я свяжу вас с нашей командой! 💬";

        sendMessage($chat_id, $welcome_message);
        
        // Отправка кнопок
        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '🌐 Перейти на сайт', 'url' => 'https://dispatch4you.com'],
                    ['text' => '📧 Email', 'url' => 'mailto:Info@dispatch4you.com']
                ],
                [
                    ['text' => '📚 Курсы', 'callback_data' => 'courses'],
                    ['text' => '💰 Цены', 'callback_data' => 'pricing']
                ]
            ]
        ];
        
        sendMessage($chat_id, "Выберите действие:", $keyboard);
    }
    // Обычное сообщение
    else {
        $response = "✅ Спасибо за ваше сообщение!\n\n";
        $response .= "Наша команда получила ваш запрос:\n";
        $response .= "\"" . mb_substr($text, 0, 100) . "\"\n\n";
        $response .= "Мы ответим вам в ближайшее время! ⏱\n\n";
        $response .= "Обычно отвечаем в течение 1-2 часов.";

        sendMessage($chat_id, $response);

        // Уведомление администратору (замените на ваш chat_id)
        $admin_chat_id = 'YOUR_ADMIN_CHAT_ID'; // Получите свой chat_id через @userinfobot
        $admin_message = "📩 Новое сообщение от пользователя!\n\n";
        $admin_message .= "👤 Имя: {$user_name}\n";
        $admin_message .= "🆔 Chat ID: {$chat_id}\n";
        $admin_message .= "💬 Сообщение: {$text}\n\n";
        $admin_message .= "Ответьте пользователю через бота!";

        // sendMessage($admin_chat_id, $admin_message);
    }
}

// Обработка callback кнопок
if (isset($update['callback_query'])) {
    $callback = $update['callback_query'];
    $chat_id = $callback['message']['chat']['id'];
    $data = $callback['data'];

    switch ($data) {
        case 'courses':
            $message = "📚 Наши курсы:\n\n";
            $message .= "✅ 12 модулей обучения\n";
            $message .= "✅ Интерактивные квизы\n";
            $message .= "✅ Симулятор звонков\n";
            $message .= "✅ Сертификат по окончании\n\n";
            $message .= "Подробнее: https://dispatch4you.com/courses.html";
            sendMessage($chat_id, $message);
            break;

        case 'pricing':
            $message = "💰 Стоимость обучения:\n\n";
            $message .= "Свяжитесь с нами для уточнения цен:\n";
            $message .= "📧 Info@dispatch4you.com\n\n";
            $message .= "Мы предлагаем гибкие планы оплаты!";
            sendMessage($chat_id, $message);
            break;
    }

    // Подтверждение нажатия кнопки
    answerCallbackQuery($callback['id']);
}

// Функция отправки сообщения
function sendMessage($chat_id, $text, $keyboard = null) {
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => 'HTML'
    ];

    if ($keyboard) {
        $data['reply_markup'] = json_encode($keyboard);
    }

    file_get_contents(API_URL . 'sendMessage?' . http_build_query($data));
}

// Функция ответа на callback
function answerCallbackQuery($callback_id) {
    file_get_contents(API_URL . 'answerCallbackQuery?callback_query_id=' . $callback_id);
}

http_response_code(200);
?>
