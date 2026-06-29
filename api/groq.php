<?php
// Groq API proxy for the Dispatch4you Chrome extension.
// The API key is read from a file ONE LEVEL ABOVE public_html, so it is never
// web-accessible and never shipped inside the extension. Create that file once:
//   ~/domains/dispatch4you.com/groq.key   (one line: the gsk_... key)
//
// Only the two Groq endpoints the extension uses are allowed, and requests must
// originate from the DAT page. ponytail: Origin/Referer check is spoofable by
// curl — it stops casual browser abuse, not a determined attacker. Upgrade path
// if the key gets abused: per-dispatcher token or real auth.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')   { http_response_code(405); echo 'POST only'; exit; }

$origin  = isset($_SERVER['HTTP_ORIGIN'])  ? $_SERVER['HTTP_ORIGIN']  : '';
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
if (stripos($origin, 'one.dat.com') === false && stripos($referer, 'one.dat.com') === false) {
  http_response_code(403); echo 'forbidden'; exit;
}

$allowed = ['chat/completions', 'audio/transcriptions'];
$path = isset($_GET['path']) ? $_GET['path'] : '';
if (!in_array($path, $allowed, true)) { http_response_code(400); echo 'bad path'; exit; }

$key = @trim(file_get_contents(__DIR__ . '/../../groq.key'));
if ($key === '' || $key === false) { http_response_code(500); echo 'server not configured'; exit; }

$url = 'https://api.groq.com/openai/v1/' . $path;
$ct  = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$headers = ['Authorization: Bearer ' . $key];

if (stripos($ct, 'multipart/form-data') !== false) {
  // Rebuild multipart from PHP-parsed fields + the uploaded audio file.
  $fields = $_POST;
  if (isset($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
    $fields['file'] = new CURLFile(
      $_FILES['file']['tmp_name'],
      $_FILES['file']['type'] ?: 'audio/webm',
      $_FILES['file']['name'] ?: 'audio.webm'
    );
  }
  curl_setopt($ch, CURLOPT_POSTFIELDS, $fields); // cURL builds the boundary
} else {
  // JSON (or other) — forward the raw body and its content type unchanged.
  $headers[] = 'Content-Type: ' . ($ct ?: 'application/json');
  curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($resp === false) { $err = curl_error($ch); curl_close($ch); http_response_code(502); echo 'upstream error: ' . $err; exit; }
curl_close($ch);

http_response_code($code ?: 200);
header('Content-Type: ' . (stripos($path, 'chat') !== false ? 'application/json' : 'text/plain; charset=utf-8'));
echo $resp;
