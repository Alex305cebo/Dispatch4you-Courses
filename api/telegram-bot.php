<?php
// @Dispatch4You_Bot webhook — принимает Rate Confirmation PDF в Telegram,
// парсит через Groq и отвечает карточкой «драйвер-инфо».
//
// Секреты (оба лежат на уровень ВЫШЕ public_html, не в вебе, не в git):
//   ~/domains/dispatch4you.com/tg-bot.key   (одна строка: токен из BotFather)
//   ~/domains/dispatch4you.com/groq.key     (уже существует — общий с api/groq.php)
//
// Первичная настройка (один раз, после появления tg-bot.key на сервере):
//   открыть в браузере https://dispatch4you.com/api/telegram-bot.php?setup=1
//   — скрипт сам вызовет setWebhook с секретом, выведет ответ Telegram.
//
// Подлинность запросов Telegram проверяется заголовком
// X-Telegram-Bot-Api-Secret-Token = sha256(токен) — задаётся в setup.
// ponytail: сканы без текстового слоя не поддерживаем (нужен OCR/vision) —
// бот честно просит текстовый PDF. Апгрейд: Groq vision по страницам-картинкам.

const SELF_URL = 'https://dispatch4you.com/api/telegram-bot.php';
const MAX_PDF_BYTES = 15728640; // 15 MB (лимит Telegram getFile — 20 MB)
const GROQ_MODEL = 'llama-3.3-70b-versatile';

$token = @trim(file_get_contents(__DIR__ . '/../../tg-bot.key'));
if ($token === '' || $token === false) { http_response_code(500); echo 'tg-bot.key missing'; exit; }
$secret = hash('sha256', $token);

// ── Setup: регистрация webhook ──────────────────────────────────────
if (isset($_GET['setup'])) {
  $resp = tgApi($token, 'setWebhook', array(
    'url' => SELF_URL,
    'secret_token' => $secret,
    'allowed_updates' => json_encode(array('message')),
    'drop_pending_updates' => true,
  ));
  header('Content-Type: application/json');
  echo $resp;
  exit;
}

// ── Webhook: только POST от Telegram с верным секретом ──────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo 'POST only'; exit; }
$hdr = isset($_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN']) ? $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] : '';
if (!hash_equals($secret, $hdr)) { http_response_code(403); echo 'forbidden'; exit; }

$update = json_decode(file_get_contents('php://input'), true);
$msg = isset($update['message']) ? $update['message'] : null;
if (!$msg || !isset($msg['chat']['id'])) { echo 'ok'; exit; }
$chatId = $msg['chat']['id'];

// /start и любой текст без файла
if (!isset($msg['document'])) {
  reply($token, $chatId,
    "Пришлите Rate Confirmation в PDF — я извлеку из него информацию для водителя: адреса, время, реф-номера, ставку и вес.\n\n" .
    "Send me a Rate Confirmation PDF and I'll extract the driver info: addresses, times, ref numbers, rate and weight.");
  echo 'ok'; exit;
}

// ── Валидация документа ─────────────────────────────────────────────
$doc = $msg['document'];
$isPdf = (isset($doc['mime_type']) && $doc['mime_type'] === 'application/pdf')
      || (isset($doc['file_name']) && preg_match('/\.pdf$/i', $doc['file_name']));
if (!$isPdf) { reply($token, $chatId, 'Это не PDF. Пришлите Rate Confirmation в формате PDF. / Please send a PDF file.'); echo 'ok'; exit; }
if (isset($doc['file_size']) && $doc['file_size'] > MAX_PDF_BYTES) {
  reply($token, $chatId, 'Файл слишком большой (лимит 15 MB). / File too large (15 MB limit).'); echo 'ok'; exit;
}

// ── Скачиваем PDF с серверов Telegram ───────────────────────────────
$info = json_decode(tgApi($token, 'getFile', array('file_id' => $doc['file_id'])), true);
if (empty($info['ok']) || empty($info['result']['file_path'])) {
  fail($token, $chatId, 'getFile failed: ' . json_encode($info)); exit;
}
$pdf = httpGet('https://api.telegram.org/file/bot' . $token . '/' . $info['result']['file_path']);
if ($pdf === false || $pdf === '') { fail($token, $chatId, 'file download failed'); exit; }

// ── Извлекаем текст (smalot/pdfparser, чистый PHP) ──────────────────
spl_autoload_register(function ($class) {
  $prefix = 'Smalot\\PdfParser\\';
  if (strncmp($class, $prefix, strlen($prefix)) === 0) {
    $file = __DIR__ . '/lib/PdfParser/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) require $file;
  }
});
try {
  $parser = new \Smalot\PdfParser\Parser();
  $text = $parser->parseContent($pdf)->getText();
} catch (\Throwable $e) {
  fail($token, $chatId, 'pdf parse: ' . $e->getMessage()); exit;
}
$text = trim(preg_replace('/[ \t]+/', ' ', $text));
if (mb_strlen($text) < 100) {
  reply($token, $chatId,
    "Не нашёл текст в PDF — похоже, это скан (картинка). Пришлите PDF с текстовым слоем.\n" .
    "No text layer found — this looks like a scanned image. Please send a text-based PDF.");
  echo 'ok'; exit;
}
if (mb_strlen($text) > 14000) $text = mb_substr($text, 0, 14000);

// ── Groq: текст → структурированный JSON ────────────────────────────
$groqKey = @trim(file_get_contents(__DIR__ . '/../../groq.key'));
if ($groqKey === '' || $groqKey === false) { fail($token, $chatId, 'groq.key missing'); exit; }

$sys = 'You extract structured data from freight Rate Confirmation documents. '
  . 'Return ONLY valid JSON with this exact schema: '
  . '{"load_id":"","broker":"","rate":"","commodity":"","weight":"","stops":['
  . '{"type":"pickup|delivery","name":"","address_lines":["street","city, ST zip"],'
  . '"time":"MM/DD/YY HH:MM - HH:MM","refs":["PU 123","PO 456"]}]}. '
  . 'Rules: stops in document order, pickups first if ambiguous. Include EVERY reference number '
  . '(PU, PO, BOL, Order#, Ref#) attached to each stop. rate like "$1,956.34". weight like "11748.00 lbs". '
  . 'time: keep the appointment date and window as written, prefer MM/DD/YY HH:MM - HH:MM. '
  . 'Unknown fields: empty string or empty array. No commentary, JSON only.';

$body = json_encode(array(
  'model' => GROQ_MODEL,
  'temperature' => 0,
  // Без явного лимита Groq обрывает ответ на полуслове и JSON не валидируется
  // ("max completion tokens reached before generating a valid document").
  'max_tokens' => 4096,
  'response_format' => array('type' => 'json_object'),
  'messages' => array(
    array('role' => 'system', 'content' => $sys),
    array('role' => 'user', 'content' => $text),
  ),
));
$resp = json_decode(httpPost('https://api.groq.com/openai/v1/chat/completions', $body, array(
  'Authorization: Bearer ' . $groqKey, 'Content-Type: application/json')), true);
$raw = isset($resp['choices'][0]['message']['content']) ? $resp['choices'][0]['message']['content'] : '';
$load = json_decode($raw, true);
if (!is_array($load) || empty($load['stops'])) {
  fail($token, $chatId, 'groq bad answer: ' . mb_substr($raw !== '' ? $raw : json_encode($resp), 0, 500)); exit;
}

// ── Сохраняем разбор для будущей веб-страницы полного разбора ───────
$id = bin2hex(random_bytes(8));
$dir = __DIR__ . '/../../tg-loads';
if (!is_dir($dir)) @mkdir($dir, 0755, true);
@file_put_contents($dir . '/' . $id . '.json', json_encode(array(
  'parsed' => $load, 'chat_id' => $chatId, 'file_name' => isset($doc['file_name']) ? $doc['file_name'] : '',
), JSON_UNESCAPED_UNICODE));

// ── Карточка «драйвер-инфо» ─────────────────────────────────────────
reply($token, $chatId, driverCard($load));
echo 'ok';
exit;

// ────────────────────────────────────────────────────────────────────
function driverCard(array $d) {
  $hr = '__________________________';
  $L = array();
  if (!empty($d['load_id'])) { $L[] = '* LOAD ID: #' . ltrim($d['load_id'], '#'); $L[] = ''; }

  $counts = array('pickup' => 0, 'delivery' => 0);
  foreach ($d['stops'] as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $counts[$type]++;
  }
  $seen = array('pickup' => 0, 'delivery' => 0);
  foreach ($d['stops'] as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $seen[$type]++;
    $label = ($type === 'delivery') ? 'Delivery Address' : 'Pick up Address';
    if ($counts[$type] > 1) $label .= ' ' . $seen[$type];
    $L[] = $label . ':';
    $L[] = '';
    if (!empty($s['name'])) $L[] = $s['name'];
    foreach ((array)(isset($s['address_lines']) ? $s['address_lines'] : array()) as $a) if ($a !== '') $L[] = $a;
    $L[] = '';
    if (!empty($s['time'])) { $L[] = $hr; $L[] = 'Time: ' . $s['time']; }
    $refs = array_filter((array)(isset($s['refs']) ? $s['refs'] : array()));
    if ($refs) {
      $L[] = $hr;
      $first = true;
      foreach ($refs as $r) { $L[] = ($first ? 'Ref: ' : '') . $r; $first = false; }
    }
    $L[] = $hr;
    $L[] = '';
  }
  if (!empty($d['rate']))      $L[] = 'Rate: ' . $d['rate'];
  if (!empty($d['commodity'])) $L[] = 'Commodity: ' . $d['commodity'];
  if (!empty($d['weight']))    $L[] = 'Weight: ' . $d['weight'];
  $card = implode("\n", $L);
  return mb_strlen($card) > 4000 ? mb_substr($card, 0, 4000) : $card;
}

function tgApi($token, $method, array $params) {
  return httpPost('https://api.telegram.org/bot' . $token . '/' . $method,
    http_build_query($params), array('Content-Type: application/x-www-form-urlencoded'));
}

function reply($token, $chatId, $text) {
  tgApi($token, 'sendMessage', array('chat_id' => $chatId, 'text' => $text));
}

function fail($token, $chatId, $logMsg) {
  @file_put_contents(__DIR__ . '/../../tg-bot.log',
    date('c') . ' ' . $logMsg . "\n", FILE_APPEND);
  reply($token, $chatId,
    "Не получилось разобрать этот документ. Попробуйте другой PDF или позже.\n" .
    "Couldn't parse this document. Try another PDF or try again later.");
  echo 'ok';
}

function httpGet($url) {
  $ch = curl_init($url);
  curl_setopt_array($ch, array(CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60, CURLOPT_FOLLOWLOCATION => true));
  $r = curl_exec($ch); curl_close($ch);
  return $r;
}

function httpPost($url, $body, array $headers) {
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60,
    CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers,
  ));
  $r = curl_exec($ch); curl_close($ch);
  return $r === false ? '' : $r;
}
