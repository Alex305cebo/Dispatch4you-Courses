<?php
// api/d4y-session-lib.php — общие функции для session.php и module.php.
// Вынесено в один файл НАМЕРЕННО: подпись куки должна ставиться и проверяться
// одним и тем же кодом. Разъедутся — гейт либо перестанет пускать своих, либо
// начнёт пускать чужих.

define('D4Y_COOKIE',      'd4y_sess');
define('D4Y_SESSION_TTL', 7200);   // 2 часа. Firebase обновляет токен раз в час,
                                   // фронт переставляет куку — до протухания
                                   // обычно не доходит, запас на всякий случай.

/** Секрет подписи. Лежит ВЫШЕ public_html — как groq.key. null, если не создан. */
function d4y_secret() {
  $p = __DIR__ . '/../../session.key';
  if (!is_readable($p)) { return null; }
  $s = trim((string) @file_get_contents($p));
  // Слишком короткий ключ = подделываемая подпись. Лучше честно не работать,
  // чем создавать видимость защиты.
  return (strlen($s) >= 32) ? $s : null;
}

function d4y_b64url_encode($s) {
  return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}
function d4y_b64url_decode($s) {
  return base64_decode(strtr($s, '-_', '+/'));
}

/** payload(array) → "base64url(json).hmac_hex" */
function d4y_sign($payload, $secret) {
  $body = d4y_b64url_encode(json_encode($payload));
  return $body . '.' . hash_hmac('sha256', $body, $secret);
}

/**
 * Разбирает и проверяет куку. Возвращает payload или null.
 * null = «доступа нет», без исключений и без полумер.
 */
function d4y_verify($cookie, $secret) {
  if (!is_string($cookie) || strpos($cookie, '.') === false) { return null; }
  list($body, $sig) = explode('.', $cookie, 2);
  $expect = hash_hmac('sha256', $body, $secret);
  // hash_equals, а не ==: сравнение с ранним выходом утекает подпись по таймингу.
  if (!hash_equals($expect, $sig)) { return null; }
  $p = json_decode(d4y_b64url_decode($body), true);
  if (!is_array($p) || empty($p['uid']) || empty($p['role']) || empty($p['exp'])) { return null; }
  if ((int) $p['exp'] < time()) { return null; }
  return $p;
}

function d4y_set_cookie($value, $exp) {
  $opts = [
    'expires'  => $exp,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,   // JS не читает — XSS не уводит сессию
    'samesite' => 'Lax',  // Lax, а не Strict: переход по внешней ссылке на модуль
                          // должен нести куку, иначе своих будет выкидывать
  ];
  if (PHP_VERSION_ID >= 70300) {
    setcookie(D4Y_COOKIE, $value, $opts);
  } else {
    setcookie(D4Y_COOKIE, $value, $exp, '/; SameSite=Lax', '', true, true);
  }
}

function d4y_cookie() {
  return isset($_COOKIE[D4Y_COOKIE]) ? $_COOKIE[D4Y_COOKIE] : '';
}

/** Доступен ли $page роли $role. Зеркалит списки из role-guard.js. */
function d4y_can_access($role, $page) {
  if ($role === 'superuser') { return true; }
  // Модуль 1 — бесплатная проба, открыт всем зарегистрированным.
  if ($page === 'doc-module-1-complete') {
    return in_array($role, ['registered', 'student'], true);
  }
  // Модули 2–12 — платные.
  if (preg_match('/^doc-module-(\d+)-complete$/', $page, $m)) {
    $n = (int) $m[1];
    if ($n >= 2 && $n <= 12) { return $role === 'student'; }
  }
  return false;
}

function d4y_post_json($url, $payload) { return d4y_http($url, ['Content-Type: application/json'], json_encode($payload)); }
function d4y_get_json($url, $headers)  { return d4y_http($url, $headers, null); }

function d4y_http($url, $headers, $body) {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  if ($body !== null) { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, $body); }
  $resp = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($resp === false) { return ['code' => 0, 'body' => null]; }
  return ['code' => $code, 'body' => json_decode($resp, true)];
}
