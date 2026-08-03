<?php
// Сводка по разбору и кнопки «что дальше» под ней.
//
// Почему так, а не простынёй: раньше бот вываливал сразу и текст водителю, и
// аналитику, и черновик письма — три экрана, из которых обычно нужен один.
// Теперь сверху короткая сводка, а детали приходят по нажатию.
//
// Функции опираются на driverCard/appLink/cityState/brokerReport/reply/tgApi из
// telegram-bot.php — файл подключается оттуда, отдельно не работает.

// ── Сводка по рейт-кону ─────────────────────────────────────────────
function rcSummary(array $d) {
  list($first, $last) = rcEnds($d);
  $L = array('📄 РЕЙТ-КОН РАЗОБРАН', '');
  if (!empty($d['load_id'])) $L[] = 'Load ID: #' . ltrim($d['load_id'], '#');
  if (!empty($d['broker']))  $L[] = 'Брокер: ' . $d['broker'];
  $from = $first ? cityState($first) : null;
  $to   = $last ? cityState($last) : null;
  if ($from || $to) $L[] = 'Маршрут: ' . ($from ? $from : '?') . '  →  ' . ($to ? $to : '?');
  if ($first && !empty($first['time'])) $L[] = 'Погрузка: ' . $first['time'];
  if ($last && !empty($last['time']))   $L[] = 'Доставка: ' . $last['time'];
  $stops = (array)(isset($d['stops']) ? $d['stops'] : array());
  if (count($stops) > 2) $L[] = 'Всего точек: ' . count($stops);
  $L[] = '';
  if (!empty($d['rate']))      $L[] = 'Ставка: ' . $d['rate'];
  if (!empty($d['miles']))     $L[] = 'Мили: ' . $d['miles'];
  if (!empty($d['weight']))    $L[] = 'Вес: ' . $d['weight'];
  if (!empty($d['commodity'])) $L[] = 'Груз: ' . $d['commodity'];
  if (!empty($d['equipment'])) $L[] = 'Трейлер: ' . $d['equipment'];

  // Ставка за милю — то, ради чего документ и открывают
  $rate = tgNum(isset($d['rate']) ? $d['rate'] : '');
  $mi   = tgNum(isset($d['miles']) ? $d['miles'] : '');
  if ($rate && $mi) $L[] = sprintf('За милю: $%.2f', $rate / $mi);
  return implode("\n", $L);
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

// ── Клавиатуры ──────────────────────────────────────────────────────
function rcKeyboard(array $d) {
  $rows = array(
    array(array('text' => '🚚 Текст водителю', 'callback_data' => 'rc:driver')),
    array(array('text' => '✉️ Письмо брокеру', 'callback_data' => 'rc:mail')),
  );
  $url = appLink($d);
  if ($url !== null) $rows[] = array(array('text' => '📊 Полный разбор с картой', 'url' => $url));
  return $rows;
}

function photoKeyboard(array $d) {
  $rows = array(
    array(array('text' => '📊 Аналитика по грузу', 'callback_data' => 'ph:an')),
    array(array('text' => '✉️ Письмо брокеру', 'callback_data' => 'ph:mail')),
  );
  if (!empty($d['mc'])) $rows[] = array(array('text' => '🔎 Проверить брокера', 'callback_data' => 'ph:mc'));
  return $rows;
}

// ── Нажатия кнопок ──────────────────────────────────────────────────
function handleCallback($token, array $cq) {
  $chatId = isset($cq['message']['chat']['id']) ? $cq['message']['chat']['id'] : null;
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
  require_once __DIR__ . '/load-photo.php';
  $stale = 'Этот разбор устарел — пришлите документ ещё раз.';

  if ($data === 'rc:driver') {
    if (empty($st['rc'])) { reply($token, $chatId, $stale); return; }
    reply($token, $chatId, '🚚 Скопируйте и перешлите водителю:');
    reply($token, $chatId, driverCard($st['rc']));
    return;
  }
  if ($data === 'rc:mail' || $data === 'ph:mail') {
    $src = $data === 'rc:mail'
      ? (empty($st['rc']) ? null : rcToLoad($st['rc']))
      : (empty($st['load']) ? null : $st['load']);
    if ($src === null) { reply($token, $chatId, $stale); return; }
    $draft = brokerEmailDraft($src, isset($st['carrier']) ? $st['carrier'] : '');
    $st['draft'] = $draft;
    stateSet($chatId, $st);
    // Два отдельных сообщения: сначала «что это и куда», потом ЧИСТЫЙ текст
    // письма — его и копируют целиком, без единой лишней строки.
    reply($token, $chatId, draftMeta($draft,
      "✏️ Поправить: /edit и новый текст\n"
      . "📤 Отправить: /send — открою письмо в вашей почте\n"
      . "🖊 Подпись компании: /carrier"));
    reply($token, $chatId, draftAsText($draft));
    return;
  }
  if ($data === 'ph:an') {
    if (empty($st['load'])) { reply($token, $chatId, $stale); return; }
    reply($token, $chatId, photoLoadAnalytics($st['load']));
    return;
  }
  if ($data === 'ph:mc') {
    $mc = isset($st['load']['mc']) ? preg_replace('/\D/', '', (string)$st['load']['mc']) : '';
    reply($token, $chatId, $mc === '' ? 'MC брокера не распознан.' : brokerReport('broker', $mc));
    return;
  }
  reply($token, $chatId, $stale);
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
    'mc' => '', 'contact_name' => '', 'email' => '', 'phone' => '',
    'reference' => isset($d['load_id']) ? ltrim($d['load_id'], '#') : '',
    'notes' => $first ? $refs($first) : '',
  );
}
