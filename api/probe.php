<?php
// Временный пробник: бот отдаёт 200 и ноль байт на любой запрос, включая те
// диагностики, что стоят до require. Так ведёт себя только ошибка разбора —
// значит файл на сервере либо не тот, что в git, либо приехал обрезанным.
// Сверяем размер и контрольную сумму, заодно смотрим версию PHP и наличие
// подключаемых файлов. Удалить сразу после починки.
header('Content-Type: text/plain; charset=utf-8');
echo 'php: ' . PHP_VERSION . "\n";
foreach (array(
  'telegram-bot.php',
  'lib/tg-actions.php',
  'lib/load-photo.php',
  'lib/pdf-decrypt.php',
  'lib/PdfParser/Parser.php',
) as $f) {
  $p = __DIR__ . '/' . $f;
  echo str_pad($f, 26) . (is_file($p)
    ? filesize($p) . ' b  md5=' . md5_file($p)
    : 'НЕТ ФАЙЛА') . "\n";
}
