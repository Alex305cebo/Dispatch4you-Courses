<?php
// Проверка чистки кириллицы в разобранных данных: php api/lib/test-en-force.php
// Молчит — значит всё сошлось; падает с assert'ом на первой же ошибке.
// Повод: в письме брокеру на английском стояло «Pickup: авг. 17» — модель
// перевела дату, которую прочитала со скриншота как «Aug 17».

require __DIR__ . '/load-photo.php';

// Месяцы во всех формах, в которых их выдаёт модель
assert(enForceValue('авг. 17') === 'Aug 17');
assert(enForceValue('17 августа') === '17 Aug');
assert(enForceValue('Авг 17, 08:00-15:00') === 'Aug 17, 08:00-15:00');
assert(enForceValue('5 мая') === '5 May');
assert(enForceValue('5 марта') === '5 Mar');   // мар и май различаются в трёх буквах
assert(enForceValue('дек. 31') === 'Dec 31');

// Английское не трогаем вообще
assert(enForceValue('Aug 17') === 'Aug 17');
assert(enForceValue('08/17/26 06:00 - 17:00') === '08/17/26 06:00 - 17:00');
assert(enForceValue('Browns Summit, NC') === 'Browns Summit, NC');

// Русское НЕ месячное оставляем как есть: пустое поле хуже кривого
assert(enForceValue('Нужны тенты') === 'Нужны тенты');

// Вся структура разбора, включая вложенные стопы и списки
$in = array(
  'pickup' => 'авг. 17',
  'rate' => '$1,956.34',
  'stops' => array(
    array('name' => 'Wieland', 'time' => '17 августа 06:00', 'refs' => array('PU 1067917')),
  ),
);
$out = enForce($in);
assert($out['pickup'] === 'Aug 17');
assert($out['rate'] === '$1,956.34');
assert($out['stops'][0]['time'] === '17 Aug 06:00');
assert($out['stops'][0]['refs'][0] === 'PU 1067917');

echo "ok\n";
