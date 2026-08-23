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
$GROQ_MODELS     = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
// Распознавание: large-v3 точнее turbo на акценте и отраслевых словах.
// Имя приходит клиенту через ?action=config — в бандле фронта его нет.
$STT_MODELS      = ['whisper-large-v3', 'whisper-large-v3-turbo'];
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
    if (!is_array($config)) { $config = ['tools' => [], 'calls' => []]; }
  }
  return $config;
}

/** Кодовые имена целей → фразы, в которых видно, кто что делает. */
function bc_goal_words($goals) {
  if (!is_array($goals)) { return []; }
  $config = bc_config();
  $wording = isset($config['goalWording']) && is_array($config['goalWording'])
    ? $config['goalWording'] : [];
  $out = [];
  foreach ($goals as $goal) {
    $key = (string) $goal;
    $out[] = isset($wording[$key]) ? $wording[$key] : $key;
  }
  return $out;
}

/**
 * Ответ модели без полей конкретного провайдера.
 *
 * В историю нужно ровно то, что понимает любая OpenAI-совместимая модель:
 * роль, текст и вызовы инструментов вместе с id. Всё остальное (`reasoning`
 * у gpt-oss) ломает следующую модель цепочки.
 */
function bc_clean_message($message) {
  if (!is_array($message)) { return ['role' => 'assistant', 'content' => '']; }
  $clean = [
    'role'    => isset($message['role']) ? $message['role'] : 'assistant',
    'content' => isset($message['content']) ? $message['content'] : '',
  ];
  if (isset($message['tool_calls']) && is_array($message['tool_calls']) && count($message['tool_calls']) > 0) {
    $clean['tool_calls'] = $message['tool_calls'];
  }
  return $clean;
}

function bc_call($seed) {
  $config = bc_config();
  return isset($config['calls'][$seed]) ? $config['calls'][$seed] : null;
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
    if (isset($rule['require']) && strpos($id, (string) $rule['require']) === false) { continue; }

    $rejected = false;
    foreach ($rule['reject'] as $bad) {
      if (strpos($id, $bad) !== false) { $rejected = true; break; }
    }
    if ($rejected) { continue; }

    $version = 0.0;
    if (preg_match('/gemini-(\d+(?:\.\d+)?)/', $id, $m)) { $version = (float) $m[1]; }
    // Множитель обязан совпадать с src/call/geminiModels.ts: поколение —
    // старший разряд, бонусы разводят модели одного поколения. С прежним
    // множителем 10 боевой сервер выбирал 2.5, а локальный 3.1.
    $score = $version * 100;
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

/**
 * Модели озвучки по убыванию пригодности.
 *
 * Список, а не одно имя: превью-модели Gemini регулярно отвечают
 * «503 high demand» — на первом же живом запросе 3.1-flash-tts оказалась
 * занята. С единственным именем брокер снова остался бы без голоса.
 */
function bc_gemini_rank($models, $kind) {
  $config = bc_config();
  if (!isset($config['geminiModelRules'][$kind])) { return []; }
  $rule = $config['geminiModelRules'][$kind];

  $scored = [];
  foreach ($models as $model) {
    if (!is_array($model) || !isset($model['name'])) { continue; }
    $id = strtolower(trim(preg_replace('#^models/#', '', (string) $model['name'])));
    if ($id === '') { continue; }

    $methods = (isset($model['supportedGenerationMethods']) && is_array($model['supportedGenerationMethods']))
      ? $model['supportedGenerationMethods'] : [];
    if (!in_array($rule['method'], $methods, true)) { continue; }
    if (isset($rule['require']) && strpos($id, (string) $rule['require']) === false) { continue; }

    $rejected = false;
    foreach ($rule['reject'] as $bad) {
      if (strpos($id, $bad) !== false) { $rejected = true; break; }
    }
    if ($rejected) { continue; }

    $version = 0.0;
    if (preg_match('/gemini-(\d+(?:\.\d+)?)/', $id, $m)) { $version = (float) $m[1]; }
    $score = $version * 100;
    foreach ($rule['bonus'] as $bonus) {
      if (strpos($id, (string) $bonus[0]) !== false) { $score += (float) $bonus[1]; }
    }
    $scored[] = ['id' => $id, 'score' => $score];
  }

  usort($scored, function ($a, $b) {
    if ($a['score'] === $b['score']) { return strcmp($b['id'], $a['id']); }
    return $a['score'] < $b['score'] ? 1 : -1;
  });
  $ids = [];
  foreach ($scored as $s) { $ids[] = $s['id']; }
  return $ids;
}

/** Голос Orpheus → голос Gemini, с сохранением пола и тембра. */
function bc_gemini_voice_from_orpheus($raw) {
  $map = [
    'austin' => 'Puck', 'daniel' => 'Charon', 'troy' => 'Fenrir',
    'diana'  => 'Kore', 'hannah' => 'Leda',   'autumn' => 'Aoede',
  ];
  $v = strtolower(trim((string) $raw));
  return bc_gemini_voice(isset($map[$v]) ? $map[$v] : 'Puck');
}

/** Заголовок WAV поверх сырого PCM16 моно — Gemini отдаёт звук без него. */
function bc_wav_from_pcm($pcm, $rate) {
  $len = strlen($pcm);
  return 'RIFF' . pack('V', 36 + $len) . 'WAVE'
    . 'fmt ' . pack('V', 16) . pack('v', 1) . pack('v', 1)
    . pack('V', $rate) . pack('V', $rate * 2) . pack('v', 2) . pack('v', 16)
    . 'data' . pack('V', $len) . $pcm;
}

/**
 * Озвучка через Gemini. Возвращает WAV строкой или null.
 *
 * Нужна потому, что Orpheus у Groq требует однократного принятия условий в
 * консоли, и пока это не сделано, брокер на сайте молчит — голосовой тренажёр
 * без голоса. Gemini TTS работает по обычному HTTP, значит доступен и здесь,
 * в отличие от Live-вебсокета.
 */
function bc_gemini_speak($key, $text, $voice, &$why = null) {
  $clean = trim((string) $text);
  if ($clean === '') { return null; }

  // Возвращает ПАРУ [код, модели]. Взять её как список моделей — ровно та
  // ошибка, из-за которой на боевом озвучка отвечала «все модели отказали»:
  // ранжирование перебирало [код, массив] и не находило ни одной модели.
  list($mcode, $models) = bc_gemini_models($key);
  if ($mcode < 200 || $mcode >= 300 || !is_array($models)) { $why = 'models.list ' . $mcode; return null; }
  $candidates = bc_gemini_rank($models, 'tts');
  if (count($candidates) === 0) { $why = 'в каталоге нет модели с tts в имени (моделей: ' . count($models) . ')'; return null; }

  foreach ($candidates as $model) {
    list($code, $body) = bc_post_json(
      BC_GEMINI_API . '/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($key),
      '',
      [
        'contents' => [['parts' => [['text' => $clean]]]],
        'generationConfig' => [
          'responseModalities' => ['AUDIO'],
          'speechConfig' => [
            'voiceConfig' => ['prebuiltVoiceConfig' => ['voiceName' => bc_gemini_voice_from_orpheus($voice)]],
          ],
        ],
      ]
    );
    if ($code < 200 || $code >= 300) { $why = $model . ' ' . $code . ': ' . substr((string) $body, 0, 160); continue; }

    $data = json_decode((string) $body, true);
    $parts = isset($data['candidates'][0]['content']['parts']) ? $data['candidates'][0]['content']['parts'] : [];
    foreach ($parts as $part) {
      if (!isset($part['inlineData']['data'])) { continue; }
      $pcm = base64_decode((string) $part['inlineData']['data'], true);
      if ($pcm === false || $pcm === '') { $why = $model . ': пустой звук'; continue; }
      $rate = 24000;
      $mime = isset($part['inlineData']['mimeType']) ? (string) $part['inlineData']['mimeType'] : '';
      if (preg_match('/rate=(\d+)/', $mime, $m)) { $rate = (int) $m[1]; }
      return bc_wav_from_pcm($pcm, $rate);
    }
  }
  if ($why === null) { $why = 'модель не вернула звук'; }
  return null;
}

/**
 * Один ход разговора через Gemini по обычному HTTP. Возвращает ответ в
 * формате OpenAI (как Groq) или null — тогда идём к запасным провайдерам.
 *
 * Зеркало broker-call/server/geminiTurn.ts. История клиента хранится в
 * формате OpenAI; здесь она переводится в contents Gemini и обратно, чтобы
 * клиенту не знать, кто отвечал. Подписи размышления (thought_signature)
 * Gemini 3 ездят туда и обратно внутри tool_calls — без них модель теряет
 * нить своего решения.
 */
function bc_gemini_turn($key, $prompt, $messages) {
  list($mcode, $models) = bc_gemini_models($key);
  if ($mcode < 200 || $mcode >= 300 || !is_array($models)) { return null; }
  $candidates = bc_gemini_rank($models, 'chat');
  if (count($candidates) === 0) { return null; }

  $config = bc_config();
  $body = [
    'systemInstruction' => ['parts' => [['text' => $prompt]]],
    'contents'          => bc_gemini_contents($messages),
    'tools'             => $config['geminiTools'],
    'generationConfig'  => ['temperature' => 0.85, 'maxOutputTokens' => 1024],
  ];

  foreach ($candidates as $model) {
    if (bc_gemini_cooling($model)) { continue; }
    list($code, $raw) = bc_post_json(
      BC_GEMINI_API . '/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($key),
      '',
      $body
    );
    // 429 — квота, и она СВОЯ у каждой модели: у новейших flash это 20 запросов
    // в сутки. Помечаем на минуту и идём к следующей, не ждём.
    if ($code === 429) { bc_gemini_cooldown($model); continue; }
    if ($code < 200 || $code >= 300) { continue; }

    $data = json_decode((string) $raw, true);
    $parts = isset($data['candidates'][0]['content']['parts']) ? $data['candidates'][0]['content']['parts'] : [];
    $text = '';
    $toolCalls = [];
    $messageCalls = [];
    $i = 0;
    foreach ($parts as $part) {
      if (isset($part['text'])) { $text .= (string) $part['text']; }
      if (isset($part['functionCall']['name'])) {
        $id = 'call_' . base_convert((string) time(), 10, 36) . '_' . $i++;
        $args = isset($part['functionCall']['args']) && is_array($part['functionCall']['args'])
          ? $part['functionCall']['args'] : [];
        $toolCalls[] = ['id' => $id, 'name' => $part['functionCall']['name'], 'arguments' => $args ? $args : new stdClass()];
        $call = ['id' => $id, 'function' => ['name' => $part['functionCall']['name'], 'arguments' => json_encode($args ? $args : new stdClass())]];
        if (isset($part['thoughtSignature'])) { $call['thought_signature'] = $part['thoughtSignature']; }
        $messageCalls[] = $call;
      }
    }
    $text = trim($text);
    if ($text === '' && count($toolCalls) === 0) { continue; }

    $message = ['role' => 'assistant', 'content' => $text];
    if (count($messageCalls) > 0) { $message['tool_calls'] = $messageCalls; }
    return [
      'provider'  => 'gemini',
      'model'     => $model,
      'message'   => $message,
      'content'   => $text,
      'toolCalls' => $toolCalls,
    ];
  }
  return null;
}

/** OpenAI-история → contents Gemini. Ответы инструментов — по имени, а не по id. */
function bc_gemini_contents($messages) {
  $nameById = [];
  $out = [];
  foreach ($messages as $m) {
    $role = isset($m['role']) ? $m['role'] : '';
    if ($role === 'system') { continue; }

    if ($role === 'tool') {
      $id = isset($m['tool_call_id']) ? (string) $m['tool_call_id'] : '';
      $name = isset($nameById[$id]) ? $nameById[$id] : 'unknown_tool';
      $decoded = json_decode(isset($m['content']) ? (string) $m['content'] : '', true);
      $response = is_array($decoded) ? $decoded : ['result' => isset($m['content']) ? $m['content'] : ''];
      $part = ['functionResponse' => ['name' => $name, 'response' => $response ? $response : new stdClass()]];
      $last = count($out) - 1;
      $allResponses = $last >= 0 && $out[$last]['role'] === 'user';
      if ($allResponses) {
        foreach ($out[$last]['parts'] as $pp) { if (!isset($pp['functionResponse'])) { $allResponses = false; break; } }
      }
      if ($allResponses) { $out[$last]['parts'][] = $part; }
      else { $out[] = ['role' => 'user', 'parts' => [$part]]; }
      continue;
    }

    if ($role === 'assistant') {
      $parts = [];
      if (isset($m['content']) && $m['content'] !== '') { $parts[] = ['text' => (string) $m['content']]; }
      if (isset($m['tool_calls']) && is_array($m['tool_calls'])) {
        foreach ($m['tool_calls'] as $c) {
          $fname = isset($c['function']['name']) ? $c['function']['name'] : '';
          if (isset($c['id'])) { $nameById[(string) $c['id']] = $fname; }
          $args = json_decode(isset($c['function']['arguments']) ? (string) $c['function']['arguments'] : '{}', true);
          $fc = ['functionCall' => ['name' => $fname, 'args' => is_array($args) && $args ? $args : new stdClass()]];
          if (isset($c['thought_signature'])) { $fc['thoughtSignature'] = $c['thought_signature']; }
          $parts[] = $fc;
        }
      }
      if (count($parts) > 0) { $out[] = ['role' => 'model', 'parts' => $parts]; }
      continue;
    }

    $text = trim(isset($m['content']) ? (string) $m['content'] : '');
    if ($text !== '') { $out[] = ['role' => 'user', 'parts' => [['text' => $text]]]; }
  }
  // Gemini требует, чтобы история начиналась с user-хода.
  while (count($out) > 0 && $out[0]['role'] !== 'user') { array_shift($out); }
  return $out;
}

/**
 * Исчерпанные модели, между запросами — в файле: PHP на каждый запрос
 * стартует заново, а без памяти каждый ход сперва стучался бы во все модели
 * с выбранной суточной квотой.
 */
function bc_gemini_cooldown_path() { return sys_get_temp_dir() . '/bc-gemini-cooldown.json'; }
function bc_gemini_cooling($model) {
  $map = json_decode((string) @file_get_contents(bc_gemini_cooldown_path()), true);
  return is_array($map) && isset($map[$model]) && $map[$model] > time();
}
function bc_gemini_cooldown($model) {
  $map = json_decode((string) @file_get_contents(bc_gemini_cooldown_path()), true);
  if (!is_array($map)) { $map = []; }
  $map[$model] = time() + 60;
  @file_put_contents(bc_gemini_cooldown_path(), json_encode($map));
}

function bc_gemini_voice($raw) {
  global $GEMINI_VOICES, $GEMINI_DEFAULT_VOICE;
  $v = strtolower(trim((string) $raw));
  foreach ($GEMINI_VOICES as $name) {
    if (strtolower($name) === $v) { return $name; }
  }
  return $GEMINI_DEFAULT_VOICE;
}

/**
 * Разбор звонка через Gemini. Возвращает массив или null, если не вышло.
 *
 * Формат у Gemini свой: системная часть отдельным полем, а не первым
 * сообщением, ответ лежит в candidates[0].content.parts, а JSON надо просить
 * через responseMimeType — иначе модель заворачивает его в ```json и разбор
 * приходится выковыривать регулярками.
 *
 * Любой отказ означает null и молчаливый откат на прежнего провайдера: разбор
 * студент видит один раз в конце звонка, и уронить его ради нового провайдера
 * значит отобрать то единственное, ради чего он звонил.
 */
function bc_gemini_debrief($key, $system, $user) {
  list($code, $models) = bc_gemini_models($key);
  if ($code < 200 || $code >= 300) { return null; }

  $model = bc_gemini_pick($models, 'text');
  if ($model === null) { return null; }

  list($rc, $body) = bc_post_json(
    BC_GEMINI_API . '/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($key),
    '',
    [
      'systemInstruction' => ['parts' => [['text' => $system]]],
      'contents'          => [['role' => 'user', 'parts' => [['text' => $user]]]],
      'generationConfig'  => [
        'temperature'      => 0.3,
        'maxOutputTokens'  => 900,
        'responseMimeType' => 'application/json',
      ],
    ]
  );
  if ($rc < 200 || $rc >= 300) { return null; }

  $data = json_decode((string) $body, true);
  if (!is_array($data) || !isset($data['candidates'][0]['content']['parts'])) { return null; }

  $text = '';
  foreach ($data['candidates'][0]['content']['parts'] as $part) {
    if (isset($part['text'])) { $text .= $part['text']; }
  }

  $parsed = json_decode($text, true);
  // Пустой разбор хуже, чем сходить к прежнему провайдеру.
  return (is_array($parsed) && $parsed) ? $parsed : null;
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
      'sttModel' => $STT_MODELS[0],
      'ready' => [
        'llm'      => ($cerebrasKey !== '' || $groqKey !== ''),
        'stt'      => ($groqKey !== ''),
        'tts'      => ($groqKey !== ''),
        'realtime' => ($openaiKey !== ''),
        // На боевом Gemini Live не работает, и ключ тут ни при чём.
        //
        // Разговор идёт по вебсокету. Эфемерные токены Google этот сокет не
        // принимает (проверено: ?access_token= — 1008 unregistered callers,
        // ?key= — 1007 invalid), поэтому локально сокет проксирует дев-сервер
        // и держит ключ у себя. PHP так не умеет.
        //
        // Отдавать true означало бы: браузер десять секунд ждёт сокет, молча
        // получает отказ и только потом идёт прежним путём. Студент всё это
        // время слушает тишину. Честнее не начинать.
        'gemini'   => false,
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
        'calls'     => count(bc_config()['calls']),
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

    // Озвучка проверяется ТЕМ ЖЕ путём, каким идёт звонок: сперва Gemini,
    // и только если ключа нет — Groq. Иначе проба показывала бы отказ Orpheus
    // там, где брокер на самом деле говорит.
    if ($geminiKey !== '') {
      $t0 = microtime(true);
      $why = null;
      $wav = bc_gemini_speak($geminiKey, 'Okay, got it.', $DEFAULT_VOICE, $why);
      $result['probe']['tts'] = ($wav === null)
        ? ['ok' => false, 'provider' => 'gemini', 'error' => (string) $why]
        : ['ok' => true, 'provider' => 'gemini', 'bytes' => strlen($wav), 'ms' => (int) round((microtime(true) - $t0) * 1000)];
    } elseif ($groqKey !== '') {
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

    }

    // Распознавание. Своим блоком, а не внутри ветки озвучки: когда озвучка
    // ушла на Gemini, проба слуха вместе с ней пропала из отчёта целиком.
    if ($groqKey !== '') {
      // Молчаливый WAV: нам важен факт приёма файла, а не текст.
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
        'model'           => $STT_MODELS[0],
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
      // Только слух: озвучку выше уже проверил Gemini, и затирать его вердикт
      // здесь означало бы показывать отказ там, где брокер говорит.
      $result['probe']['stt'] = ['ok' => false, 'error' => 'no groq.key'];
      if (!isset($result['probe']['tts'])) {
        $result['probe']['tts'] = ['ok' => false, 'error' => 'no TTS key'];
      }
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
          $calls = bc_config()['calls'];
          $first = is_array($calls) ? reset($calls) : null;
          $prompt = (is_array($first) && isset($first['prompt'])) ? $first['prompt'] : 'You are a freight broker.';
          list($tc, $tb) = bc_gemini_token($geminiKey, bc_gemini_setup($live, $prompt, ''));
          $probe = [
            // Токен выпускается — но сокет его не принимает, а сокета тут и
            // нет. Зелёная строка на этом месте однажды уже стоила разбора:
            // проба светилась, разговор не начинался.
            'ok'         => false,
            'live'       => false,
            'why'        => 'Gemini Live на боевом не работает: вебсокет нужно проксировать, PHP так не умеет. Разговор идёт прежним путём.',
            'token'      => ($tc >= 200 && $tc < 300),
            'live_model' => $live,
            'text_model' => $text,
            'models'     => count($models),
            'ms'         => (int) round((microtime(true) - $t0) * 1000),
          ];
          if (!$probe['token']) {
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
    $seed = isset($in['seed']) ? (string) $in['seed'] : '';
    $scenario = bc_call($seed);
    if ($scenario === null) { bc_fail(400, 'bad seed: ' . $seed); }

    $messages = isset($in['messages']) && is_array($in['messages']) ? $in['messages'] : [];
    // Сводка известных фактов приклеивается к промпту на каждом ходу. Она
    // приходит с клиента: факты лежат в CallMachine, а он исполняется в
    // браузере. Длина ограничена — это не канал для подмены промпта.
    $known = isset($in['known']) ? substr((string) $in['known'], 0, 1500) : '';
    $prompt = $known !== '' ? $scenario['prompt'] . "\n\n" . $known : $scenario['prompt'];

    // Gemini первым — это основной путь разговора. Groq и Cerebras остаются
    // запасными: у них 8000 токенов в минуту, и звонок встаёт на торге.
    if ($geminiKey !== '') {
      $reply = bc_gemini_turn($geminiKey, $prompt, $messages);
      if ($reply !== null) { bc_json($reply); }
    }

    array_unshift($messages, ['role' => 'system', 'content' => $prompt]);

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
        // Сообщение уходит клиенту очищенным от полей конкретного провайдера.
        // gpt-oss кладёт в ответ `reasoning`; оно попадало в историю, а
        // следующая модель цепочки отвечала «400: reasoning is not supported
        // with this model» — на экране это выглядело как «брокер не отвечает».
        'message'   => bc_clean_message($message),
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
    $in = bc_body();
    $text = isset($in['text']) ? (string) $in['text'] : '';
    if ($text === '') { bc_fail(400, 'no text'); }

    // Gemini первым: Orpheus у Groq требует принятия условий, и без этого
    // брокер молчит. Отказ — молча вниз, на Groq.
    if ($geminiKey !== '') {
      $wav = bc_gemini_speak($geminiKey, $text, isset($in['voice']) ? $in['voice'] : '');
      if ($wav !== null) {
        http_response_code(200);
        header('Content-Type: audio/wav');
        header('Cache-Control: no-store');
        echo $wav;
        exit;
      }
    }
    if ($groqKey === '') { bc_fail(503, 'no TTS key configured'); }

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
    $scenario = bc_call(isset($in['seed']) ? (string) $in['seed'] : '');
    if ($scenario === null) { bc_fail(400, 'unknown scenario'); }

    $lines = [];
    if (isset($in['transcript']) && is_array($in['transcript'])) {
      foreach ($in['transcript'] as $item) {
        $role = (isset($item['role']) && $item['role'] === 'dispatcher') ? 'Dispatcher' : 'Broker';
        $lines[] = $role . ': ' . (isset($item['text']) ? $item['text'] : '');
      }
    }

    // Цели человеческими словами, а не кодовыми именами. `give_mc` модель
    // читает как «спросить MC» и советует студенту делать работу брокера —
    // ровно наоборот тому, чему учим. Таблица приезжает из TypeScript вместе
    // с промптами, чтобы формулировка была одна на оба пути.
    $metrics = (isset($in['metrics']) && is_array($in['metrics'])) ? $in['metrics'] : [];
    $did    = bc_goal_words(isset($metrics['goalsMet']) ? $metrics['goalsMet'] : []);
    $didNot = bc_goal_words(isset($metrics['goalsMissed']) ? $metrics['goalsMissed'] : []);

    $user = "Scores already calculated:\n"
      . json_encode(isset($in['metrics']) ? $in['metrics'] : new stdClass(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
      . "\n\nWhat the dispatcher DID do:\n"
      . ($did ? "- " . implode("\n- ", $did) : '- nothing from the checklist')
      . "\n\nWhat the dispatcher did NOT do:\n"
      . ($didNot ? "- " . implode("\n- ", $didNot) : '- nothing missing')
      . "\n\nFacts recorded during the call:\n"
      . json_encode(isset($in['facts']) ? $in['facts'] : new stdClass(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
      . "\n\nTranscript:\n" . implode("\n", $lines);

    // Gemini первым, когда есть ключ: flash-lite даёт 500 разборов в сутки
    // против двадцати у моделей уровня pro, а разбор — ровно один запрос на
    // звонок. Не вышло — молча вниз, на прежний путь.
    if ($geminiKey !== '') {
      $viaGemini = bc_gemini_debrief($geminiKey, $scenario['debrief'], $user);
      if ($viaGemini !== null) { bc_json($viaGemini); }
    }

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
    $scenario = bc_call(isset($in['seed']) ? (string) $in['seed'] : '');
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
    $scenario = bc_call(isset($in['seed']) ? (string) $in['seed'] : '');
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
