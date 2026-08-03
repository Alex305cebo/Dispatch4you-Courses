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
// Раздельные RU/EN версии — выбор языка (см. langKeyboard/handleLanguage) должен
// реально менять то, что видит человек, а не просто переключать флаг в состоянии.
const HELP_START_RU =
  "Dispatch4You — рабочий инструмент диспетчера.\n"
. "Разбираю документы по грузу и готовлю всё, что нужно отправить дальше.\n\n"
. "📄 Rate Confirmation (PDF)\n"
. "Пришлите файл от брокера — верну сводку по грузу, а по кнопкам:\n"
. "• текст для водителя — адреса, окна времени, все реф-номера\n"
. "• письмо брокеру — готовое, с возможностью правки\n"
. "• полный разбор с картой маршрута и расчётом\n\n"
. "📷 Скриншот груза с лоуборда (DAT, Truckstop)\n"
. "Пришлите картинку — разберу и посчитаю:\n"
. "• ставку за милю и остаток после топлива\n"
. "• на что смотреть: перевес, тенты, hazmat, отсутствие контактов\n"
. "• письмо брокеру по этому грузу\n\n"
. "🔎 Проверка брокера по FMCSA\n"
. "/mc 115789 — по номеру MC · /dot 2100420 — по DOT\n"
. "Право работать, авторити, бонд BMC-84, адрес — из официального источника.\n\n"
. "Требования: PDF с текстовым слоем до 15 МБ. Документ на сервере не хранится — "
. "только данные загрузки.\n\n"
. "/menu — все разделы одним списком\n"
. "/help — подробная инструкция\n"
. "/language — сменить язык бота";

const HELP_START_EN =
  "Dispatch4You — a dispatcher's working tool.\n"
. "I read your load documents and prepare everything you need to send next.\n\n"
. "📄 Rate Confirmation (PDF)\n"
. "Send the file from the broker — I'll return a load summary, then buttons for:\n"
. "• driver info text — addresses, time windows, every reference number\n"
. "• broker email — ready to send, editable\n"
. "• full breakdown with a route map and the numbers\n\n"
. "📷 Load board screenshot (DAT, Truckstop)\n"
. "Send a picture — I'll read it and calculate:\n"
. "• rate per mile and what's left after fuel\n"
. "• what to watch for: overweight, tarps, hazmat, missing contacts\n"
. "• a broker email for this load\n\n"
. "🔎 Broker check via FMCSA\n"
. "/mc 115789 — by MC number · /dot 2100420 — by DOT number\n"
. "Authority status, bond on file (BMC-84), address — straight from the official source.\n\n"
. "Requirements: a text-based PDF, up to 15 MB. The document itself is never stored — "
. "only the extracted load data.\n\n"
. "/menu — every section in one list\n"
. "/help — full instructions\n"
. "/language — change the bot's language";

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

// Сводки, кнопки под разбором и обработка нажатий
require_once __DIR__ . '/lib/tg-actions.php';

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

// ── ВРЕМЕННО: какие модели Gemini реально доступны нашему ключу ──────
// Названия в консоли AI Studio — витринные, у API свои идентификаторы.
// Спрашиваем сам API, а не гадаем. Удалить после настройки цепочки.
if (isset($_GET['gemprobe'])) {
  header('Content-Type: text/plain; charset=utf-8');
  if ($_GET['gemprobe'] !== 'b41f7ac9e2d5') { http_response_code(403); echo 'bad token'; exit; }
  require_once __DIR__ . '/lib/load-photo.php';
  $key = geminiKey();
  if ($key === null) { echo "gemini.key нет\n"; exit; }

  // 1. Официальный список моделей аккаунта
  $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200');
  curl_setopt_array($ch, array(CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => array('x-goog-api-key: ' . $key)));
  $list = json_decode((string)curl_exec($ch), true);
  curl_close($ch);
  echo "=== ДОСТУПНЫЕ МОДЕЛИ (generateContent) ===\n";
  foreach ((array)(isset($list['models']) ? $list['models'] : array()) as $m) {
    $methods = (array)(isset($m['supportedGenerationMethods']) ? $m['supportedGenerationMethods'] : array());
    if (!in_array('generateContent', $methods, true)) continue;
    $id = str_replace('models/', '', $m['name']);
    if (stripos($id, 'flash') === false && stripos($id, 'pro') === false) continue;
    echo str_pad($id, 44) . (isset($m['inputTokenLimit']) ? 'вход ' . number_format($m['inputTokenLimit']) : '') . "\n";
  }

  // 2. Живая проверка нашей цепочки — отвечает ли каждая модель на самом деле
  echo "\n=== ПРОВЕРКА ЦЕПОЧКИ ===\n";
  foreach (GEMINI_CHAIN as $model) {
    list($d, $e) = geminiStructure('Return ONLY {"ok":true}', 'ping', array($model));
    echo str_pad($model, 30) . ($d !== null ? 'РАБОТАЕТ' : 'нет: ' . substr($e, 0, 110)) . "\n";
  }
  exit;
}

// ── ВРЕМЕННО: сравнение Gemini vs Groq на реальном тексте рейт-кона ──
// Нужно ровно на время переезда с Groq на Gemini, чтобы решение о смене
// движка стояло на цифрах. Закрыто одноразовым токеном; удалить после проверки.
if (isset($_GET['rctest'])) {
  header('Content-Type: application/json; charset=utf-8');
  if ($_GET['rctest'] !== 'b41f7ac9e2d5') { http_response_code(403); echo '{"error":"bad token"}'; exit; }
  $t = file_get_contents('php://input');
  if (trim($t) === '') { echo '{"error":"post the extracted text as the body"}'; exit; }
  require_once __DIR__ . '/lib/load-photo.php';
  $sysT = rcPrompt();

  $t0 = microtime(true);
  list($gem, $gemErr) = geminiStructure($sysT, $t);
  $gemSec = round(microtime(true) - $t0, 1);

  $groqKey = @trim(file_get_contents(__DIR__ . '/../../groq.key'));
  $t1 = microtime(true);
  $body = json_encode(array('model' => GROQ_MODEL, 'temperature' => 0, 'max_tokens' => 2000,
    'response_format' => array('type' => 'json_object'),
    'messages' => array(array('role' => 'system', 'content' => $sysT),
                        array('role' => 'user', 'content' => mb_substr($t, 0, 14000)))));
  $gr = json_decode(httpPost('https://api.groq.com/openai/v1/chat/completions', $body,
    array('Authorization: Bearer ' . $groqKey, 'Content-Type: application/json')), true);
  $groqSec = round(microtime(true) - $t1, 1);
  $groqJson = isset($gr['choices'][0]['message']['content']) ? json_decode($gr['choices'][0]['message']['content'], true) : null;

  echo json_encode(array(
    'chars' => mb_strlen($t),
    'gemini' => array('sec' => $gemSec, 'err' => $gemErr, 'data' => $gem),
    'groq' => array('sec' => $groqSec, 'err' => isset($gr['error']['code']) ? $gr['error']['code'] : '', 'data' => $groqJson),
  ), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  exit;
}

// ── Живой ли ключ FMCSA (проверка брокера). Ключ наружу не отдаём ──
if (isset($_GET['fmcsacheck'])) {
  header('Content-Type: text/plain; charset=utf-8');
  $kp = realpath(__DIR__ . '/../..') . '/fmcsa.key';
  $key = @trim(file_get_contents(__DIR__ . '/../../fmcsa.key'));
  if ($key === '' || $key === false) { echo "fmcsa.key: не найден или пуст\nискали тут: $kp\n"; exit; }
  echo "fmcsa.key: есть\n";
  // MC 115789 — реальный действующий брокер (TQL), используем как проверочный
  echo "ответ: " . brokerReport('mc', '115789') . "\n";
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
    // callback_query обязателен: без него нажатия на кнопки под разбором
    // до нас просто не доедут, и бот будет молчать в ответ на них.
    'allowed_updates' => json_encode(array('message', 'callback_query')),
    'drop_pending_updates' => true,
  )), true);
  // Короткое описание — в профиле бота; полное — на пустом экране чата
  // (именно его человек читает до того, как нажать «Начать»).
  $out['short_description'] = json_decode(tgApi($token, 'setMyShortDescription', array(
    'short_description' => 'Рейт-коны и скриншоты грузов: текст водителю, расчёт, письмо брокеру, проверка по FMCSA.',
  )), true);
  // Лимит Telegram — 512 символов, поэтому здесь только суть; подробности в /start.
  $out['description'] = json_decode(tgApi($token, 'setMyDescription', array(
    'description' =>
        "Рабочий инструмент диспетчера.\n\n"
      . "Пришлите Rate Confirmation в PDF или скриншот груза с лоуборда — получите:\n"
      . "• текст для водителя: адреса, окна времени, реф-номера\n"
      . "• расчёт: ставка за милю, топливо, на что смотреть\n"
      . "• готовое письмо брокеру\n"
      . "• проверку брокера по FMCSA\n\n"
      . "— — —\n"
      . "Rate confirmations and load screenshots in — driver text, per-mile math, "
      . "broker email and FMCSA checks out.",
  )), true);
  // Плоский список — так его и показывает Telegram, разделов внутри самого
  // меню нет технически. Порядок группирует пункты по смыслу: сначала общее,
  // потом работа с письмом брокеру, потом проверка брокера, потом настройки.
  $out['commands'] = json_decode(tgApi($token, 'setMyCommands', array(
    'commands' => json_encode(array(
      array('command' => 'start',    'description' => '👋 Что умеет бот'),
      array('command' => 'menu',     'description' => '📋 Все разделы одним списком'),
      array('command' => 'help',     'description' => 'ℹ️ Подробная инструкция'),
      array('command' => 'carrier',  'description' => '🖊 Подпись компании для писем'),
      array('command' => 'edit',     'description' => '✏️ Поправить текст письма'),
      array('command' => 'send',     'description' => '📤 Подготовить письмо к отправке'),
      array('command' => 'mc',       'description' => '🔎 Проверить брокера по MC'),
      array('command' => 'dot',      'description' => '🔎 Проверить брокера по DOT'),
      array('command' => 'language', 'description' => '🌐 Сменить язык / Change language'),
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

// Нажатие кнопки под разбором: показываем то, что попросили, из сохранённого
// состояния — заново документ не разбираем.
if (isset($update['callback_query'])) {
  handleCallback($token, $update['callback_query']);
  exit;
}

$msg = isset($update['message']) ? $update['message'] : null;
if (!$msg || !isset($msg['chat']['id'])) { echo 'ok'; exit; }
$chatId = $msg['chat']['id'];

$introState = stateGet($chatId);

// Первое сообщение от этого чата вообще — до всего остального спрашиваем язык.
// Ответ на выбор не блокируется: пока человек не нажал кнопку, всё отвечает
// на русском по умолчанию — большинство диспетчеров, писавших нам, русскоязычные.
if (empty($introState['asked_lang'])) {
  reply($token, $chatId, "🌐 Выберите язык / Choose your language", langKeyboard());
  $introState['asked_lang'] = true;
  stateSet($chatId, $introState);
}

// Раз в час — напоминание о возможностях. Диспетчер заходит в бот между
// звонками и половину функций просто не помнит; чаще показывать нельзя,
// иначе это превращается в шум поверх рабочей переписки.
$introAge = time() - (int)(isset($introState['intro_at']) ? $introState['intro_at'] : 0);
if ($introAge > 3600) {
  $isStart = isset($msg['text']) && stripos(trim($msg['text']), '/start') === 0;
  if (!$isStart) reply($token, $chatId, helpStart($introState)); // на /start оно и так придёт
  $introState['intro_at'] = time();
  stateSet($chatId, $introState);
}

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
      $lang = curLang($introState);
      list($rec, $err) = fetchBrokerRecord($kind, $numArg);
      if ($rec === null) {
        reply($token, $chatId, brokerReport($kind, $numArg, $lang));
      } else {
        $introState['fmcsa'] = array('rec' => $rec, 'kind' => $kind, 'number' => $numArg);
        stateSet($chatId, $introState);
        reply($token, $chatId, formatBrokerReport($rec, $kind, $numArg, $lang), fmcsaKeyboard($lang));
      }
    }
  } elseif (stripos($text, '/language') === 0 || stripos($text, '/lang') === 0) {
    reply($token, $chatId, "🌐 Выберите язык / Choose your language", langKeyboard());
  } elseif (stripos($text, '/menu') === 0) {
    reply($token, $chatId, menuText($introState));
  } else {
    reply($token, $chatId, stripos($text, '/help') === 0 ? HELP_FULL : helpStart($introState));
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
$text = fixGluedUnits($text);
if (mb_strlen($text) < 100) {
  clearProgress($token, $chatId);
  reply($token, $chatId, HELP_SCAN);
  echo 'ok'; exit;
}
// Разбирает Gemini, а у него контекст на порядки больше — режем только для
// защиты от аномалий (200-страничный скан вместо рейт-кона), а не потому,
// что модель не потянет. Раньше стояло 14000, и документы Trinity (20-22 тыс.)
// теряли хвост: сегодня повезло, что данные были на первой странице.
if (mb_strlen($text) > 200000) $text = mb_substr($text, 0, 200000);

// ── Текст → структурированный JSON ─────────────────────────────────
$groqKey = @trim(file_get_contents(__DIR__ . '/../../groq.key'));

$sys = rcPrompt();

// Основной разборщик — Gemini: документ уходит целиком, лимиты позволяют
// пользоваться ботом больше чем одному человеку в минуту.
require_once __DIR__ . '/lib/load-photo.php';
list($load, $gemErr) = geminiStructure($sys, $text);

// Страховка: если Gemini недоступен (нет ключа, квота, сбой) — добираем через
// Groq, он уже настроен для расширения DAT и голосового тренажёра. У Groq
// контекст меньше, поэтому туда текст идёт обрезанным.
$groqErrCode = '';
if (!is_array($load)) {
  $groqKey = @trim(file_get_contents(__DIR__ . '/../../groq.key'));
  if ($groqKey !== '' && $groqKey !== false) {
    $body = json_encode(array(
      'model' => GROQ_MODEL,
      'temperature' => 0,
      // Без явного лимита Groq обрывает ответ на полуслове и JSON не валидируется.
      'max_tokens' => 2000,
      'response_format' => array('type' => 'json_object'),
      'messages' => array(
        array('role' => 'system', 'content' => $sys),
        array('role' => 'user', 'content' => mb_substr($text, 0, 14000)),
      ),
    ));
    $resp = json_decode(httpPost('https://api.groq.com/openai/v1/chat/completions', $body, array(
      'Authorization: Bearer ' . $groqKey, 'Content-Type: application/json')), true);
    $raw = isset($resp['choices'][0]['message']['content']) ? $resp['choices'][0]['message']['content'] : '';
    $load = json_decode($raw, true);
    $groqErrCode = isset($resp['error']['code']) ? $resp['error']['code'] : '';
  }
}

if (!is_array($load)) {
  // Причину называем словами пользователя, а не «попробуйте позже».
  $why = 'сервис разбора вернул неожиданный ответ';
  if (strpos($gemErr, 'nokey') === 0)                  $why = 'ключ сервиса разбора не настроен (это на нашей стороне)';
  elseif (stripos($gemErr, 'quota') !== false)          $why = 'дневной лимит сервиса разбора исчерпан';
  elseif ($groqErrCode === 'rate_limit_exceeded')       $why = 'сервис разбора перегружен, попробуйте через минуту';
  elseif (stripos($gemErr, 'api_key') !== false || stripos($gemErr, 'API key') !== false)
                                                        $why = 'ключ сервиса разбора недействителен (это на нашей стороне)';
  fail($token, $chatId, 'parse failed. gemini=' . mb_substr($gemErr, 0, 300) . ' groq=' . $groqErrCode, $why);
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

// Разбор кладём в состояние чата: кнопки под сообщением берут данные отсюда,
// документ второй раз не разбирается. $missing — структурные метки, не текст:
// кнопка перевода строит из них список заново на нужном языке.
$st = stateGet($chatId);
$st['rc'] = $load;
$st['rc_missing'] = $missing;
stateSet($chatId, $st);
$lang = curLang($st);

// Сводка + кнопки «что дальше». Полотно для водителя больше не вываливается
// сразу: его отдаём по кнопке, когда оно действительно нужно.
reply($token, $chatId, rcSummaryFull($load, $missing, $lang), rcKeyboard($load, $lang));
echo 'ok';
exit;

// ── Язык интерфейса ──────────────────────────────────────────────────
// По умолчанию русский: до этой правки бот отвечал только на русском,
// и вся текущая аудитория — русскоязычные диспетчеры.
function helpStart(array $state) {
  return (isset($state['lang']) && $state['lang'] === 'en') ? HELP_START_EN : HELP_START_RU;
}

// Единая точка правды о том, на каком языке сейчас говорить с этим диспетчером —
// используется и для готовых сообщений, и для кнопки переключения под каждым из них.
function curLang(array $state) {
  return (isset($state['lang']) && $state['lang'] === 'en') ? 'en' : 'ru';
}

function langToggleButton($lang, $msgtype) {
  $target = $lang === 'en' ? 'ru' : 'en';
  return array('text' => ($target === 'en' ? '🌐 English' : '🌐 Русский'), 'callback_data' => 'tr:' . $msgtype . ':' . $target);
}

function editMessage($token, $chatId, $messageId, $text, array $keyboard = null) {
  $p = array('chat_id' => $chatId, 'message_id' => $messageId, 'text' => $text, 'disable_web_page_preview' => true);
  if ($keyboard !== null) $p['reply_markup'] = json_encode(array('inline_keyboard' => $keyboard));
  return tgApi($token, 'editMessageText', $p);
}

// Разделы «по-человечески»: у Telegram нет заголовков-секций в самом меню команд
// (кнопка «Menu» показывает строго плоский список) — здесь то же самое разложено
// по группам текстом, /menu ссылается и в /start, и в описании бота.
function menuText(array $state) {
  if (isset($state['lang']) && $state['lang'] === 'en') {
    return "📋 SECTIONS\n\n"
    . "📄 Rate Confirmation\n"
    . "Send the PDF — a summary and action buttons come back.\n\n"
    . "📷 Load screenshot\n"
    . "Send a photo from DAT/Truckstop — analysis and action buttons come back.\n\n"
    . "✉️ Broker email\n"
    . "/carrier — set your company's signature\n"
    . "/edit — replace the draft text\n"
    . "/send — get the ready-to-send email + mail link\n\n"
    . "🔎 Broker check (FMCSA)\n"
    . "/mc 115789 — by MC number\n"
    . "/dot 2100420 — by DOT number\n\n"
    . "🌐 Language\n"
    . "/language — switch RU/EN\n\n"
    . "/help — full instructions";
  }
  return "📋 РАЗДЕЛЫ\n\n"
  . "📄 Rate Confirmation\n"
  . "Пришлите PDF — придёт сводка и кнопки действий.\n\n"
  . "📷 Скриншот груза\n"
  . "Пришлите фото с DAT/Truckstop — придёт разбор и кнопки действий.\n\n"
  . "✉️ Письмо брокеру\n"
  . "/carrier — задать подпись компании\n"
  . "/edit — заменить текст черновика\n"
  . "/send — получить готовое письмо и ссылку на отправку\n\n"
  . "🔎 Проверка брокера (FMCSA)\n"
  . "/mc 115789 — по номеру MC\n"
  . "/dot 2100420 — по номеру DOT\n\n"
  . "🌐 Язык\n"
  . "/language — сменить RU/EN\n\n"
  . "/help — подробная инструкция";
}

function langKeyboard() {
  return array(array(
    array('text' => '🇷🇺 Русский', 'callback_data' => 'lang:ru'),
    array('text' => '🇬🇧 English', 'callback_data' => 'lang:en'),
  ));
}

function handleLanguage($token, $chatId, $lang) {
  $st = stateGet($chatId);
  $st['lang'] = $lang;
  stateSet($chatId, $st);
  reply($token, $chatId, $lang === 'en' ? '✅ Language set: English' : '✅ Язык установлен: Русский');
  reply($token, $chatId, helpStart($st));
}

// ────────────────────────────────────────────────────────────────────
// $lang меняет только подписи полей (LOAD ID, Pick up Address, Time, Ref...) —
// сами данные (адреса, суммы, номера) не переводятся, это факты, а не текст.
// ⚠️ Карточка по умолчанию — для американского водителя, который читает по-английски;
// русская версия существует по прямому запросу и отправлять её водителю не стоит.
function driverCard(array $d, $lang = 'en') {
  $t = $lang === 'ru'
    ? array('load' => 'НОМЕР ЗАГРУЗКИ', 'pickup' => 'Адрес погрузки', 'delivery' => 'Адрес доставки',
            'time' => 'Время', 'ref' => 'Реф', 'rate' => 'Ставка', 'commodity' => 'Груз', 'weight' => 'Вес')
    : array('load' => 'LOAD ID', 'pickup' => 'Pick up Address', 'delivery' => 'Delivery Address',
            'time' => 'Time', 'ref' => 'Ref', 'rate' => 'Rate', 'commodity' => 'Commodity', 'weight' => 'Weight');
  $hr = '__________________________';
  $L = array();
  if (!empty($d['load_id'])) { $L[] = '* ' . $t['load'] . ': #' . ltrim($d['load_id'], '#'); $L[] = ''; }

  $counts = array('pickup' => 0, 'delivery' => 0);
  foreach ($d['stops'] as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $counts[$type]++;
  }
  $seen = array('pickup' => 0, 'delivery' => 0);
  foreach ($d['stops'] as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $seen[$type]++;
    $label = ($type === 'delivery') ? $t['delivery'] : $t['pickup'];
    if ($counts[$type] > 1) $label .= ' ' . $seen[$type];
    $L[] = $label . ':';
    $L[] = '';
    // Пустая строка после названия склада — иначе оно визуально слипается
    // с адресом на следующей строке.
    if (!empty($s['name'])) { $L[] = $s['name']; $L[] = ''; }
    foreach ((array)(isset($s['address_lines']) ? $s['address_lines'] : array()) as $a) if ($a !== '') $L[] = $a;
    $L[] = '';
    if (!empty($s['time'])) { $L[] = $hr; $L[] = $t['time'] . ': ' . $s['time']; }
    $refs = array_filter((array)(isset($s['refs']) ? $s['refs'] : array()));
    if ($refs) {
      $L[] = $hr;
      $first = true;
      foreach ($refs as $r) { $L[] = ($first ? $t['ref'] . ': ' : '') . $r; $first = false; }
    }
    $L[] = $hr;
    $L[] = '';
  }
  if (!empty($d['rate']))      $L[] = $t['rate'] . ': ' . $d['rate'];
  if (!empty($d['commodity'])) $L[] = $t['commodity'] . ': ' . $d['commodity'];
  if (!empty($d['weight']))    $L[] = $t['weight'] . ': ' . $d['weight'];
  $card = implode("\n", $L);
  return mb_strlen($card) > 4000 ? mb_substr($card, 0, 4000) : $card;
}

// Промпт разбора рейт-кона — один на всех потребителей (Gemini, запасной Groq,
// диагностика ?rctest). Проверен на живых документах: без запрета «придумывать»
// модель подставляет адрес офиса брокера и выдуманные реф-номера.
function rcPrompt() {
  return "You extract data from freight Rate Confirmation documents.\n"
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
  . "- Some rate cons print stops as a TABLE with a 'Pick/Drop #' or 'PU/Delv #' column instead of labelled refs. "
  . "There the pickup/delivery number is a bare code sitting right after the stop's weight or time "
  . "(e.g. '41870.00lbs 1713693K' means ref '1713693K'). Treat those bare codes as that stop's refs. "
  . "Do NOT invent a label for them — output the code alone.\n"
  . "- rate: the TOTAL rate paid to the carrier, with currency as printed.\n"
  . "- weight: shipment weight in pounds. miles: trip distance. Labels and values are often on separate lines — "
  . "match them by column position, not adjacency.\n"
  . "- commodity: the goods description ONLY, never the trailer type. equipment: trailer type (VAN, REEFER, FLATBED, POWER ONLY).\n"
  . "Output JSON only, no commentary.";
}

// PDF-таблицы иногда извлекаются без пробела между соседними ячейками:
// «41870.00lbs1713693K» — вес и реф-номер доставки слиплись в одно слово,
// модель на реальном документе (Armstrong Transport, 3 стопа) потеряла оба
// реф-номера доставки именно из-за этого. Вставляем границу после единицы
// измерения, если сразу за ней идёт буква/цифра без пробела — дёшево и не
// трогает легитимные слитные токены вроде «MC123456» или «53V».
function fixGluedUnits($text) {
  // \b перед «lbs» не сработал бы: между цифрой и буквой нет границы слова
  // (обе — \w). Требуем цифру непосредственно перед единицей — она и так
  // всегда стоит перед lbs/kg в весе, а от случайных слов это защищает.
  // Группа атомарная: иначе «s» в lbs?/kgs? необязательна, и на «36000.0lbs TUBS»
  // движок откатывался к короткому «lb», принимал «s» из самого «lbs» за начало
  // следующего слова и резал слово пополам.
  return preg_replace('/(\d)(?>lbs?|kgs?)(?=[A-Za-z0-9])/i', '$0 ', $text);
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
// Возвращает структурные метки (не текст), чтобы список можно было отрисовать
// на любом языке позже, без повторного разбора документа — см. missingFieldsText().
function missingFields(array $d) {
  $miss = array();
  if (empty($d['load_id']))   $miss[] = array('field' => 'load_id');
  if (empty($d['rate']))      $miss[] = array('field' => 'rate');
  if (empty($d['weight']))    $miss[] = array('field' => 'weight');
  if (empty($d['commodity'])) $miss[] = array('field' => 'commodity');
  $i = 0;
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    $i++;
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    if (empty($s['name']) && empty($s['address_lines'])) {
      $miss[] = array('field' => 'address', 'type' => $type, 'n' => $i);
    } elseif (!preg_match('/\b[A-Z]{2}\b[ ,]+\d{5}/', implode(' ', (array)(isset($s['address_lines']) ? $s['address_lines'] : array())))) {
      // без «CITY ST ZIP» водителю адрес бесполезен — предупреждаем явно
      $miss[] = array('field' => 'citystate', 'type' => $type, 'n' => $i);
    }
    if (empty($s['time'])) $miss[] = array('field' => 'time', 'type' => $type, 'n' => $i);
    if (empty($s['refs'])) $miss[] = array('field' => 'refs', 'type' => $type, 'n' => $i);
  }
  return $miss;
}

// Превращает структурные метки missingFields() в читаемый список на нужном языке.
function missingFieldsText(array $miss, $lang = 'ru') {
  $labels = $lang === 'en'
    ? array('load_id' => 'load number', 'rate' => 'rate', 'weight' => 'weight', 'commodity' => 'commodity',
            'address' => 'address', 'citystate' => 'city and zip', 'time' => 'time', 'refs' => 'reference numbers')
    : array('load_id' => 'номер загрузки', 'rate' => 'ставка', 'weight' => 'вес', 'commodity' => 'груз',
            'address' => 'адрес', 'citystate' => 'город и индекс', 'time' => 'время', 'refs' => 'реф-номера');
  $stopWord = $lang === 'en'
    ? array('pickup' => 'pickup', 'delivery' => 'delivery')
    : array('pickup' => 'погрузка', 'delivery' => 'доставка');
  $out = array();
  foreach ($miss as $m) {
    $label = isset($labels[$m['field']]) ? $labels[$m['field']] : $m['field'];
    $out[] = isset($m['type']) ? $label . ' (' . $stopWord[$m['type']] . ' #' . $m['n'] . ')' : $label;
  }
  return $out;
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

function authWord($code, $lang = 'ru') {
  if ($lang === 'en') {
    if ($code === 'A') return 'active';
    if ($code === 'I') return 'inactive';
    if ($code === 'N') return 'no';
    return 'unknown';
  }
  if ($code === 'A') return 'активно';
  if ($code === 'I') return 'неактивно';
  if ($code === 'N') return 'нет';
  return 'неизвестно';
}

// $kind: mc | dot | broker (broker = сперва MC, затем DOT — диспетчер обычно
// не знает, какой номер ему прислали).
// @return array{0:?array,1:string} [сырая запись FMCSA|null, код ошибки '' | 'nokey' | 'notfound']
function fetchBrokerRecord($kind, $number) {
  $key = @trim(file_get_contents(__DIR__ . '/../../fmcsa.key'));
  if ($key === '' || $key === false) return array(null, 'nokey');

  $rec = null;
  if ($kind === 'mc' || $kind === 'broker') {
    $rec = unwrapCarrier(fmcsaGet('carriers/docket-number/' . $number, $key));
  }
  if ($rec === null && ($kind === 'dot' || $kind === 'broker')) {
    $rec = unwrapCarrier(fmcsaGet('carriers/' . $number, $key));
  }
  return array($rec, $rec === null ? 'notfound' : '');
}

// Только форматирование — данные уже получены fetchBrokerRecord(). Разделено,
// чтобы переключение языка не дёргало FMCSA повторно: карточка та же, слова другие.
function formatBrokerReport($rec, $kind, $number, $lang = 'ru') {
  $name = isset($rec['legalName']) ? $rec['legalName'] : '—';
  $dba  = !empty($rec['dbaName']) ? $rec['dbaName'] : null;
  $dot  = isset($rec['dotNumber']) ? $rec['dotNumber'] : '—';
  $L = array();
  // Первым делом — что это НЕ проверяет. FMCSA не знает, платит ли брокер вовремя;
  // это отдельная база у каждой факторинговой компании, и её нужно смотреть отдельно.
  $L[] = $lang === 'en'
    ? '⚠️ This is an FMCSA legal-status check — it does NOT verify creditworthiness '
      . 'and does NOT replace factoring. Be sure to also check this MC/DOT in your '
      . 'factoring company\'s own portal before taking the load.'
    : '⚠️ Это проверка юридического статуса по FMCSA — она НЕ проверяет '
      . 'платёжеспособность и НЕ заменяет факторинг. Обязательно проверьте этот '
      . 'MC/DOT ещё и в личном кабинете вашей факторинговой компании перед тем как брать груз.';
  $L[] = '';
  $L[] = '🔎 FMCSA';
  $L[] = '';
  $L[] = $name . ($dba !== null ? ' (DBA ' . $dba . ')' : '');
  $L[] = 'DOT ' . $dot . ($kind !== 'dot' ? ' · MC ' . $number : '');
  $L[] = '';
  $L[] = $lang === 'en' ? 'Criteria checked:' : 'Критерии проверки:';

  // Каждая строка ниже — конкретный официальный критерий: галочка стоит, только
  // если по нему всё чисто. Пропускаем поле целиком, если FMCSA его не вернул
  // (например, у чистого перевозчика без брокерской авторити просто нет этого статуса).
  $allowed = isset($rec['allowedToOperate']) ? $rec['allowedToOperate'] : null;
  $allowedWord = $lang === 'en'
    ? ($allowed === 'Y' ? 'YES' : ($allowed === 'N' ? 'NO' : 'unknown'))
    : ($allowed === 'Y' ? 'ДА' : ($allowed === 'N' ? 'НЕТ' : 'неизвестно'));
  $L[] = mark($allowed === 'Y') . ' ' . ($lang === 'en' ? 'Allowed to operate' : 'Право работать') . ': ' . $allowedWord;

  if (isset($rec['brokerAuthorityStatus'])) {
    $ba = $rec['brokerAuthorityStatus'];
    $L[] = mark($ba === 'A') . ' ' . ($lang === 'en' ? 'Broker authority' : 'Брокерская авторити') . ': ' . authWord($ba, $lang);
  }

  // bondInsuranceOnFile — сумма в ТЫСЯЧАХ долларов, а не флаг Y/N: «75» = бонд
  // BMC-84 на $75 000. В приложении на этом уже обжигались.
  if (isset($rec['bondInsuranceOnFile']) && $rec['bondInsuranceOnFile'] !== '') {
    $bond = preg_replace('/\D/', '', (string)$rec['bondInsuranceOnFile']);
    $hasBond = $bond !== '' && $bond !== '0';
    $noWord = $lang === 'en' ? 'no' : 'нет';
    $L[] = mark($hasBond) . ' BMC-84 ' . ($lang === 'en' ? 'bond' : 'бонд') . ': ' . ($hasBond ? '$' . number_format((float)$bond * 1000, 0, '.', ',') : $noWord);
  }

  // Common/Contract authority — статус перевозчика, не брокера; красным флагом не
  // считаем, показываем справочно, без галочки.
  if (isset($rec['commonAuthorityStatus']))   $L[] = 'Common authority: ' . authWord($rec['commonAuthorityStatus'], $lang);
  if (isset($rec['contractAuthorityStatus'])) $L[] = 'Contract authority: ' . authWord($rec['contractAuthorityStatus'], $lang);
  if (!empty($rec['safetyRating'])) $L[] = 'Safety rating: ' . $rec['safetyRating'];
  $city = isset($rec['phyCity']) ? $rec['phyCity'] : '';
  $st   = isset($rec['phyState']) ? $rec['phyState'] : '';
  if ($city !== '' || $st !== '') $L[] = ($lang === 'en' ? 'Address' : 'Адрес') . ': ' . trim($city . ', ' . $st, ' ,');
  $L[] = '';
  $L[] = $lang === 'en' ? 'Source: FMCSA QCMobile, official data.' : 'Источник: FMCSA QCMobile, данные официальные.';
  return implode("\n", $L);
}

// Точка входа для /mc, /dot, /broker — тянет данные и сразу форматирует.
// Используется там, где переключение языка потом не нужно (первый ответ).
function brokerReport($kind, $number, $lang = 'ru') {
  list($rec, $err) = fetchBrokerRecord($kind, $number);
  if ($err === 'nokey') {
    return $lang === 'en'
      ? "Broker check is off — needs a free FMCSA key.\n\n"
        . "Get one at mobile.fmcsa.dot.gov/QCDevsite (sign in via Login.gov) "
        . "and put it on the server as fmcsa.key next to the other keys. "
        . "The check will work right away after that."
      : "Проверка брокера выключена — нужен бесплатный ключ FMCSA.\n\n"
        . "Заведите его на mobile.fmcsa.dot.gov/QCDevsite (вход через Login.gov) "
        . "и положите на сервер в файл fmcsa.key рядом с остальными ключами. "
        . "После этого проверка заработает сразу.";
  }
  if ($err === 'notfound') {
    return $lang === 'en'
      ? "Couldn't find a carrier under number " . $number . ".\nCheck the number — MC and DOT are different, a broker usually has both."
      : "Не нашёл перевозчика по номеру " . $number . ".\nПроверьте номер: MC и DOT — разные, у брокера обычно есть оба.";
  }
  return formatBrokerReport($rec, $kind, $number, $lang);
}

function mark($ok) { return $ok ? '✅' : '⚠️'; }

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

// Та же ссылка, но из плоской структуры груза со скриншота (photoExtractLoad) —
// там нет стопов, только origin/destination и время текстом. Поля, которых
// у скриншота в принципе не бывает (точный адрес склада, дата отдельно от
// времени), просто не заполняются — приложение и на этом соберёт разбор.
function photoAppLink(array $d) {
  $num = function ($v) { $v = preg_replace('/[^0-9.]/', '', (string)$v); return $v === '' ? null : $v; };
  $p = array();
  $rate = $num(isset($d['rate']) ? $d['rate'] : '');
  $miles = $num(isset($d['miles']) ? $d['miles'] : '');
  $dh = $num(isset($d['deadhead']) ? $d['deadhead'] : '');
  if ($rate !== null)  $p['rate']  = $rate;
  if ($miles !== null) $p['miles'] = $miles;
  if ($dh !== null)    $p['dh']    = $dh;
  // Рыночная ставка биржи иногда сумма рейса, иногда уже $/милю — как и в аналитике.
  $spot = $num(isset($d['spot_rate']) ? $d['spot_rate'] : '');
  if ($spot !== null) {
    $spotRpm = $spot < 20 ? $spot : ($miles !== null && (float)$miles > 0 ? $spot / (float)$miles : null);
    if ($spotRpm !== null) $p['spot'] = round($spotRpm, 2);
  }
  if (!empty($d['origin']))      $p['origin'] = $d['origin'];
  if (!empty($d['destination'])) $p['dest']   = $d['destination'];
  if (!empty($d['broker']))      $p['bn']     = $d['broker'];
  if (!empty($d['mc']))          $p['mc']     = $d['mc'];
  if (!empty($d['email']))       $p['email']  = $d['email'];
  if (!empty($d['phone']))       $p['phone']  = $d['phone'];
  if (!empty($d['reference']))   $p['ref']    = $d['reference'];
  if (!empty($d['pickup']))      $p['pt']     = $d['pickup'];
  if (!empty($d['delivery']))    $p['dt']     = $d['delivery'];
  if (!empty($d['weight']))      $p['wt']     = $d['weight'];
  if (!empty($d['commodity']))   $p['cm']     = $d['commodity'];
  if (!empty($d['equipment']))   $p['eq']     = $d['equipment'];
  if (!empty($d['notes']))       $p['notes']  = $d['notes'];
  if (!$p) return null;
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

function reply($token, $chatId, $text, $keyboard = null) {
  $p = array('chat_id' => $chatId, 'text' => $text, 'disable_web_page_preview' => true);
  if ($keyboard !== null) $p['reply_markup'] = json_encode(array('inline_keyboard' => $keyboard));
  return tgApi($token, 'sendMessage', $p);
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
  $st['load'] = $load;
  stateSet($chatId, $st);
  $lang = curLang($st);

  // Карточка + кнопки. Аналитика и письмо приходят по нажатию, а не сразу
  // тремя простынями подряд: обычно нужна одна из них.
  $tail = $lang === 'en' ? "\n\n👇 What to do with this load:" : "\n\n👇 Что сделать с этим грузом:";
  reply($token, $chatId, photoLoadCard($load, $lang) . $tail, photoKeyboard($load, $lang));
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
  $lang = curLang($st);
  reply($token, $chatId, draftMeta($st['draft'], $lang, $lang === 'en' ? '📤 Ready to send: /send' : '📤 Готово к отправке: /send'));
  reply($token, $chatId, draftAsText($st['draft']));
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

  // Три отдельных сообщения: инструкция, ЧИСТЫЙ текст письма для копирования,
  // ссылка на открытие в почте — ничего не перемешано в одном сообщении.
  reply($token, $chatId,
    "📤 Письмо готово к отправке — отправляете вы, из своей почты.\n\n"
    . "Кому: " . ($hasTo ? $to : '(адрес брокера не найден — впишите вручную)') . "\n\n"
    . "Следующим сообщением — готовый текст, скопируйте его целиком. Либо нажмите ссылку ниже — "
    . "письмо откроется в вашей почте уже заполненным.\n\n"
    . "Так брокер видит адрес вашей компании, а не наш, и ответ придёт прямо вам.");
  reply($token, $chatId, draftAsText($draft));
  // mailto в inline-кнопке Telegram не пропускает — отдаём ссылкой в тексте
  reply($token, $chatId, "Открыть в почте:\n" . $mailto);
}
