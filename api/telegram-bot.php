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
// Куда ведёт кнопка «Открыть в приложении». Разбор передаётся в ХЕШЕ ссылки, а хеш
// по стандарту не отправляется на сервер — ставка брокера остаётся в браузере
// диспетчера и в наши логи не попадает. Контракт параметров — lib/qr-load.ts в
// репозитории приложения (Alex305cebo/dispatch-app), страница-приёмник /load.
const APP_DEMO_URL = 'https://dispatch4you.pro/demo?next=/load/card';
const MAX_PDF_BYTES = 15728640; // 15 MB (лимит Telegram getFile — 20 MB)
// llama-3.3-70b на реальных рейт-конах выдумывала адреса и уходила в цикл
// (13/14 против 0/14 на проверочном документе) — не возвращать.
const GROQ_MODEL = 'openai/gpt-oss-120b';

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
. "📷 Ещё пришлите скриншот груза с лоуборда (DAT, Truckstop) — разберу его, "
. "посчитаю ставку за милю и подготовлю письмо брокеру, которое можно поправить и отправить.\n\n"
. "🔎 Проверка брокера по FMCSA:\n"
. "/mc 115789 · /dot 2100420\n\n"
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
. "📷 Скриншот груза с лоуборда:\n"
. "Пришлите картинку карточки груза (DAT, Truckstop) или письма брокера — верну:\n"
. "• карточку груза: маршрут, даты, трейлер, вес, контакты\n"
. "• аналитику: ставка за милю, сравнение с ориентиром, топливо, на что смотреть\n"
. "• черновик письма брокеру\n\n"
. "Работа с письмом:\n"
. "/carrier — задать подпись (компания, MC, телефон, ваш email)\n"
. "/edit — прислать исправленный текст письма\n"
. "/send — подготовить письмо к отправке (бот сам НЕ отправляет)\n\n"
. "🔎 Проверка брокера по FMCSA:\n"
. "/mc 115789 — по номеру MC\n"
. "/dot 2100420 — по номеру DOT\n"
. "/broker 115789 — если не знаете, какой это номер\n"
. "Покажу название, право работать, авторити, бонд BMC-84 и адрес.\n\n"
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

// ── Диагностика окружения (какие утилиты доступны для PDF) ──────────
if (isset($_GET['diag'])) {
  header('Content-Type: text/plain; charset=utf-8');
  $exec = function_exists('shell_exec') && !in_array('shell_exec', array_map('trim', explode(',', (string)ini_get('disable_functions'))), true);
  echo "shell_exec: " . ($exec ? 'yes' : 'NO') . "\n";
  if ($exec) {
    foreach (array('pdftotext', 'qpdf', 'gs', 'mutool', 'python3') as $bin) {
      $p = trim((string)@shell_exec('command -v ' . $bin . ' 2>/dev/null'));
      echo str_pad($bin, 10) . ': ' . ($p !== '' ? $p : '—') . "\n";
    }
  }
  echo "openssl ext: " . (extension_loaded('openssl') ? 'yes' : 'NO') . "\n";
  echo "mbstring ext: " . (extension_loaded('mbstring') ? 'yes' : 'NO') . "\n";
  exit;
}

// ── Живой ли ключ Gemini (разбор скриншотов). Ключ наружу не отдаём ──
if (isset($_GET['geminicheck'])) {
  header('Content-Type: text/plain; charset=utf-8');
  require_once __DIR__ . '/lib/load-photo.php';
  // Путь печатаем: перепутанный уровень вложенности уже подводил
  $kp = realpath(__DIR__ . '/../..') . '/gemini.key';
  if (geminiKey() === null) { echo "gemini.key: не найден или пуст\nискали тут: $kp\n"; exit; }
  // 1x1 白 PNG — минимальная картинка, чтобы проверить именно vision-путь
  $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  list($data, $err) = photoExtractLoad($png, 'image/png');
  echo "gemini.key: есть\n";
  echo "модель: " . GEMINI_MODEL . "\n";
  // Пустая картинка — не груз, значит 'notload' и есть признак рабочего ключа
  echo "ответ: " . ($err === '' || $err === 'notload' ? 'РАБОТАЕТ' : $err) . "\n";
  exit;
}

// ── Что Telegram думает о нашем вебхуке (ошибки доставки, очередь) ──
if (isset($_GET['webhookinfo'])) {
  header('Content-Type: application/json');
  echo json_encode(json_decode(tgApi($token, 'getWebhookInfo', array()), true),
    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
  exit;
}

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
      array('command' => 'start',   'description' => 'Что умеет бот / What this bot does'),
      array('command' => 'help',    'description' => 'Инструкция и требования / Help'),
      array('command' => 'carrier', 'description' => 'Подпись перевозчика для писем брокерам'),
      array('command' => 'edit',    'description' => 'Поправить черновик письма'),
      array('command' => 'send',    'description' => 'Подготовить письмо к отправке'),
      array('command' => 'mc',      'description' => 'Проверить брокера по MC'),
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

// Фото/скриншот груза с лоуборда: карточка + аналитика + черновик письма
if (isset($msg['photo']) || (isset($msg['document']['mime_type']) && strpos($msg['document']['mime_type'], 'image/') === 0)) {
  if (isset($msg['photo'])) {
    // Telegram присылает лесенку размеров, последний — самый крупный
    $ph = end($msg['photo']);
    $fileId = $ph['file_id'];
    $mime = 'image/jpeg';
  } else {
    $fileId = $msg['document']['file_id'];
    $mime = $msg['document']['mime_type'];
  }
  handlePhotoLoad($token, $chatId, $fileId, $mime);
  exit;
}

// /help, /id, /start и любой текст без файла
if (!isset($msg['document'])) {
  $text = isset($msg['text']) ? trim($msg['text']) : '';
  if (stripos($text, '/id') === 0) {
    // нужен, чтобы прописать получателя тревог сторожа в tg-admin.txt
    reply($token, $chatId, "Ваш chat id: " . $chatId);
  } elseif (preg_match('~^/carrier\b\s*(.*)$~is', $text, $cm)) {
    handleCarrier($token, $chatId, trim($cm[1]));
  } elseif (preg_match('~^/edit\b\s*(.*)$~is', $text, $em)) {
    handleEdit($token, $chatId, trim($em[1]));
  } elseif (preg_match('~^/send\b\s*(.*)$~i', $text, $sm)) {
    handleSend($token, $chatId, trim($sm[1]));
  } elseif (preg_match('~^/(broker|mc|dot)\b\s*(.*)$~i', $text, $bm)) {
    $kind = strtolower($bm[1]);
    $numArg = preg_replace('/\D/', '', $bm[2]);
    if ($numArg === '') {
      reply($token, $chatId,
        "Проверка брокера по FMCSA.\n\n"
        . "Пришлите номер:\n"
        . "/mc 115789 — по MC\n"
        . "/dot 2100420 — по DOT\n"
        . "/broker 115789 — сначала MC, потом DOT");
    } else {
      reply($token, $chatId, brokerReport($kind, $numArg));
    }
  } else {
    reply($token, $chatId, stripos($text, '/help') === 0 ? HELP_FULL : HELP_START);
  }
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

// Telegram ждёт ответ несколько секунд, иначе считает вебхук зависшим и
// присылает тот же документ повторно — пользователь получал бы дубли карточек.
// Отвечаем «ок» немедленно, разбор продолжается уже без него.
finishRequest();

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
// Рейт-коны от Sertifi/DocuSign/TMS почти всегда «защищены от изменений»:
// пароля на открытие нет, но парсер такие файлы не берёт. Снимаем защиту.
require __DIR__ . '/lib/pdf-decrypt.php';
list($pdf, $encProblem) = pdf_decrypt($pdf);
if ($encProblem === 'aes') {
  clearProgress($token, $chatId);
  reply($token, $chatId,
    "🔒 Этот PDF зашифрован по алгоритму AES — такие я пока не читаю.\n\n"
    . "Обходной путь: откройте файл и «Печать → Сохранить как PDF», затем пришлите результат. "
    . "Мы работаем над поддержкой таких файлов.");
  echo 'ok'; exit;
}
if ($encProblem === 'password') {
  clearProgress($token, $chatId);
  reply($token, $chatId,
    "🔒 PDF защищён паролем на открытие — без пароля я его прочитать не могу.\n\n"
    . "Попросите у брокера версию без пароля или снимите защиту сами и пришлите заново.");
  echo 'ok'; exit;
}

try {
  $parser = new \Smalot\PdfParser\Parser();
  $text = $parser->parseContent($pdf)->getText();
} catch (\Throwable $e) {
  $why = stripos($e->getMessage(), 'secured') !== false
    ? 'PDF защищён нестандартным способом'
    : 'файл повреждён или это не PDF';
  fail($token, $chatId, 'pdf parse: ' . $e->getMessage(), $why); exit;
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

// Промпт проверен на живых рейт-конах: без запрета «придумывать» модель
// подставляет адрес офиса брокера и выдуманные реф-номера.
$sys = "You extract data from freight Rate Confirmation documents.\n"
. "The text is extracted from a PDF, so table columns may be interleaved and spacing is irregular. Read carefully.\n\n"
. "Return ONLY a JSON object:\n"
. "{\"load_id\":\"\",\"broker\":\"\",\"rate\":\"\",\"commodity\":\"\",\"weight\":\"\",\"miles\":\"\",\"equipment\":\"\",\"stops\":"
. "[{\"type\":\"pickup or delivery\",\"name\":\"\",\"address_lines\":[],\"time\":\"\",\"refs\":[]}]}\n\n"
. "CRITICAL RULES:\n"
. "- Copy every value VERBATIM from the document. NEVER invent, guess or fill in plausible data.\n"
. "- If a value is not in the document, use an empty string (or empty array). An empty field is CORRECT; an invented field is a serious error.\n"
. "- Strip label words glued to a value: 'Appointment', 'Time', 'Ref', 'Weight', '#'. Keep only the value.\n"
. "- load_id: the load/order/PRO number of this shipment.\n"
. "- broker: the company issuing the rate confirmation (not the carrier).\n"
. "- stops: pickups (PICK, PICKUP, SHIPPER) and deliveries (STOP, DROP, CONSIGNEE, DELIVERY), in document order.\n"
. "- name: facility name. address_lines: the street line(s) AND then the 'CITY ST ZIP' line.\n"
. "- address_lines MUST contain the CITY ST ZIP line whenever it appears in the document (e.g. 'EASTABOGA AL 36260'). "
. "An address without its city line is unusable for a driver — never omit it.\n"
. "- time: appointment date and window as printed, e.g. '02/02/26 @ 12:30' or '07/24/26 06:00 - 17:00'.\n"
. "- refs: EVERY reference number belonging to that stop. Format each as '<LABEL> <NUMBER>' using the label as printed "
. "(PU, PO, BOL, Order#). If the label is only 'Ref' or 'Ref #', output the number alone.\n"
. "- rate: the TOTAL rate paid to the carrier, with currency as printed.\n"
. "- weight: shipment weight in pounds. miles: trip distance. Labels and values are often on separate lines — "
. "match them by column position, not adjacency.\n"
. "- commodity: the goods description ONLY, never the trailer type. equipment: trailer type (VAN, REEFER, FLATBED, POWER ONLY).\n"
. "Output JSON only, no commentary.";

$body = json_encode(array(
  'model' => GROQ_MODEL,
  'temperature' => 0,
  // Без явного лимита Groq обрывает ответ на полуслове и JSON не валидируется.
  // Больше 2000 не нужно даже на рейт-кон с пятью стопами, а лимит TPM
  // на бесплатном тарифе считает max_tokens как уже потраченные.
  'max_tokens' => 2000,
  'response_format' => array('type' => 'json_object'),
  'messages' => array(
    array('role' => 'system', 'content' => $sys),
    array('role' => 'user', 'content' => $text),
  ),
));

// Бесплатный тариф Groq — 8000 токенов в минуту, один рейт-кон съедает
// заметную часть. Упёрлись в лимит — ждём столько, сколько просит API, и
// пробуем ещё раз, вместо того чтобы огорчать пользователя.
$resp = null;
for ($attempt = 1; $attempt <= 2; $attempt++) {
  $resp = json_decode(httpPost('https://api.groq.com/openai/v1/chat/completions', $body, array(
    'Authorization: Bearer ' . $groqKey, 'Content-Type: application/json')), true);
  if (!isset($resp['error']['code']) || $resp['error']['code'] !== 'rate_limit_exceeded') break;
  if ($attempt === 2) break;
  $wait = 3;
  if (preg_match('/try again in ([\d.]+)(ms|s)/i', (string)$resp['error']['message'], $rm)) {
    $wait = $rm[2] === 'ms' ? 1 : min(20, (int)ceil((float)$rm[1]) + 1);
  }
  sleep($wait);
}
$raw = isset($resp['choices'][0]['message']['content']) ? $resp['choices'][0]['message']['content'] : '';
$load = json_decode($raw, true);
if (!is_array($load)) {
  // Причину называем словами пользователя, а не «попробуйте позже»:
  // ошибки Groq различаются, и человек должен понимать, что делать.
  $apiErr = isset($resp['error']['code']) ? $resp['error']['code'] : (isset($resp['error']['type']) ? $resp['error']['type'] : '');
  $why = 'сервис разбора вернул неожиданный ответ';
  if ($apiErr === 'json_validate_failed')      $why = 'документ слишком длинный — модель не успела дописать разбор';
  elseif ($apiErr === 'rate_limit_exceeded')   $why = 'сервис разбора перегружен, попробуйте через минуту';
  elseif (stripos($apiErr, 'authentication') !== false) $why = 'ключ сервиса разбора недействителен (это на нашей стороне)';
  elseif ($raw === '')                         $why = 'сервис разбора не ответил';
  fail($token, $chatId, 'groq bad answer: ' . mb_substr($raw !== '' ? $raw : json_encode($resp), 0, 500), $why);
  exit;
}

// ── Сохраняем разбор для будущей веб-страницы полного разбора ───────
$id = bin2hex(random_bytes(8));
$dir = __DIR__ . '/../../tg-loads';
if (!is_dir($dir)) @mkdir($dir, 0755, true);
@file_put_contents($dir . '/' . $id . '.json', json_encode(array(
  'parsed' => $load, 'chat_id' => $chatId, 'file_name' => isset($doc['file_name']) ? $doc['file_name'] : '',
), JSON_UNESCAPED_UNICODE));

// ── Ответ ───────────────────────────────────────────────────────────
clearProgress($token, $chatId);

$load = normalizeLoad($load);
$missing = missingFields($load);

if (empty($load['stops'])) {
  // Адресов нет — карточка бессмысленна, но молчать нельзя: показываем
  // всё, что удалось достать, и честно говорим, чего не хватило.
  $found = array();
  foreach (array('load_id' => 'Load ID', 'broker' => 'Брокер', 'rate' => 'Ставка',
                 'commodity' => 'Груз', 'weight' => 'Вес') as $k => $label) {
    if (!empty($load[$k])) $found[] = $label . ': ' . $load[$k];
  }
  reply($token, $chatId,
    "⚠️ Не нашёл в документе адреса погрузки и доставки — карточку собрать не из чего.\n\n"
    . ($found ? "Что удалось прочитать:\n" . implode("\n", $found) . "\n\n" : "")
    . "Похоже, это не рейт-кон, либо адреса в документе — картинкой. Пришлите оригинальный PDF от брокера.");
  echo 'ok'; exit;
}

// Карточка уходит отдельным сообщением, без единого лишнего символа —
// её копируют целиком и пересылают водителю.
reply($token, $chatId, driverCard($load));

// Чего в документе не нашлось — отдельным сообщением, чтобы не пачкать карточку.
if ($missing) {
  reply($token, $chatId,
    "⚠️ Не найдено в документе: " . implode(', ', $missing) . ".\n"
    . "Проверьте вручную — в рейт-коне этих данных нет или они записаны нестандартно.");
}

// Кнопка идёт ОТДЕЛЬНЫМ сообщением, а не на карточке: карточку копируют целиком и
// пересылают водителю, и кнопка уехала бы вместе с ней. Последней — чтобы в чате
// оказаться внизу, под глазами.
$appUrl = appLink($load);
if ($appUrl !== null) {
  replyWithButton($token, $chatId,
    "Посчитать этот груз: маржа, ставка за милю, порожний пробег.\n"
    . "Откроется демо — смотреть можно всё, сохранять только в своём аккаунте.",
    '📊 Открыть в приложении', $appUrl);
}
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

// Вес и мили модель регулярно меняет местами: в рейт-конах подписи столбцов
// и значения печатаются на разных строках. Разводим их арифметикой — это
// надёжнее любых уговоров в промпте.
// ponytail: порог 3000 (пробег редко больше, вес редко меньше). Если пойдут
// сборные LTL-грузы легче 3000 lbs — брать вес из подписи, а не из величины.
function normalizeLoad(array $d) {
  $num = function ($v) {
    $v = preg_replace('/[^0-9.]/', '', (string)$v);
    return $v === '' ? null : (float)$v;
  };
  $w = $num(isset($d['weight']) ? $d['weight'] : '');
  $m = $num(isset($d['miles']) ? $d['miles'] : '');

  if ($w !== null && $m !== null && $m > $w) {           // явно перепутаны местами
    $t = $d['weight']; $d['weight'] = $d['miles']; $d['miles'] = $t;
    $t = $w; $w = $m; $m = $t;
  } elseif ($w === null && $m !== null && $m >= 3000) {  // вес уехал в мили
    $d['weight'] = $d['miles']; $d['miles'] = ''; $w = $m; $m = null;
  } elseif ($m === null && $w !== null && $w < 3000) {   // мили уехали в вес
    $d['miles'] = $d['weight']; $d['weight'] = ''; $m = $w; $w = null;
  }

  // «41438» → «41438 lbs»: в карточке единицы должны быть всегда
  if ($w !== null && !preg_match('/[a-zA-Zа-яА-Я]/u', (string)$d['weight'])) {
    $d['weight'] = trim($d['weight']) . ' lbs';
  }
  // «1200.00» → «$1,200.00»: в рейт-конах доллар часто в заголовке столбца
  if (!empty($d['rate']) && preg_match('/^[\d.,]+$/', trim($d['rate']))) {
    $r = (float)str_replace(',', '', $d['rate']);
    if ($r > 0) $d['rate'] = '$' . number_format($r, 2);
  }
  return $d;
}

// Список того, чего в разборе не хватает — по-человечески, с указанием стопа.
function missingFields(array $d) {
  $miss = array();
  if (empty($d['load_id']))   $miss[] = 'номер загрузки';
  if (empty($d['rate']))      $miss[] = 'ставка';
  if (empty($d['weight']))    $miss[] = 'вес';
  if (empty($d['commodity'])) $miss[] = 'груз';
  $i = 0;
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    $i++;
    $who = ((isset($s['type']) && $s['type'] === 'delivery') ? 'доставка' : 'погрузка') . " #$i";
    if (empty($s['name']) && empty($s['address_lines'])) {
      $miss[] = "адрес ($who)";
    } elseif (!preg_match('/\b[A-Z]{2}\b[ ,]+\d{5}/', implode(' ', (array)(isset($s['address_lines']) ? $s['address_lines'] : array())))) {
      // без «CITY ST ZIP» водителю адрес бесполезен — предупреждаем явно
      $miss[] = "город и индекс ($who)";
    }
    if (empty($s['time'])) $miss[] = "время ($who)";
    if (empty($s['refs'])) $miss[] = "реф-номера ($who)";
  }
  return $miss;
}

// ── Проверка брокера через FMCSA QCMobile ───────────────────────────
// Тот же бесплатный API, что и в приложении (lib/fmcsa.ts). Ключ — отдельный файл
// рядом с остальными секретами, ВЫШЕ public_html: бот живёт на dispatch4you.com, а
// переменная FMCSA_WEBKEY задана у приложения на dispatch4you.pro — это разные
// хостинги, общей переменной у них нет.
// Без ключа отвечаем честной инструкцией и ничего не ломаем.
function fmcsaGet($path, $key) {
  $sep = strpos($path, '?') === false ? '?' : '&';
  $url = 'https://mobile.fmcsa.dot.gov/qc/services/' . $path . $sep . 'webKey=' . urlencode($key);
  $raw = httpGet($url);
  if ($raw === false || $raw === null || $raw === '') return null;
  $j = json_decode($raw, true);
  return is_array($j) ? $j : null;
}

// Ответ QCMobile приходит в трёх разных обёртках в зависимости от эндпоинта.
function unwrapCarrier($data) {
  if (!is_array($data)) return null;
  if (isset($data['content'][0]['carrier'])) return $data['content'][0]['carrier'];
  if (isset($data['content']['carrier']))    return $data['content']['carrier'];
  if (isset($data['carrier']))               return $data['carrier'];
  return null;
}

function authWord($code) {
  if ($code === 'A') return 'активно';
  if ($code === 'I') return 'неактивно';
  if ($code === 'N') return 'нет';
  return 'неизвестно';
}

// $kind: mc | dot | broker (broker = сперва MC, затем DOT — диспетчер обычно
// не знает, какой номер ему прислали).
function brokerReport($kind, $number) {
  $key = @trim(file_get_contents(__DIR__ . '/../../fmcsa.key'));
  if ($key === '' || $key === false) {
    return "Проверка брокера выключена — нужен бесплатный ключ FMCSA.\n\n"
      . "Заведите его на mobile.fmcsa.dot.gov/QCDevsite (вход через Login.gov) "
      . "и положите на сервер в файл fmcsa.key рядом с остальными ключами. "
      . "После этого проверка заработает сразу.";
  }

  $rec = null;
  if ($kind === 'mc' || $kind === 'broker') {
    $rec = unwrapCarrier(fmcsaGet('carriers/docket-number/' . $number, $key));
  }
  if ($rec === null && ($kind === 'dot' || $kind === 'broker')) {
    $rec = unwrapCarrier(fmcsaGet('carriers/' . $number, $key));
  }
  if ($rec === null) {
    return "Не нашёл перевозчика по номеру " . $number . ".\n"
      . "Проверьте номер: MC и DOT — разные, у брокера обычно есть оба.";
  }

  $name = isset($rec['legalName']) ? $rec['legalName'] : '—';
  $dba  = !empty($rec['dbaName']) ? $rec['dbaName'] : null;
  $dot  = isset($rec['dotNumber']) ? $rec['dotNumber'] : '—';
  $L = array();
  $L[] = '🔎 FMCSA';
  $L[] = '';
  $L[] = $name . ($dba !== null ? ' (DBA ' . $dba . ')' : '');
  $L[] = 'DOT ' . $dot . ($kind !== 'dot' ? ' · MC ' . $number : '');
  $L[] = '';
  $allowed = isset($rec['allowedToOperate']) ? $rec['allowedToOperate'] : null;
  $L[] = 'Право работать: ' . ($allowed === 'Y' ? 'ДА' : ($allowed === 'N' ? 'НЕТ ⚠️' : 'неизвестно'));
  if (isset($rec['brokerAuthorityStatus']))   $L[] = 'Брокерская авторити: ' . authWord($rec['brokerAuthorityStatus']);
  if (isset($rec['commonAuthorityStatus']))   $L[] = 'Common authority: ' . authWord($rec['commonAuthorityStatus']);
  if (isset($rec['contractAuthorityStatus'])) $L[] = 'Contract authority: ' . authWord($rec['contractAuthorityStatus']);
  // bondInsuranceOnFile — сумма в ТЫСЯЧАХ долларов, а не флаг Y/N: «75» = бонд
  // BMC-84 на $75 000. В приложении на этом уже обжигались.
  if (isset($rec['bondInsuranceOnFile']) && $rec['bondInsuranceOnFile'] !== '') {
    $bond = preg_replace('/\D/', '', (string)$rec['bondInsuranceOnFile']);
    $L[] = 'Бонд BMC-84: ' . ($bond === '' || $bond === '0' ? 'нет ⚠️' : '$' . number_format((float)$bond * 1000, 0, '.', ','));
  }
  if (!empty($rec['safetyRating'])) $L[] = 'Safety rating: ' . $rec['safetyRating'];
  $city = isset($rec['phyCity']) ? $rec['phyCity'] : '';
  $st   = isset($rec['phyState']) ? $rec['phyState'] : '';
  if ($city !== '' || $st !== '') $L[] = 'Адрес: ' . trim($city . ', ' . $st, ' ,');
  $L[] = '';
  $L[] = 'Источник: FMCSA QCMobile, данные официальные.';
  return implode("\n", $L);
}

// «Pine Hall, NC 27042» → «Pine Hall, NC». Приложению нужен город со штатом: по ним
// оно считает мили и ставит точки на карте, индекс только мешает совпадению.
// Идём с конца адреса — «City, ST ZIP» печатают последней строкой.
function cityState(array $stop) {
  $lines = (array)(isset($stop['address_lines']) ? $stop['address_lines'] : array());
  foreach (array_reverse($lines) as $line) {
    if (preg_match('/([A-Za-z][A-Za-z .\'\-]*),\s*([A-Z]{2})\b/', (string)$line, $m)) {
      return trim($m[1]) . ', ' . $m[2];
    }
  }
  return null;
}

// Ссылка «открыть разбор в приложении». Данные едут в ХЕШЕ (после #): браузер его
// на сервер не отправляет, поэтому ставка не окажется ни в наших логах, ни в чужих.
// Пустые поля не кладём — приложение само спросит то, чего в рейт-коне не было
// (мили и дни в пути документ нередко не печатает).
function appLink(array $d) {
  $num = function ($v) { $v = preg_replace('/[^0-9.]/', '', (string)$v); return $v === '' ? null : $v; };
  $pickup = null; $delivery = null;
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    if (isset($s['type']) && $s['type'] === 'delivery') { $delivery = $s; }  // последняя выгрузка
    elseif ($pickup === null) { $pickup = $s; }                              // первая погрузка
  }
  $p = array();
  $rate = $num(isset($d['rate']) ? $d['rate'] : '');
  $miles = $num(isset($d['miles']) ? $d['miles'] : '');
  if ($rate !== null)  $p['rate']  = $rate;
  if ($miles !== null) $p['miles'] = $miles;
  if ($pickup)   { $c = cityState($pickup);   if ($c !== null) $p['origin'] = $c; }
  if ($delivery) { $c = cityState($delivery); if ($c !== null) $p['dest']   = $c; }
  if (!empty($d['broker']))  $p['bn']  = $d['broker'];
  if (!empty($d['load_id'])) $p['ref'] = ltrim($d['load_id'], '#');

  // Подробности стопов — их знает только рейт-кон, и без них страница не соберёт
  // ни текст водителю, ни письмо брокеру.
  $street = function ($s) {
    $lines = array_values(array_filter((array)(isset($s['address_lines']) ? $s['address_lines'] : array())));
    return count($lines) > 1 ? $lines[0] : ''; // последняя строка — это CITY ST ZIP, она уже в origin/dest
  };
  if ($pickup) {
    if (!empty($pickup['name'])) $p['pn'] = $pickup['name'];
    if ($street($pickup) !== '')  $p['pa'] = $street($pickup);
    if (!empty($pickup['time'])) $p['pt'] = $pickup['time'];
    $refs = array_filter((array)(isset($pickup['refs']) ? $pickup['refs'] : array()));
    if ($refs) $p['pr'] = implode('|', $refs);
  }
  if ($delivery) {
    if (!empty($delivery['name'])) $p['dn'] = $delivery['name'];
    if ($street($delivery) !== '')  $p['da'] = $street($delivery);
    if (!empty($delivery['time'])) $p['dt'] = $delivery['time'];
    $refs = array_filter((array)(isset($delivery['refs']) ? $delivery['refs'] : array()));
    if ($refs) $p['dr'] = implode('|', $refs);
  }
  if (!empty($d['weight']))    $p['wt'] = $d['weight'];
  if (!empty($d['commodity'])) $p['cm'] = $d['commodity'];
  if (!empty($d['equipment'])) $p['eq'] = $d['equipment'];
  if (!$p) return null;
  // http_build_query кодирует пробел как «+», а URLSearchParams на той стороне
  // читает «+» как пробел — форматы совпадают, ничего конвертировать не нужно.
  return APP_DEMO_URL . '#' . http_build_query($p);
}

// URL-кнопка, а не callback: подписка вебхука — только на "message", и callback_query
// до нас бы просто не дошёл. Ссылка открывается сразу, без ответа от бота.
function replyWithButton($token, $chatId, $text, $btnText, $url) {
  return tgApi($token, 'sendMessage', array(
    'chat_id' => $chatId,
    'text' => $text,
    'disable_web_page_preview' => true,
    'reply_markup' => json_encode(array('inline_keyboard' => array(array(
      array('text' => $btnText, 'url' => $url),
    )))),
  ));
}

function tgApi($token, $method, array $params) {
  return httpPost('https://api.telegram.org/bot' . $token . '/' . $method,
    http_build_query($params), array('Content-Type: application/x-www-form-urlencoded'));
}

function reply($token, $chatId, $text) {
  return tgApi($token, 'sendMessage', array(
    'chat_id' => $chatId, 'text' => $text, 'disable_web_page_preview' => true));
}

// Закрывает HTTP-ответ, не прерывая скрипт: LiteSpeed (Hostinger) и PHP-FPM
// называют это по-разному, на остальных SAPI просто работаем как раньше.
function finishRequest() {
  echo 'ok';
  if (function_exists('litespeed_finish_request')) { litespeed_finish_request(); return; }
  if (function_exists('fastcgi_finish_request')) { fastcgi_finish_request(); return; }
  @ob_end_flush(); @flush();
}

// Убирает «⏳ Разбираю документ…», чтобы в чате не оставалось мусора.
function clearProgress($token, $chatId) {
  if (empty($GLOBALS['progressId'])) return;
  tgApi($token, 'deleteMessage', array('chat_id' => $chatId, 'message_id' => $GLOBALS['progressId']));
  $GLOBALS['progressId'] = null;
}

// $why — причина человеческим языком. Код ошибки печатаем и в чат, и в лог:
// по нему находится конкретный случай, а сообщения перестают быть одинаковыми.
function fail($token, $chatId, $logMsg, $why = '') {
  $code = strtoupper(substr(md5($logMsg), 0, 6));
  @file_put_contents(__DIR__ . '/../../tg-bot.log',
    date('c') . " [$code] " . $logMsg . "\n", FILE_APPEND);
  clearProgress($token, $chatId);
  reply($token, $chatId,
    "😕 Не смог разобрать этот документ.\n\n"
  . ($why !== '' ? "Причина: $why.\n\n" : '')
  . "Что можно сделать:\n"
  . "• прислать оригинальный PDF от брокера (не скан и не фото)\n"
  . "• проверить, что файл не защищён паролем\n"
  . "• попробовать ещё раз через минуту\n\n"
  . "Код ошибки: $code — назовите его, если напишете нам.");
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

// ── Груз со скриншота: разбор, аналитика, письмо брокеру ────────────

// Состояние диалога (подпись перевозчика и текущий черновик) — по одному
// файлу на чат, рядом с ключами и вне публичной папки.
function statePath($chatId) { return __DIR__ . '/../../tg-state/' . preg_replace('/\D/', '', $chatId) . '.json'; }

function stateGet($chatId) {
  $j = @file_get_contents(statePath($chatId));
  $s = $j === false ? null : json_decode($j, true);
  return is_array($s) ? $s : array();
}

function stateSet($chatId, array $s) {
  $dir = __DIR__ . '/../../tg-state';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);
  @file_put_contents(statePath($chatId), json_encode($s, JSON_UNESCAPED_UNICODE));
}

function handlePhotoLoad($token, $chatId, $fileId, $mime) {
  global $progressId;
  $sent = json_decode(reply($token, $chatId, '⏳ Читаю скриншот… / Reading…'), true);
  if (!empty($sent['result']['message_id'])) $progressId = $sent['result']['message_id'];
  finishRequest();

  require_once __DIR__ . '/lib/load-photo.php';

  $info = json_decode(tgApi($token, 'getFile', array('file_id' => $fileId)), true);
  if (empty($info['result']['file_path'])) { fail($token, $chatId, 'photo getFile: ' . json_encode($info), 'Telegram не отдал картинку'); return; }
  $bytes = httpGet('https://api.telegram.org/file/bot' . $token . '/' . $info['result']['file_path']);
  if ($bytes === false || $bytes === '') { fail($token, $chatId, 'photo download failed', 'не удалось скачать картинку'); return; }

  list($load, $err) = photoExtractLoad($bytes, $mime);
  clearProgress($token, $chatId);

  if ($err === 'nokey') {
    reply($token, $chatId,
      "Разбор скриншотов выключен — нужен бесплатный ключ Google Gemini.\n\n"
      . "Заведите его на aistudio.google.com/apikey и положите на сервер в файл gemini.key "
      . "рядом с groq.key и fmcsa.key. После этого фото начнут читаться сразу.");
    return;
  }
  if ($err === 'notload') {
    reply($token, $chatId,
      "На картинке нет груза — я вижу что-то другое.\n\n"
      . "Пришлите скриншот карточки груза с лоуборда (DAT, Truckstop) или письма брокера. "
      . "Рейт-кон лучше присылать файлом PDF — так точнее.");
    return;
  }
  if ($err !== '') { fail($token, $chatId, 'photo vision: ' . $err, 'сервис распознавания не справился с картинкой'); return; }

  $st = stateGet($chatId);
  $draft = brokerEmailDraft($load, isset($st['carrier']) ? $st['carrier'] : '');
  $st['load'] = $load;
  $st['draft'] = $draft;
  stateSet($chatId, $st);

  reply($token, $chatId, photoLoadCard($load));
  reply($token, $chatId, photoLoadAnalytics($load));
  reply($token, $chatId, draftAsText($draft) . "\n\n"
    . "— — —\n"
    . "✏️ Изменить: /edit и новый текст письма\n"
    . "📤 Готово к отправке: /send — открою письмо в вашей почте"
    . "\n🖊 Подпись: /carrier и данные вашей компании");
}

function handleCarrier($token, $chatId, $sig) {
  $st = stateGet($chatId);
  if ($sig === '') {
    $cur = isset($st['carrier']) ? $st['carrier'] : '';
    reply($token, $chatId, $cur === ''
      ? "Подпись пока не задана.\n\nПришлите её так:\n/carrier ABC Trucking LLC\nMC 123456\nJohn, (555) 111-2233\njohn@abctrucking.com\n\nОна будет подставляться в письма брокерам, а email из неё — в поле «ответить»."
      : "Ваша подпись:\n\n" . $cur . "\n\nЗаменить — пришлите /carrier с новым текстом.");
    return;
  }
  $st['carrier'] = $sig;
  if (!empty($st['load'])) { // пересобираем черновик с новой подписью
    require_once __DIR__ . '/lib/load-photo.php';
    $st['draft'] = brokerEmailDraft($st['load'], $sig);
  }
  stateSet($chatId, $st);
  reply($token, $chatId, "Подпись сохранена:\n\n" . $sig);
}

function handleEdit($token, $chatId, $newBody) {
  $st = stateGet($chatId);
  if (empty($st['draft'])) { reply($token, $chatId, "Нечего редактировать — сначала пришлите скриншот груза."); return; }
  if ($newBody === '') {
    reply($token, $chatId,
      "Пришлите письмо целиком после команды:\n\n/edit Hello John,\n\nWe can cover this load at $2,400 all-in...\n\n"
      . "Можно менять и тему — первой строкой «Subject: ...»");
    return;
  }
  // Первая строка «Subject: ...» меняет тему, остальное — тело
  if (preg_match('~^\s*subject:\s*(.+?)\R+(.*)$~is', $newBody, $m)) {
    $st['draft']['subject'] = trim($m[1]);
    $st['draft']['body'] = trim($m[2]);
  } else {
    $st['draft']['body'] = $newBody;
  }
  stateSet($chatId, $st);
  reply($token, $chatId, draftAsText($st['draft']) . "\n\n— — —\n📤 Готово к отправке: /send");
}

// Бот НЕ отправляет письма сам. Причины, по которым отправку убрали после первого
// же теста: команда с опечаткой мгновенно уходила чужому адресату без подтверждения,
// а письмо с домена сайта, а не перевозчика, брокеры всё равно считают спамом.
// Здесь мы только готовим письмо — отправляет человек из своей почты.
function handleSend($token, $chatId, $toArg) {
  $st = stateGet($chatId);
  if (empty($st['draft'])) { reply($token, $chatId, "Нечего отправлять — сначала пришлите скриншот груза."); return; }
  $draft = $st['draft'];
  $to = $toArg !== '' ? $toArg : $draft['to'];
  $hasTo = filter_var($to, FILTER_VALIDATE_EMAIL) !== false;

  $mailto = 'mailto:' . ($hasTo ? rawurlencode($to) : '')
    . '?subject=' . rawurlencode($draft['subject'])
    . '&body=' . rawurlencode($draft['body']);

  $text = "📤 Письмо готово к отправке — отправляете вы, из своей почты.\n\n"
    . "Кому: " . ($hasTo ? $to : '(адрес брокера не найден)') . "\n"
    . "Тема: " . $draft['subject'] . "\n\n"
    . $draft['body'] . "\n\n"
    . "— — —\n"
    . "Скопируйте текст выше или нажмите кнопку — письмо откроется в вашей почтовой программе уже заполненным.\n"
    . "Так брокер видит адрес вашей компании, а не наш, и ответ придёт прямо вам.";

  // mailto в inline-кнопке Telegram не пропускает — отдаём ссылкой в тексте
  reply($token, $chatId, $text . "\n\nОткрыть в почте:\n" . $mailto);
}
