<?php
// Cerebras API proxy — same pattern as api/groq.php. Used by ai-broker-chat.html
// as the PRIMARY broker-dialogue model (llama-3.3-70b, generous free daily token
// quota); Groq is the fallback when Cerebras errors/rate-limits.
// The API key is read from a file ONE LEVEL ABOVE public_html, so it is never
// web-accessible and never shipped client-side. Create that file once:
//   ~/domains/dispatch4you.com/cerebras.key   (one line: the csk-... key)
//
// Only chat/completions is allowed, and requests must originate from
// dispatch4you.com or localhost (local dev testing). ponytail: Origin/Referer
// check is spoofable by curl — it stops casual browser abuse, not a determined
// attacker (same tradeoff as groq.php). Upgrade path if the key gets abused:
// per-dispatcher token or real auth.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')   { http_response_code(405); echo 'POST only'; exit; }

$origin  = isset($_SERVER['HTTP_ORIGIN'])  ? $_SERVER['HTTP_ORIGIN']  : '';
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$allowedOrigins = ['dispatch4you.com', 'localhost', '127.0.0.1'];
$originOk = false;
foreach ($allowedOrigins as $o) {
  if (stripos($origin, $o) !== false || stripos($referer, $o) !== false) { $originOk = true; break; }
}
if (!$originOk) {
  http_response_code(403); echo 'forbidden'; exit;
}

$allowed = ['chat/completions'];
$path = isset($_GET['path']) ? $_GET['path'] : '';
if (!in_array($path, $allowed, true)) { http_response_code(400); echo 'bad path'; exit; }

$key = @trim(file_get_contents(__DIR__ . '/../../cerebras.key'));
if ($key === '' || $key === false) { http_response_code(500); echo 'server not configured'; exit; }

$url = 'https://api.cerebras.ai/v1/' . $path;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer ' . $key,
  'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));

$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($resp === false) { $err = curl_error($ch); curl_close($ch); http_response_code(502); echo 'upstream error: ' . $err; exit; }
curl_close($ch);

http_response_code($code ?: 200);
header('Content-Type: application/json');
echo $resp;
