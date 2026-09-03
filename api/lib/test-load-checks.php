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

// ── Реф-номера, напечатанные для груза в целом ──────────────────────
// Живой случай, рейт-кон Arrive Logistics 9497205: колонки Ref/PO# у стопов
// пустые, а «Shipment ID 934219923» и «Reference # T064090» стоят в шапке.
// Раньше в схеме не было поля под такие номера, и они пропадали — водитель
// приезжал на склад без единого номера, который у него спросят.
$rc = array(
  'load_id' => '9497205',
  'refs' => array('Shipment ID 934219923', 'Reference # T064090'),
  'rate' => '$2,080.00', 'weight' => '40512 lb', 'commodity' => 'FIRELOG',
  'stops' => array(
    array('type' => 'pickup', 'name' => 'Royal Oak',
          'address_lines' => array('6202 Industrial Dr', 'Greenville, TX 75402'),
          'time' => 'Sep 3, 2026 10:00 CDT', 'refs' => array()),
    array('type' => 'delivery', 'name' => 'ROYAL OAK CHARCOAL',
          'address_lines' => array('6400 CORPORATE PARK DRIVE', 'Loudon, TN 37774'),
          'time' => 'Sep 4, 2026 11:00 EDT', 'refs' => array()),
  ),
);
$blocks = driverCardBlocks($rc, 'en');
// Оба номера — в шапке карточки, рядом с номером загрузки
assert(strpos($blocks[0], 'Shipment ID 934219923') !== false);
assert(strpos($blocks[0], 'Reference # T064090') !== false);
assert(strpos($blocks[0], 'LOAD ID: #9497205') !== false);

// И на пустые реф-номера стопов бот больше не жалуется: номера есть, просто
// напечатаны в шапке. Раньше он писал «реф-номера (погрузка #1)» под карточкой,
// в которой эти номера стояли строкой выше.
$codes = array_map(function ($m) { return $m['field']; }, missingFields($rc));
assert(!in_array('refs', $codes, true));

// А когда номеров нет вообще — жалоба на месте
$rcNoRefs = $rc;
$rcNoRefs['refs'] = array();
$codes = array_map(function ($m) { return $m['field']; }, missingFields($rcNoRefs));
assert(in_array('refs', $codes, true));

// ── Число из строки ─────────────────────────────────────────────────
// Живой случай: биржа DAT печатает рыночную ставку как «$4,045 ($2.22/mi)».
// Прежний разбор («выкинуть всё, кроме цифр и точек») склеивал два числа в
// 40452.22, делил на 1822 мили и показывал рынок $22.20 за милю.
assert(numOf('$4,045 ($2.22/mi)') === 4045.0);
assert(numOf('$2.22/mi') === 2.22);
assert(numOf('1,822 mi') === 1822.0);
assert(numOf('29,125 lbs') === 29125.0);
assert(numOf('$4,300') === 4300.0);
assert(numOf('80') === 80.0);
assert(numOf('Avg 32 days') === 32.0);
assert(numOf('3 stars (239)') === 3.0);
assert(numOf('') === null);
assert(numOf('по договорённости') === null);
assert(numOf(null) === null);
// Дробная часть не теряется и не приклеивается к следующему числу
assert(numOf('$52.00 per ton') === 52.0);
assert(numOf('41,870.50 lbs') === 41870.5);

// ── Деньги и вес в карточке ─────────────────────────────────────────
// Живой случай, рейт-кон J.B. Hunt 8HH3583: в карточке стояло «$7450.0».
assert(formatMoney('$7450.0') === '$7,450.00');
assert(formatMoney('7450') === '$7,450.00');
assert(formatMoney('$1,956.34') === '$1,956.34');
// Хвост после числа НЕ теряем: без слов «per ton» ставка $52 за тонну
// превращается в рейс за $52 — на этом уже обжигались
assert(formatMoney('$52.00 per ton') === '$52.00 per ton');
assert(formatMoney('') === '');
assert(formatMoney('по договорённости') === 'по договорённости');

assert(formatWeight('42851.0 lbs') === '42,851 lbs');
assert(formatWeight('44000') === '44,000');
assert(formatWeight('41,870.50 lbs') === '41,871 lbs');
assert(formatWeight('') === '');

// ── Адрес: только то, по чему водитель доедет ───────────────────────
// Живой случай, рейт-кон MODE Transportation 16374612: ориентир «SOUTH OF
// BATTLE MOUNTAIN» напечатан в документе строкой адреса и вставал у водителя
// на место улицы.
assert(cleanAddressLines(array('SOUTH OF BATTLE MOUNTAIN', 'HC 61 BOX 165', 'BATTLE MOUNTAIN, NV 89820'))
  === array('HC 61 BOX 165', 'BATTLE MOUNTAIN, NV 89820'));
// Нормальный адрес не трогаем
assert(cleanAddressLines(array('217 WEST TERRA BELLA AVE', 'PIXLEY, CA 93256'))
  === array('217 WEST TERRA BELLA AVE', 'PIXLEY, CA 93256'));
// Улица без номера, но со словом-указателем — оставляем
assert(cleanAddressLines(array('MAIN STREET', 'PIXLEY, CA 93256'))
  === array('MAIN STREET', 'PIXLEY, CA 93256'));
assert(cleanAddressLines(array('SUITE B', '217 W TERRA BELLA AVE', 'PIXLEY, CA 93256'))
  === array('SUITE B', '217 W TERRA BELLA AVE', 'PIXLEY, CA 93256'));
// Пояснения выкидываем
assert(cleanAddressLines(array('C/O RECEIVING', '217 W TERRA BELLA AVE', 'PIXLEY, CA 93256'))
  === array('217 W TERRA BELLA AVE', 'PIXLEY, CA 93256'));
// Страховка: если правило съело бы всё или потеряло город — отдаём исходное
assert(cleanAddressLines(array('ACROSS FROM THE SILO')) === array('ACROSS FROM THE SILO'));
assert(cleanAddressLines(array()) === array());

// ── Ставка за тонну, а не за рейс ───────────────────────────────────
// Тот же документ: «$52.00 LINEHAUL ***per ton***» при 44000 lbs — это ≈$1144
// за рейс, а в карточке водителя стояло $52.
$t = rateSanityText(array('rate' => '$52.00 per ton', 'weight' => '44000 lbs'), 'ru');
assert(strpos($t, '1,144.00') !== false);
assert(strpos($t, '22.0') !== false);
$t = rateSanityText(array('rate' => '$52.00 per ton', 'weight' => '44000 lbs'), 'en');
assert(strpos($t, '1,144.00') !== false);
// Без веса считать нечего, но предупредить надо
assert(strpos(rateSanityText(array('rate' => '$52.00 per ton'), 'ru'), 'ЗА ТОННУ') !== false);
// Единицы не написаны, сумма неправдоподобна для рейса
assert(rateSanityText(array('rate' => '$52.00'), 'ru') !== '');
// Обычная ставка — молчим
assert(rateSanityText(array('rate' => '$1,956.34'), 'ru') === '');
assert(rateSanityText(array('rate' => ''), 'ru') === '');

// ── Когда стоит тратить запрос vision на повторное чтение PDF ────────
// Не хватает того, без чего карточка водителю бессмысленна — стоит
assert(rcIncomplete(array(array('field' => 'nopickup'))) === true);
assert(rcIncomplete(array(array('field' => 'nodelivery'))) === true);
assert(rcIncomplete(array(array('field' => 'address', 'type' => 'pickup', 'n' => 1))) === true);
assert(rcIncomplete(array(array('field' => 'citystate', 'type' => 'delivery', 'n' => 2))) === true);
// Мелкие пропуски картинкой не добираются — квоту на них не тратим
assert(rcIncomplete(array(array('field' => 'rate'), array('field' => 'weight'),
                          array('field' => 'refs', 'type' => 'pickup', 'n' => 1),
                          array('field' => 'mc'), array('field' => 'time', 'type' => 'pickup', 'n' => 1))) === false);
assert(rcIncomplete(array()) === false);

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
// Сравниваем по значению, а не ===: PHP делит два целых в ЦЕЛОЕ, если делится
// нацело, и 11 === 11.0 не выполняется.
assert(abs(($w['end'] - $w['start']) / 3600 - 11) < 0.001);
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
