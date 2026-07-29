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

// Тексты держим здесь, а не размазываем по коду: их правят чаще всего.
const HELP_START =
  "👋 Я разбираю Rate Confirmation.\n\n"
. "Пришлите PDF рейт-кона — верну готовую карточку для водителя: адреса погрузки и выгрузки, "
. "окна времени, все реф-номера, ставку, груз и вес. Карточку можно сразу скопировать и переслать водителю.\n\n"
. "Как отправить:\n"
. "1. Скрепка 📎 → Файл → выберите PDF\n"
. "2. Подождите 5–15 секунд\n"
. "3. Скопируйте карточку и отправьте водителю\n\n"
. "Нужен PDF с текстом (как присылает брокер), не фото и не скан. До 15 МБ.\n\n"
. "/help — подробнее и что делать при ошибке\n\n"
. "— — —\n"
. "Send a Rate Confirmation PDF and get a ready-to-forward driver info card. /help for details.";

const HELP_FULL =
  "📄 Что бот достаёт из рейт-кона:\n"
. "• номер загрузки (Load ID / PRO#)\n"
. "• адрес погрузки и адрес доставки полностью\n"
. "• дату и окно времени по каждому стопу\n"
. "• все реф-номера (PU, PO, BOL, Ref#)\n"
. "• ставку, груз, вес\n\n"
. "Несколько пикапов или доставок — каждый стоп отдельным блоком, по порядку.\n\n"
. "⚠️ Требования к файлу:\n"
. "• PDF с текстовым слоем — тот, что брокер прислал на почту\n"
. "• не фото документа и не скан (там нет текста, бот его не прочитает)\n"
. "• размер до 15 МБ\n\n"
. "❓ Если бот не смог разобрать:\n"
. "1. Проверьте, что это PDF, а не фото\n"
. "2. Попробуйте переслать оригинал письма от брокера\n"
. "3. Напишите нам — разберёмся: dispatch4you.com\n\n"
. "🔒 Сам файл на сервере не хранится — только извлечённые данные загрузки.\n\n"
. "— — —\n"
. "Requirements: text-based PDF (not a photo or scan), up to 15 MB. "
. "The file itself is not stored, only the extracted load data.";

const HELP_SCAN =
  "📷 В этом PDF нет текста — похоже, это скан или фото, вставленное в PDF.\n\n"
. "Что делать: попросите брокера прислать оригинальный PDF (тот, что формирует их система) "
. "или перешлите письмо с рейт-коном как есть — в нём файл обычно текстовый.\n\n"
. "— — —\n"
. "No text layer found — this looks like a scan. Please send the original text-based PDF.";

const HELP_PHOTO =
  "📷 Это фото, а из фото я текст не читаю.\n\n"
. "Пришлите PDF-файл: скрепка 📎 → Файл. Если рейт-кон пришёл на почту — перешлите вложение как есть.\n\n"
. "— — —\n"
. "Photos are not supported — please send the PDF file itself (📎 → File).";

$token = @trim(file_get_contents(__DIR__ . '/../../tg-bot.key'));
if ($token === '' || $token === false) { http_response_code(500); echo 'tg-bot.key missing'; exit; }
$secret = hash('sha256', $token);

// ── Setup: webhook + описание бота + меню команд ────────────────────
if (isset($_GET['setup'])) {
  $out = array();
  $out['webhook'] = json_decode(tgApi($token, 'setWebhook', array(
    'url' => SELF_URL,
    'secret_token' => $secret,
    'allowed_updates' => json_encode(array('message')),
    'drop_pending_updates' => true,
  )), true);
  // Короткое описание — в профиле бота; полное — на пустом экране чата
  // (именно его человек читает до того, как нажать «Начать»).
  $out['short_description'] = json_decode(tgApi($token, 'setMyShortDescription', array(
    'short_description' => 'Rate Confirmation PDF → готовая карточка для водителя.',
  )), true);
  $out['description'] = json_decode(tgApi($token, 'setMyDescription', array(
    'description' => "Пришлите PDF рейт-кона — верну карточку для водителя: адреса, окна времени, реф-номера, ставку, вес.\n\n"
      . "Send a Rate Confirmation PDF — get a driver info card: addresses, time windows, reference numbers, rate, weight.",
  )), true);
  $out['commands'] = json_decode(tgApi($token, 'setMyCommands', array(
    'commands' => json_encode(array(
      array('command' => 'start', 'description' => 'Что умеет бот / What this bot does'),
      array('command' => 'help',  'description' => 'Инструкция и требования / Help'),
    )),
  )), true);
  header('Content-Type: application/json');
  echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
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

// Фото/скриншот рейт-кона — частый случай, отвечаем осмысленно
if (isset($msg['photo'])) {
  reply($token, $chatId, HELP_PHOTO); echo 'ok'; exit;
}

// /help, /start и любой текст без файла
if (!isset($msg['document'])) {
  $text = isset($msg['text']) ? trim($msg['text']) : '';
  reply($token, $chatId, stripos($text, '/help') === 0 ? HELP_FULL : HELP_START);
  echo 'ok'; exit;
}

// ── Валидация документа ─────────────────────────────────────────────
$doc = $msg['document'];
$isPdf = (isset($doc['mime_type']) && $doc['mime_type'] === 'application/pdf')
      || (isset($doc['file_name']) && preg_match('/\.pdf$/i', $doc['file_name']));
if (!$isPdf) {
  reply($token, $chatId,
    "Это не PDF, а «" . (isset($doc['file_name']) ? $doc['file_name'] : 'файл') . "».\n"
    . "Пришлите рейт-кон в формате PDF — брокеры присылают его именно так.\n\n"
    . "Not a PDF. Please send the Rate Confirmation as a PDF file.");
  echo 'ok'; exit;
}
if (isset($doc['file_size']) && $doc['file_size'] > MAX_PDF_BYTES) {
  reply($token, $chatId,
    "Файл слишком большой: " . round($doc['file_size'] / 1048576, 1) . " МБ при лимите 15 МБ.\n"
    . "Обычно так бывает у сканов — попросите брокера прислать текстовый PDF.\n\n"
    . "File too large (15 MB limit).");
  echo 'ok'; exit;
}

// Разбор занимает 5–15 секунд — без этого сообщения кажется, что бот завис
$progressId = null;
$sent = json_decode(reply($token, $chatId, '⏳ Разбираю документ… / Parsing…'), true);
if (!empty($sent['result']['message_id'])) $progressId = $sent['result']['message_id'];

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
  clearProgress($token, $chatId);
  reply($token, $chatId, HELP_SCAN);
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
// Карточка уходит отдельным сообщением, без единого лишнего символа —
// её копируют целиком и пересылают водителю.
clearProgress($token, $chatId);
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
  return tgApi($token, 'sendMessage', array(
    'chat_id' => $chatId, 'text' => $text, 'disable_web_page_preview' => true));
}

// Убирает «⏳ Разбираю документ…», чтобы в чате не оставалось мусора.
function clearProgress($token, $chatId) {
  if (empty($GLOBALS['progressId'])) return;
  tgApi($token, 'deleteMessage', array('chat_id' => $chatId, 'message_id' => $GLOBALS['progressId']));
  $GLOBALS['progressId'] = null;
}

function fail($token, $chatId, $logMsg) {
  @file_put_contents(__DIR__ . '/../../tg-bot.log',
    date('c') . ' ' . $logMsg . "\n", FILE_APPEND);
  clearProgress($token, $chatId);
  reply($token, $chatId,
    "😕 Не получилось разобрать этот документ.\n\n"
  . "Чаще всего причина одна из трёх:\n"
  . "• это скан или фото, а не текстовый PDF\n"
  . "• файл защищён паролем\n"
  . "• документ нестандартного вида\n\n"
  . "Попробуйте прислать оригинальный PDF от брокера. /help — подробности.\n\n"
  . "— — —\n"
  . "Couldn't parse this document. Please send the original text-based PDF from the broker.");
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
