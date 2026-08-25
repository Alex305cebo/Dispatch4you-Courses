<?php
// api/origin-guard.php — одна проверка «свой ли источник» для всех прокси к
// платным API (groq.php, cerebras.php, broker-call.php).
//
// Зачем отдельным файлом: проверка была скопирована в три файла и во всех трёх
// сравнивала ПОДСТРОКОЙ:
//
//     stripos($origin, 'dispatch4you.com') !== false
//
// Такому условию удовлетворяет и https://dispatch4you.com.чужой-домен.ru, и
// вообще любой адрес, где нужные буквы встретились хоть в пути:
// https://зло.example/?dispatch4you.com. То есть прокси к оплачиваемым Groq,
// Cerebras и Gemini открывался кому угодно — счёт при этом идёт владельцу
// ключа. Здесь сравнивается именно ХОСТ, целиком.
//
// ponytail: заголовки Origin и Referer подделываются curl'ом — это заслон от
// чужого сайта и случайного скана, а не от целенаправленной атаки. Настоящий
// рубеж — токен на каждого пользователя; ставить его есть смысл, когда по
// счетам станет видно, что прокси нашли.

/**
 * Разрешён ли источник запроса.
 *
 * @param string[] $allowed хосты без схемы: ['dispatch4you.com', 'localhost']
 * @param bool     $allowPrivateNet пускать ли адреса домашней сети —
 *                 нужно, чтобы проверять звук с телефона на 192.168.x.x
 * @return bool
 */
function d4y_origin_allowed(array $allowed, $allowPrivateNet = false) {
  foreach (array('HTTP_ORIGIN', 'HTTP_REFERER') as $h) {
    if (empty($_SERVER[$h])) { continue; }
    $host = parse_url((string) $_SERVER[$h], PHP_URL_HOST);
    if (!$host) { continue; }
    $host = strtolower($host);

    foreach ($allowed as $a) {
      $a = strtolower($a);
      // Либо сам домен, либо его поддомен — но именно поддомен: проверка идёт
      // по точке перед именем, поэтому «dispatch4you.com.чужой.ru» не пройдёт.
      if ($host === $a) { return true; }
      if (substr($host, -strlen('.' . $a)) === '.' . $a) { return true; }
    }

    if ($allowPrivateNet && d4y_is_private_host($host)) { return true; }
  }
  return false;
}

/** Адрес из домашней сети: 192.168.x.x, 10.x.x.x, 172.16–31.x.x. */
function d4y_is_private_host($host) {
  if (!filter_var($host, FILTER_VALIDATE_IP)) { return false; }
  return !filter_var(
    $host,
    FILTER_VALIDATE_IP,
    FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
  );
}

/**
 * Какой Origin вернуть в заголовке. Раньше стояла звёздочка — она разрешает
 * читать ответ странице ЛЮБОГО сайта. Отдаём ровно тот источник, который сами
 * же признали своим, и только его.
 */
function d4y_cors_origin(array $allowed, $allowPrivateNet = false) {
  if (empty($_SERVER['HTTP_ORIGIN'])) { return null; }
  $origin = (string) $_SERVER['HTTP_ORIGIN'];
  $host = parse_url($origin, PHP_URL_HOST);
  if (!$host) { return null; }
  $host = strtolower($host);
  foreach ($allowed as $a) {
    $a = strtolower($a);
    if ($host === $a || substr($host, -strlen('.' . $a)) === '.' . $a) { return $origin; }
  }
  if ($allowPrivateNet && d4y_is_private_host($host)) { return $origin; }
  return null;
}
