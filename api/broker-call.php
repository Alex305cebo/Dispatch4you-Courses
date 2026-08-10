<?php
// Серверная сторона тренажёра Broker Call (/broker-call/).
//
// Повторяет контракт дев-прокси из broker-call/server/devProxy.ts один в один,
// поэтому фронт между локальным запуском и боевым сервером не меняется ни
// строкой. Действие выбирается через ?action=.
//
// Ключи читаются из файлов ОДНОГО УРОВНЯ ВЫШЕ public_html — та же схема, что у
// api/groq.php, и тот же самый groq.key. Заводить ничего не нужно:
//   ~/domains/dispatch4you.com/groq.key       (уже есть)
//   ~/domains/dispatch4you.com/cerebras.key   (необязателен)
//   ~/domains/dispatch4you.com/openai.key     (только для режима realtime)
//
// Системный промпт и схемы инструментов лежат в api/broker-config.php —
// сгенерированном файле, который возвращает массив и ничего не печатает,
// поэтому по HTTP не читается. Собирается из TypeScript при сборке фронта:
//   cd broker-call && npm run build:server-config
//
// ponytail: проверка Origin/Referer подделывается curl'ом — она отсекает
// случайное использование чужими страницами, но не целенаправленное. Пока это
// тот же уровень защиты, что у api/groq.php. Когда тренажёр повесят на
// страницу сайта, сюда надо добавить проверку куки d4y_sess (api/session.php
// её уже выдаёт) и квоту минут на uid.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$action = isset($_GET['action']) ? $_GET['action'] : '';

// ── Проверка происхождения ───────────────────────────────────────────────────
// health проверяется ДО неё и намеренно открыт: диагностическую ручку нужно
// уметь открыть тапом из адресной строки телефона, а Origin туда не приходит.
// Секретов она не отдаёт — только «работает/не работает» и текст ошибки
// провайдера. Без этого исключения «спроси у сервера, что сломалось» не
// работает, и причину приходится выводить чтением исходников.
$origin  = isset($_SERVER['HTTP_ORIGIN'])  ? $_SERVER['HTTP_ORIGIN']  : '';
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$allowedOrigins = ['dispatch4you.com', 'localhost', '127.0.0.1'];
$originOk = false;
foreach ($allowedOrigins as $o) {
  if (stripos($origin, $o) !== false || stripos($referer, $o) !== false) { $originOk = true; break; }
}
if (!$originOk && $action !== 'health') { bc_fail(403, 'forbidden'); }

// ── Ключи ────────────────────────────────────────────────────────────────────
function bc_key($name) {
  $path = __DIR__ . '/../../' . $name;
  if (!is_readable($path)) { return ''; }
  $value = trim((string) @file_get_contents($path));
  return $value;
}

$groqKey     = bc_key('groq.key');
$cerebrasKey = bc_key('cerebras.key');
$openaiKey   = bc_key('openai.key');
// Пока файла gemini.key нет, ветка Gemini не включается ничем: config отдаёт
// false, фронт даже не пробует и идёт прежним пайплайном. Появление файла —
// единственный переключатель.
$geminiKey   = bc_key('gemini.key');

// Списки, а не одиночные имена: провайдеры снимают модели с бесплатного тарифа
// без предупреждения. Groq объявил llama-3.3-70b-versatile устаревшей
// 17.06.2026 — с единственным именем в коде это положило бы весь звонок.
$CEREBRAS_MODELS = ['llama-3.3-70b'];
$GROQ_MODELS     = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile'];
$TTS_MODEL       = 'canopylabs/orpheus-v1-english';

/**
 * Приводит тело запроса под конкретную модель.
 *
 * gpt-oss — рассуждающие модели, и они НЕ принимают max_tokens: запрос
 * отваливается целиком. Именно на этом звонок падал с «LLM 502», хотя проба
 * health показывала зелёное — она слала простой ping без этого параметра и без
 * инструментов, то есть проверяла не тот путь, которым идёт разговор.
 *
 * reasoning_effort=low заодно держит задержку низкой: брокеру в трубке не надо
 * рассуждать, ему надо отвечать.
 */
function bc_shape_payload($payload, $model) {
  if (strpos($model, 'gpt-oss') !== false) {
    if (isset($payload['max_tokens'])) {
      $payload['max_completion_tokens'] = $payload['max_tokens'];
      unset($payload['max_tokens']);
    }
    $payload['reasoning_effort'] = 'low';
  }
  $payload['model'] = $model;
  return $payload;
}

// Голоса Groq Orpheus. НЕ совпадают с именами оригинального Orpheus от
// Canopy Labs (tara, leo, zac…) — именно на этом тренажёр немел: запрос уходил
// с несуществующим голосом, Groq отвечал 400, и звонок шёл без звука.
$ORPHEUS_VOICES = ['austin', 'daniel', 'troy', 'autumn', 'diana', 'hannah'];
$DEFAULT_VOICE  = 'austin';

/** Неизвестное имя подменяем, а не отправляем провайдеру: одна опечатка не должна обесточивать звонок. */
function bc_voice($raw) {
  global $ORPHEUS_VOICES, $DEFAULT_VOICE;
  $v = strtolower(trim((string) $raw));
  return in_array($v, $ORPHEUS_VOICES, true) ? $v : $DEFAULT_VOICE;
}

// ── Конфиг сценариев ─────────────────────────────────────────────────────────
function bc_config() {
  static $config = null;
  if ($config === null) {
    $path = __DIR__ . '/broker-config.php';
    $config = is_readable($path) ? require $path : null;
    if (!is_array($config)) { $config = ['tools' => [], 'scenarios' => []]; }
  }
  return $config;
}

function bc_scenario($id) {
  $config = bc_config();
  return isset($config['scenarios'][$id]) ? $config['scenarios'][$id] : null;
}

// ── Ответы ───────────────────────────────────────────────────────────────────
function bc_json($data, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function bc_fail($status, $message) {
  bc_json(['error' => $message], $status);
}

function bc_body() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

/** Полсекунды тишины в WAV 16 кГц — минимальный валидный файл для пробы STT. */
function bc_silent_wav() {
  $rate = 16000;
  $samples = (int) ($rate * 0.5);
  $data = str_repeat("\x00\x00", $samples);
  return 'RIFF' . pack('V', 36 + strlen($data)) . 'WAVE'
    . 'fmt ' . pack('V', 16) . pack('v', 1) . pack('v', 1)
    . pack('V', $rate) . pack('V', $rate * 2) . pack('v', 2) . pack('v', 16)
    . 'data' . pack('V', strlen($data)) . $data;
}

// ── Gemini Live ──────────────────────────────────────────────────────────────
// Браузер получает ОДНОРАЗОВЫЙ токен, а не ключ: вебсокет открыт со страницы,
// а страница открыта у студента. Настройки сессии запираются здесь же, поэтому
// подменить системный промпт или список инструментов со стороны браузера
// нельзя — он присылает пустой setup.

define('BC_GEMINI_API', 'https://generativelanguage.googleapis.com');
define('BC_GEMINI_WS', 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent');

/** Каталог моделей ключа. Кэш на десять минут: он меняется реже, чем звонят. */
function bc_gemini_models($key) {
  $cache = sys_get_temp_dir() . '/bc-gemini-models-' . substr(sha1($key), 0, 12) . '.json';
  if (is_readable($cache) && (time() - filemtime($cache)) < 600) {
    $cached = json_decode((string) @file_get_contents($cache), true);
    if (is_array($cached)) { return [200, $cached]; }
  }

  $ch = curl_init(BC_GEMINI_API . '/v1beta/models?pageSize=1000&key=' . rawurlencode($key));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 20);
  $body = curl_exec($ch);
  if ($body === false) { $err = curl_error($ch); curl_close($ch); return [502, 'models.list: ' . $err]; }
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($code < 200 || $code >= 300) { return [$code, substr((string) $body, 0, 200)]; }

  $data = json_decode((string) $body, true);
  $models = (is_array($data) && isset($data['models']) && is_array($data['models'])) ? $data['models'] : [];
  @file_put_contents($cache, json_encode($models));
  return [200, $models];
}

/**
 * Выбор модели по политике из broker-config.php.
 *
 * Имён моделей здесь нет намеренно: вписанное в код имя — то, на чём тренажёр
 * замолкал трижды. Политика («умеет вебсокет», «не pro, потому что суточный
 * лимит меньше группы») лежит в src/call/geminiModels.ts и покрыта тестами,
 * сюда она приезжает готовой таблицей. Здесь повторяется только подсчёт.
 */
function bc_gemini_pick($models, $kind) {
  $config = bc_config();
  if (!isset($config['geminiModelRules'][$kind])) { return null; }
  $rule = $config['geminiModelRules'][$kind];

  $best = null;
  $bestScore = -1;
  foreach ($models as $model) {
    if (!is_array($model) || !isset($model['name'])) { continue; }
    $id = strtolower(trim(preg_replace('#^models/#', '', (string) $model['name'])));
    if ($id === '') { continue; }

    $methods = (isset($model['supportedGenerationMethods']) && is_array($model['supportedGenerationMethods']))
      ? $model['supportedGenerationMethods'] : [];
    if (!in_array($rule['method'], $methods, true)) { continue; }

    $rejected = false;
    foreach ($rule['reject'] as $bad) {
      if (strpos($id, $bad) !== false) { $rejected = true; break; }
    }
    if ($rejected) { continue; }

    $version = 0.0;
    if (preg_match('/gemini-(\d+(?:\.\d+)?)/', $id, $m)) { $version = (float) $m[1]; }
    $score = $version * 10;
    foreach ($rule['bonus'] as $bonus) {
      if (strpos($id, (string) $bonus[0]) !== false) { $score += (float) $bonus[1]; }
    }

    // При равных очках берём имя «больше» — у Google в хвосте имени дата.
    if ($score > $bestScore || ($score == $bestScore && $best !== null && strcmp($id, $best) > 0)) {
      $bestScore = $score;
      $best = $id;
    }
  }
  return $best;
}

/** Настройки сессии. Уходят вместе с токеном и после этого заперты. */
function bc_gemini_setup($model, $prompt, $voice) {
  $config = bc_config();
  return [
    'model'             => 'models/' . $model,
    'generationConfig'  => [
      'responseModalities' => ['AUDIO'],
      'temperature'        => 0.85,
      'speechConfig'       => [
        'voiceConfig' => ['prebuiltVoiceConfig' => ['voiceName' => bc_gemini_voice($voice)]],
      ],
    ],
    'systemInstruction' => ['parts' => [['text' => $prompt]]],
    'tools'             => isset($config['geminiTools']) ? $config['geminiTools'] : [],
    // Текст обеих сторон нужен экрану: слова на экране — это весь тренажёр.
    'inputAudioTranscription'  => new stdClass(),
    'outputAudioTranscription' => new stdClass(),
    // Паузы режет провайдер по самому аудио, а не по громкости, — в шумной
    // комнате это работает лучше нашего детектора.
    'realtimeInputConfig' => ['automaticActivityDetection' => new stdClass()],
  ];
}

// Голоса Gemini. С набором Groq не пересекаются ни одним именем — ровно на
// перепутанных наборах тренажёр однажды онемел.
$GEMINI_VOICES = ['Puck', 'Charon', 'Fenrir', 'Orus', 'Kore', 'Aoede', 'Leda', 'Zephyr'];
$GEMINI_DEFAULT_VOICE = 'Puck';

function bc_gemini_voice($raw) {
  global $GEMINI_VOICES, $GEMINI_DEFAULT_VOICE;
  $v = strtolower(trim((string) $raw));
  foreach ($GEMINI_VOICES as $name) {
    if (strtolower($name) === $v) { return $name; }
  }
  return $GEMINI_DEFAULT_VOICE;
}

/** Одноразовый токен на одну сессию. Возвращает [код, тело]. */
function bc_gemini_token($key, $setup) {
  return bc_post_json(
    BC_GEMINI_API . '/v1alpha/auth_tokens?key=' . rawurlencode($key),
    '',
    [
      'uses'                     => 1,
      // Полчаса на сам звонок и две минуты на то, чтобы его начать.
      'expireTime'               => gmdate('Y-m-d\TH:i:s\Z', time() + 1800),
      'newSessionExpireTime'     => gmdate('Y-m-d\TH:i:s\Z', time() + 120),
      'bidiGenerateContentSetup' => $setup,
    ]
  );
}

/** POST JSON к OpenAI-совместимому провайдеру. Возвращает [код, тело]. */
function bc_post_json($url, $key, $payload) {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 60);
  // Пустой ключ — значит авторизация уже в адресе (?key=…, так ходит Google).
  // Отправлять при этом «Authorization: Bearer » нельзя: заголовок пустой, а
  // отказ получается тот же, что при неверном ключе, и искать его пришлось бы
  // среди настоящих проблем с ключами.
  $headers = ['Content-Type: application/json'];
  if ($key !== '') { $headers[] = 'Authorization: Bearer ' . $key; }
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
  $body = curl_exec($ch);
  if ($body === false) {
    $err = curl_error($ch);
    curl_close($ch);
    return [502, 'upstream error: ' . $err];
  }
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return [$code ?: 200, $body];
}

// ═════════════════════════════════════════════════════════════════════════════

switch ($action) {

  // ── Что доступно ───────────────────────────────────────────────────────────
  case 'config': {
    bc_json([
      'transport' => ($openaiKey !== '' && getenv('BROKER_CALL_TRANSPORT') === 'realtime')
        ? 'realtime' : 'pipeline',
      'ready' => [
        'llm'      => ($cerebrasKey !== '' || $groqKey !== ''),
        'stt'      => ($groqKey !== ''),
        'tts'      => ($groqKey !== ''),
        'realtime' => ($openaiKey !== ''),
        // Ключа нет — фронт не пробует Gemini и работает как работал.
        'gemini'   => ($geminiKey !== ''),
      ],
    ]);
  }

  // ── Диагностика ────────────────────────────────────────────────────────────
  // Живые пробы, а не догадки: короткий запрос к каждому сервису и текст
  // ошибки провайдера как есть. Открывается тапом с телефона.
  case 'health': {
    $result = [
      'keys' => [
        'groq'     => $groqKey !== '',
        'cerebras' => $cerebrasKey !== '',
        'openai'   => $openaiKey !== '',
        'gemini'   => $geminiKey !== '',
      ],
      'config' => [
        'scenarios' => count(bc_config()['scenarios']),
        'tools'     => count(bc_config()['tools']),
        'tts_model' => $TTS_MODEL,
        'voices'    => $ORPHEUS_VOICES,
      ],
      'probe' => [],
    ];

    // Диалог: перебираем те же модели и в том же порядке, что боевой звонок.
    if ($groqKey !== '' || $cerebrasKey !== '') {
      $chat = ['ok' => false];
      $attempts = [];
      if ($cerebrasKey !== '') {
        foreach ($CEREBRAS_MODELS as $m) {
          $attempts[] = ['cerebras', 'https://api.cerebras.ai/v1/chat/completions', $cerebrasKey, $m];
        }
      }
      if ($groqKey !== '') {
        foreach ($GROQ_MODELS as $m) {
          $attempts[] = ['groq', 'https://api.groq.com/openai/v1/chat/completions', $groqKey, $m];
        }
      }
      foreach ($attempts as $a) {
        list($name, $url, $key, $model) = $a;
        $t0 = microtime(true);
        // Проба обязана идти ТЕМ ЖЕ путём, что и звонок: с инструментами и
        // через ту же подгонку тела. Прежняя слала голый ping и показывала
        // зелёное, пока настоящий разговор падал с 502 — проверять надо то,
        // что ломается, а не то, что удобно проверить.
        list($code, $body) = bc_post_json($url, $key, bc_shape_payload([
          'messages'    => [['role' => 'user', 'content' => 'ping']],
          'tools'       => bc_config()['tools'],
          'tool_choice' => 'auto',
          'temperature' => 0.85,
          'max_tokens'  => 32,
        ], $model));
        $ms = (int) round((microtime(true) - $t0) * 1000);
        if ($code >= 200 && $code < 300) {
          $chat = ['ok' => true, 'provider' => $name, 'model' => $model, 'ms' => $ms];
          break;
        }
        $chat = [
          'ok'    => false,
          'provider' => $name,
          'model' => $model,
          'status' => $code,
          'error' => substr((string) $body, 0, 200),
        ];
      }
      $result['probe']['chat'] = $chat;
    } else {
      $result['probe']['chat'] = ['ok' => false, 'error' => 'no LLM key'];
    }

    // Озвучка: та самая проба, которой не хватило, чтобы поймать чужие голоса.
    if ($groqKey !== '') {
      $t0 = microtime(true);
      list($code, $body) = bc_post_json(
        'https://api.groq.com/openai/v1/audio/speech',
        $groqKey,
        [
          'model'           => $TTS_MODEL,
          'voice'           => $DEFAULT_VOICE,
          'input'           => 'Apex Freight, this is Mike.',
          'response_format' => 'wav',
        ]
      );
      $ms = (int) round((microtime(true) - $t0) * 1000);
      if ($code >= 200 && $code < 300) {
        $result['probe']['tts'] = ['ok' => true, 'voice' => $DEFAULT_VOICE, 'bytes' => strlen((string) $body), 'ms' => $ms];
      } else {
        $tts = ['ok' => false, 'voice' => $DEFAULT_VOICE, 'status' => $code, 'error' => substr((string) $body, 0, 200)];
        // Самый частый отказ — не поломка, а непринятые условия модели.
        // Ответ провайдера обрезан, поэтому подсказку с рабочей ссылкой
        // собираем сами: иначе адрес не дочитать.
        if (stripos((string) $body, 'terms acceptance') !== false) {
          $tts['hint'] = 'Модель требует однократного принятия условий: https://console.groq.com/playground?model=' . rawurlencode($TTS_MODEL);
        }
        $result['probe']['tts'] = $tts;
      }

      // Распознавание: молчаливый WAV, нам важен факт приёма файла, а не текст.
      $wav = bc_silent_wav();
      $tmp = tempnam(sys_get_temp_dir(), 'bc');
      file_put_contents($tmp, $wav);
      $ch = curl_init('https://api.groq.com/openai/v1/audio/transcriptions');
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_TIMEOUT, 30);
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $groqKey]);
      curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'file'            => new CURLFile($tmp, 'audio/wav', 'probe.wav'),
        'model'           => 'whisper-large-v3-turbo',
        'response_format' => 'text',
      ]);
      $t0 = microtime(true);
      $sttBody = curl_exec($ch);
      $sttCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      @unlink($tmp);
      $result['probe']['stt'] = ($sttCode >= 200 && $sttCode < 300)
        ? ['ok' => true, 'ms' => (int) round((microtime(true) - $t0) * 1000)]
        : ['ok' => false, 'status' => $sttCode, 'error' => substr((string) $sttBody, 0, 200)];
    } else {
      $result['probe']['tts'] = ['ok' => false, 'error' => 'no groq.key'];
      $result['probe']['stt'] = ['ok' => false, 'error' => 'no groq.key'];
    }

    // Gemini: проба идёт тем же путём, что и звонок, — каталог, выбор модели,
    // выпуск токена. Проверять надо то, что ломается, а не то, что удобно
    // проверить: прежняя проба чата слала голый ping и светилась зелёным,
    // пока настоящий разговор падал.
    if ($geminiKey !== '') {
      $t0 = microtime(true);
      list($code, $models) = bc_gemini_models($geminiKey);
      if ($code < 200 || $code >= 300) {
        $result['probe']['gemini'] = ['ok' => false, 'stage' => 'models.list', 'status' => $code, 'error' => substr((string) $models, 0, 200)];
      } else {
        $live = bc_gemini_pick($models, 'live');
        $text = bc_gemini_pick($models, 'text');
        if ($live === null) {
          $result['probe']['gemini'] = [
            'ok'     => false,
            'stage'  => 'pick',
            'error'  => 'на этом ключе нет модели с bidiGenerateContent',
            'models' => count($models),
          ];
        } else {
          // Первый попавшийся сценарий: пробе важно, что токен выпускается с
          // настоящим промптом и настоящими инструментами, а не какой именно.
          $scenarios = bc_config()['scenarios'];
          $first = is_array($scenarios) ? reset($scenarios) : null;
          $prompt = (is_array($first) && isset($first['prompt'])) ? $first['prompt'] : 'You are a freight broker.';
          list($tc, $tb) = bc_gemini_token($geminiKey, bc_gemini_setup($live, $prompt, ''));
          $probe = [
            'ok'         => ($tc >= 200 && $tc < 300),
            'live_model' => $live,
            'text_model' => $text,
            'models'     => count($models),
            'ms'         => (int) round((microtime(true) - $t0) * 1000),
          ];
          if (!$probe['ok']) {
            $probe['stage']  = 'auth_tokens';
            $probe['status'] = $tc;
            $probe['error']  = substr((string) $tb, 0, 200);
          }
          $result['probe']['gemini'] = $probe;
        }
      }
    } else {
      $result['probe']['gemini'] = ['ok' => false, 'error' => 'no gemini.key'];
    }

    bc_json($result);
  }

  // ── Ход разговора ──────────────────────────────────────────────────────────
  // Клиент присылает только историю. Системный промпт и инструменты
  // приклеиваются здесь, поэтому подменить характер брокера или потолок ставки
  // со стороны браузера нельзя.
  case 'turn': {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { bc_fail(405, 'POST only'); }
    $in = bc_body();
    $scenarioId = isset($in['scenarioId']) ? (string) $in['scenarioId'] : '';
    $scenario = bc_scenario($scenarioId);
    if ($scenario === null) { bc_fail(400, 'unknown scenario: ' . $scenarioId); }

    $messages = isset($in['messages']) && is_array($in['messages']) ? $in['messages'] : [];
    array_unshift($messages, ['role' => 'system', 'content' => $scenario['prompt']]);

    $config = bc_config();
    $payload = [
      'messages'    => $messages,
      'tools'       => $config['tools'],
      'tool_choice' => 'auto',
      'temperature' => 0.85,
      'max_tokens'  => 220,
    ];

    // Cerebras первым — щедрый бесплатный лимит. Имена моделей у провайдеров
    // РАЗНЫЕ: старый ai-broker-chat.html слал груповское имя в Cerebras, тот
    // отвечал ошибкой, и каждый вызов молча уходил на запасного.
    $attempts = [];
    if ($cerebrasKey !== '') {
      foreach ($CEREBRAS_MODELS as $m) {
        $attempts[] = ['cerebras', 'https://api.cerebras.ai/v1/chat/completions', $cerebrasKey, $m];
      }
    }
    if ($groqKey !== '') {
      foreach ($GROQ_MODELS as $m) {
        $attempts[] = ['groq', 'https://api.groq.com/openai/v1/chat/completions', $groqKey, $m];
      }
    }
    if (!$attempts) { bc_fail(503, 'no LLM key configured'); }

    $lastError = '';
    foreach ($attempts as $a) {
      list($name, $url, $key, $model) = $a;
      list($code, $body) = bc_post_json($url, $key, bc_shape_payload($payload, $model));
      if ($code < 200 || $code >= 300) {
        $lastError = $name . '/' . $model . ' ' . $code . ': ' . substr((string) $body, 0, 300);
        continue;
      }
      $data = json_decode($body, true);
      $message = isset($data['choices'][0]['message']) ? $data['choices'][0]['message'] : null;
      if ($message === null) { $lastError = $name . ': empty response'; continue; }

      $toolCalls = [];
      if (isset($message['tool_calls']) && is_array($message['tool_calls'])) {
        foreach ($message['tool_calls'] as $call) {
          $args = isset($call['function']['arguments']) ? $call['function']['arguments'] : '{}';
          $parsed = json_decode($args, true);
          $toolCalls[] = [
            'id'        => isset($call['id']) ? $call['id'] : uniqid('call_'),
            'name'      => isset($call['function']['name']) ? $call['function']['name'] : '',
            'arguments' => is_array($parsed) ? $parsed : new stdClass(),
          ];
        }
      }

      bc_json([
        'provider'  => $name,
        'model'     => $model,
        // Сырое сообщение уходит обратно клиенту, чтобы он дописал его в
        // историю ровно в том виде, в каком его ждёт провайдер на следующем
        // ходу — вместе с tool_calls и их id.
        'message'   => $message,
        'content'   => isset($message['content']) ? $message['content'] : '',
        'toolCalls' => $toolCalls,
      ]);
    }
    bc_fail(502, $lastError !== '' ? $lastError : 'all providers failed');
  }

  // ── Распознавание речи ─────────────────────────────────────────────────────
  case 'stt': {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { bc_fail(405, 'POST only'); }
    if ($groqKey === '') { bc_fail(503, 'groq.key is not set'); }
    if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
      bc_fail(400, 'no audio file');
    }

    // Пересобираем multipart из разобранных PHP полей плюс загруженный файл —
    // так же, как это делает api/groq.php.
    $fields = $_POST;
    $fields['file'] = new CURLFile(
      $_FILES['file']['tmp_name'],
      $_FILES['file']['type'] ?: 'audio/wav',
      $_FILES['file']['name'] ?: 'speech.wav'
    );

    $ch = curl_init('https://api.groq.com/openai/v1/audio/transcriptions');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $groqKey]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    $body = curl_exec($ch);
    if ($body === false) { $err = curl_error($ch); curl_close($ch); bc_fail(502, 'upstream: ' . $err); }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    http_response_code($code ?: 200);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    echo $body;
    exit;
  }

  // ── Озвучка ────────────────────────────────────────────────────────────────
  // Orpheus, а не playai-tts: Groq объявил playai устаревшим 23.12.2025.
  case 'tts': {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { bc_fail(405, 'POST only'); }
    if ($groqKey === '') { bc_fail(503, 'groq.key is not set'); }
    $in = bc_body();
    $text = isset($in['text']) ? (string) $in['text'] : '';
    if ($text === '') { bc_fail(400, 'no text'); }

    list($code, $body) = bc_post_json(
      'https://api.groq.com/openai/v1/audio/speech',
      $groqKey,
      [
        'model'           => $TTS_MODEL,
        'voice'           => bc_voice(isset($in['voice']) ? $in['voice'] : ''),
        'input'           => $text,
        'response_format' => 'wav',
      ]
    );
    if ($code < 200 || $code >= 300) { bc_fail($code, substr((string) $body, 0, 300)); }

    http_response_code(200);
    header('Content-Type: audio/wav');
    header('Cache-Control: no-store');
    echo $body;
    exit;
  }

  // ── Разбор звонка ──────────────────────────────────────────────────────────
  // Баллы приходят уже посчитанными кодом — модель их только объясняет.
  case 'debrief': {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { bc_fail(405, 'POST only'); }
    $in = bc_body();
    $scenario = bc_scenario(isset($in['scenarioId']) ? (string) $in['scenarioId'] : '');
    if ($scenario === null) { bc_fail(400, 'unknown scenario'); }

    $lines = [];
    if (isset($in['transcript']) && is_array($in['transcript'])) {
      foreach ($in['transcript'] as $item) {
        $role = (isset($item['role']) && $item['role'] === 'dispatcher') ? 'Dispatcher' : 'Broker';
        $lines[] = $role . ': ' . (isset($item['text']) ? $item['text'] : '');
      }
    }

    $user = "Scores already calculated:\n"
      . json_encode(isset($in['metrics']) ? $in['metrics'] : new stdClass(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
      . "\n\nFacts recorded during the call:\n"
      . json_encode(isset($in['facts']) ? $in['facts'] : new stdClass(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
      . "\n\nTranscript:\n" . implode("\n", $lines);

    $useCerebras = ($cerebrasKey !== '');
    $key = $useCerebras ? $cerebrasKey : $groqKey;
    if ($key === '') { bc_fail(503, 'no LLM key configured'); }

    list($code, $body) = bc_post_json(
      $useCerebras
        ? 'https://api.cerebras.ai/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions',
      $key,
      bc_shape_payload([
        'messages'        => [
          ['role' => 'system', 'content' => $scenario['debrief']],
          ['role' => 'user',   'content' => $user],
        ],
        'temperature'     => 0.3,
        'max_tokens'      => 700,
        'response_format' => ['type' => 'json_object'],
      ], $useCerebras ? $CEREBRAS_MODELS[0] : $GROQ_MODELS[0])
    );
    if ($code < 200 || $code >= 300) { bc_fail(502, substr((string) $body, 0, 300)); }

    $data = json_decode($body, true);
    $content = isset($data['choices'][0]['message']['content'])
      ? $data['choices'][0]['message']['content'] : '{}';
    $parsed = json_decode($content, true);
    if (!is_array($parsed)) {
      // Модель иногда заворачивает JSON в ```json — вытаскиваем первый объект.
      if (preg_match('/\{[\s\S]*\}/', $content, $m)) { $parsed = json_decode($m[0], true); }
    }
    bc_json(is_array($parsed) ? $parsed : new stdClass());
  }

  // ── Эфемерный ключ Realtime ────────────────────────────────────────────────
  case 'realtime-session': {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { bc_fail(405, 'POST only'); }
    if ($openaiKey === '') { bc_fail(503, 'openai.key is not set'); }
    $in = bc_body();
    $scenario = bc_scenario(isset($in['scenarioId']) ? (string) $in['scenarioId'] : '');
    if ($scenario === null) { bc_fail(400, 'unknown scenario'); }

    $config = bc_config();
    $tools = [];
    foreach ($config['tools'] as $tool) {
      $tools[] = [
        'type'        => 'function',
        'name'        => $tool['function']['name'],
        'description' => $tool['function']['description'],
        'parameters'  => $tool['function']['parameters'],
      ];
    }

    list($code, $body) = bc_post_json(
      'https://api.openai.com/v1/realtime/client_secrets',
      $openaiKey,
      [
        'session' => [
          'type'         => 'realtime',
          'model'        => 'gpt-realtime-mini',
          'instructions' => $scenario['prompt'],
          'audio'        => [
            'input'  => ['turn_detection' => ['type' => 'semantic_vad', 'interrupt_response' => true]],
            'output' => ['voice' => isset($in['voice']) ? (string) $in['voice'] : 'ash'],
          ],
          'tools'        => $tools,
        ],
      ]
    );
    if ($code < 200 || $code >= 300) { bc_fail($code, substr((string) $body, 0, 300)); }

    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo $body;
    exit;
  }

  // ── Сессия Gemini Live ─────────────────────────────────────────────────────
  // Отдаём одноразовый токен и имя модели, которое узнали у провайдера прямо
  // сейчас. Ключ в браузер не уезжает ни на минуту.
  case 'gemini-session': {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { bc_fail(405, 'POST only'); }
    if ($geminiKey === '') { bc_fail(503, 'gemini.key is not set'); }
    $in = bc_body();
    $scenario = bc_scenario(isset($in['scenarioId']) ? (string) $in['scenarioId'] : '');
    if ($scenario === null) { bc_fail(400, 'unknown scenario'); }

    list($code, $models) = bc_gemini_models($geminiKey);
    if ($code < 200 || $code >= 300) { bc_fail(502, 'models.list: ' . substr((string) $models, 0, 200)); }

    $model = bc_gemini_pick($models, 'live');
    if ($model === null) { bc_fail(503, 'на этом ключе нет модели с bidiGenerateContent'); }

    list($tc, $tb) = bc_gemini_token(
      $geminiKey,
      bc_gemini_setup($model, $scenario['prompt'], isset($in['voice']) ? $in['voice'] : '')
    );
    if ($tc < 200 || $tc >= 300) { bc_fail($tc, 'auth_tokens: ' . substr((string) $tb, 0, 300)); }

    $token = json_decode((string) $tb, true);
    if (!is_array($token) || !isset($token['name'])) { bc_fail(502, 'auth_tokens ответил без токена'); }

    bc_json([
      'token' => $token['name'],
      'model' => $model,
      'wsUrl' => BC_GEMINI_WS,
      // Настройки заперты на стороне сервера: клиент шлёт пустой setup.
      'setup' => ['locked' => true],
    ]);
  }

  default:
    bc_fail(400, 'unknown action');
}
