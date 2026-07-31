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
$origin  = isset($_SERVER['HTTP_ORIGIN'])  ? $_SERVER['HTTP_ORIGIN']  : '';
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$allowedOrigins = ['dispatch4you.com', 'localhost', '127.0.0.1'];
$originOk = false;
foreach ($allowedOrigins as $o) {
  if (stripos($origin, $o) !== false || stripos($referer, $o) !== false) { $originOk = true; break; }
}
if (!$originOk) { bc_fail(403, 'forbidden'); }

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

$CEREBRAS_MODEL = 'llama-3.3-70b';
$GROQ_MODEL     = 'llama-3.3-70b-versatile';
$TTS_MODEL      = 'canopylabs/orpheus-v1-english';

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

/** POST JSON к OpenAI-совместимому провайдеру. Возвращает [код, тело]. */
function bc_post_json($url, $key, $payload) {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 60);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $key,
  ]);
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
      ],
    ]);
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
      $attempts[] = ['cerebras', 'https://api.cerebras.ai/v1/chat/completions', $cerebrasKey, $CEREBRAS_MODEL];
    }
    if ($groqKey !== '') {
      $attempts[] = ['groq', 'https://api.groq.com/openai/v1/chat/completions', $groqKey, $GROQ_MODEL];
    }
    if (!$attempts) { bc_fail(503, 'no LLM key configured'); }

    $lastError = '';
    foreach ($attempts as $a) {
      list($name, $url, $key, $model) = $a;
      $payload['model'] = $model;
      list($code, $body) = bc_post_json($url, $key, $payload);
      if ($code < 200 || $code >= 300) {
        $lastError = $name . ' ' . $code . ': ' . substr((string) $body, 0, 300);
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
        'voice'           => isset($in['voice']) ? (string) $in['voice'] : 'zac',
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
      [
        'model'           => $useCerebras ? $CEREBRAS_MODEL : $GROQ_MODEL,
        'messages'        => [
          ['role' => 'system', 'content' => $scenario['debrief']],
          ['role' => 'user',   'content' => $user],
        ],
        'temperature'     => 0.3,
        'max_tokens'      => 700,
        'response_format' => ['type' => 'json_object'],
      ]
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

  default:
    bc_fail(400, 'unknown action');
}
