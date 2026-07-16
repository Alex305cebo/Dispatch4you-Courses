<?php
// api/session.php — обменивает Firebase ID token на подписанную сессионную куку.
//
// Зачем: HTML платных модулей нельзя отдавать до проверки доступа, а обычная
// навигация по ссылке не несёт Authorization-заголовок — токен лежит в SDK, а
// не в куке. Поэтому один раз после входа фронт отдаёт сюда токен, а мы
// выдаём HttpOnly-куку, которую браузер сам приложит к каждому запросу модуля.
// Дальше api/module.php проверяет только подпись куки — без похода в Google
// на каждой странице.
//
// Ключ подписи читается из файла ОДНОГО УРОВНЯ ВЫШЕ public_html — та же схема,
// что у api/groq.php с groq.key. Создать один раз (произвольная длинная строка):
//   ~/domains/dispatch4you.com/session.key
// Сгенерировать можно так:  head -c 48 /dev/urandom | base64 > session.key
//
// Проверка токена идёт REST-запросом к Google (identitytoolkit accounts:lookup).
// Так сделано намеренно: Composer в проекте нет, а значит нет и библиотеки для
// проверки подписи JWT локально. Запрос к Google — один раз за сессию (~раз в
// час на пользователя), не на каждую страницу, так что цена запроса не важна.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); echo json_encode(['error' => 'POST only']); exit;
}

require_once __DIR__ . '/d4y-session-lib.php';

$FB_API_KEY = 'AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI'; // публичный по замыслу Firebase
$FB_PROJECT = 'dispatch4you-80e0f';
$SUPER_EMAILS = ['dersire.der@gmail.com', 'cebotarigg@gmail.com', 'mihail.ce89@gmail.com'];

$secret = d4y_secret();
if ($secret === null) {
  http_response_code(500); echo json_encode(['error' => 'server not configured']); exit;
}

$raw = file_get_contents('php://input');
$in  = json_decode($raw, true);
$idToken = (is_array($in) && isset($in['idToken'])) ? $in['idToken'] : '';
if (!is_string($idToken) || $idToken === '') {
  http_response_code(400); echo json_encode(['error' => 'no idToken']); exit;
}

// ── 1. Проверяем токен у Google ──────────────────────────────────────────────
$lookup = d4y_post_json(
  'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . $FB_API_KEY,
  ['idToken' => $idToken]
);
if ($lookup['code'] !== 200) {
  // Токен поддельный, протухший или отозванный. Ровно тот случай, ради
  // которого всё затевалось, — отказ без всяких поблажек.
  http_response_code(401); echo json_encode(['error' => 'invalid token']); exit;
}
$users = isset($lookup['body']['users'][0]) ? $lookup['body']['users'][0] : null;
if (!$users || empty($users['localId'])) {
  http_response_code(401); echo json_encode(['error' => 'no user']); exit;
}
$uid   = $users['localId'];
$email = isset($users['email']) ? strtolower($users['email']) : '';

// ── 2. Определяем роль ───────────────────────────────────────────────────────
// Порядок тот же, что в role-guard.js и d4y-auth.js: супер-юзеры по email
// моментально, остальные — из Firestore users/{uid}.accessRole.
$role = 'registered';
if ($email !== '' && in_array($email, $SUPER_EMAILS, true)) {
  $role = 'superuser';
} else {
  // Читаем документ ТОКЕНОМ САМОГО ПОЛЬЗОВАТЕЛЯ — сервисный аккаунт не нужен,
  // правила Firestore применяются как обычно.
  $doc = d4y_get_json(
    'https://firestore.googleapis.com/v1/projects/' . $FB_PROJECT .
      '/databases/(default)/documents/users/' . rawurlencode($uid),
    ['Authorization: Bearer ' . $idToken]
  );
  if ($doc['code'] === 200 && isset($doc['body']['fields']['accessRole']['stringValue'])) {
    $r = $doc['body']['fields']['accessRole']['stringValue'];
    if (in_array($r, ['registered', 'student', 'superuser'], true)) { $role = $r; }
  }
  // Документа нет / Firestore недоступен → остаётся 'registered'. Это НЕ даёт
  // доступа к платному: модули 2–12 требуют 'student'. Тот же дефолт, что в
  // role-guard.js:118 — поведение не меняется.
}

// ── 3. Ставим подписанную куку ───────────────────────────────────────────────
$exp = time() + D4Y_SESSION_TTL;
d4y_set_cookie(d4y_sign(['uid' => $uid, 'role' => $role, 'exp' => $exp], $secret), $exp);

echo json_encode(['ok' => true, 'role' => $role, 'exp' => $exp]);
