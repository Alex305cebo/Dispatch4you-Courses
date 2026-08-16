<?php
// Сводка по разбору, кнопки «что дальше» и переключатель языка под каждым
// сообщением бота.
//
// Почему так, а не простынёй: раньше бот вываливал сразу и текст водителю, и
// аналитику, и черновик письма — три экрана, из которых обычно нужен один.
// Теперь сверху короткая сводка, а детали приходят по нажатию.
//
// Про перевод: карточка водителю и письмо брокеру по смыслу всегда должны
// быть на английском (их читают американские водители и брокеры) — русская
// версия существует по прямой просьбе владельца бота, и это осознанный риск:
// переключив на русский, не пересылайте их так водителю/брокеру.
//
// Функции опираются на driverCard/appLink/cityState/brokerReport/fetchBrokerRecord/
// formatBrokerReport/curLang/langToggleButton/editMessage/reply/tgApi из
// telegram-bot.php — файл подключается оттуда, отдельно не работает.

// ── Сводка по рейт-кону ─────────────────────────────────────────────
function rcSummary(array $d, $lang = 'ru') {
  $t = $lang === 'en'
    ? array('title' => '📄 RATE CON PARSED', 'load' => 'Load ID', 'broker' => 'Broker', 'route' => 'Route',
            'pickup' => 'Pickup', 'delivery' => 'Delivery', 'stops' => 'Total stops', 'rate' => 'Rate',
            'miles' => 'Miles', 'weight' => 'Weight', 'commodity' => 'Commodity', 'equipment' => 'Trailer',
            'rpm' => 'Per mile')
    : array('title' => '📄 РЕЙТ-КОН РАЗОБРАН', 'load' => 'Load ID', 'broker' => 'Брокер', 'route' => 'Маршрут',
            'pickup' => 'Погрузка', 'delivery' => 'Доставка', 'stops' => 'Всего точек', 'rate' => 'Ставка',
            'miles' => 'Мили', 'weight' => 'Вес', 'commodity' => 'Груз', 'equipment' => 'Трейлер',
            'rpm' => 'За милю');
  list($first, $last) = rcEnds($d);
  $L = array($t['title'], '');
  if (!empty($d['load_id'])) $L[] = $t['load'] . ': #' . ltrim($d['load_id'], '#');
  if (!empty($d['broker']))  $L[] = $t['broker'] . ': ' . $d['broker'];
  $from = $first ? cityState($first) : null;
  $to   = $last ? cityState($last) : null;
  if ($from || $to) $L[] = $t['route'] . ': ' . ($from ? $from : '?') . '  →  ' . ($to ? $to : '?');
  if ($first && !empty($first['time'])) $L[] = $t['pickup'] . ': ' . $first['time'];
  if ($last && !empty($last['time']))   $L[] = $t['delivery'] . ': ' . $last['time'];
  $stops = (array)(isset($d['stops']) ? $d['stops'] : array());
  if (count($stops) > 2) $L[] = $t['stops'] . ': ' . count($stops);
  $L[] = '';
  if (!empty($d['rate']))      $L[] = $t['rate'] . ': ' . $d['rate'];
  if (!empty($d['miles']))     $L[] = $t['miles'] . ': ' . $d['miles'];
  if (!empty($d['weight']))    $L[] = $t['weight'] . ': ' . $d['weight'];
  if (!empty($d['commodity'])) $L[] = $t['commodity'] . ': ' . $d['commodity'];
  if (!empty($d['equipment'])) $L[] = $t['equipment'] . ': ' . $d['equipment'];

  // Ставка за милю — то, ради чего документ и открывают
  $rate = tgNum(isset($d['rate']) ? $d['rate'] : '');
  $mi   = tgNum(isset($d['miles']) ? $d['miles'] : '');
  if ($rate && $mi) $L[] = sprintf('%s: $%.2f', $t['rpm'], $rate / $mi);
  return implode("\n", $L);
}

// Сводка + предупреждение о ненайденных полях + призыв к действию — единым
// текстом, чтобы кнопка перевода могла пересобрать ВСЁ сообщение целиком.
function rcSummaryFull(array $d, array $missing, $lang = 'ru', array $fraud = array()) {
  $text = rcSummary($d, $lang);
  // Сверка брокера и проверка по часам идут ПЕРВЫМИ после цифр: если с грузом
  // что-то не так, это надо увидеть до того, как рука потянется к кнопкам.
  $fr = fraudText($fraud, $lang);
  if ($fr !== '') $text .= "\n\n" . $fr;
  $hos = hosText(hosFeasibility($d), $lang);
  if ($hos !== '') $text .= "\n\n" . $hos;
  if ($missing) {
    $list = implode(', ', missingFieldsText($missing, $lang));
    $text .= $lang === 'en'
      ? "\n\n⚠️ Not found in the document: {$list}.\nCheck manually — either the rate con doesn't have this, or it's written non-standardly."
      : "\n\n⚠️ Не найдено в документе: {$list}.\nПроверьте вручную — в рейт-коне этих данных нет или они записаны нестандартно.";
  }
  $text .= $lang === 'en' ? "\n\n👇 What to do with this load:" : "\n\n👇 Что сделать с этим грузом:";
  return $text;
}

function tgNum($v) {
  $v = preg_replace('/[^0-9.]/', '', (string)$v);
  return $v === '' ? null : (float)$v;
}

/** Первая погрузка и последняя доставка — из них строится маршрут. */
function rcEnds(array $d) {
  $first = null; $last = null;
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    if (isset($s['type']) && $s['type'] === 'delivery') $last = $s;
    elseif ($first === null) $first = $s;
  }
  return array($first, $last);
}

// ── Клавиатуры: у каждого типа сообщения свои кнопки + переключатель языка ──
function rcKeyboard(array $d, $lang = 'ru') {
  $rows = array(
    array(array('text' => $lang === 'en' ? '🚚 Driver text' : '🚚 Текст водителю', 'callback_data' => 'rc:driver')),
  );
  if (MAIL_ENABLED) $rows[] = array(array('text' => $lang === 'en' ? '✉️ Broker email' : '✉️ Письмо брокеру', 'callback_data' => 'rc:mail'));
  // MC из рейт-кона извлекается давно, а кнопки проверки тут не было — она
  // существовала только у груза со скриншота. Полный отчёт FMCSA в один тап
  // нужен как раз по рейт-кону: это документ, который собираются подписывать.
  // dot появляется, когда MC в документе не напечатан, а брокера нашли в FMCSA
  // по названию — проверить его от этого можно ровно так же.
  if (!empty($d['mc']) || !empty($d['dot'])) $rows[] = array(array('text' => $lang === 'en' ? '🔎 Check broker' : '🔎 Проверить брокера', 'callback_data' => 'rc:mc'));
  $url = appLink($d);
  if ($url !== null) $rows[] = array(array('text' => $lang === 'en' ? '📊 Full breakdown with map' : '📊 Полный разбор с картой', 'url' => $url));
  $rows[] = array(langToggleButton($lang, 'rc'));
  return $rows;
}

function driverKeyboard($lang = 'ru') {
  $rows = array();
  if (MAIL_ENABLED) $rows[] = array(array('text' => $lang === 'en' ? '✉️ Broker email' : '✉️ Письмо брокеру', 'callback_data' => 'rc:mail'));
  $rows[] = array(langToggleButton($lang, 'driver'));
  return $rows;
}

function mailKeyboard($lang = 'ru') {
  return array(array(langToggleButton($lang, 'mail')));
}

function analyticsKeyboard($lang = 'ru') {
  return array(array(langToggleButton($lang, 'analytics')));
}

function fmcsaKeyboard($lang = 'ru') {
  return array(array(langToggleButton($lang, 'fmcsa')));
}

function photoKeyboard(array $d, $lang = 'ru') {
  $rows = array(
    array(array('text' => $lang === 'en' ? '📊 Load analytics' : '📊 Аналитика по грузу', 'callback_data' => 'ph:an')),
  );
  if (MAIL_ENABLED) $rows[] = array(array('text' => $lang === 'en' ? '✉️ Broker email' : '✉️ Письмо брокеру', 'callback_data' => 'ph:mail'));
  if (!empty($d['mc'])) $rows[] = array(array('text' => $lang === 'en' ? '🔎 Check broker' : '🔎 Проверить брокера', 'callback_data' => 'ph:mc'));
  // Та же кнопка на полный разбор, что у рейт-кона — раньше её тут не было
  // вообще, разбор со скриншота не вёл на сайт.
  $url = photoAppLink($d);
  if ($url !== null) $rows[] = array(array('text' => $lang === 'en' ? '📊 Full breakdown with map' : '📊 Полный разбор с картой', 'url' => $url));
  $rows[] = array(langToggleButton($lang, 'photo'));
  return $rows;
}

// ── Нажатия кнопок ──────────────────────────────────────────────────
function handleCallback($token, array $cq) {
  $chatId = isset($cq['message']['chat']['id']) ? $cq['message']['chat']['id'] : null;
  $messageId = isset($cq['message']['message_id']) ? $cq['message']['message_id'] : null;
  $data = isset($cq['data']) ? $cq['data'] : '';
  // Ответить Telegram нужно всегда, иначе на кнопке бесконечно крутится часик
  tgApi($token, 'answerCallbackQuery', array('callback_query_id' => $cq['id']));
  if ($chatId === null) { echo 'ok'; return; }
  finishRequest();

  if ($data === 'lang:ru' || $data === 'lang:en') {
    handleLanguage($token, $chatId, $data === 'lang:en' ? 'en' : 'ru');
    return;
  }

  $st = stateGet($chatId);
  $lang = curLang($st);
  $stale = $lang === 'en'
    ? 'This breakdown has expired — please send the document again.'
    : 'Этот разбор устарел — пришлите документ ещё раз.';

  // tr:<msgtype>:<lang> — перевести КОНКРЕТНОЕ сообщение на месте (editMessageText),
  // не трогая остальную переписку и не запрашивая источник заново. $target — язык
  // ЭТОГО сообщения, он живёт отдельно от языка интерфейса ($lang).
  if (strpos($data, 'tr:') === 0 && $messageId !== null) {
    $parts = explode(':', $data); // tr, msgtype, lang
    $msgtype = isset($parts[1]) ? $parts[1] : '';
    $target = (isset($parts[2]) && $parts[2] === 'en') ? 'en' : 'ru';
    handleTranslate($token, $chatId, $messageId, $st, $msgtype, $target);
    return;
  }

  if ($data === 'rc:driver') {
    if (empty($st['rc'])) { reply($token, $chatId, $stale); return; }
    reply($token, $chatId, $lang === 'en' ? '🚚 Copy and forward to the driver:' : '🚚 Скопируйте и перешлите водителю:');
    // Карточка всегда СТАРТУЕТ на английском независимо от языка интерфейса
    // бота — её читает американский водитель. driverKeyboard('en') отражает
    // именно текущий язык ЭТОГО сообщения, а не настройку диспетчера.
    reply($token, $chatId, driverCard($st['rc'], 'en'), driverKeyboard('en'));
    return;
  }
  if ($data === 'rc:mail' || $data === 'ph:mail') {
    // Кнопка живёт в уже отправленных сообщениях и после выключения функции —
    // нажать её можно в любой момент, значит закрывать надо и здесь.
    if (!MAIL_ENABLED) { reply($token, $chatId, mailOffText($lang)); return; }
    $src = $data === 'rc:mail'
      ? (empty($st['rc']) ? null : rcToLoad($st['rc']))
      : (empty($st['load']) ? null : $st['load']);
    if ($src === null) { reply($token, $chatId, $stale); return; }
    $draft = brokerEmailDraft($src, isset($st['carrier']) ? $st['carrier'] : '', 'en');
    $st['draft'] = $draft;
    $st['mail_src'] = $src;
    // Язык письма и «правили ли его руками» — то, на что смотрят кнопка перевода,
    // /carrier и /edit. Кнопка выдаёт письмо на английском, правок ещё нет.
    $st['draft_lang'] = 'en';
    $st['draft_edited'] = false;
    stateSet($chatId, $st);
    // Два отдельных сообщения: сначала «что это и куда», потом ЧИСТЫЙ текст
    // письма — его и копируют целиком, без единой лишней строки.
    reply($token, $chatId, draftMeta($draft, $lang,
      $lang === 'en'
        ? "✏️ Edit: /edit and the new text\n📤 Send: /send — opens it in your mail app\n🖊 Company signature: /carrier"
        : "✏️ Поправить: /edit и новый текст\n📤 Отправить: /send — открою письмо в вашей почте\n🖊 Подпись компании: /carrier"));
    // Как и карточка водителю, письмо стартует на английском — читает его
    // американский брокер. mailKeyboard('en') — язык именно этого сообщения.
    reply($token, $chatId, draftAsText($draft), mailKeyboard('en'));
    return;
  }
  if ($data === 'ph:an') {
    if (empty($st['load'])) { reply($token, $chatId, $stale); return; }
    reply($token, $chatId, photoLoadAnalytics($st['load'], $lang), analyticsKeyboard($lang));
    return;
  }
  // Одна и та же проверка для груза со скриншота и для рейт-кона — отличается
  // только тем, из какого разбора брать номер.
  if ($data === 'ph:mc' || $data === 'rc:mc') {
    $src = $data === 'ph:mc' ? (isset($st['load']) ? $st['load'] : array()) : (isset($st['rc']) ? $st['rc'] : array());
    // MC из документа, а если его там не было — DOT, найденный по названию.
    $num = isset($src['mc']) ? preg_replace('/\D/', '', (string)$src['mc']) : '';
    $kind = 'broker';
    if ($num === '' && !empty($src['dot'])) { $num = preg_replace('/\D/', '', (string)$src['dot']); $kind = 'dot'; }
    if ($num === '') { reply($token, $chatId, $lang === 'en' ? 'Broker MC not recognized.' : 'MC брокера не распознан.'); return; }
    list($rec, $err) = fetchBrokerRecord($kind, $num);
    if ($rec === null) { reply($token, $chatId, brokerReport($kind, $num, $lang)); return; }
    $st['fmcsa'] = array('rec' => $rec, 'kind' => $kind, 'number' => $num);
    stateSet($chatId, $st);
    reply($token, $chatId, formatBrokerReport($rec, $kind, $num, $lang), fmcsaKeyboard($lang));
    return;
  }
  reply($token, $chatId, $stale);
}

// Перевод уже отправленного сообщения на месте — данные берём из состояния,
// FMCSA/скриншот/рейт-кон заново не запрашиваем.
function handleTranslate($token, $chatId, $messageId, array $st, $msgtype, $lang) {
  switch ($msgtype) {
    case 'rc':
      if (empty($st['rc'])) return;
      editMessage($token, $chatId, $messageId,
        rcSummaryFull($st['rc'], isset($st['rc_missing']) ? $st['rc_missing'] : array(), $lang,
          isset($st['rc_fraud']) ? $st['rc_fraud'] : array()),
        rcKeyboard($st['rc'], $lang));
      return;
    case 'driver':
      if (empty($st['rc'])) return;
      // Собирали карточку жёстко на 'en', а $lang уходил только в подпись кнопки:
      // нажатие меняло надпись, текст оставался английским в обе стороны.
      editMessage($token, $chatId, $messageId, driverCard($st['rc'], $lang), driverKeyboard($lang));
      return;
    case 'mail':
      if (!MAIL_ENABLED) return;
      if (empty($st['draft'])) return;
      // /edit заменяет черновик свободным текстом — перегенерировать шаблон
      // после этого нечем, правку молча не затираем.
      if (!empty($st['draft_edited'])) return;
      $src = !empty($st['mail_src']) ? $st['mail_src'] : null;
      if ($src === null) return;
      $draft = brokerEmailDraft($src, isset($st['carrier']) ? $st['carrier'] : '', $lang);
      // Черновик в состоянии — ровно тот, что человек видит на экране: иначе
      // /send и /edit продолжали бы работать с английским письмом.
      $st['draft'] = $draft;
      $st['draft_lang'] = $lang;
      stateSet($chatId, $st);
      editMessage($token, $chatId, $messageId, draftAsText($draft), mailKeyboard($lang));
      return;
    case 'photo':
      if (empty($st['load'])) return;
      editMessage($token, $chatId, $messageId, photoLoadCard($st['load'], $lang), photoKeyboard($st['load'], $lang));
      return;
    case 'analytics':
      if (empty($st['load'])) return;
      editMessage($token, $chatId, $messageId, photoLoadAnalytics($st['load'], $lang), analyticsKeyboard($lang));
      return;
    case 'fmcsa':
      if (empty($st['fmcsa'])) return;
      $f = $st['fmcsa'];
      editMessage($token, $chatId, $messageId, formatBrokerReport($f['rec'], $f['kind'], $f['number'], $lang), fmcsaKeyboard($lang));
      return;
  }
}

// Из чего собирать письмо брокеру, если кнопку «Письмо брокеру» ещё не нажимали
// (например, человек сразу задал /carrier после разбора). $st['last'] помнит, что
// разбирали последним, — иначе после рейт-кона письмо ушло бы по позавчерашнему
// скриншоту, который всё ещё лежит в $st['load'].
function mailSource(array $st) {
  $order = (isset($st['last']) && $st['last'] === 'rc') ? array('rc', 'load') : array('load', 'rc');
  foreach ($order as $k) {
    if ($k === 'rc'   && !empty($st['rc']))   return rcToLoad($st['rc']);
    if ($k === 'load' && !empty($st['load'])) return $st['load'];
  }
  return !empty($st['mail_src']) ? $st['mail_src'] : null;
}

// Рейт-кон → форма груза со скриншота: письмо брокеру собирает один и тот же
// код, что бы человек ни прислал — PDF или картинку.
function rcToLoad(array $d) {
  list($first, $last) = rcEnds($d);
  $refs = function ($s) {
    $r = array_filter((array)(isset($s['refs']) ? $s['refs'] : array()));
    return $r ? implode(', ', $r) : '';
  };
  return array(
    'origin' => $first ? (string)cityState($first) : '',
    'destination' => $last ? (string)cityState($last) : '',
    'pickup' => $first && !empty($first['time']) ? $first['time'] : '',
    'delivery' => $last && !empty($last['time']) ? $last['time'] : '',
    'equipment' => isset($d['equipment']) ? $d['equipment'] : '',
    'rate' => isset($d['rate']) ? $d['rate'] : '',
    'miles' => isset($d['miles']) ? $d['miles'] : '',
    'weight' => isset($d['weight']) ? $d['weight'] : '',
    'commodity' => isset($d['commodity']) ? $d['commodity'] : '',
    'broker' => isset($d['broker']) ? $d['broker'] : '',
    // Раньше тут стояли пустые строки, и письмо по рейт-кону ВСЕГДА уходило без
    // адресата — хотя почта и телефон брокера извлекаются из документа с самого
    // начала. Поля в разборе называются иначе, чем в грузе со скриншота, отсюда
    // и потеря: broker_email → email, broker_phone → phone.
    'mc' => isset($d['mc']) ? $d['mc'] : '',
    'contact_name' => '',
    'email' => isset($d['broker_email']) ? $d['broker_email'] : '',
    'phone' => isset($d['broker_phone']) ? $d['broker_phone'] : '',
    'reference' => isset($d['load_id']) ? ltrim($d['load_id'], '#') : '',
    'notes' => $first ? $refs($first) : '',
  );
}
