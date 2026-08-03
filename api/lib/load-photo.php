<?php
// Разбор фото/скриншота груза (DAT, Truckstop, письмо брокера) + аналитика
// + черновик письма брокеру.
//
// Почему Gemini, а не Groq: на нашем аккаунте Groq нет ни одной модели,
// которая видит картинки (llama-4 недоступны, vision-модели выведены).
// Ключ: ~/domains/dispatch4you.com/gemini.key — как fmcsa.key и groq.key.
//
// ponytail: рынок ставок берём из зашитых ориентиров по типу трейлера, а не
// из живого индекса — своих данных пока мало. Как накопится история разборов
// в tg-loads, считать среднее по лейну оттуда и убрать константы ниже.

const GEMINI_MODEL = 'gemini-2.5-flash';

// Ориентиры $/милю по типу трейлера (без топливной надбавки), лето 2026.
const RPM_BASELINE = array('VAN' => 2.15, 'REEFER' => 2.45, 'FLATBED' => 2.40, 'POWER ONLY' => 1.60);

// Этот файл лежит в api/lib/, то есть на уровень глубже telegram-bot.php:
// до папки с ключами (рядом с public_html) отсюда ТРИ шага вверх, а не два.
function geminiKey() {
  $k = @trim(file_get_contents(__DIR__ . '/../../../gemini.key'));
  return ($k === '' || $k === false) ? null : $k;
}

/**
 * Картинка -> структура груза.
 * @return array{0:?array,1:string} [данные, код ошибки: ''|'nokey'|'api'|'nojson'|'notload']
 */
function photoExtractLoad($bytes, $mime) {
  $key = geminiKey();
  if ($key === null) return array(null, 'nokey');

  $prompt = "You read screenshots of freight load boards (DAT One, Truckstop, 123Loadboard) "
    . "and broker emails, and extract the load.\n\n"
    . "Return ONLY a JSON object:\n"
    . '{"is_load":true,"source":"","origin":"","destination":"","pickup":"","delivery":"","equipment":"",'
    . '"rate":"","miles":"","weight":"","length":"","commodity":"","broker":"","mc":"","contact_name":"",'
    . '"email":"","phone":"","reference":"","notes":""}' . "\n\n"
    . "RULES:\n"
    . "- Copy values VERBATIM from the image. NEVER invent anything. Unknown -> empty string.\n"
    . "- is_load: false if the image is not a freight load listing or load-related email.\n"
    . "- origin/destination: 'CITY, ST' as shown.\n"
    . "- rate: the posted or offered rate in dollars. If only rate-per-mile is shown, put it in rate as printed.\n"
    . "- miles: trip distance if shown. weight: in pounds. length: feet.\n"
    . "- equipment: VAN, REEFER, FLATBED, POWER ONLY, STEP DECK etc.\n"
    . "- broker: the posting company. mc: their MC/DOT number if visible.\n"
    . "- email/phone/contact_name: the broker contact details shown.\n"
    . "- notes: special requirements (tarps, hazmat, team, appointment, TONU terms).\n"
    . "Output JSON only.";

  $body = json_encode(array(
    'contents' => array(array('parts' => array(
      array('text' => $prompt),
      array('inline_data' => array('mime_type' => $mime, 'data' => base64_encode($bytes))),
    ))),
    'generationConfig' => array(
      'temperature' => 0,
      'maxOutputTokens' => 4096,
      // Без этого «размышления» съедают весь лимит вывода и приходит пустой
      // ответ вообще без ошибки — грабля, на которую уже наступали.
      'thinkingConfig' => array('thinkingBudget' => 0),
      'responseMimeType' => 'application/json',
    ),
  ));

  $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL . ':generateContent';
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 90,
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'x-goog-api-key: ' . $key),
  ));
  $raw = curl_exec($ch);
  curl_close($ch);
  $resp = json_decode((string)$raw, true);
  if (!is_array($resp) || isset($resp['error'])) {
    return array(null, 'api:' . substr(isset($resp['error']['message']) ? $resp['error']['message'] : (string)$raw, 0, 200));
  }
  $text = isset($resp['candidates'][0]['content']['parts'][0]['text']) ? $resp['candidates'][0]['content']['parts'][0]['text'] : '';
  $data = json_decode($text, true);
  if (!is_array($data)) return array(null, 'nojson:' . substr($text, 0, 200));
  if (isset($data['is_load']) && $data['is_load'] === false) return array(null, 'notload');
  return array($data, '');
}

// ── Карточка груза со скриншота ─────────────────────────────────────
function photoLoadCard(array $d) {
  $L = array('📦 ГРУЗ СО СКРИНШОТА', '');
  $line = function ($label, $val) use (&$L) { if (!empty($val)) $L[] = $label . ': ' . $val; };
  $line('Маршрут', trim((string)$d['origin'] . (empty($d['destination']) ? '' : '  →  ' . $d['destination']), ' →'));
  $line('Погрузка', isset($d['pickup']) ? $d['pickup'] : '');
  $line('Доставка', isset($d['delivery']) ? $d['delivery'] : '');
  $line('Трейлер', isset($d['equipment']) ? $d['equipment'] : '');
  $line('Ставка', isset($d['rate']) ? $d['rate'] : '');
  $line('Мили', isset($d['miles']) ? $d['miles'] : '');
  $line('Вес', isset($d['weight']) ? $d['weight'] : '');
  $line('Длина', isset($d['length']) ? $d['length'] : '');
  $line('Груз', isset($d['commodity']) ? $d['commodity'] : '');
  $L[] = '';
  $line('Брокер', isset($d['broker']) ? $d['broker'] : '');
  $line('MC', isset($d['mc']) ? $d['mc'] : '');
  $line('Контакт', trim((string)(isset($d['contact_name']) ? $d['contact_name'] : '')));
  $line('Email', isset($d['email']) ? $d['email'] : '');
  $line('Телефон', isset($d['phone']) ? $d['phone'] : '');
  $line('Референс', isset($d['reference']) ? $d['reference'] : '');
  $line('Примечания', isset($d['notes']) ? $d['notes'] : '');
  return implode("\n", $L);
}

// ── Аналитика: считаем то, что считается, и честно говорим про остальное ──
function photoLoadAnalytics(array $d) {
  $num = function ($v) {
    $v = preg_replace('/[^0-9.]/', '', (string)$v);
    return $v === '' ? null : (float)$v;
  };
  $rate  = $num(isset($d['rate']) ? $d['rate'] : '');
  $miles = $num(isset($d['miles']) ? $d['miles'] : '');
  $weight = $num(isset($d['weight']) ? $d['weight'] : '');
  $equip = strtoupper(trim((string)(isset($d['equipment']) ? $d['equipment'] : '')));

  $L = array('📊 АНАЛИТИКА', '');
  $flags = array();

  if ($rate !== null && $miles !== null && $miles > 0 && $rate > 50) {
    $rpm = $rate / $miles;
    $L[] = sprintf('Ставка за милю: $%.2f  (%s за %s миль)',
      $rpm, '$' . number_format($rate, 2), number_format($miles));

    $base = null;
    foreach (RPM_BASELINE as $k => $v) if ($equip !== '' && strpos($equip, $k) !== false) { $base = $v; break; }
    if ($base !== null) {
      $diff = ($rpm - $base) / $base * 100;
      $L[] = sprintf('Ориентир по %s: $%.2f/mi  →  %s%.0f%%', $k, $base, $diff >= 0 ? '+' : '', $diff);
      if ($diff <= -15) $flags[] = 'Ставка заметно ниже ориентира — есть смысл торговаться.';
      elseif ($diff >= 15) $flags[] = 'Ставка выше ориентира — брать можно быстро, такие разбирают.';
    }
    if ($rpm < 1.50) $flags[] = 'Меньше $1.50/mi — на большинстве машин это работа в минус.';
    // Топливо ~$4.00/gal при 6.5 mpg ≈ $0.62/mi
    $L[] = sprintf('Топливо ориентировочно: $%.0f (при 6.5 mpg и $4.00/gal)', $miles * 0.62);
    $L[] = sprintf('Остаётся до прочих расходов: $%.0f', $rate - $miles * 0.62);
  } else {
    $L[] = 'Ставку за милю не посчитать — на скриншоте нет ставки или миль.';
  }

  if ($weight !== null) {
    if ($weight > 45000) $flags[] = 'Вес ' . number_format($weight) . ' lbs — рискует упереться в лимит 80 000 брутто, проверьте свой тягач.';
    elseif ($weight > 42000) $flags[] = 'Вес ' . number_format($weight) . ' lbs — тяжёлый груз, лёгкий тягач не возьмёт.';
  }
  $notes = strtolower((string)(isset($d['notes']) ? $d['notes'] : ''));
  if (strpos($notes, 'hazmat') !== false) $flags[] = 'Hazmat — нужен допуск и страховка.';
  if (strpos($notes, 'tarp') !== false)   $flags[] = 'Нужны тенты — уточните доплату за tarping.';
  if (strpos($notes, 'team') !== false)   $flags[] = 'Требуется экипаж из двух водителей.';
  if (empty($d['email']) && empty($d['phone'])) $flags[] = 'На скриншоте нет контактов брокера — письмо отправить не получится, нужен email.';
  if (empty($d['mc'])) $flags[] = 'MC брокера не виден — проверить его через /mc не выйдет.';

  if ($flags) { $L[] = ''; $L[] = '⚠️ На что смотреть:'; foreach ($flags as $f) $L[] = '• ' . $f; }
  $L[] = '';
  $L[] = 'Ориентиры приблизительные: своей статистики по лейнам пока мало, deadhead и ваши расходы не учтены.';
  return implode("\n", $L);
}

// ── Черновик письма брокеру ─────────────────────────────────────────
function brokerEmailDraft(array $d, $carrier) {
  $route = trim((string)(isset($d['origin']) ? $d['origin'] : '') . ' to ' . (isset($d['destination']) ? $d['destination'] : ''), ' to');
  $ref = !empty($d['reference']) ? $d['reference'] : '';
  $subject = 'Load inquiry' . ($route !== '' ? ' - ' . $route : '') . ($ref !== '' ? ' (Ref ' . $ref . ')' : '');

  $b = array();
  $b[] = 'Hello' . (!empty($d['contact_name']) ? ' ' . $d['contact_name'] : '') . ',';
  $b[] = '';
  $b[] = 'We are interested in your load' . ($route !== '' ? ' ' . $route : '') . '.';
  $details = array();
  if (!empty($d['pickup']))    $details[] = 'Pickup: ' . $d['pickup'];
  if (!empty($d['delivery']))  $details[] = 'Delivery: ' . $d['delivery'];
  if (!empty($d['equipment'])) $details[] = 'Equipment: ' . $d['equipment'];
  if (!empty($d['weight']))    $details[] = 'Weight: ' . $d['weight'];
  if ($ref !== '')             $details[] = 'Reference: ' . $ref;
  if ($details) { $b[] = ''; foreach ($details as $x) $b[] = $x; }
  $b[] = '';
  $b[] = 'Our truck is available and can cover it on time.';
  if (!empty($d['rate'])) {
    $b[] = 'Posted rate is ' . $d['rate'] . '. Please confirm the all-in rate you can do.';
  } else {
    $b[] = 'Please advise the all-in rate you can offer.';
  }
  $b[] = '';
  $b[] = 'Thank you,';
  // Заглушку сюда не кладём: письмо должно оставаться отправляемым как есть —
  // предупреждение о пустой подписи идёт отдельной строкой, а не в теле письма.
  if ($carrier !== '') $b[] = $carrier;

  return array('subject' => $subject, 'to' => isset($d['email']) ? (string)$d['email'] : '', 'body' => implode("\n", $b));
}

// Только сам текст письма — ничего лишнего. Специально отдельная функция от
// draftMeta(): раньше «Кому/Тема» и инструкции ехали в одном сообщении с телом
// письма, и было неясно, что именно копировать.
function draftAsText(array $draft) {
  return "Subject: " . $draft['subject'] . "\n\n" . $draft['body'];
}

// Сопроводительное сообщение — адрес, подсказки, ничего для копирования в письмо.
function draftMeta(array $draft, $extra = '') {
  $L = array();
  $L[] = '✉️ Письмо готово — следующим сообщением придёт его текст целиком, для копирования.';
  $L[] = '';
  $L[] = 'Кому: ' . ($draft['to'] !== '' ? $draft['to'] : '(не найден — впишите вручную при отправке)');
  if (substr_count($draft['body'], "\n") > 0 && preg_match('/Thank you,\s*$/', $draft['body'])) {
    $L[] = '';
    $L[] = '⚠️ Подпись не задана — письмо заканчивается на «Thank you,» без имени. Задайте её: /carrier';
  }
  if ($extra !== '') { $L[] = ''; $L[] = $extra; }
  return implode("\n", $L);
}
