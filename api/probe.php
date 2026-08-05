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
  if (!is_file($p)) { echo str_pad($f, 26) . "НЕТ ФАЙЛА\n"; continue; }
  // token_get_all с TOKEN_PARSE разбирает файл, НЕ выполняя его, и на кривом
  // синтаксисе бросает ParseError с номером строки — это и есть php -l,
  // которого на хостинге нет. Выполнять файл нельзя: это боевой вебхук.
  $verdict = 'синтаксис ок';
  try {
    token_get_all(file_get_contents($p), TOKEN_PARSE);
  } catch (\Throwable $e) {
    $verdict = 'ОШИБКА: ' . $e->getMessage() . ' @ строка ' . $e->getLine();
  }
  echo str_pad($f, 26) . filesize($p) . ' b  ' . $verdict . "\n";
}
