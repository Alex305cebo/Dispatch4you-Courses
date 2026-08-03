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
    . '"email":"","phone":"","reference":"","notes":"",'
    . '"spot_rate":"","posted_age":"","trip_type":"","deadhead":"","broker_rating":"","days_to_pay":""}' . "\n\n"
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
    . "- spot_rate: the load board's OWN displayed market/average rate for this lane if shown "
    . "(e.g. a 'DAT Rate', 'Market avg $X/mi' or trend figure next to the posted rate) — NOT the posted rate itself.\n"
    . "- posted_age: how long ago it was posted, as printed (e.g. '2 hrs ago', '13 min ago').\n"
    . "- trip_type: 'Full' or 'Partial' if shown.\n"
    . "- deadhead: deadhead/empty miles to the pickup if the board shows them (only appears when searched from a truck location).\n"
    . "- broker_rating: any broker trust/credit badge or tier shown next to their name (e.g. 'Blue', 'Gold', a star rating).\n"
    . "- days_to_pay: broker's average days-to-pay if shown (e.g. 'Avg 32 days').\n"
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
function photoLoadCard(array $d, $lang = 'ru') {
  $t = $lang === 'en'
    ? array('title' => '📦 LOAD FROM SCREENSHOT', 'route' => 'Route', 'pickup' => 'Pickup', 'delivery' => 'Delivery',
            'equipment' => 'Trailer', 'rate' => 'Rate', 'miles' => 'Miles', 'weight' => 'Weight', 'length' => 'Length',
            'commodity' => 'Commodity', 'broker' => 'Broker', 'contact' => 'Contact', 'phone' => 'Phone',
            'reference' => 'Reference', 'notes' => 'Notes', 'type' => 'Type', 'posted' => 'Posted',
            'spot' => 'Board market rate', 'deadhead' => 'Deadhead', 'rating' => 'Broker rating', 'pay' => 'Broker pay terms')
    : array('title' => '📦 ГРУЗ СО СКРИНШОТА', 'route' => 'Маршрут', 'pickup' => 'Погрузка', 'delivery' => 'Доставка',
            'equipment' => 'Трейлер', 'rate' => 'Ставка', 'miles' => 'Мили', 'weight' => 'Вес', 'length' => 'Длина',
            'commodity' => 'Груз', 'broker' => 'Брокер', 'contact' => 'Контакт', 'phone' => 'Телефон',
            'reference' => 'Референс', 'notes' => 'Примечания', 'type' => 'Тип', 'posted' => 'Опубликовано',
            'spot' => 'Рыночная ставка биржи', 'deadhead' => 'DH', 'rating' => 'Рейтинг брокера', 'pay' => 'Срок оплаты брокера');
  $L = array($t['title'], '');
  $line = function ($label, $val) use (&$L) { if (!empty($val)) $L[] = $label . ': ' . $val; };
  $line($t['route'], trim((string)$d['origin'] . (empty($d['destination']) ? '' : '  →  ' . $d['destination']), ' →'));
  $line($t['pickup'], isset($d['pickup']) ? $d['pickup'] : '');
  $line($t['delivery'], isset($d['delivery']) ? $d['delivery'] : '');
  $line($t['equipment'], isset($d['equipment']) ? $d['equipment'] : '');
  $line($t['rate'], isset($d['rate']) ? $d['rate'] : '');
  $line($t['miles'], isset($d['miles']) ? $d['miles'] : '');
  $line($t['weight'], isset($d['weight']) ? $d['weight'] : '');
  $line($t['length'], isset($d['length']) ? $d['length'] : '');
  $line($t['commodity'], isset($d['commodity']) ? $d['commodity'] : '');
  $L[] = '';
  $line($t['broker'], isset($d['broker']) ? $d['broker'] : '');
  $line('MC', isset($d['mc']) ? $d['mc'] : '');
  $line($t['contact'], trim((string)(isset($d['contact_name']) ? $d['contact_name'] : '')));
  $line('Email', isset($d['email']) ? $d['email'] : '');
  $line($t['phone'], isset($d['phone']) ? $d['phone'] : '');
  $line($t['reference'], isset($d['reference']) ? $d['reference'] : '');
  $line($t['notes'], isset($d['notes']) ? $d['notes'] : '');
  $extra = array();
  $add = function ($label, $val) use (&$extra) { if (!empty($val)) $extra[] = $label . ': ' . $val; };
  $add($t['type'], isset($d['trip_type']) ? $d['trip_type'] : '');
  $add($t['posted'], isset($d['posted_age']) ? $d['posted_age'] : '');
  $add($t['spot'], isset($d['spot_rate']) ? $d['spot_rate'] : '');
  $add($t['deadhead'], isset($d['deadhead']) ? $d['deadhead'] : '');
  $add($t['rating'], isset($d['broker_rating']) ? $d['broker_rating'] : '');
  $add($t['pay'], isset($d['days_to_pay']) ? $d['days_to_pay'] : '');
  if ($extra) { $L[] = ''; foreach ($extra as $x) $L[] = $x; }
  return implode("\n", $L);
}

// ── Аналитика: считаем то, что считается, и честно говорим про остальное ──
function photoLoadAnalytics(array $d, $lang = 'ru') {
  $en = $lang === 'en';
  $num = function ($v) {
    $v = preg_replace('/[^0-9.]/', '', (string)$v);
    return $v === '' ? null : (float)$v;
  };
  $rate     = $num(isset($d['rate']) ? $d['rate'] : '');
  $miles    = $num(isset($d['miles']) ? $d['miles'] : '');
  $weight   = $num(isset($d['weight']) ? $d['weight'] : '');
  $deadhead = $num(isset($d['deadhead']) ? $d['deadhead'] : '');
  $spot     = $num(isset($d['spot_rate']) ? $d['spot_rate'] : '');
  // Рыночную ставку биржи иногда печатают как «$/милю» (число вроде 2.5), иногда
  // как полную сумму рейса — отличаем по величине, полную сумму переводим в $/mi.
  $spotRpm = null;
  if ($spot !== null) $spotRpm = ($spot < 20 ? $spot : ($miles > 0 ? $spot / $miles : null));
  $equip = strtoupper(trim((string)(isset($d['equipment']) ? $d['equipment'] : '')));

  $L = array($en ? '📊 ANALYTICS' : '📊 АНАЛИТИКА', '');
  $flags = array();

  if ($rate !== null && $miles !== null && $miles > 0 && $rate > 50) {
    $rpm = $rate / $miles;
    $L[] = $en
      ? sprintf('Rate per mile: $%.2f  (%s for %s miles)', $rpm, '$' . number_format($rate, 2), number_format($miles))
      : sprintf('Ставка за милю: $%.2f  (%s за %s миль)', $rpm, '$' . number_format($rate, 2), number_format($miles));

    // Реальная ставка биржи важнее нашего статичного ориентира — если она есть
    // на скриншоте, сравниваем с ней и ориентир по типу трейлера не показываем,
    // чтобы не путать двумя разными цифрами.
    if ($spotRpm !== null && $spotRpm > 0) {
      $diff = ($rpm - $spotRpm) / $spotRpm * 100;
      $L[] = ($en ? 'Board market rate: $%.2f/mi  →  %s%.0f%%' : 'Рыночная ставка биржи: $%.2f/mi  →  %s%.0f%%');
      $L[count($L) - 1] = sprintf($L[count($L) - 1], $spotRpm, $diff >= 0 ? '+' : '', $diff);
      if ($diff <= -15) $flags[] = $en ? 'Rate is notably below market — worth negotiating.' : 'Ставка заметно ниже рыночной — есть смысл торговаться.';
      elseif ($diff >= 15) $flags[] = $en ? 'Rate is above market — grab it fast, these get taken quickly.' : 'Ставка выше рыночной — брать можно быстро, такие разбирают.';
    } else {
      $base = null;
      foreach (RPM_BASELINE as $k => $v) if ($equip !== '' && strpos($equip, $k) !== false) { $base = $v; break; }
      if ($base !== null) {
        $diff = ($rpm - $base) / $base * 100;
        $L[] = sprintf(($en ? 'Baseline for %s: $%.2f/mi  →  %s%.0f%%' : 'Ориентир по %s: $%.2f/mi  →  %s%.0f%%'), $k, $base, $diff >= 0 ? '+' : '', $diff);
        if ($diff <= -15) $flags[] = $en ? 'Rate is notably below our baseline — worth negotiating.' : 'Ставка заметно ниже ориентира — есть смысл торговаться.';
        elseif ($diff >= 15) $flags[] = $en ? 'Rate is above our baseline — grab it fast, these get taken quickly.' : 'Ставка выше ориентира — брать можно быстро, такие разбирают.';
      }
    }
    if ($rpm < 1.50) $flags[] = $en ? 'Under $1.50/mi — a loss for most trucks.' : 'Меньше $1.50/mi — на большинстве машин это работа в минус.';

    // Порожний пробег со скрина, если он там есть, — иначе честно только гружёные мили
    $totalMiles = $miles + (float)$deadhead;
    $fuel = $totalMiles * 0.62; // ~$4.00/gal при 6.5 mpg
    if ($deadhead !== null && $deadhead > 0) {
      $L[] = sprintf($en ? 'Deadhead: %s mi (from the board, not an estimate)' : 'DH: %s миль (с биржи, не оценка)', number_format($deadhead));
      $L[] = sprintf($en ? 'Fuel estimate: $%.0f over %s total miles (6.5 mpg, $4.00/gal)' : 'Топливо ориентировочно: $%.0f на %s миль всего (при 6.5 mpg и $4.00/gal)', $fuel, number_format($totalMiles));
    } else {
      $L[] = sprintf($en ? 'Fuel estimate: $%.0f (6.5 mpg, $4.00/gal, deadhead not included)' : 'Топливо ориентировочно: $%.0f (при 6.5 mpg и $4.00/gal, без учёта порожнего пробега)', $fuel);
    }
    $L[] = sprintf($en ? 'Left before other costs: $%.0f' : 'Остаётся до прочих расходов: $%.0f', $rate - $fuel);
  } else {
    $L[] = $en ? "Can't calculate rate per mile — no rate or miles on the screenshot." : 'Ставку за милю не посчитать — на скриншоте нет ставки или миль.';
  }

  if (!empty($d['posted_age'])) {
    $L[] = '';
    $L[] = ($en ? 'Posted: ' : 'Опубликовано: ') . $d['posted_age'];
    $age = strtolower((string)$d['posted_age']);
    if (preg_match('/\b(\d+)\s*min/', $age, $am) && (int)$am[1] < 20) {
      $flags[] = $en ? "Very fresh post — barely any competition on it yet." : 'Совсем свежий пост — конкуренции по нему ещё почти нет.';
    } elseif (preg_match('/\b(\d+)\s*(hr|hour)/', $age, $am) && (int)$am[1] >= 6) {
      $flags[] = $en ? "Posted several hours ago — the rate may have already dropped, or the load is problematic. Confirm the current price." : 'Висит уже несколько часов — вероятно, ставку уже снижали или груз проблемный. Уточните текущую цену.';
    }
  }
  if (!empty($d['trip_type']) && stripos($d['trip_type'], 'partial') !== false) {
    $flags[] = $en ? 'Partial — possible extra stops/consolidation, confirm the exact route with the broker.' : 'Partial — возможны доп. остановки/подсадка, уточните точный маршрут у брокера.';
  }
  if (!empty($d['broker_rating']) || !empty($d['days_to_pay'])) {
    $L[] = '';
    if (!empty($d['broker_rating'])) $L[] = ($en ? 'Broker board rating: ' : 'Рейтинг брокера на бирже: ') . $d['broker_rating'];
    if (!empty($d['days_to_pay']))   $L[] = ($en ? 'Average pay terms: ' : 'Средний срок оплаты: ') . $d['days_to_pay'];
    if (!empty($d['days_to_pay']) && preg_match('/(\d+)/', (string)$d['days_to_pay'], $dm) && (int)$dm[1] > 45) {
      $flags[] = $en ? 'Pay terms over 45 days — if working without factoring, plan for the cash-flow gap.' : 'Оплата дольше 45 дней — если работаете без факторинга, посчитайте кассовый разрыв заранее.';
    }
  }

  if ($weight !== null) {
    if ($weight > 45000) $flags[] = ($en ? 'Weight ' . number_format($weight) . ' lbs — risks the 80,000 gross limit, check your tractor.' : 'Вес ' . number_format($weight) . ' lbs — рискует упереться в лимит 80 000 брутто, проверьте свой тягач.');
    elseif ($weight > 42000) $flags[] = ($en ? 'Weight ' . number_format($weight) . ' lbs — heavy load, a light tractor won\'t take it.' : 'Вес ' . number_format($weight) . ' lbs — тяжёлый груз, лёгкий тягач не возьмёт.');
  }
  $notes = strtolower((string)(isset($d['notes']) ? $d['notes'] : ''));
  if (strpos($notes, 'hazmat') !== false) $flags[] = $en ? 'Hazmat — needs an endorsement and insurance.' : 'Hazmat — нужен допуск и страховка.';
  if (strpos($notes, 'tarp') !== false)   $flags[] = $en ? 'Tarps needed — confirm the tarping surcharge.' : 'Нужны тенты — уточните доплату за tarping.';
  if (strpos($notes, 'team') !== false)   $flags[] = $en ? 'Team drivers required.' : 'Требуется экипаж из двух водителей.';
  if (empty($d['email']) && empty($d['phone'])) $flags[] = $en ? "No broker contact on the screenshot — can't send an email, need one." : 'На скриншоте нет контактов брокера — письмо отправить не получится, нужен email.';
  if (empty($d['mc'])) $flags[] = $en ? "Broker MC not visible — can't check it via /mc." : 'MC брокера не виден — проверить его через /mc не выйдет.';

  if ($flags) { $L[] = ''; $L[] = $en ? '⚠️ Worth checking:' : '⚠️ На что смотреть:'; foreach ($flags as $f) $L[] = '• ' . $f; }
  $L[] = '';
  if ($spotRpm !== null) {
    $L[] = $en ? 'The market rate came straight off the screenshot. Deadhead (unless shown above) and your own costs are still not accounted for.'
               : 'Ставка рынка — с самого скриншота. DH (если не указан выше) и ваши расходы всё ещё не учтены.';
  } else {
    $L[] = $en ? "Baselines are approximate: we don't have much of our own lane data yet, deadhead and your costs are not accounted for."
               : 'Ориентиры приблизительные: своей статистики по лейнам пока мало, deadhead и ваши расходы не учтены.';
  }
  return implode("\n", $L);
}

// ── Черновик письма брокеру ─────────────────────────────────────────
// ⚠️ По умолчанию — английский: письмо читает американский брокер. Русская
// версия существует по прямой просьбе владельца бота — переключив на русский,
// не отправляйте письмо брокеру в таком виде, он его не поймёт.
function brokerEmailDraft(array $d, $carrier, $lang = 'en') {
  $en = $lang === 'en';
  $route = trim((string)(isset($d['origin']) ? $d['origin'] : '') . ' to ' . (isset($d['destination']) ? $d['destination'] : ''), ' to');
  $ref = !empty($d['reference']) ? $d['reference'] : '';
  $subject = ($en ? 'Checking your load' : 'Уточняю по вашему грузу') . ($route !== '' ? ' - ' . $route : '');

  $b = array();
  $b[] = ($en ? 'Hello' : 'Здравствуйте') . (!empty($d['contact_name']) ? ' ' . $d['contact_name'] : '') . ',';
  $b[] = '';
  // Маршрут — отдельной строкой, а не приклеен к предыдущей фразе.
  $b[] = ($en ? 'We are interested in your load' : 'Нас интересует ваш груз') . ($route === '' ? '.' : '');
  if ($route !== '') $b[] = $route;
  $details = array();
  $lbl = $en
    ? array('pickup' => 'Pickup', 'delivery' => 'Delivery', 'equipment' => 'Equipment', 'weight' => 'Weight', 'reference' => 'Reference')
    : array('pickup' => 'Погрузка', 'delivery' => 'Доставка', 'equipment' => 'Трейлер', 'weight' => 'Вес', 'reference' => 'Референс');
  if (!empty($d['pickup']))    $details[] = $lbl['pickup'] . ': ' . $d['pickup'];
  if (!empty($d['delivery']))  $details[] = $lbl['delivery'] . ': ' . $d['delivery'];
  if (!empty($d['equipment'])) $details[] = $lbl['equipment'] . ': ' . $d['equipment'];
  if (!empty($d['weight']))    $details[] = $lbl['weight'] . ': ' . $d['weight'];
  if ($ref !== '')             $details[] = $lbl['reference'] . ': ' . $ref;
  if ($details) { $b[] = ''; foreach ($details as $x) $b[] = $x; }
  $b[] = '';
  $b[] = $en ? 'Our truck is available and can cover it on time.' : 'Наш трак свободен и может выполнить рейс вовремя.';
  $b[] = $en ? 'Please confirm BEST rate for this load.' : 'Пожалуйста, подтвердите ЛУЧШУЮ ставку по этому грузу.';
  $b[] = '';
  $b[] = $en ? 'Thank you' : 'Спасибо';
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
function draftMeta(array $draft, $lang = 'ru', $extra = '') {
  $en = $lang === 'en';
  $L = array();
  $L[] = $en
    ? '✉️ Email is ready — the next message has its full text, for copying.'
    : '✉️ Письмо готово — следующим сообщением придёт его текст целиком, для копирования.';
  $L[] = '';
  $L[] = ($en ? 'To: ' : 'Кому: ') . ($draft['to'] !== '' ? $draft['to'] : ($en ? '(not found — enter it manually when sending)' : '(не найден — впишите вручную при отправке)'));
  if (substr_count($draft['body'], "\n") > 0 && preg_match('/(Thank you|Спасибо)\s*$/u', $draft['body'])) {
    $L[] = '';
    $L[] = $en
      ? '⚠️ No signature set — the email ends on "Thank you" with no name. Set it: /carrier'
      : '⚠️ Подпись не задана — письмо заканчивается без имени. Задайте её: /carrier';
  }
  if ($extra !== '') { $L[] = ''; $L[] = $extra; }
  return implode("\n", $L);
}
