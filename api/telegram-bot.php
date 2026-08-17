<?php
// @Dispatch4You_Bot webhook — принимает Rate Confirmation PDF в Telegram,
// парсит через Groq и отвечает карточкой «драйвер-инфо».
//
// Секреты (оба лежат на уровень ВЫШЕ public_html, не в вебе, не в git):
//   ~/domains/dispatch4you.com/tg-bot.key   (одна строка: токен из BotFather)
//   ~/domains/dispatch4you.com/groq.key     (уже существует — общий с api/groq.php)
//
// Первичная настройка (один раз, после появления tg-bot.key на сервере):
//   открыть в браузере ?setup=1&k=<ключ> — скрипт сам вызовет setWebhook с
//   секретом и выведет ответ Telegram. Готовую ссылку с ключом даёт команда
//   /diag в чате с ботом (только владельцу из tg-admin.txt).
//   Если бот молчит и /diag не доходит — ничего делать не нужно: сторож
//   tg-guard.php по крону вернёт вебхук сам в течение 10 минут.
//
// Подлинность запросов Telegram проверяется заголовком
// X-Telegram-Bot-Api-Secret-Token = sha256(токен) — задаётся в setup.
// ponytail: сканы без текстового слоя не поддерживаем (нужен OCR/vision) —
// бот честно просит текстовый PDF. Апгрейд: Groq vision по страницам-картинкам.

// Штамп сборки. Нужен не для красоты: rsync -c не перезаливает файл с тем же
// содержимым и не меняет ему время правки, поэтому opcache может держать
// старую скомпилированную копию сколько угодно. Менять эту строку — самый
// дешёвый способ заставить сервер перечитать файл.
const BUILD = '2026-08-17-2';

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

// Тексты для человека собираются функциями helpStart()/helpFull()/menuText()
// ниже, а не лежат готовыми константами: пункты про письмо брокеру должны
// исчезать вместе с самой функцией (MAIL_ENABLED), иначе справка обещает
// кнопки, которых в боте нет.

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

// Рубильник на всё, что связано с письмом брокеру (кнопки, /edit, /send).
// Выключали после двух аварий: бот отправлял письмо сам, и /send зациклился.
// Обе устранены — отправки в коде больше нет вообще (grep mail(), ни одного
// вызова), бот только готовит текст, отправляет человек из своей почты; цикл
// починен в 1d82333c. Рубильник оставлен на случай следующей аварии.
const MAIL_ENABLED = true;

// Версия списка команд в меню Telegram. Меню живёт на серверах Telegram и само
// не обновляется — раньше его применял только ?setup=1, поэтому в боте месяцами
// висели команды, которых в коде уже не было. Теперь бот сверяет версию сам:
// поменял список — увеличь число, и меню обновится у всех при первом сообщении.
const COMMANDS_VERSION = 6;

// Предохранитель на исходящие сообщения: больше стольких в минуту в один чат
// бот не отправит НИ ПРИ КАКИХ обстоятельствах. Обычный сценарий — 2–3
// сообщения на документ, так что запас десятикратный.
const MAX_OUT_PER_MIN = 20;

// Сколько страниц альбома берём в один разбор. Рейт-коны бывают и длиннее
// шести листов, а лишний запас тут ничего не стоит: снимки из Telegram мелкие,
// а у Gemini на запрос 20 МБ. Константы этого файла ОБЯЗАНЫ стоять здесь,
// вверху: top-level const в PHP исполняется по достижении строки, а ветка с
// фото завершается через exit задолго до середины файла — объявленная там
// константа не существует к моменту вызова, и обработчик падает.
const GROUP_MAX_PAGES = 12;

// Фатальная ошибка в обработчике = HTTP 500 = Telegram считает доставку
// неудачной и присылает ТОТ ЖЕ апдейт снова, по кругу. Один такой случай
// (/send вызывал draftAsText() из load-photo.php, который в текстовой ветке
// не подключался) дал 648 одинаковых сообщений подряд. Поэтому: причину — в
// лог, наружу — 200, чтобы повторной доставки не было ни при каком сбое.
register_shutdown_function(function () {
  $e = error_get_last();
  if ($e === null) return;
  if (!in_array($e['type'], array(E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR), true)) return;
  $where = $e['file'] . ':' . $e['line'];
  @file_put_contents(__DIR__ . '/../../tg-bot.log',
    date('c') . " [FATAL] " . $e['message'] . ' @ ' . $where . "\n", FILE_APPEND);
  if (!headers_sent()) http_response_code(200);

  // Тревога админу. В tg-bot.log никто не заглядывает — про поломку /send
  // владелец узнал по 648 одинаковым сообщениям в своём чате спустя часы.
  // Не чаще раза в 15 минут на одну и ту же поломку: падает обычно на каждом
  // сообщении подряд, и сам алерт превратился бы в тот же спам.
  $admin = @trim(file_get_contents(__DIR__ . '/../../tg-admin.txt'));
  $tok   = @trim(file_get_contents(__DIR__ . '/../../tg-bot.key'));
  if ($admin === '' || $admin === false || $tok === '' || $tok === false) return;
  $dir = __DIR__ . '/../../tg-state';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);
  $stamp = $dir . '/alert-' . md5($e['message'] . $where) . '.stamp';
  if (@filemtime($stamp) > time() - 900) return;
  @touch($stamp);
  $ch = curl_init('https://api.telegram.org/bot' . $tok . '/sendMessage');
  curl_setopt_array($ch, array(
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
    CURLOPT_POSTFIELDS => http_build_query(array(
      'chat_id' => $admin,
      'text' => "🔥 Бот упал на обработке сообщения\n\n" . $e['message'] . "\n\n" . $where
        . "\n\nTelegram получил 200, так что повторной доставки и спама не будет — "
        . "но команда до конца не отработала.",
    )),
  ));
  @curl_exec($ch); @curl_close($ch);
});

// ── Служебные GET — только со своим ключом ──────────────────────────
// Секрет Telegram проверяется НИЖЕ и только для POST, а диагностика — обычные
// ссылки, которые открываются в браузере. Пока они были без пароля, посторонний
// мог: снести очередь входящих (?setup переставляет вебхук с drop_pending_updates),
// сжечь суточную квоту Gemini (?geminicheck — 20 запросов в сутки на модель) и
// прочитать пути на сервере из текста падений (?lasterr). Адрес угадывается, а
// список самих ссылок лежит в этом же файле в репозитории.
// Ключ считается из токена бота: отдельный секрет заводить незачем, а при
// отзыве токена старые ссылки протухают сами. Получить готовые — команда /diag
// в чате с ботом (отвечает только владельцу из tg-admin.txt).
// Стоит ДО require: если библиотека не подключится, фатал случится раньше, и
// диагностика должна пережить это — ровно ради этого ?lasterr и стоит первым.
function diagKey($token) { return substr(hash('sha256', 'diag' . $token), 0, 24); }

// Токена нет — не пускаем никого: молчаливое «открыто всем» опаснее отказа.
function diagGate() {
  $t = @trim(file_get_contents(__DIR__ . '/../../tg-bot.key'));
  if ($t !== '' && $t !== false && isset($_GET['k']) && hash_equals(diagKey($t), (string)$_GET['k'])) return;
  http_response_code(403);
  header('Content-Type: text/plain; charset=utf-8');
  echo "forbidden\n";
  exit;
}

// Один список на все служебные ветки — заводишь новую, дописываешь сюда.
foreach (array('lasterr', 'diag', 'fmcsacheck', 'fmcsaname', 'geminicheck', 'webhookinfo', 'setup') as $q) {
  if (isset($_GET[$q])) { diagGate(); break; }
}

// ── Последние падения из tg-bot.log ─────────────────────────────────
// Стоит ДО require и намеренно: когда библиотека не подключается, фатал
// случается прямо на этой строке, и ВСЕ остальные диагностики (?diag,
// ?geminicheck) умирают вместе с ней — снаружи это выглядит как пустой
// ответ 200 на любой запрос, без единой подсказки о причине.
// Наружу отдаём только строки [FATAL]: обычные записи лога содержат имена
// присланных файлов, а это уже чужие данные.
if (isset($_GET['lasterr'])) {
  header('Content-Type: text/plain; charset=utf-8');
  $lp = realpath(__DIR__ . '/../..') . '/tg-bot.log';
  $txt = @file_get_contents(__DIR__ . '/../../tg-bot.log');
  if ($txt === false) { echo "tg-bot.log не читается\nискали тут: $lp\n"; exit; }
  $fatal = array_filter(explode("\n", $txt), function ($l) { return strpos($l, '[FATAL]') !== false; });
  echo $fatal ? implode("\n", array_slice($fatal, -10)) . "\n" : "записей [FATAL] нет\n";
  exit;
}

// Сводки, кнопки под разбором и обработка нажатий
require_once __DIR__ . '/lib/tg-actions.php';
// Черновик письма, карточка и аналитика по скриншоту. Подключаем ОДИН РАЗ здесь,
// а не по месту вызова: ленивые require разъехались с вызовами (/send и /edit
// звали draftAsText/draftMeta без подключённого файла) — это и был тот самый
// цикл повторной доставки. Файл дешёвый, грузить его всегда безопаснее.
require_once __DIR__ . '/lib/load-photo.php';
// Антифрод по брокеру и проверка рейса по часам. Чистые функции, никуда не
// ходят — подключаем рядом с остальными по той же причине.
require_once __DIR__ . '/lib/load-checks.php';

$token = @trim(file_get_contents(__DIR__ . '/../../tg-bot.key'));
if ($token === '' || $token === false) { http_response_code(500); echo 'tg-bot.key missing'; exit; }
$secret = hash('sha256', $token);

// ── Диагностика окружения (какие утилиты доступны для PDF) ──────────
if (isset($_GET['diag'])) {
  header('Content-Type: text/plain; charset=utf-8');
  // Первой строкой — версия сборки: единственный способ убедиться, что деплой
  // доехал и opcache перечитал файл. Без неё «задеплоено» приходилось принимать
  // на веру, а именно на этом бот один раз молча стоял со старым байткодом.
  echo "build: " . BUILD . "\n";
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

// ── Живой ли ключ FMCSA (проверка брокера). Ключ наружу не отдаём ──
if (isset($_GET['fmcsacheck'])) {
  header('Content-Type: text/plain; charset=utf-8');
  $kp = realpath(__DIR__ . '/../..') . '/fmcsa.key';
  $key = @trim(file_get_contents(__DIR__ . '/../../fmcsa.key'));
  if ($key === '' || $key === false) { echo "fmcsa.key: не найден или пуст\nискали тут: $kp\n"; exit; }
  echo "fmcsa.key: есть\n";
  // Номер можно передать: ?fmcsacheck=249072. Без него — дефолтный, лишь бы
  // убедиться, что ключ жив. Раньше тут стоял 115789 с подписью «брокер TQL»,
  // а FMCSA отдаёт по нему перевозчика 1983 года — на такой заглушке брокерская
  // ветка отчёта не проверялась вообще.
  $mc = isset($_GET['fmcsacheck']) ? preg_replace('/\D/', '', (string)$_GET['fmcsacheck']) : '';
  if ($mc === '') $mc = '115789';
  // ?keys=1 — какие поля вообще приходят от QCMobile. Пригодилось, когда телефон
  // не показывался: гадать о названиях полей по документации дороже, чем спросить.
  if (!empty($_GET['keys'])) {
    list($rec, ) = fetchBrokerRecord('broker', $mc);
    echo is_array($rec) ? implode("\n", array_keys($rec)) . "\n" : "запись не найдена\n";
    exit;
  }
  echo "ответ: " . brokerReport('broker', $mc) . "\n";
  exit;
}

// ── Поиск брокера по названию: ?fmcsaname=Molo Solutions ────────────
// Нужен потому, что MC в рейт-конах печатают не всегда, и вся сверка держится
// на этом поиске. Проверять его вслепую нельзя: FMCSA отдаёт по имени всех
// похожих, и важно видеть, находится ли КОНКРЕТНЫЙ брокер однозначно.
if (isset($_GET['fmcsaname'])) {
  header('Content-Type: text/plain; charset=utf-8');
  $n = trim((string)$_GET['fmcsaname']);
  $rec = $n === '' ? null : fetchBrokerByName($n);
  if (!is_array($rec)) {
    echo "«$n»: однозначного совпадения нет\n";
    echo "(либо не найдено, либо тёзок несколько — в обоих случаях бот молчит)\n";
    exit;
  }
  echo "«$n» → " . $rec['legalName'] . "\n";
  echo "DOT " . (isset($rec['dotNumber']) ? $rec['dotNumber'] : '—') . "\n\n";
  $fl = brokerFraudFlags(array('broker' => $n), $rec);
  echo $fl ? fraudText($fl) . "\n" : "флагов нет\n";
  exit;
}

// ── Живой ли ключ Gemini (разбор скриншотов). Ключ наружу не отдаём ──
if (isset($_GET['geminicheck'])) {
  header('Content-Type: text/plain; charset=utf-8');
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
  $out['profile'] = applyProfile($token, true);
  header('Content-Type: application/json');
  echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  exit;
}

// ── Webhook: только POST от Telegram с верным секретом ──────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo 'POST only'; exit; }
$hdr = isset($_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN']) ? $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] : '';
if (!hash_equals($secret, $hdr)) { http_response_code(403); echo 'forbidden'; exit; }

$update = json_decode(file_get_contents('php://input'), true);

// ── Повторная доставка: обрабатываем каждый апдейт ровно один раз ────
// Telegram гарантирует уникальность update_id и переприсылает апдейт при любой
// неудачной доставке — 500, таймаут, обрыв, а после простоя ещё и выгружает
// всю накопленную очередь разом. Без этой проверки каждая повторная доставка
// заново отрабатывает команду и заново шлёт все сообщения: именно так и
// набежали сотни одинаковых сообщений подряд. Убрать причину падения мало —
// сам механизм повтора надо обезвредить, потому что причина в следующий раз
// будет другая.
$updateId = isset($update['update_id']) ? (int)$update['update_id'] : 0;
if ($updateId > 0 && updateAlreadySeen($updateId)) { echo 'ok (dup)'; exit; }

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
  // Альбом (несколько страниц одним отправлением) — собираем в ОДИН разбор.
  // Без этого каждая страница разбиралась отдельно и последняя затирала
  // предыдущие: текст водителю выходил по одной странице из двух.
  if (!empty($msg['media_group_id'])) {
    handlePhotoGroup($token, $chatId, (string)$msg['media_group_id'], $fileId, $mime);
    exit;
  }
  handlePhotoLoad($token, $chatId, $fileId, $mime);
  exit;
}

// /help, /id, /start и любой текст без файла
if (!isset($msg['document'])) {
  // Отвечаем Telegram «ок» ДО обработки: /mc ходит в FMCSA, /send собирает
  // письмо — если что-то из этого упадёт или затянется, Telegram не должен
  // считать доставку неудачной и присылать ту же команду по кругу.
  finishRequest();
  ensureProfile($token); // меню и описания Telegram подтянет само
  $text = isset($msg['text']) ? trim($msg['text']) : '';
  if (stripos($text, '/id') === 0) {
    // нужен, чтобы прописать получателя тревог сторожа в tg-admin.txt
    reply($token, $chatId, "Ваш chat id: " . $chatId);
  } elseif (stripos($text, '/diag') === 0) {
    // Служебные ссылки владельцу: сам он ключ не посчитает, а без ключа
    // диагностика теперь не открывается. Чужим команду не показываем вовсе —
    // отвечаем обычной справкой, как будто её нет.
    $admin = @trim(file_get_contents(__DIR__ . '/../../tg-admin.txt'));
    if ($admin === '' || $admin === false || (string)$chatId !== (string)$admin) {
      reply($token, $chatId, helpStart($introState));
    } else {
      $k = diagKey($token);
      reply($token, $chatId,
        "🔧 Служебные ссылки. Ключ считается из токена бота — сменишь токен, "
        . "ссылки станут другими, старые перестанут работать.\n\n"
        . "Живы ли расширения и утилиты:\n" . SELF_URL . "?diag=1&k=" . $k . "\n\n"
        . "Последние падения:\n" . SELF_URL . "?lasterr=1&k=" . $k . "\n\n"
        . "Что Telegram думает о вебхуке:\n" . SELF_URL . "?webhookinfo=1&k=" . $k . "\n\n"
        . "Жив ли ключ Gemini (тратит 1 запрос из 20 в сутки):\n" . SELF_URL . "?geminicheck=1&k=" . $k . "\n\n"
        . "Жив ли ключ FMCSA:\n" . SELF_URL . "?fmcsacheck=115789&k=" . $k . "\n\n"
        . "Найдётся ли брокер по названию (подставь своё):\n" . SELF_URL . "?fmcsaname=Molo+Solutions&k=" . $k . "\n\n"
        . "Переустановить вебхук (сотрёт необработанную очередь):\n" . SELF_URL . "?setup=1&k=" . $k);
    }
  } elseif (preg_match('~^/carrier\b\s*(.*)$~is', $text, $cm)) {
    handleCarrier($token, $chatId, trim($cm[1]));
  } elseif (preg_match('~^/edit\b\s*(.*)$~is', $text, $em)) {
    if (MAIL_ENABLED) handleEdit($token, $chatId, trim($em[1]));
    else reply($token, $chatId, mailOffText(curLang($introState)));
  } elseif (preg_match('~^/send\b\s*(.*)$~i', $text, $sm)) {
    if (MAIL_ENABLED) handleSend($token, $chatId, trim($sm[1]));
    else reply($token, $chatId, mailOffText(curLang($introState)));
  } elseif (preg_match('~^/(broker|mc|dot)\b\s*(.*)$~i', $text, $bm)) {
    $kind = strtolower($bm[1]);
    $numArg = preg_replace('/\D/', '', $bm[2]);
    if ($numArg === '') {
      // Сюда попадают из меню — значит это и есть экран «как проверить брокера».
      // Про отмену MC говорим прямо: иначе человек ищет номер, которого у
      // брокера физически нет, и решает, что бот не работает.
      $lang = curLang($introState);
      reply($token, $chatId, $lang === 'en'
        ? "🔎 Broker check via FMCSA\n\n"
          . "Send the number right after the command — either MC or DOT works:\n"
          . "/broker 115789\n\n"
          . "You get the legal name, authority status, BMC-84 bond and address, "
          . "straight from the official source.\n\n"
          . "⚠️ FMCSA stopped issuing MC numbers on 1 October 2025 — brokers registered "
          . "after that have a DOT number only."
        : "🔎 Проверка брокера по FMCSA\n\n"
          . "Пришлите номер сразу после команды — подойдёт любой, MC или DOT:\n"
          . "/broker 115789\n\n"
          . "Покажу название, право работать, авторити, бонд BMC-84 и адрес — "
          . "из официального источника.\n\n"
          . "⚠️ MC-номера FMCSA не выдаёт с 1 октября 2025 — у брокеров, "
          . "зарегистрированных позже, есть только DOT.");
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
    reply($token, $chatId, stripos($text, '/help') === 0 ? helpFull() : helpStart($introState));
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

// Текст достаём ПО СТРАНИЦАМ, а не одним куском. Рейт-кон часто на 4-6
// страницах: погрузка на первой, доставка и реф-номера на третьей-пятой,
// условия в конце. Без отметок о границах страниц модель склеивает конец одной
// страницы с началом другой — так у стопа появлялось чужое время или чужой
// реф-номер, и заметить это в готовой карточке нельзя.
$pageTexts = array();
try {
  $parser = new \Smalot\PdfParser\Parser();
  $parsed = $parser->parseContent($pdf);
  try {
    foreach ($parsed->getPages() as $pg) $pageTexts[] = (string)$pg->getText();
  } catch (\Throwable $e) {
    $pageTexts = array();   // дерево страниц не читается — возьмём документ целиком
  }
  if (!$pageTexts) $pageTexts = array((string)$parsed->getText());
} catch (\Throwable $e) {
  $why = stripos($e->getMessage(), 'secured') !== false
    ? 'PDF защищён нестандартным способом'
    : 'файл повреждён или это не PDF';
  fail($token, $chatId, 'pdf parse: ' . $e->getMessage(), $why); exit;
}

// Страницы БЕЗ текстового слоя. Главная беда смешанного документа: первая
// страница из TMS (текст), остальные — сканы подписанных листов. Общего текста
// при этом набирается много, прежний порог «меньше 100 символов на документ»
// не срабатывал, и страницы-картинки пропадали молча вместе со всеми стопами,
// реф-номерами и условиями, которые на них были.
$pagesTotal = count($pageTexts);
$thinPages = array();
foreach ($pageTexts as $i => $t) {
  if (mb_strlen(trim(preg_replace('/\s+/u', ' ', $t))) < 80) $thinPages[] = $i + 1;
}
$marked = array();
foreach ($pageTexts as $i => $t) {
  $marked[] = ($pagesTotal > 1 ? '=== PAGE ' . ($i + 1) . ' OF ' . $pagesTotal . " ===\n" : '') . $t;
}
$text = trim(preg_replace('/[ \t]+/', ' ', implode("\n\n", $marked)));
$text = fixGluedUnits($text);

// Читать нечего, или часть страниц — картинки: отправляем файл целиком в
// Gemini, он видит PDF как изображение и читает ВСЕ страницы. Рендерить
// страницы самим нечем — на хостинге нет ни Imagick, ни ghostscript, а
// shell_exec отключён.
$scanned = false;
$unreadPages = array();
if (mb_strlen($text) < 100 || $thinPages) {
  list($scanLoad, $scanErr) = geminiFile(rcPrompt(), $pdf, 'application/pdf');
  if (is_array($scanLoad) && !empty($scanLoad['stops'])) {
    $scanned = true;
    $load = $scanLoad;
  } elseif (mb_strlen($text) < 100) {
    // Текстового слоя нет вовсе, и картинкой прочитать не удалось — сдаёмся честно.
    clearProgress($token, $chatId);
    reply($token, $chatId, HELP_SCAN);
    @file_put_contents(__DIR__ . '/../../tg-bot.log',
      date('c') . ' scanned pdf failed: ' . mb_substr((string)$scanErr, 0, 200) . "\n", FILE_APPEND);
    echo 'ok'; exit;
  } else {
    // Текст есть, но часть страниц прочитать не вышло. Разбираем что есть и
    // говорим прямо, каких страниц не хватает: молчаливая потеря страницы
    // выглядит как полный разбор, а это хуже честного предупреждения.
    $unreadPages = $thinPages;
    @file_put_contents(__DIR__ . '/../../tg-bot.log',
      date('c') . ' pages without text layer: ' . implode(',', $thinPages)
      . ' of ' . $pagesTotal . '; vision failed: ' . mb_substr((string)$scanErr, 0, 120) . "\n", FILE_APPEND);
  }
}
// Разбирает Gemini, а у него контекст на порядки больше — режем только для
// защиты от аномалий (200-страничный скан вместо рейт-кона), а не потому,
// что модель не потянет. Раньше стояло 14000, и документы Trinity (20-22 тыс.)
// теряли хвост: сегодня повезло, что данные были на первой странице.
if (mb_strlen($text) > 200000) $text = mb_substr($text, 0, 200000);

// ── Текст → структурированный JSON ─────────────────────────────────
$sys = rcPrompt();
$gemErr = '';

// Скан уже разобран по картинке выше — второй раз не гоняем: это лишний
// запрос из дневной квоты и риск затереть удачный результат.
// Основной разборщик — Gemini: документ уходит целиком, лимиты позволяют
// пользоваться ботом больше чем одному человеку в минуту.
if (!$scanned) list($load, $gemErr) = geminiStructure($sys, $text);

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
// Сверка брокера идёт ДО списка недостающего: найдя его в FMCSA по имени, она
// дописывает в разбор DOT — и жаловаться на пропавший MC уже не на что.
// Свой MC берём из подписи /carrier, чтобы не выдать диспетчеру отчёт о его же
// компании: в шапке рейт-кона его номер стоит рядом с брокерским.
$stPre = stateGet($chatId);
$fraud = rcFraud($load, ownMcFromSignature(isset($stPre['carrier']) ? $stPre['carrier'] : ''));
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
$st['rc_fraud'] = $fraud;
$st['last'] = 'rc'; // из чего собирать письмо, если /carrier придёт до кнопки
stateSet($chatId, $st);
$lang = curLang($st);

// Сводка + кнопки «что дальше». Полотно для водителя больше не вываливается
// сразу: его отдаём по кнопке, когда оно действительно нужно.
$warn = $unreadPages
  ? ($lang === 'en'
      ? "⚠️ No text layer on page(s) " . implode(', ', $unreadPages) . " of {$pagesTotal} — I could not read them. "
        . "If stops or reference numbers were printed there, check them by hand.\n\n"
      : "⚠️ Страницы без текстового слоя: " . implode(', ', $unreadPages) . " из {$pagesTotal} — прочитать их не удалось. "
        . "Если на них были стопы или реф-номера, проверьте вручную.\n\n")
  : '';
reply($token, $chatId, $warn . rcSummaryFull($load, $missing, $lang, $st['rc_fraud']), rcKeyboard($load, $lang));
echo 'ok';
exit;

// ── Язык интерфейса ──────────────────────────────────────────────────
// По умолчанию русский: до этой правки бот отвечал только на русском,
// и вся текущая аудитория — русскоязычные диспетчеры.
// Подробная инструкция. Раздел «работа с письмом» уходит целиком вместе с
// выключенным письмом — вместе со ссылками на /carrier, /edit и /send.
function helpFull() {
  $L = array(
    '📄 Что бот достаёт из рейт-кона:',
    '• номер загрузки (Load ID / PRO#)',
    '• адрес погрузки и адрес доставки полностью',
    '• дату и окно времени по каждому стопу',
    '• все реф-номера (PU, PO, BOL, Ref#)',
    '• ставку, груз, вес', '',
    'Несколько пикапов или доставок — каждый стоп отдельным блоком, по порядку.', '',
    '📷 Скриншот груза с лоуборда:',
    'Пришлите картинку карточки груза (DAT, Truckstop) или письма брокера — верну:',
    '• карточку груза: маршрут, даты, трейлер, вес, контакты',
    '• аналитику: ставка за милю, сравнение с ориентиром, топливо, на что смотреть',
  );
  if (MAIL_ENABLED) {
    $L[] = '• черновик письма брокеру';
    $L[] = '';
    $L[] = '✉️ Работа с письмом:';
    $L[] = '/carrier — задать подпись (компания, MC, телефон, ваш email)';
    $L[] = '/edit — прислать исправленный текст письма';
    $L[] = '/send — подготовить письмо к отправке (бот сам НЕ отправляет)';
  }
  $L[] = '';
  $L[] = '🔎 Проверка брокера по FMCSA:';
  $L[] = '/broker 115789 — подойдёт любой номер, MC или DOT';
  $L[] = 'Покажу название, право работать, авторити, бонд BMC-84 и адрес.';
  $L[] = 'MC-номера FMCSA не выдаёт с 01.10.2025 — у новых брокеров только DOT.';
  $L[] = 'Если точно знаете тип номера: /mc 115789 или /dot 2100420.';
  $L[] = '';
  $L[] = '⚠️ Требования к файлу:';
  $L[] = '• PDF с текстовым слоем — тот, что брокер прислал на почту';
  $L[] = '• не фото документа и не скан (там нет текста, бот его не прочитает)';
  $L[] = '• размер до 15 МБ';
  $L[] = '';
  $L[] = '❓ Если бот не смог разобрать:';
  $L[] = '1. Проверьте, что это PDF, а не фото';
  $L[] = '2. Попробуйте переслать оригинал письма от брокера';
  $L[] = '3. Напишите нам — разберёмся: dispatch4you.com';
  $L[] = '';
  $L[] = '🔒 Сам файл на сервере не хранится — только извлечённые данные загрузки.';
  $L[] = '';
  $L[] = '— — —';
  $L[] = 'Requirements: text-based PDF (not a photo or scan), up to 15 MB. '
       . 'The file itself is not stored, only the extracted load data.';
  $t = implode("\n", $L);
  if (!MAIL_ENABLED) $t .= "\n\n— — —\n" . mailOffText('ru');
  return $t;
}

// Собирается по кускам, а не берётся готовой строкой: пункты про письмо брокеру
// должны исчезать вместе с самой функцией. Раньше текст был константой, обещал
// «письмо брокеру — готовое, с возможностью правки», а внизу стояла пометка, что
// письмо отключено — человек читал два противоречащих утверждения подряд.
function helpStart(array $state) {
  $lang = (isset($state['lang']) && $state['lang'] === 'en') ? 'en' : 'ru';
  $L = array();
  if ($lang === 'en') {
    $L[] = "Dispatch4You — a dispatcher's working tool.";
    $L[] = "I read your load documents and prepare what you need to send next.";
    $L[] = '';
    $L[] = '📄 RATE CONFIRMATION (PDF)';
    $L[] = "Send the broker's file — you get a load summary, then buttons for:";
    $L[] = '• driver text — addresses, time windows, every reference number';
    if (MAIL_ENABLED) $L[] = '• broker email — ready to send, editable';
    $L[] = '• full breakdown with a route map and the numbers';
    $L[] = '';
    $L[] = '📷 LOAD BOARD SCREENSHOT (DAT, Truckstop)';
    $L[] = "Send a picture — I'll read it and calculate:";
    $L[] = '• rate per mile and what is left after fuel';
    $L[] = '• what to watch for: overweight, tarps, hazmat, missing contacts';
    if (MAIL_ENABLED) $L[] = '• a broker email for this load';
    $L[] = '';
    $L[] = '🔎 BROKER CHECK (FMCSA)';
    $L[] = '/broker 115789 — either number works, MC or DOT';
    $L[] = 'Authority status, bond on file (BMC-84), address — from the official source.';
    $L[] = '';
    $L[] = 'Requirements: a text-based PDF, up to 15 MB. The document is never stored — only the extracted load data.';
    $L[] = '';
    $L[] = '/menu — every section in one list';
    $L[] = '/help — full instructions';
    $L[] = '/language — change the language';
  } else {
    $L[] = 'Dispatch4You — рабочий инструмент диспетчера.';
    $L[] = 'Разбираю документы по грузу и готовлю всё, что нужно отправить дальше.';
    $L[] = '';
    $L[] = '📄 RATE CONFIRMATION (PDF)';
    $L[] = 'Пришлите файл от брокера — верну сводку по грузу, а по кнопкам:';
    $L[] = '• текст для водителя — адреса, окна времени, все реф-номера';
    if (MAIL_ENABLED) $L[] = '• письмо брокеру — готовое, с возможностью правки';
    $L[] = '• полный разбор с картой маршрута и расчётом';
    $L[] = '';
    $L[] = '📷 СКРИНШОТ ГРУЗА С ЛОУБОРДА (DAT, Truckstop)';
    $L[] = 'Пришлите картинку — разберу и посчитаю:';
    $L[] = '• ставку за милю и остаток после топлива';
    $L[] = '• на что смотреть: перевес, тенты, hazmat, отсутствие контактов';
    if (MAIL_ENABLED) $L[] = '• письмо брокеру по этому грузу';
    $L[] = '';
    $L[] = '🔎 ПРОВЕРКА БРОКЕРА (FMCSA)';
    $L[] = '/broker 115789 — подойдёт любой номер, MC или DOT';
    $L[] = 'Право работать, авторити, бонд BMC-84, адрес — из официального источника.';
    $L[] = '';
    $L[] = 'Требования: PDF с текстовым слоем до 15 МБ. Документ на сервере не хранится — только данные загрузки.';
    $L[] = '';
    $L[] = '/menu — все разделы одним списком';
    $L[] = '/help — подробная инструкция';
    $L[] = '/language — сменить язык бота';
  }
  $t = implode("\n", $L);
  if (!MAIL_ENABLED) $t .= "\n\n— — —\n" . mailOffText($lang);
  return $t;
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

// ?array, а не array: на PHP 8.4 неявно nullable-параметр — Deprecated в лог
// на каждое нажатие кнопки перевода.
function editMessage($token, $chatId, $messageId, $text, ?array $keyboard = null) {
  $p = array('chat_id' => $chatId, 'message_id' => $messageId, 'text' => $text, 'disable_web_page_preview' => true);
  if ($keyboard !== null) $p['reply_markup'] = json_encode(array('inline_keyboard' => $keyboard));
  return tgApi($token, 'editMessageText', $p);
}

// Разделы «по-человечески»: у Telegram нет заголовков-секций в самом меню команд
// (кнопка «Menu» показывает строго плоский список) — здесь то же самое разложено
// по группам текстом, /menu ссылается и в /start, и в описании бота.
// Два блока вместо пяти равнозначных разделов: бот управляется тем, что человек
// ПРИСЫЛАЕТ, а команды — вспомогательные. Раньше всё лежало одним плоским
// списком, где «пришлите PDF» и «/language» выглядели одинаково важными.
// Выключенное письмо не показываем разделом вовсе — только пометкой в конце:
// раздел, который не работает, путает сильнее, чем его отсутствие.
function menuText(array $state) {
  $en = isset($state['lang']) && $state['lang'] === 'en';
  $off = MAIL_ENABLED ? '' : "\n\n— — —\n" . mailOffText(curLang($state));
  if ($en) {
    $L = array(
      '📋 SECTIONS', '',
      'WHAT TO SEND ME', '',
      '📄 Rate Confirmation (PDF)',
      '     → load summary and action buttons', '',
      '📷 Load board screenshot',
      '     → rate per mile, fuel, what to watch for', '',
    );
    if (MAIL_ENABLED) {
      $L[] = 'BROKER EMAIL';
      $L[] = '';
      $L[] = '🖊 /carrier — your company signature';
      $L[] = '✏️ /edit — replace the draft text';
      $L[] = '📤 /send — prepare it for sending';
      $L[] = '';
    }
    $L[] = 'COMMANDS';
    $L[] = '';
    $L[] = '🔎 /broker 115789 — check a broker (MC or DOT)';
    $L[] = '🌐 /language — switch RU / EN';
    $L[] = 'ℹ️ /help — instructions and limits';
    return implode("\n", $L) . $off;
  }
  $L = array(
    '📋 РАЗДЕЛЫ', '',
    'ЧТО МНЕ ПРИСЛАТЬ', '',
    '📄 Rate Confirmation в PDF',
    '     → сводка по грузу и кнопки действий', '',
    '📷 Скриншот груза с лоуборда',
    '     → ставка за милю, топливо, на что смотреть', '',
  );
  if (MAIL_ENABLED) {
    $L[] = 'ПИСЬМО БРОКЕРУ';
    $L[] = '';
    $L[] = '🖊 /carrier — подпись вашей компании';
    $L[] = '✏️ /edit — заменить текст черновика';
    $L[] = '📤 /send — подготовить к отправке';
    $L[] = '';
  }
  $L[] = 'КОМАНДЫ';
  $L[] = '';
  $L[] = '🔎 /broker 115789 — проверить брокера (MC или DOT)';
  $L[] = '🌐 /language — сменить язык';
  $L[] = 'ℹ️ /help — инструкция и требования';
  return implode("\n", $L) . $off;
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
// Блоки: шапка с номером загрузки, каждый стоп ОДНИМ блоком, итоговые строки.
// Именно блоками, а не готовой строкой: из них собирается и целая карточка, и
// разложенная по сообщениям (driverCardParts ниже) — так стоп не разрывается.
function driverCardBlocks(array $d, $lang = 'en') {
  $t = $lang === 'ru'
    ? array('load' => 'НОМЕР ЗАГРУЗКИ', 'pickup' => 'Адрес погрузки', 'delivery' => 'Адрес доставки',
            'time' => 'Время', 'ref' => 'Реф', 'rate' => 'Ставка', 'commodity' => 'Груз', 'weight' => 'Вес')
    : array('load' => 'LOAD ID', 'pickup' => 'Pick up Address', 'delivery' => 'Delivery Address',
            'time' => 'Time', 'ref' => 'Ref', 'rate' => 'Rate', 'commodity' => 'Commodity', 'weight' => 'Weight');
  $hr = '__________________________';
  $blocks = array();
  if (!empty($d['load_id'])) $blocks[] = '* ' . $t['load'] . ': #' . ltrim($d['load_id'], '#');

  $stops = (array)(isset($d['stops']) ? $d['stops'] : array());
  $counts = array('pickup' => 0, 'delivery' => 0);
  foreach ($stops as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $counts[$type]++;
  }
  $seen = array('pickup' => 0, 'delivery' => 0);
  foreach ($stops as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $seen[$type]++;
    $label = ($type === 'delivery') ? $t['delivery'] : $t['pickup'];
    if ($counts[$type] > 1) $label .= ' ' . $seen[$type];
    $L = array($label . ':', '');
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
    $blocks[] = implode("\n", $L);
  }
  $tail = array();
  if (!empty($d['rate']))      $tail[] = $t['rate'] . ': ' . $d['rate'];
  if (!empty($d['commodity'])) $tail[] = $t['commodity'] . ': ' . $d['commodity'];
  if (!empty($d['weight']))    $tail[] = $t['weight'] . ': ' . $d['weight'];
  if ($tail) $blocks[] = implode("\n", $tail);
  return $blocks;
}

// Карточка водителю, разложенная по сообщениям под лимит Telegram (4096
// символов). Раньше она просто обрезалась на 4000 — и на рейт-коне в 5-6
// страниц последние стопы вместе со ставкой и весом ИСЧЕЗАЛИ из текста,
// который диспетчер копирует и отправляет водителю. Ни в чате, ни в логе следа
// не оставалось: сообщение выглядело законченным.
// Упаковка — packBlocks() в lib/load-checks.php: она чистая и проверяется
// тестом, а потерять здесь стоп дороже всего.
function driverCardParts(array $d, $lang = 'en', $limit = 3800) {
  return packBlocks(driverCardBlocks($d, $lang), $limit);
}

// Промпт разбора рейт-кона — один на всех потребителей (Gemini, запасной Groq,
// запасной Groq). Проверен на живых документах: без запрета «придумывать»
// модель подставляет адрес офиса брокера и выдуманные реф-номера.
function rcPrompt() {
  return "You extract data from freight Rate Confirmation documents.\n"
  . "The text is extracted from a PDF, so table columns may be interleaved and spacing is irregular. Read carefully.\n\n"
  . "Return ONLY a JSON object:\n"
  . "{\"load_id\":\"\",\"broker\":\"\",\"mc\":\"\",\"broker_phone\":\"\",\"broker_email\":\"\","
  . "\"rate\":\"\",\"commodity\":\"\",\"weight\":\"\",\"miles\":\"\",\"equipment\":\"\",\"stops\":"
  . "[{\"type\":\"pickup or delivery\",\"name\":\"\",\"address_lines\":[],\"time\":\"\",\"refs\":[]}]}\n\n"
  . "CRITICAL RULES:\n"
  . "- The text may contain '=== PAGE n OF m ===' markers. Read EVERY page through to the last one. "
  . "On multi-page rate confirmations the pickup is often on page 1 while deliveries, reference numbers "
  . "and appointment windows are printed on later pages. A value from one page belongs to a stop on "
  . "another page only if the document clearly ties them together.\n"
  . "- Copy every value VERBATIM from the document. NEVER invent, guess or fill in plausible data.\n"
  . "- Every value must stay in the document's own language, which is English. NEVER translate or "
  . "localise anything — dates and month names included. '08/17' or 'Aug 17' stays exactly as printed.\n"
  . "- If a value is not in the document, use an empty string (or empty array). An empty field is CORRECT; an invented field is a serious error.\n"
  . "- Strip label words glued to a value: 'Appointment', 'Time', 'Ref', 'Weight', '#'. Keep only the value.\n"
  . "- load_id: the load/order/PRO number of this shipment.\n"
  . "- broker: the company issuing the rate confirmation (not the carrier).\n"
  . "- mc: the BROKER's MC/MC# number, digits only. It is usually in the header or footer next to the broker's "
  . "name and address, printed as 'MC 123456', 'MC# 123456' or 'MC-123456'. NEVER take the carrier's MC — the "
  . "carrier is the company the document is addressed TO. If only a DOT number is printed, leave mc empty.\n"
  . "- broker_phone / broker_email: the booking contact for THIS load (the broker's rep), not the carrier's.\n"
  . "- stops: pickups (PICK, PICKUP, SHIPPER) and deliveries (STOP, DROP, CONSIGNEE, DELIVERY), in document order.\n"
  . "- EVERY rate confirmation has at least one pickup AND at least one delivery. If your stops list has no pickup, "
  . "you have missed it — re-read the whole document, including pages after the first, before answering. "
  . "The pickup is often on a separate page or in a section titled only with the shipper's name.\n"
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
  // Через эту функцию проходит КАЖДЫЙ разбор рейт-кона — и из PDF, и с фото,
  // поэтому чистка кириллицы стоит тут: одно место вместо четырёх вызовов.
  $d = enForce($d);
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
  // Про MC жалуемся, только если брокера не удалось опознать вообще: когда его
  // нашли в FMCSA по названию, номер у нас есть — просто не из документа.
  if (empty($d['mc']) && empty($d['dot'])) $miss[] = array('field' => 'mc');
  // Целиком пропавший стоп раньше не считался пропажей: в сводке просто
  // появлялось «Маршрут: ? → …», а карта в приложении не строилась вообще,
  // и понять, что бот не дочитал документ, было невозможно.
  $kinds = array();
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    $kinds[(isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup'] = true;
  }
  if (empty($kinds['pickup']))   $miss[] = array('field' => 'nopickup');
  if (empty($kinds['delivery'])) $miss[] = array('field' => 'nodelivery');

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
            'address' => 'address', 'citystate' => 'city and zip', 'time' => 'time', 'refs' => 'reference numbers',
            'mc' => "broker's MC — the app cannot run the FMCSA check without it",
            'nopickup' => 'the PICKUP stop — no map without it',
            'nodelivery' => 'the DELIVERY stop — no map without it')
    : array('load_id' => 'номер загрузки', 'rate' => 'ставка', 'weight' => 'вес', 'commodity' => 'груз',
            'address' => 'адрес', 'citystate' => 'город и индекс', 'time' => 'время', 'refs' => 'реф-номера',
            'mc' => 'MC брокера — без него приложение не проверит его по FMCSA',
            'nopickup' => 'ПОГРУЗКА — без неё не построится карта',
            'nodelivery' => 'ДОСТАВКА — без неё не построится карта');
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
  // Телефона и e-mail в QCMobile нет ни в одном эндпоинте — проверено списком
  // полей живой записи (?fmcsacheck=<MC>&keys=1). Не искать их повторным
  // запросом: это удваивало вызовы API и всё равно возвращало пустоту.
  // Контакты живут в карточке SAFER, ссылку на неё даём в отчёте.
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
  // MC печатаем, только если это действительно MC. /broker сначала ищет по
  // docket-номеру, а не найдя — по DOT; на втором пути $number и есть DOT, и
  // строка «DOT 2100420 · MC 2100420» выдавала одно за другое. Диспетчер
  // записывал DOT как MC — особенно легко сейчас, когда у брокеров, открытых
  // после 01.10.2025, MC не существует вовсе.
  $numberIsDot = (string)$number === (string)$dot;
  $L[] = 'DOT ' . $dot . ($kind !== 'dot' && !$numberIsDot ? ' · MC ' . $number : '');
  // ── Ключевые проверки. Считаем пройденные, чтобы дать процент и вердикт.
  // Common/Contract authority сюда НЕ входят: это статус перевозчика, а не
  // брокера, и у нормального брокера они законно «неактивны» — показывать их
  // рядом с галочками значит пугать диспетчера без причины.
  $checks = array();   // [пройдена?, подпись, значение]
  $blocker = false;    // хоть одна провалена — работать с таким брокером опасно

  $allowed = isset($rec['allowedToOperate']) ? $rec['allowedToOperate'] : null;
  if ($allowed !== null) {
    $ok = $allowed === 'Y';
    if (!$ok) $blocker = true;
    $checks[] = array($ok, $lang === 'en' ? 'Allowed to operate' : 'Право работать',
      $lang === 'en' ? ($ok ? 'YES' : 'NO') : ($ok ? 'ДА' : 'НЕТ'));
  }
  // По номеру приходит и перевозчик, и брокер. У перевозчика брокерской авторити
  // и бонда BMC-84 нет по определению — если валить его за это, честная фура
  // получает красный «не работать». Значит, требуем брокерские пункты только
  // когда перед нами действительно брокер.
  $isBroker  = isset($rec['brokerAuthorityStatus']) && $rec['brokerAuthorityStatus'] === 'A';
  $isCarrier = (isset($rec['commonAuthorityStatus']) && $rec['commonAuthorityStatus'] === 'A')
            || (isset($rec['contractAuthorityStatus']) && $rec['contractAuthorityStatus'] === 'A');
  $carrierOnly = !$isBroker && $isCarrier;

  if (isset($rec['brokerAuthorityStatus']) && !$carrierOnly) {
    if (!$isBroker) $blocker = true;
    $checks[] = array($isBroker, $lang === 'en' ? 'Broker authority' : 'Брокерская авторити',
      authWord($rec['brokerAuthorityStatus'], $lang));
  }
  // bondInsuranceOnFile — сумма в ТЫСЯЧАХ долларов, а не флаг Y/N: «75» = бонд
  // BMC-84 на $75 000. В приложении на этом уже обжигались.
  if (!$carrierOnly && isset($rec['bondInsuranceOnFile']) && $rec['bondInsuranceOnFile'] !== '') {
    $bond = preg_replace('/\D/', '', (string)$rec['bondInsuranceOnFile']);
    $ok = $bond !== '' && $bond !== '0';
    if (!$ok) $blocker = true;
    $checks[] = array($ok, ($lang === 'en' ? 'BMC-84 bond' : 'Бонд BMC-84'),
      $ok ? '$' . number_format((float)$bond * 1000, 0, '.', ',') : ($lang === 'en' ? 'none' : 'нет'));
  }
  // Out of service — прямой запрет работать, важнее почти всего остального.
  // array_key_exists, а не isset: у чистого перевозчика тут null, и isset его
  // отбросил бы — зелёная галочка «не out of service» не показалась бы никогда.
  if (array_key_exists('oosDate', $rec)) {
    $oos = !empty($rec['oosDate']);
    if ($oos) $blocker = true;
    $checks[] = array(!$oos, $lang === 'en' ? 'Out of service' : 'Out of service',
      $oos ? (string)$rec['oosDate'] : ($lang === 'en' ? 'no' : 'нет'));
  }
  // MCS-150: не блокирует, но просроченная анкета — признак заброшенной конторы.
  if (!empty($rec['mcs150Outdated'])) {
    $ok = $rec['mcs150Outdated'] === 'N';
    $checks[] = array($ok, $lang === 'en' ? 'MCS-150 up to date' : 'Анкета MCS-150 свежая',
      $lang === 'en' ? ($ok ? 'yes' : 'outdated') : ($ok ? 'да' : 'просрочена'));
  }

  $passed = 0;
  foreach ($checks as $c) if ($c[0]) $passed++;
  $total = count($checks);
  $pct = $total > 0 ? (int)round($passed / $total * 100) : 0;

  // Вердикт строкой: провал любой ключевой проверки — красный, независимо от %.
  $L[] = '';
  if ($total > 0) {
    $icon = $blocker ? '🔴' : ($pct === 100 ? '🟢' : '🟡');
    $verdict = $blocker
      ? ($lang === 'en' ? 'key checks failed — do not work without clarifying' : 'ключевые проверки провалены — не работать без выяснения')
      : ($pct === 100
          ? ($lang === 'en' ? 'all checks passed' : 'все проверки пройдены')
          : ($lang === 'en' ? 'passed with remarks' : 'пройдено с замечаниями'));
    $L[] = sprintf('%s %d%% (%d/%d) — %s', $icon, $pct, $passed, $total, $verdict);
  }

  if ($carrierOnly) {
    $L[] = $lang === 'en'
      ? 'ℹ️ This MC/DOT is a motor carrier, not a broker — broker authority and a BMC-84 bond are not required of it, so they are not checked.'
      : 'ℹ️ Этот MC/DOT — перевозчик, а не брокер: брокерская авторити и бонд BMC-84 с него не требуются, поэтому не проверяются.';
  }

  $L[] = '';
  $L[] = $lang === 'en' ? 'Criteria checked:' : 'Критерии проверки:';
  foreach ($checks as $c) $L[] = mark($c[0]) . ' ' . $c[1] . ': ' . $c[2];

  // ── Контакты. Телефона и почты в API нет — вместо выдуманных данных даём
  // адрес и прямую ссылку на карточку SAFER, где телефон брокера и есть.
  $contacts = array();
  $addr = array_filter(array(
    isset($rec['phyStreet']) ? $rec['phyStreet'] : '',
    isset($rec['phyCity']) ? $rec['phyCity'] : '',
    isset($rec['phyState']) ? $rec['phyState'] : '',
    isset($rec['phyZipcode']) ? $rec['phyZipcode'] : '',
  ));
  if ($addr) $contacts[] = ($lang === 'en' ? 'Address: ' : 'Адрес: ') . implode(', ', $addr);
  if (!empty($rec['dotNumber'])) {
    $contacts[] = ($lang === 'en' ? 'Phone and full profile — SAFER card:' : 'Телефон и полная карточка — SAFER:')
      . "\nhttps://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot"
      . '&query_param=USDOT&query_string=' . $rec['dotNumber'];
  }
  if ($contacts) {
    $L[] = '';
    $L[] = $lang === 'en' ? '📞 Contacts:' : '📞 Контакты:';
    foreach ($contacts as $c) $L[] = $c;
  }

  // ── Досье: размер парка и безопасность. Поля бывают не у всех записей,
  // поэтому каждое показываем только если FMCSA его реально вернул.
  $extra = array();
  if (!empty($rec['safetyRating'])) {
    // FMCSA отдаёт односимвольный код; голая «S» диспетчеру ничего не говорит.
    $sr = strtoupper((string)$rec['safetyRating']);
    $srWords = $lang === 'en'
      ? array('S' => 'Satisfactory', 'C' => 'Conditional', 'U' => 'Unsatisfactory')
      : array('S' => 'удовлетворительный', 'C' => 'условный', 'U' => 'неудовлетворительный');
    $extra[] = 'Safety rating: ' . (isset($srWords[$sr]) ? $srWords[$sr] : $sr)
      . (!empty($rec['safetyRatingDate']) ? ' (' . $rec['safetyRatingDate'] . ')' : '');
  }
  // Нули не показываем: у брокера своего парка нет, и строка «Тягачей: 0»
  // выглядит как сбой, а не как факт.
  if (!empty($rec['totalPowerUnits'])) {
    $extra[] = ($lang === 'en' ? 'Power units: ' : 'Тягачей: ') . $rec['totalPowerUnits'];
  }
  if (!empty($rec['totalDrivers'])) {
    $extra[] = ($lang === 'en' ? 'Drivers: ' : 'Водителей: ') . $rec['totalDrivers'];
  }
  // Страховки: суммы FMCSA отдаёт только по бонду, остальное — флаги наличия.
  // Придумывать долларовые суммы по флагу нельзя, поэтому пишем как есть.
  $ins = array();
  if (!empty($rec['cargoInsuranceOnFile'])) $ins[] = $lang === 'en' ? 'cargo' : 'карго';
  if (!empty($rec['bipdInsuranceOnFile']))  $ins[] = 'BIPD';
  if ($ins) $extra[] = ($lang === 'en' ? 'Insurance on file: ' : 'Страховки на файле: ') . implode(', ', $ins);

  if (!empty($rec['crashTotal'])) {
    $line = ($lang === 'en' ? 'Crashes (24 mo): ' : 'ДТП за 24 мес: ') . $rec['crashTotal'];
    $det = array();
    if (!empty($rec['fatalCrash'])) $det[] = ($lang === 'en' ? 'fatal ' : 'со смертью ') . $rec['fatalCrash'];
    if (!empty($rec['injCrash']))   $det[] = ($lang === 'en' ? 'injury ' : 'с травмами ') . $rec['injCrash'];
    if ($det) $line .= ' (' . implode(', ', $det) . ')';
    $extra[] = $line;
  }
  // Процент проверок, после которых машину или водителя сняли с рейса, против
  // национального среднего. Это то, чем реально меряют перевозчика на дороге.
  foreach (array(
    array('driverOosRate',  'driverOosRateNationalAverage',  'Driver out-of-service', 'Снятия водителей с рейса', 'driverInsp'),
    array('vehicleOosRate', 'vehicleOosRateNationalAverage', 'Vehicle out-of-service', 'Снятия машин с рейса', 'vehicleInsp'),
  ) as $o) {
    if (!isset($rec[$o[0]]) || $rec[$o[0]] === '' || $rec[$o[0]] === null) continue;
    // Без инспекций процент всегда 0 — у брокера своих машин нет вовсе. Строка
    // «0% ✅» читалась бы как безупречная история вместо «проверок не было».
    if (empty($rec[$o[4]])) continue;
    $line = ($lang === 'en' ? $o[2] : $o[3]) . ': ' . round((float)$rec[$o[0]], 1) . '%';
    if (!empty($rec[$o[1]])) {
      $nat = round((float)$rec[$o[1]], 1);
      $line .= ($lang === 'en' ? ' (national average ' : ' (в среднем по стране ') . $nat . '%)';
      $line .= (float)$rec[$o[0]] > (float)$rec[$o[1]] ? ' ⚠️' : ' ✅';
    }
    $extra[] = $line;
  }
  if (!empty($rec['carrierOperation']['carrierOperationDesc'])) {
    $extra[] = ($lang === 'en' ? 'Operation: ' : 'Тип работы: ') . $rec['carrierOperation']['carrierOperationDesc'];
  }
  if ($extra) {
    $L[] = '';
    $L[] = $lang === 'en' ? 'ℹ️ Company profile:' : 'ℹ️ О компании:';
    foreach ($extra as $e) $L[] = $e;
  }

  $L[] = '';
  $L[] = $lang === 'en' ? 'Source: FMCSA QCMobile, official data.' : 'Источник: FMCSA QCMobile, данные официальные.';
  return implode("\n", $L);
}

// Сверка брокера сразу при разборе документа: MC из рейт-кона → запись FMCSA →
// структурные метки. Один запрос к бесплатному API на документ, и только если
// MC вообще нашёлся. Без ключа FMCSA молчим: пугать «MC не найден» там, где мы
// просто не смотрели, — хуже, чем не проверять.
// $load передаётся ПО ССЫЛКЕ: найдя брокера по имени, мы дописываем в разбор
// его DOT — от этого зависит и кнопка проверки, и предупреждение о пропавшем MC.
function rcFraud(array &$load, $ownMc = '') {
  $name = isset($load['broker']) ? trim((string)$load['broker']) : '';
  $mc = preg_replace('/\D/', '', (string)(isset($load['mc']) ? $load['mc'] : ''));

  // Свой собственный MC (из подписи /carrier) — точно не брокерский. Рейт-кон
  // адресован перевозчику, его номер напечатан в шапке рядом с брокерским, и
  // модель регулярно берёт не тот. Отчёт о собственной компании диспетчеру не
  // нужен: он и так про неё всё знает.
  if ($mc !== '' && $ownMc !== '' && $mc === $ownMc) { $load['mc'] = ''; $mc = ''; }

  if ($mc !== '') {
    list($rec, $err) = fetchBrokerRecord('broker', $mc);
    if ($err === 'nokey') return array();
    // Запись нашлась, но это НЕ та компания, что выдала документ. Два разных
    // случая, и путать их нельзя:
    //  • перед нами перевозчик — значит из шапки взяли его номер вместо
    //    брокерского. Это ошибка извлечения, а не мошенничество: молча ищем
    //    брокера по названию и проверяем уже его.
    //  • перед нами БРОКЕР с другим именем — вот это тревога, её оставляем.
    if (is_array($rec) && $name !== '' && !recMatchesName($rec, $name) && recIsCarrierOnly($rec)) {
      $byName = fetchBrokerByName($name);
      $load['mc'] = '';                       // чужой номер в разборе не держим
      if (is_array($byName)) {
        if (!empty($byName['dotNumber'])) $load['dot'] = (string)$byName['dotNumber'];
        return brokerFraudFlags($load, $byName);
      }
      // Брокера по имени не нашли — говорим прямо, что проверять было нечего.
      return array(array('code' => 'mc_is_carrier', 'mc' => $mc));
    }
    return brokerFraudFlags($load, $rec);
  }
  // MC в документе нет — на живых рейт-конах это обычное дело: номер печатают
  // мелким шрифтом в подвале, и он теряется при извлечении текста. Раньше на
  // этом проверка просто заканчивалась, то есть не работала ровно там, где
  // нужнее всего. Ищем по названию компании.
  if ($name === '') return array();
  $rec = fetchBrokerByName($name);
  // Не нашли или нашли неоднозначно — молчим. Отсутствие записи по имени не
  // улика: FMCSA ищет по точному написанию, а брокер мог представиться иначе.
  if (!is_array($rec)) return array();
  if (!empty($rec['dotNumber'])) $load['dot'] = (string)$rec['dotNumber'];
  return brokerFraudFlags($load, $rec);
}

/**
 * Брокер по названию компании. Отдаём запись, только если совпадение
 * ОДНО и однозначное: у FMCSA поиск по имени возвращает всех похожих, и
 * взять первого попавшегося — это выдать диспетчеру чужую контору за его.
 */
function fetchBrokerByName($name) {
  $key = @trim(file_get_contents(__DIR__ . '/../../fmcsa.key'));
  if ($key === '' || $key === false) return null;
  // Запятые и точки в запросе только мешают: «Molo Solutions, LLC» не находится,
  // «MOLO SOLUTIONS» находится.
  $q = trim(preg_replace('/\s+/', ' ', preg_replace('/[^A-Za-z0-9 ]/', ' ', $name)));
  if ($q === '') return null;
  $data = fmcsaGet('carriers/name/' . rawurlencode($q), $key);
  if (!is_array($data) || !isset($data['content']) || !is_array($data['content'])) return null;

  $hits = array();
  foreach ($data['content'] as $row) {
    $c = isset($row['carrier']) ? $row['carrier'] : $row;
    if (!is_array($c) || empty($c['legalName'])) continue;
    $dba = isset($c['dbaName']) ? (string)$c['dbaName'] : '';
    if (!sameCompany($name, $c['legalName']) && ($dba === '' || !sameCompany($name, $dba))) continue;
    // Один и тот же DOT приходит несколько раз — считаем компании, не строки.
    $hits[(string)(isset($c['dotNumber']) ? $c['dotNumber'] : count($hits))] = $c;
    if (count($hits) > 1) return null;   // тёзки: молча выходим, гадать нельзя
  }
  return $hits ? reset($hits) : null;
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

// Меню команд Telegram. Правила, по которым оно собрано:
//  • одна строка на пункт — было «Подпись перевозчика для писем брокерам» в две
//    строки, и список читался как стена текста;
//  • никаких «RU / EN» в каждом пункте — двойной текст удлинял строку вдвое,
//    язык переключается отдельной командой;
//  • ни одного дубля по смыслу. /start, /menu и /help значили примерно одно —
//    осталась одна запись. /mc и /dot — тоже одно действие «проверить брокера»,
//    и разделение вредное: MC-номера FMCSA не выдаёт с 01.10.2025, у свежих
//    брокеров их нет вообще. /broker принимает любой номер: пробует сначала как
//    MC, потом как DOT — диспетчеру не нужно знать, какой ему прислали.
// /help, /menu, /mc, /dot продолжают работать, если их набрать, — просто не
// занимают место в списке.
function botCommands() {
  $c = array(
    array('command' => 'start', 'description' => '👋 Что умеет бот'),
  );
  if (MAIL_ENABLED) {
    $c[] = array('command' => 'carrier', 'description' => '🖊 Подпись компании');
    $c[] = array('command' => 'send',    'description' => '📤 Письмо брокеру');
  }
  $c[] = array('command' => 'broker',   'description' => '🔎 Проверить брокера');
  $c[] = array('command' => 'language', 'description' => '🌐 Язык / Language');
  return $c;
}

// Короткое описание — под именем бота в профиле и в списке чатов.
function botShortDescription() {
  return MAIL_ENABLED
    ? 'Рейт-коны и скриншоты грузов: текст водителю, расчёт, письмо брокеру, проверка по FMCSA.'
    : 'Рейт-коны и скриншоты грузов: текст водителю, расчёт за милю, проверка брокера по FMCSA.';
}

// Полное описание — то, что человек читает на пустом экране чата ДО кнопки
// «Начать». Витрина бота: обещать здесь выключенную функцию нельзя.
// Лимит Telegram — 512 символов, поэтому только суть, подробности в /start.
function botDescription() {
  $L = array(
    'Рабочий инструмент диспетчера.', '',
    'Пришлите Rate Confirmation в PDF или скриншот груза с лоуборда — получите:',
    '• текст для водителя: адреса, окна времени, реф-номера',
    '• расчёт: ставка за милю, топливо, на что смотреть',
  );
  if (MAIL_ENABLED) $L[] = '• готовое письмо брокеру';
  $L[] = '• проверку брокера по FMCSA';
  $L[] = '';
  $L[] = '— — —';
  $L[] = MAIL_ENABLED
    ? 'Rate confirmations and load screenshots in — driver text, per-mile math, broker email and FMCSA checks out.'
    : 'Rate confirmations and load screenshots in — driver text, per-mile math and FMCSA broker checks out.';
  return implode("\n", $L);
}

// Меню команд + описания разом: всё, что живёт на серверах Telegram и само не
// обновляется. $verbose — вернуть ответы Telegram (нужно для ?setup=1).
function applyProfile($token, $verbose = false) {
  $r = array();
  $r['commands'] = tgApi($token, 'setMyCommands', array('commands' => json_encode(botCommands())));
  $r['short_description'] = tgApi($token, 'setMyShortDescription', array('short_description' => botShortDescription()));
  $r['description'] = tgApi($token, 'setMyDescription', array('description' => botDescription()));
  if (!$verbose) return null;
  foreach ($r as $k => $v) $r[$k] = json_decode($v, true);
  return $r;
}

// Сверяет версию и обновляет меню с описаниями, если они поменялись.
// Вызывается на обычных сообщениях, поэтому в норме это чтение одного
// маленького файла и ничего больше — запросы уходят только при расхождении.
function ensureProfile($token) {
  $dir = __DIR__ . '/../../tg-state';
  if (!is_dir($dir)) { @mkdir($dir, 0700, true); if (!is_dir($dir)) return; }
  $file = $dir . '/commands.ver';
  if ((int)@file_get_contents($file) === COMMANDS_VERSION) return;
  // Версию пишем ДО запросов: если Telegram ответит ошибкой, повторять их на
  // каждом сообщении подряд нельзя — это ровно тот способ, которым бот уже
  // однажды устроил шторм.
  @file_put_contents($file, (string)COMMANDS_VERSION);
  applyProfile($token);
}

// Единый ответ на всё, что связано с письмом брокеру, пока MAIL_ENABLED = false.
function mailOffText($lang = 'ru') {
  return $lang === 'en'
    ? "✉️ The broker email is temporarily switched off — we are sorting out a fault in it. "
      . "Everything else works: rate confirmations, load screenshots, driver text and FMCSA checks."
    : "✉️ Письмо брокеру временно отключено — разбираемся со сбоем в нём.\n\n"
      . "Остальное работает: разбор рейт-конов и скриншотов, текст водителю, проверка брокера по FMCSA.";
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
  // Без MC приложение не может проверить брокера и пишет «MC не передан» —
  // именно этого номера в извлечении раньше не было вовсе.
  $mc = $num(isset($d['mc']) ? $d['mc'] : '');
  if ($mc !== null) $p['mc'] = $mc;
  if (!empty($d['broker_email'])) $p['email'] = $d['broker_email'];
  if (!empty($d['broker_phone'])) $p['phone'] = $d['broker_phone'];
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

// Здесь жила replyWithButton() — не вызывалась ниоткуда, а её комментарий
// («подписка вебхука — только на message») уже устарел и успел навести на
// ошибку: ровно из-за него сторож восстанавливал вебхук без callback_query.
// Кнопки давно работают через reply($token, $chatId, $text, $keyboard).

function tgApi($token, $method, array $params) {
  return httpPost('https://api.telegram.org/bot' . $token . '/' . $method,
    http_build_query($params), array('Content-Type: application/x-www-form-urlencoded'));
}

function reply($token, $chatId, $text, $keyboard = null) {
  if (!outboundAllowed($chatId)) return '';
  $p = array('chat_id' => $chatId, 'text' => $text, 'disable_web_page_preview' => true);
  if ($keyboard !== null) $p['reply_markup'] = json_encode(array('inline_keyboard' => $keyboard));
  return tgApi($token, 'sendMessage', $p);
}

// true — этот апдейт уже обрабатывали, второй раз не надо.
// Маркер создаётся атомарно: fopen в режиме 'x' падает, если файл уже есть,
// поэтому две одновременные доставки одного апдейта не проскочат обе (Telegram
// умеет доставлять параллельно, обычная проверка «прочитал-записал» тут гонку
// проигрывает).
// Если каталог завести не удалось — НЕ блокируем: лучше ответить дважды, чем
// замолчать совсем.
function updateAlreadySeen($id) {
  $dir = __DIR__ . '/../../tg-seen';
  if (!is_dir($dir)) { @mkdir($dir, 0700, true); if (!is_dir($dir)) return false; }
  $file = $dir . '/' . $id;
  $h = @fopen($file, 'x');
  if ($h === false) return file_exists($file);
  fclose($h);
  // Раз в сотню апдейтов подчищаем маркеры старше суток: дольше Telegram
  // недоставленные апдейты всё равно не хранит.
  if ($id % 100 === 0) {
    foreach ((array)@glob($dir . '/*') as $old) {
      if (@filemtime($old) < time() - 86400) @unlink($old);
    }
  }
  return false;
}

// Предохранитель. Что бы ни сломалось выше по течению — повторная доставка,
// цикл в новом коде, шторм апдейтов после простоя — в один чат уйдёт не больше
// MAX_OUT_PER_MIN сообщений в минуту. Сотни одинаковых сообщений подряд
// становятся невозможны механически, а не «потому что мы починили причину».
function outboundAllowed($chatId) {
  $dir = __DIR__ . '/../../tg-state';
  if (!is_dir($dir)) { @mkdir($dir, 0700, true); if (!is_dir($dir)) return true; }
  $file = $dir . '/rate-' . preg_replace('/\D/', '', $chatId) . '.json';
  $now = time();
  $r = json_decode((string)@file_get_contents($file), true);
  if (!is_array($r) || !isset($r['start'], $r['n']) || (int)$r['start'] < $now - 60) {
    $r = array('start' => $now, 'n' => 0);
  }
  $r['n'] = (int)$r['n'] + 1;
  @file_put_contents($file, json_encode($r), LOCK_EX);
  if ($r['n'] <= MAX_OUT_PER_MIN) return true;
  // Сообщаем о срабатывании один раз за окно, иначе лог распухнет так же,
  // как распух чат.
  if ($r['n'] === MAX_OUT_PER_MIN + 1) {
    @file_put_contents(__DIR__ . '/../../tg-bot.log',
      date('c') . " [BRAKE] chat " . $chatId . ": превышен лимит "
      . MAX_OUT_PER_MIN . " сообщений в минуту, остальные подавлены\n", FILE_APPEND);
  }
  return false;
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

// Скачать одну картинку по file_id. null — не получилось, причина уже в логе.
function photoBytes($token, $fileId) {
  $info = json_decode(tgApi($token, 'getFile', array('file_id' => $fileId)), true);
  if (empty($info['result']['file_path'])) return null;
  $bytes = httpGet('https://api.telegram.org/file/bot' . $token . '/' . $info['result']['file_path']);
  return ($bytes === false || $bytes === '') ? null : $bytes;
}

function handlePhotoLoad($token, $chatId, $fileId, $mime) {
  global $progressId;
  $sent = json_decode(reply($token, $chatId, '⏳ Читаю скриншот… / Reading…'), true);
  if (!empty($sent['result']['message_id'])) $progressId = $sent['result']['message_id'];
  finishRequest();

  $bytes = photoBytes($token, $fileId);
  if ($bytes === null) { fail($token, $chatId, 'photo download failed: ' . $fileId, 'не удалось скачать картинку'); return; }

  list($load, $err) = photoExtractLoad($bytes, $mime);
  photoRespond($token, $chatId, $load, $err);
}

// Альбом: две-три страницы одного документа, отправленные разом.
//
// Telegram присылает каждую страницу ОТДЕЛЬНЫМ апдейтом, объединённым только
// полем media_group_id. Раньше его никто не смотрел: каждая страница
// разбиралась сама по себе, вторая затирала первую в состоянии — и текст
// водителю собирался по одной случайной странице, без половины стопов и
// реф-номеров. Выглядело это как «бот разобрал», а не как ошибка.
//
// Поэтому: страницы копим в файле, а разбирает их ВСЕ разом та доставка,
// которая пришла первой. Остальные молча дописывают свою страницу и уходят.
// ponytail: сколько всего страниц в альбоме, Telegram не сообщает — ждём, пока
// счётчик перестанет расти. Это единственный способ, других API нет.
// Порядок страниц — порядок доставки апдейтов; Telegram присылает их по порядку.
function handlePhotoGroup($token, $chatId, $groupId, $fileId, $mime) {
  global $progressId;
  $dir = __DIR__ . '/../../tg-state';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);
  $file = $dir . '/group-' . preg_replace('/\W/', '', $groupId) . '.json';
  // Недоеденные альбомы (первая доставка упала, собирать некому) не копим.
  foreach ((array)@glob($dir . '/group-*.json') as $old) {
    if (@filemtime($old) < time() - 3600) @unlink($old);
  }

  // Дописываем страницу под блокировкой: доставки идут параллельно, и без
  // неё две одновременные записи затирают друг друга.
  $h = @fopen($file, 'c+');
  if ($h === false) { handlePhotoLoad($token, $chatId, $fileId, $mime); return; }  // хотя бы одну страницу разберём
  flock($h, LOCK_EX);
  $g = json_decode((string)stream_get_contents($h), true);
  if (!is_array($g) || !isset($g['pages'])) $g = array('pages' => array());
  $g['pages'][] = array('id' => $fileId, 'mime' => $mime);
  $mine = count($g['pages']);
  ftruncate($h, 0); rewind($h); fwrite($h, json_encode($g)); fflush($h);
  flock($h, LOCK_UN); fclose($h);

  if ($mine > 1) { echo 'ok'; return; }   // не первая страница — собирать будет первая

  $sent = json_decode(reply($token, $chatId, '⏳ Собираю страницы… / Reading pages…'), true);
  if (!empty($sent['result']['message_id'])) $progressId = $sent['result']['message_id'];
  finishRequest();

  // Ждём остальные страницы: обычно они доезжают меньше чем за секунду.
  // Выходим, когда счётчик не менялся две проверки подряд, но не ждём дольше 6 с.
  // Список держим отдельной переменной: если очередное чтение файла не удастся,
  // разберём то, что уже собрали, а не потеряем альбом целиком.
  $pages = $g['pages'];
  $stable = 0;
  for ($i = 0; $i < 24; $i++) {   // до 12 с: десяток страниц доезжает дольше двух
    usleep(500000);
    $fresh = json_decode((string)@file_get_contents($file), true);
    if (!is_array($fresh) || !isset($fresh['pages'])) continue;
    if (count($fresh['pages']) === count($pages)) { if (++$stable >= 2) break; }
    else { $stable = 0; $pages = $fresh['pages']; }
    if (count($pages) >= GROUP_MAX_PAGES) break;
  }
  @unlink($file);
  $pages = array_slice($pages, 0, GROUP_MAX_PAGES);
  $images = array();
  foreach ($pages as $p) {
    $b = photoBytes($token, $p['id']);
    if ($b !== null) $images[] = array('bytes' => $b, 'mime' => $p['mime']);
  }
  if (!$images) { fail($token, $chatId, 'group download failed: ' . $groupId, 'не удалось скачать страницы'); return; }

  list($load, $err) = photoExtractPages($images);
  photoRespond($token, $chatId, $load, $err, count($images));
}

// Общий хвост для одной картинки и для альбома: ошибки, а дальше рейт-кон или
// карточка груза. Был скопирован в обе ветки — теперь один.
function photoRespond($token, $chatId, $load, $err, $pageCount = 1) {
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
  $lang = curLang($st);
  // Сколько страниц реально попало в разбор — видно сразу. Иначе непонятно,
  // прочитал бот вторую страницу или тихо обошёлся первой.
  $pages = $pageCount > 1
    ? ($lang === 'en' ? "📄 Merged from {$pageCount} pages\n\n" : "📄 Собрано из {$pageCount} страниц\n\n")
    : '';

  // Фото/скан РЕЙТ-КОНА ведём по ветке рейт-кона, а не «груза с лоуборда»:
  // у него есть адреса складов, окна времени и реф-номера, и человеку нужен
  // текст водителю. Раньше любая картинка разбиралась схемой лоуборда, и эти
  // поля молча терялись — ответ выглядел нормальным, но был неполным.
  if (isRateCon($load)) {
    $load = normalizeLoad($load);
    // до missingFields: может дописать DOT. Свой MC — из подписи /carrier.
    $st['rc_fraud'] = rcFraud($load, ownMcFromSignature(isset($st['carrier']) ? $st['carrier'] : ''));
    $st['rc'] = $load;
    $st['rc_missing'] = missingFields($load);
    $st['last'] = 'rc';
    stateSet($chatId, $st);
    reply($token, $chatId, $pages . rcSummaryFull($load, $st['rc_missing'], $lang, $st['rc_fraud']), rcKeyboard($load, $lang));
    return;
  }

  $st['load'] = $load;
  $st['last'] = 'load';
  stateSet($chatId, $st);

  // Карточка + кнопки. Аналитика и письмо приходят по нажатию, а не сразу
  // тремя простынями подряд: обычно нужна одна из них.
  $tail = $lang === 'en' ? "\n\n👇 What to do with this load:" : "\n\n👇 Что сделать с этим грузом:";
  reply($token, $chatId, $pages . photoLoadCard($load, $lang) . $tail, photoKeyboard($load, $lang));
}

function handleCarrier($token, $chatId, $sig) {
  $st = stateGet($chatId);
  $lang = curLang($st);
  // Подпись существует только ради письма брокеру — пока письмо выключено,
  // хранить её незачем, а обещать «черновик пересобран» тем более.
  if (!MAIL_ENABLED) { reply($token, $chatId, mailOffText($lang)); return; }
  $example = "/carrier ABC Trucking LLC\nMC 123456\nJohn, (555) 111-2233\njohn@abctrucking.com";
  if ($sig === '') {
    $cur = isset($st['carrier']) ? $st['carrier'] : '';
    if ($cur === '') {
      reply($token, $chatId, $lang === 'en'
        ? "No signature set yet.\n\nSend it like this:\n" . $example
          . "\n\nIt goes into every broker email, and the address from it becomes the reply-to."
        : "Подпись пока не задана.\n\nПришлите её так:\n" . $example
          . "\n\nОна будет подставляться в письма брокерам, а email из неё — в поле «ответить».");
    } else {
      reply($token, $chatId, $lang === 'en'
        ? "Your signature:\n\n" . $cur . "\n\nTo replace it, send /carrier with the new text."
        : "Ваша подпись:\n\n" . $cur . "\n\nЗаменить — пришлите /carrier с новым текстом.");
    }
    return;
  }
  $st['carrier'] = $sig;
  // Черновик пересобираем из того же источника, что и кнопка «Письмо брокеру».
  // Раньше смотрели только на $st['load'] — груз со скриншота, — и после разбора
  // рейт-кона подпись сохранялась, но в письмо не попадала.
  $rebuilt = false;
  if (empty($st['draft_edited'])) { // правку руками подписью не затираем
    $src = mailSource($st);
    if ($src !== null) {
      $st['mail_src'] = $src;
      $st['draft'] = brokerEmailDraft($src, $sig, isset($st['draft_lang']) ? $st['draft_lang'] : 'en');
      $rebuilt = true;
    }
  }
  stateSet($chatId, $st);
  $tail = $rebuilt
    ? ($lang === 'en' ? "\n\nThe draft has been rebuilt with it — /send when you're ready."
                      : "\n\nЧерновик письма пересобран с ней — /send, когда будете готовы.")
    : '';
  reply($token, $chatId, ($lang === 'en' ? "Signature saved:\n\n" : "Подпись сохранена:\n\n") . $sig . $tail);
}

function handleEdit($token, $chatId, $newBody) {
  $st = stateGet($chatId);
  $lang = curLang($st);
  // Черновик рождается и от рейт-кона, и от скриншота — про скриншот тут
  // говорили как про единственный путь, и после разбора PDF это сбивало с толку.
  if (empty($st['draft'])) {
    reply($token, $chatId, $lang === 'en'
      ? "Nothing to edit yet — send a rate confirmation PDF or a load screenshot first, then tap \"Broker email\"."
      : "Пока нечего править — пришлите рейт-кон в PDF или скриншот груза, а потом нажмите «Письмо брокеру».");
    return;
  }
  if ($newBody === '') {
    reply($token, $chatId, $lang === 'en'
      ? "Send the whole email after the command:\n\n/edit Hello John,\n\nWe can cover this load at $2,400 all-in...\n\n"
        . "You can change the subject too — put \"Subject: ...\" on the first line."
      : "Пришлите письмо целиком после команды:\n\n/edit Hello John,\n\nWe can cover this load at $2,400 all-in...\n\n"
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
  // Метка правки: после неё письмо не пересобирается ни кнопкой перевода,
  // ни /carrier — иначе ручной текст молча заменялся бы шаблоном.
  $st['draft_edited'] = true;
  stateSet($chatId, $st);
  reply($token, $chatId, draftMeta($st['draft'], $lang, $lang === 'en' ? '📤 Ready to send: /send' : '📤 Готово к отправке: /send'));
  reply($token, $chatId, draftAsText($st['draft']));
}

// Бот НЕ отправляет письма сам. Причины, по которым отправку убрали после первого
// же теста: команда с опечаткой мгновенно уходила чужому адресату без подтверждения,
// а письмо с домена сайта, а не перевозчика, брокеры всё равно считают спамом.
// Здесь мы только готовим письмо — отправляет человек из своей почты.
function handleSend($token, $chatId, $toArg) {
  $st = stateGet($chatId);
  $lang = curLang($st);
  if (empty($st['draft'])) {
    reply($token, $chatId, $lang === 'en'
      ? "Nothing to send yet — send a rate confirmation PDF or a load screenshot first, then tap \"Broker email\"."
      : "Пока нечего отправлять — пришлите рейт-кон в PDF или скриншот груза, а потом нажмите «Письмо брокеру».");
    return;
  }
  $draft = $st['draft'];
  foreach (array('to', 'subject', 'body') as $k) if (!isset($draft[$k])) $draft[$k] = '';
  $to = $toArg !== '' ? $toArg : $draft['to'];
  $hasTo = filter_var($to, FILTER_VALIDATE_EMAIL) !== false;

  $mailto = 'mailto:' . ($hasTo ? rawurlencode($to) : '')
    . '?subject=' . rawurlencode($draft['subject'])
    . '&body=' . rawurlencode($draft['body']);

  // Три отдельных сообщения: инструкция, ЧИСТЫЙ текст письма для копирования,
  // ссылка на открытие в почте — ничего не перемешано в одном сообщении.
  reply($token, $chatId, $lang === 'en'
    ? "📤 The email is ready — you send it yourself, from your own mailbox.\n\n"
      . "To: " . ($hasTo ? $to : "(broker's address not found — type it in manually)") . "\n\n"
      . "The next message is the full text, copy all of it. Or tap the link below — the email "
      . "opens in your mail app already filled in.\n\n"
      . "That way the broker sees your company's address, not ours, and the reply comes straight to you."
    : "📤 Письмо готово к отправке — отправляете вы, из своей почты.\n\n"
      . "Кому: " . ($hasTo ? $to : '(адрес брокера не найден — впишите вручную)') . "\n\n"
      . "Следующим сообщением — готовый текст, скопируйте его целиком. Либо нажмите ссылку ниже — "
      . "письмо откроется в вашей почте уже заполненным.\n\n"
      . "Так брокер видит адрес вашей компании, а не наш, и ответ придёт прямо вам.");
  reply($token, $chatId, draftAsText($draft));
  // mailto в inline-кнопке Telegram не пропускает — отдаём ссылкой в тексте
  reply($token, $chatId, ($lang === 'en' ? "Open in your mail app:\n" : "Открыть в почте:\n") . $mailto);
}
