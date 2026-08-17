<?php
// Проверки антифрода и расчёта по часам: php api/lib/test-load-checks.php
// Молчит — значит сошлось. Тут арифметика и сравнение имён, то есть ровно то,
// что ломается незаметно: ложный красный флаг на честном брокере хуже, чем его
// отсутствие, поэтому «не обвиняем» проверяется наравне с «ловим».

require __DIR__ . '/load-checks.php';

// ── Раскладка карточки по сообщениям ────────────────────────────────
// Короткое остаётся одним куском
assert(packBlocks(array('коротко')) === array('коротко'));

// Блок стопа содержит пустые строки ВНУТРИ (после подписи, после названия
// склада) — именно поэтому упаковщик принимает готовые блоки, а не текст.
$stops = array();
for ($i = 1; $i <= 8; $i++) {
  $stops[] = "Pick up Address {$i}:\n\nWIELAND COPPER PRODUCTS\n\n"
    . str_repeat("1234 SOME STREET LINE\n", 10) . "EASTABOGA AL 3626{$i}";
}
$parts = packBlocks($stops, 800);
assert(count($parts) > 1);                                  // ради этого и делалось
assert(implode("\n\n", $parts) === implode("\n\n", $stops)); // ни одного потерянного символа
foreach ($parts as $p) assert(mb_strlen($p) <= 800);
// Стоп не разорван: каждая часть начинается с подписи стопа, а не с адреса
foreach ($parts as $p) assert(strpos($p, 'Pick up Address') === 0);
// И каждый стоп целиком лежит в одном сообщении
foreach ($stops as $s) {
  $whole = 0;
  foreach ($parts as $p) if (strpos($p, $s) !== false) $whole++;
  assert($whole === 1);
}

// Блок, который сам длиннее лимита, не теряется — уходит частями
$huge = str_repeat('X', 2500);
$parts = packBlocks(array('шапка', $huge), 1000);
assert(implode('', array_map(function ($p) { return str_replace("\n\n", '', $p); }, $parts)) === 'шапка' . $huge);
foreach ($parts as $p) assert(mb_strlen($p) <= 1000);

// Пустые блоки просто пропускаются
assert(packBlocks(array('a', '', 'b'), 100) === array("a\n\nb"));

// Многобайтные символы считаются символами, а не байтами
assert(mb_strlen(packBlocks(array(str_repeat('я', 50)), 100)[0]) === 50);

// ── Одна ли это компания ────────────────────────────────────────────
assert(sameCompany('ABC Logistics LLC', 'ABC LOGISTICS, INC.') === true);
assert(sameCompany('Coyote Logistics', 'COYOTE LOGISTICS LLC') === true);
// Аббревиатуры: в документе TQL, в FMCSA полное имя — самый частый повод для
// ложной тревоги, если сравнивать в лоб.
assert(sameCompany('TQL', 'TOTAL QUALITY LOGISTICS LLC') === true);
assert(sameCompany('RXO Capacity Solutions', 'RXO CAPACITY SOLUTIONS LLC') === true);
// А это уже другая контора
assert(sameCompany('Coyote Logistics', 'Freight Xpress Inc') === false);

// ── Свой MC из подписи и «это перевозчик, а не брокер» ──────────────
// Из-за этого бот однажды выдал диспетчеру отчёт о его собственной компании:
// в шапке рейт-кона номер перевозчика стоит рядом с брокерским.
assert(ownMcFromSignature("MAYA LOGISTICS INC\nMC 626911\nJohn, (555) 111-2233") === '626911');
assert(ownMcFromSignature('MC# 626911') === '626911');
assert(ownMcFromSignature('MC: 626911') === '626911');
assert(ownMcFromSignature('MC-626911') === '626911');
assert(ownMcFromSignature('ABC Trucking, (555) 111-2233') === '');
assert(ownMcFromSignature('') === '');

// Перевозчик: брокерской авторити нет, обычная есть
assert(recIsCarrierOnly(array('commonAuthorityStatus' => 'A')) === true);
assert(recIsCarrierOnly(array('contractAuthorityStatus' => 'A')) === true);
// Брокер — не перевозчик, даже если обе авторити активны
assert(recIsCarrierOnly(array('brokerAuthorityStatus' => 'A', 'commonAuthorityStatus' => 'A')) === false);
assert(recIsCarrierOnly(array('brokerAuthorityStatus' => 'A')) === false);
assert(recIsCarrierOnly(null) === false);

// Совпадение записи с названием из документа
assert(recMatchesName(array('legalName' => 'MAYA LOGISTICS INC'), 'Maya Logistics') === true);
assert(recMatchesName(array('legalName' => 'SOME HOLDINGS LLC', 'dbaName' => 'BLUE ARROW'), 'Blue Arrow') === true);
assert(recMatchesName(array('legalName' => 'MAYA LOGISTICS INC'), 'Molo Solutions') === false);

// ── Метки антифрода ─────────────────────────────────────────────────
$codes = function ($flags) { return array_map(function ($f) { return $f['code']; }, $flags); };

$rec = array('legalName' => 'FREIGHT XPRESS INC', 'allowedToOperate' => 'Y',
             'brokerAuthorityStatus' => 'A', 'bondInsuranceOnFile' => '75');
$f = brokerFraudFlags(array('broker' => 'Coyote Logistics', 'mc' => '123456'), $rec);
assert(in_array('name_mismatch', $codes($f), true));

// Тот же брокер, что и в записи — ни одной метки
$f = brokerFraudFlags(array('broker' => 'Freight Xpress', 'mc' => '123456',
                            'broker_email' => 'john@freightxpress.com'), $rec);
assert($f === array());

// DBA: в документе торговое имя, в FMCSA юридическое — это норма
$rec2 = array('legalName' => 'SOME HOLDINGS LLC', 'dbaName' => 'BLUE ARROW FREIGHT',
              'allowedToOperate' => 'Y');
$f = brokerFraudFlags(array('broker' => 'Blue Arrow Freight', 'mc' => '1'), $rec2);
assert($f === array());

// Запрет работать и отсутствие бонда — красные, каждый сам по себе
$rec3 = array('legalName' => 'FREIGHT XPRESS INC', 'allowedToOperate' => 'N');
$f = $codes(brokerFraudFlags(array('broker' => 'Freight Xpress', 'mc' => '1'), $rec3));
assert(in_array('not_allowed', $f, true));

$rec4 = array('legalName' => 'FREIGHT XPRESS INC', 'allowedToOperate' => 'Y',
              'brokerAuthorityStatus' => 'A', 'bondInsuranceOnFile' => '');
$f = $codes(brokerFraudFlags(array('broker' => 'Freight Xpress', 'mc' => '1'), $rec4));
assert(in_array('no_bond', $f, true));

// MC в документе есть, а в FMCSA такой записи нет
$f = $codes(brokerFraudFlags(array('broker' => 'Freight Xpress', 'mc' => '999999'), null));
assert(in_array('mc_notfound', $f, true));

// Бесплатная почта у брокера
$f = $codes(brokerFraudFlags(array('broker' => 'Freight Xpress', 'broker_email' => 'dispatch@gmail.com'), null));
assert(in_array('free_email', $f, true));

// Корпоративная почта того же брокера тревоги не поднимает
$f = $codes(brokerFraudFlags(array('broker' => 'Freight Xpress', 'broker_email' => 'j@freightxpress.com'), null));
assert(!in_array('domain_mismatch', $f, true) && !in_array('free_email', $f, true));

// Пустой разбор ничего не ломает
assert(brokerFraudFlags(array(), null) === array());
assert(fraudText(array()) === '');

// ── Окна времени ────────────────────────────────────────────────────
$w = parseWindow('07/24/26 06:00 - 17:00');
assert($w !== null);
assert(($w['end'] - $w['start']) / 3600 === 11.0);
assert(date('Y-m-d H:i', $w['start']) === '2026-07-24 06:00');

$w = parseWindow('02/02/26 @ 12:30');           // одна точка времени, не окно
assert($w !== null && $w['start'] === $w['end']);
assert(parseWindow('') === null);
assert(parseWindow('по договорённости') === null);

$w = parseWindow('08/16/26 8:00 am - 3:00 pm'); // 12-часовой формат
assert(date('H:i', $w['start']) === '08:00' && date('H:i', $w['end']) === '15:00');

// ── Успевает ли водитель ────────────────────────────────────────────
// 890 миль, окно от погрузки до доставки 15 часов — легально невозможно
$tight = array(
  'miles' => '890',
  'stops' => array(
    array('type' => 'pickup',   'time' => '08/16/26 15:00 - 15:00'),
    array('type' => 'delivery', 'time' => '08/17/26 06:00 - 06:00'),
  ),
);
$h = hosFeasibility($tight);
assert($h !== null);
assert(round($h['avail']) === 15.0);
assert($h['days'] === 2);          // 16 часов за рулём в одну смену не влезают
assert($h['need'] > $h['avail']);
assert(strpos(hosText($h, 'ru'), '🔴') === 0);
assert(strpos(hosText($h, 'en'), '🔴') === 0);

// 500 миль и трое суток — вопросов нет, молчим
$easy = array(
  'miles' => '500',
  'stops' => array(
    array('type' => 'pickup',   'time' => '08/16/26 08:00 - 16:00'),
    array('type' => 'delivery', 'time' => '08/19/26 08:00 - 16:00'),
  ),
);
$h = hosFeasibility($easy);
assert($h !== null && $h['need'] < $h['avail']);
assert(hosText($h, 'ru') === '');

// Считать не из чего — не выдумываем
assert(hosFeasibility(array('stops' => array())) === null);
assert(hosFeasibility(array('miles' => '500', 'stops' => array())) === null);
assert(hosFeasibility(array('miles' => '', 'stops' => array(
  array('type' => 'pickup', 'time' => '08/16/26 08:00'),
  array('type' => 'delivery', 'time' => '08/19/26 08:00')))) === null);
assert(hosText(null) === '');

echo "ok\n";
