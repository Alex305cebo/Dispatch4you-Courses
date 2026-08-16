<?php
// Сторож вебхука. Запускается по расписанию (cron) и проверяет, что Telegram
// шлёт сообщения именно нам. Если адрес подменили — возвращает наш и присылает
// тревогу в Telegram. Поводом послужил реальный захват 29.07.2026: вебхук был
// переписан на чужой сервер, и заметили это только вручную.
//
// Cron (hPanel → Advanced → Cron Jobs), раз в 10 минут:
//   /usr/bin/php ~/domains/dispatch4you.com/public_html/api/tg-guard.php
//
// Кому слать тревогу: числовой chat id в файле tg-admin.txt рядом с ключами
// (не секрет, но и не в вебе). Свой id можно узнать командой /id у бота.
//
// ponytail: сторож только восстанавливает и сообщает. Если чужой сервер начнёт
// переставлять вебхук в цикле — увидим это по потоку тревог, и тогда лечение
// одно: отзыв токена. Автоматически отзывать нельзя, это делается только руками.

if (PHP_SAPI !== 'cli') { http_response_code(403); exit("cli only\n"); }

const EXPECTED_URL = 'https://dispatch4you.com/api/telegram-bot.php';

$base = __DIR__ . '/../../';
$token = @trim(file_get_contents($base . 'tg-bot.key'));
if ($token === '' || $token === false) { guardLog('tg-bot.key missing'); exit(1); }

// Сначала — жив ли сам обработчик. 05.08.2026 он молча умер: хостинг обновил
// PHP до 8.3, а opcache остался с байткодом от 8.2, и бот отдавал 200 с нулём
// байт на ЛЮБОЙ запрос. Вебхук при этом был идеален, очередь пустая, Telegram
// доволен — сторож рапортовал «всё в порядке», пока владелец не заметил сам.
// ?diag печатает текст всегда, так что пустой ответ = обработчик не запускается.
// Ключ к служебным ссылкам. Формула ОБЯЗАНА совпадать с diagKey() в
// telegram-bot.php — включить тот файл нельзя, он тут же начнёт отрабатывать
// вебхук. Разойдутся — сторож получит 403, решит, что бот умер, и начнёт слать
// ложные тревоги.
$dk = substr(hash('sha256', 'diag' . $token), 0, 24);

$body = @file_get_contents(EXPECTED_URL . '?diag&k=' . $dk, false, stream_context_create(
  array('http' => array('timeout' => 20, 'ignore_errors' => true))
));
$body = trim((string)$body);
// Пусто = обработчик не запускается вовсе. «forbidden» = запустился, но не
// признал наш ключ: значит формула выше разошлась с diagKey() в боте. Это
// разные поломки, и лечатся они по-разному — не смешивать.
if ($body === '' || stripos($body, 'forbidden') !== false) {
  $msg = $body === ''
    ? "🚨 Сторож бота\n\nОбработчик не отвечает: " . EXPECTED_URL . "?diag вернул пусто.\n\n"
      . "Обычно это opcache с устаревшим байткодом (бывает после смены версии PHP). "
      . "Лечение: любое изменение содержимого api/telegram-bot.php и деплой — "
      . "проще всего поменять строку BUILD в начале файла."
    : "🚨 Сторож бота\n\nОбработчик жив, но не принял ключ диагностики (403).\n\n"
      . "Формула ключа в tg-guard.php разошлась с diagKey() в telegram-bot.php — "
      . "либо один файл задеплоен, а второй нет. Сам бот при этом работает: "
      . "сообщения и кнопки идут как обычно, не отвечает только диагностика.";
  guardLog(str_replace("\n", ' | ', $msg));
  $admin = @trim(file_get_contents($base . 'tg-admin.txt'));
  if ($admin !== '' && $admin !== false) tg($token, 'sendMessage', array('chat_id' => $admin, 'text' => $msg));
  exit(1);
}

$info = json_decode(tg($token, 'getWebhookInfo', array()), true);
if (empty($info['ok'])) {
  // Токен отозван или Telegram недоступен — молча не оставляем
  guardLog('getWebhookInfo failed: ' . substr(json_encode($info), 0, 300));
  exit(1);
}
$r = $info['result'];
$url = isset($r['url']) ? $r['url'] : '';

$problems = array();
if ($url !== EXPECTED_URL) $problems[] = "вебхук подменён на: " . ($url === '' ? '(пусто)' : $url);
if (!empty($r['last_error_message'])) $problems[] = 'ошибка доставки: ' . $r['last_error_message'];
if (!empty($r['pending_update_count']) && $r['pending_update_count'] > 20) {
  $problems[] = 'очередь необработанных: ' . $r['pending_update_count'];
}
if (!$problems) exit(0); // всё в порядке — молчим, чтобы лог не пух

// Возвращаем свой вебхук
$restored = false;
if ($url !== EXPECTED_URL) {
  $set = json_decode(tg($token, 'setWebhook', array(
    'url' => EXPECTED_URL,
    'secret_token' => hash('sha256', $token),
    // 'callback_query' здесь ОБЯЗАТЕЛЕН и должен совпадать с ?setup=1. Без него
    // после восстановления вебхука у бота молча умирают ВСЕ кнопки под
    // сообщениями: текст водителю, письмо брокеру, перевод, проверка брокера.
    // Заметить это трудно — обычные сообщения продолжают ходить как ни в чём
    // не бывало, а сторож рапортует «вебхук восстановлен».
    'allowed_updates' => json_encode(array('message', 'callback_query')),
  )), true);
  $restored = !empty($set['ok']);
  $problems[] = $restored ? 'наш вебхук восстановлен' : 'ВОССТАНОВИТЬ НЕ УДАЛОСЬ: ' . substr(json_encode($set), 0, 200);
}

$msg = "🚨 Сторож бота\n\n" . implode("\n", $problems);
if ($restored) {
  $msg .= "\n\nЕсли это повторится — токен скомпрометирован. Отзовите его: "
        . "@BotFather → /mybots → API Token → Revoke current token, "
        . "затем впишите новый в tg-bot.key. Вебхук я верну сам на следующем "
        . "запуске, руками ?setup=1 открывать не нужно.";
}
guardLog(str_replace("\n", ' | ', $msg));

$admin = @trim(file_get_contents($base . 'tg-admin.txt'));
if ($admin !== '' && $admin !== false) {
  tg($token, 'sendMessage', array('chat_id' => $admin, 'text' => $msg));
}

function tg($token, $method, array $params) {
  $ch = curl_init('https://api.telegram.org/bot' . $token . '/' . $method);
  curl_setopt_array($ch, array(
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30,
    CURLOPT_POSTFIELDS => http_build_query($params),
  ));
  $r = curl_exec($ch); curl_close($ch);
  return $r === false ? '' : $r;
}

function guardLog($line) {
  @file_put_contents(__DIR__ . '/../../tg-guard.log', date('c') . ' ' . $line . "\n", FILE_APPEND);
}
